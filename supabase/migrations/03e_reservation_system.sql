-- ============================================================================
-- MIGRACIÓN 03e-A.3: Sistema de reserva de inventario
-- ============================================================================
-- Fecha: 20/02/2026
-- Bloque: 3e-A.3
--
-- Reemplaza el trigger handle_order_completion con un sistema completo de
-- reserva blanda → reserva dura → decremento real.
--
-- Flujo de estados:
--   INSERT(pending) → soft reserve (reserved_qty++)
--   pending→confirmed → hard reserve (status='confirmed' en reservations)
--   confirmed→completed → decrement real + registro en sales/sale_items
--   any→cancelled → liberar reserved_qty (y restaurar quantity si era completed)
--
-- EJECUTAR EN:
--   https://supabase.com/dashboard/project/lrcggpdgrqltqbxqnjgh/editor
-- ============================================================================

-- ── PARTE 1: Columna reserved_qty en inventory ────────────────────────────────

ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS reserved_qty INTEGER NOT NULL DEFAULT 0
    CHECK (reserved_qty >= 0);

COMMENT ON COLUMN inventory.reserved_qty IS
  'Unidades con reserva blanda activa (pedidos pending/confirmed). Disponible = quantity - reserved_qty';

-- ── PARTE 2: Columnas de fulfillment en orders ────────────────────────────────

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS fulfillment_location_id UUID REFERENCES locations(id),
  ADD COLUMN IF NOT EXISTS fulfillment_notes TEXT,
  ADD COLUMN IF NOT EXISTS reserved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.expires_at IS
  'Reserva expira 2 horas tras la creación del pedido. Usado por cancel_expired_orders()';

-- ── PARTE 3: Tabla inventory_reservations ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS inventory_reservations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  size        TEXT,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  status      TEXT NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved', 'confirmed', 'released', 'completed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_res_order_id
  ON inventory_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_inv_res_product_location
  ON inventory_reservations(product_id, location_id);

ALTER TABLE inventory_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access reservations" ON inventory_reservations;
CREATE POLICY "Admin full access reservations"
  ON inventory_reservations FOR ALL USING (true);

-- ── PARTE 4: Eliminar triggers y funciones anteriores ─────────────────────────

DROP TRIGGER IF EXISTS handle_order_completion    ON orders;
DROP TRIGGER IF EXISTS handle_order_confirmation  ON orders;
DROP TRIGGER IF EXISTS trigger_decrement_inventory ON orders;
DROP TRIGGER IF EXISTS handle_order_status_change  ON orders;
DROP TRIGGER IF EXISTS handle_new_order            ON orders;

DROP FUNCTION IF EXISTS handle_order_completion();
DROP FUNCTION IF EXISTS handle_order_confirmation();
DROP FUNCTION IF EXISTS decrement_inventory_on_confirm();
DROP FUNCTION IF EXISTS handle_order_status_change();

-- ── PARTE 5: Nueva función unificada ─────────────────────────────────────────
--
-- NOTAS DE IMPLEMENTACIÓN:
-- • Usa IS DISTINCT FROM en lugar de != para manejar OLD = NULL en INSERT
-- • El loop PENDING hace JOIN con locations para ordenar: Puestos primero, Bodega último
-- • El bloque COMPLETED usa reservations cuando existen, o decremento directo como fallback
-- • COMPLETED inserta 1 header en sales + 1 fila en sale_items por producto (patrón correcto)

CREATE OR REPLACE FUNCTION handle_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  item             RECORD;
  v_org_id         UUID;
  v_inventory_row  RECORD;
  v_remaining      INTEGER;
  v_take           INTEGER;
  v_sale_id        UUID;
  payment_mapped   payment_method;
  v_has_reservations BOOLEAN;
BEGIN

  -- Resolver organization_id desde productos si el pedido no lo tiene
  v_org_id := COALESCE(
    NEW.organization_id,
    (SELECT p.organization_id
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = NEW.id
     LIMIT 1)
  );

  -- ════════════════════════════════════════════════════════════════════
  -- PENDING: soft reserve (incrementar reserved_qty)
  -- Dispara tanto en INSERT nuevo como en UPDATE hacia 'pending'
  -- ════════════════════════════════════════════════════════════════════
  IF NEW.status = 'pending' AND NEW.status IS DISTINCT FROM OLD.status THEN

    -- Borrar reservas previas del pedido si las hubiera (re-pending edge case)
    FOR v_inventory_row IN
      SELECT ir.location_id, ir.product_id, ir.size, ir.quantity AS res_qty, i.id AS inv_id
      FROM inventory_reservations ir
      JOIN inventory i ON i.product_id = ir.product_id
        AND i.location_id = ir.location_id
        AND (ir.size IS NULL OR i.size = ir.size)
      WHERE ir.order_id = NEW.id AND ir.status IN ('reserved', 'confirmed')
    LOOP
      UPDATE inventory
        SET reserved_qty = GREATEST(0, reserved_qty - v_inventory_row.res_qty),
            updated_at   = NOW()
        WHERE id = v_inventory_row.inv_id;
    END LOOP;

    DELETE FROM inventory_reservations WHERE order_id = NEW.id;

    -- Reservar stock para cada producto del pedido
    FOR item IN
      SELECT oi.product_id, oi.quantity, oi.size
      FROM order_items oi WHERE oi.order_id = NEW.id
    LOOP
      v_remaining := item.quantity;

      -- Iterar sobre ubicaciones con stock disponible.
      -- Orden: Puestos primero (por nombre ASC), Bodega al final.
      FOR v_inventory_row IN
        SELECT i.id,
               i.location_id,
               i.quantity,
               COALESCE(i.reserved_qty, 0)               AS reserved_qty,
               (i.quantity - COALESCE(i.reserved_qty, 0)) AS available
        FROM inventory i
        JOIN locations l ON l.id = i.location_id
        WHERE i.product_id = item.product_id
          AND (item.size IS NULL OR item.size = '' OR i.size = item.size)
          AND (i.quantity - COALESCE(i.reserved_qty, 0)) > 0
        ORDER BY
          CASE WHEN l.name ILIKE '%bodega%' THEN 1 ELSE 0 END ASC,
          l.name ASC
      LOOP
        IF v_remaining <= 0 THEN EXIT; END IF;

        v_take := LEAST(v_remaining, v_inventory_row.available);

        -- Incrementar reserva blanda
        UPDATE inventory
          SET reserved_qty = COALESCE(reserved_qty, 0) + v_take,
              updated_at   = NOW()
          WHERE id = v_inventory_row.id;

        -- Registrar en log de reservas
        INSERT INTO inventory_reservations
          (order_id, product_id, location_id, size, quantity, status)
        VALUES
          (NEW.id, item.product_id, v_inventory_row.location_id,
           NULLIF(item.size, ''), v_take, 'reserved');

        v_remaining := v_remaining - v_take;
      END LOOP;
    END LOOP;

    -- Marcar expiry: 2 horas desde ahora
    UPDATE orders
      SET reserved_at = NOW(),
          expires_at  = NOW() + INTERVAL '2 hours'
      WHERE id = NEW.id;

  END IF;

  -- ════════════════════════════════════════════════════════════════════
  -- CONFIRMED: pasar reservas a estado 'confirmed' (hard hold)
  -- ════════════════════════════════════════════════════════════════════
  IF NEW.status = 'confirmed' AND OLD.status IS DISTINCT FROM 'confirmed' THEN

    UPDATE inventory_reservations
      SET status     = 'confirmed',
          updated_at = NOW()
      WHERE order_id = NEW.id AND status = 'reserved';

  END IF;

  -- ════════════════════════════════════════════════════════════════════
  -- COMPLETED: decremento real + registro en ventas
  -- ════════════════════════════════════════════════════════════════════
  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN

    -- Verificar si existen reservas activas para este pedido
    SELECT EXISTS(
      SELECT 1 FROM inventory_reservations
      WHERE order_id = NEW.id AND status IN ('reserved', 'confirmed')
    ) INTO v_has_reservations;

    IF v_has_reservations THEN
      -- Decrement desde reservas: más preciso (sabe qué puesto tiene el stock)
      FOR v_inventory_row IN
        SELECT ir.location_id, ir.product_id, ir.size,
               ir.quantity AS res_qty, i.id AS inv_id
        FROM inventory_reservations ir
        JOIN inventory i ON i.product_id = ir.product_id
          AND i.location_id = ir.location_id
          AND (ir.size IS NULL OR i.size = ir.size)
        WHERE ir.order_id = NEW.id
          AND ir.status IN ('reserved', 'confirmed')
      LOOP
        UPDATE inventory
          SET quantity     = GREATEST(0, quantity - v_inventory_row.res_qty),
              reserved_qty = GREATEST(0, reserved_qty - v_inventory_row.res_qty),
              updated_at   = NOW()
          WHERE id = v_inventory_row.inv_id;

        UPDATE inventory_reservations
          SET status     = 'completed',
              updated_at = NOW()
          WHERE order_id   = NEW.id
            AND location_id = v_inventory_row.location_id
            AND product_id  = v_inventory_row.product_id;
      END LOOP;

    ELSE
      -- Fallback: decremento directo cuando no hay reservas previas
      FOR item IN
        SELECT oi.product_id, oi.quantity, oi.size
        FROM order_items oi WHERE oi.order_id = NEW.id
      LOOP
        IF item.size IS NOT NULL AND item.size != '' THEN
          UPDATE inventory
            SET quantity   = GREATEST(0, quantity - item.quantity),
                updated_at = NOW()
            WHERE id = (
              SELECT id FROM inventory
              WHERE product_id = item.product_id AND size = item.size AND quantity > 0
              ORDER BY quantity DESC LIMIT 1
            );
        ELSE
          UPDATE inventory
            SET quantity   = GREATEST(0, quantity - item.quantity),
                updated_at = NOW()
            WHERE id = (
              SELECT id FROM inventory
              WHERE product_id = item.product_id AND quantity > 0
              ORDER BY quantity DESC LIMIT 1
            );
        END IF;
      END LOOP;
    END IF;

    -- Registrar en historial de ventas (solo si aún no existe)
    IF NOT EXISTS (SELECT 1 FROM sales WHERE order_id = NEW.id) THEN

      -- Mapear payment_method TEXT → ENUM
      payment_mapped := CASE
        WHEN NEW.payment_method ILIKE '%efectivo%' OR NEW.payment_method ILIKE '%cash%'
          THEN 'cash'::payment_method
        WHEN NEW.payment_method ILIKE '%tarjeta%' OR NEW.payment_method ILIKE '%card%'
          THEN 'card'::payment_method
        ELSE 'qr'::payment_method
      END;

      -- Insertar header de venta
      INSERT INTO sales (
        organization_id, location_id, sold_by,
        customer_name, subtotal, discount, tax, total,
        payment_method, canal, order_id, notes, created_at
      ) VALUES (
        v_org_id,
        NEW.fulfillment_location_id,
        NEW.managed_by,
        NEW.customer_name,
        NEW.subtotal,
        COALESCE(NEW.discount, 0),
        0,
        NEW.total,
        payment_mapped,
        'online',
        NEW.id,
        'Pedido online #' || UPPER(LEFT(NEW.id::text, 8)),
        NOW()
      )
      RETURNING id INTO v_sale_id;

      -- Insertar una fila en sale_items por cada producto
      INSERT INTO sale_items
        (sale_id, product_id, quantity, unit_price, subtotal, size, color, location_id)
      SELECT
        v_sale_id,
        oi.product_id,
        oi.quantity,
        oi.unit_price,
        oi.subtotal,
        oi.size,
        oi.color,
        NULL
      FROM order_items oi
      WHERE oi.order_id = NEW.id;

    END IF;

  END IF;

  -- ════════════════════════════════════════════════════════════════════
  -- CANCELLED: liberar todas las reservas activas
  -- ════════════════════════════════════════════════════════════════════
  IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' THEN

    -- Liberar reserved_qty para reservas activas (reserved o confirmed)
    FOR v_inventory_row IN
      SELECT ir.location_id, ir.product_id, ir.size,
             ir.quantity AS res_qty, i.id AS inv_id
      FROM inventory_reservations ir
      JOIN inventory i ON i.product_id = ir.product_id
        AND i.location_id = ir.location_id
        AND (ir.size IS NULL OR i.size = ir.size)
      WHERE ir.order_id = NEW.id
        AND ir.status IN ('reserved', 'confirmed')
    LOOP
      UPDATE inventory
        SET reserved_qty = GREATEST(0, reserved_qty - v_inventory_row.res_qty),
            updated_at   = NOW()
        WHERE id = v_inventory_row.inv_id;

      UPDATE inventory_reservations
        SET status     = 'released',
            updated_at = NOW()
        WHERE order_id   = NEW.id
          AND location_id = v_inventory_row.location_id
          AND product_id  = v_inventory_row.product_id
          AND status IN ('reserved', 'confirmed');
    END LOOP;

    -- Si el pedido estaba 'completed', restaurar quantity también
    IF OLD.status = 'completed' THEN
      FOR v_inventory_row IN
        SELECT ir.location_id, ir.product_id, ir.size,
               ir.quantity AS res_qty, i.id AS inv_id
        FROM inventory_reservations ir
        JOIN inventory i ON i.product_id = ir.product_id
          AND i.location_id = ir.location_id
          AND (ir.size IS NULL OR i.size = ir.size)
        WHERE ir.order_id = NEW.id AND ir.status = 'completed'
      LOOP
        UPDATE inventory
          SET quantity   = quantity + v_inventory_row.res_qty,
              updated_at = NOW()
          WHERE id = v_inventory_row.inv_id;
      END LOOP;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Trigger para UPDATE de estado ─────────────────────────────────────────────
CREATE TRIGGER handle_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_status_change();

-- ── NOTA: No se crea trigger para INSERT ─────────────────────────────────────
-- El checkout de la landing inserta la order Y los order_items en dos
-- statements separados. Si el trigger INSERT disparara inmediatamente,
-- no encontraría items en order_items → 0 reservas creadas.
-- En su lugar, el API route llama a la función RPC reserve_order_inventory()
-- después de insertar ambos (order + items).
--
-- Para los admin que cambian estado a 'pending' desde el dashboard, el
-- trigger UPDATE (handle_order_status_change) maneja la reserva correctamente.

-- ── PARTE 6: RPC reserve_order_inventory — llamado desde checkout API ────────
-- Hace la misma lógica de reserva que el bloque PENDING del trigger,
-- pero se ejecuta DESPUÉS de que los order_items ya existen.

CREATE OR REPLACE FUNCTION reserve_order_inventory(p_order_id UUID)
RETURNS VOID AS $$
DECLARE
  item            RECORD;
  v_inventory_row RECORD;
  v_remaining     INTEGER;
  v_take          INTEGER;
BEGIN
  -- Limpiar reservas previas si existieran
  FOR v_inventory_row IN
    SELECT ir.location_id, ir.product_id, ir.size, ir.quantity AS res_qty, i.id AS inv_id
    FROM inventory_reservations ir
    JOIN inventory i ON i.product_id = ir.product_id
      AND i.location_id = ir.location_id
      AND (ir.size IS NULL OR i.size = ir.size)
    WHERE ir.order_id = p_order_id AND ir.status IN ('reserved','confirmed')
  LOOP
    UPDATE inventory
      SET reserved_qty = GREATEST(0, reserved_qty - v_inventory_row.res_qty),
          updated_at   = NOW()
      WHERE id = v_inventory_row.inv_id;
  END LOOP;
  DELETE FROM inventory_reservations WHERE order_id = p_order_id;

  FOR item IN
    SELECT oi.product_id, oi.quantity, oi.size
    FROM order_items oi WHERE oi.order_id = p_order_id
  LOOP
    v_remaining := item.quantity;

    FOR v_inventory_row IN
      SELECT i.id, i.location_id, i.quantity,
             COALESCE(i.reserved_qty, 0) AS reserved_qty,
             (i.quantity - COALESCE(i.reserved_qty, 0)) AS available
      FROM inventory i
      JOIN locations l ON l.id = i.location_id
      WHERE i.product_id = item.product_id
        AND (item.size IS NULL OR item.size = '' OR i.size = item.size)
        AND (i.quantity - COALESCE(i.reserved_qty, 0)) > 0
      ORDER BY
        CASE WHEN l.name ILIKE '%bodega%' THEN 1 ELSE 0 END ASC,
        l.name ASC
    LOOP
      IF v_remaining <= 0 THEN EXIT; END IF;
      v_take := LEAST(v_remaining, v_inventory_row.available);

      UPDATE inventory
        SET reserved_qty = COALESCE(reserved_qty, 0) + v_take,
            updated_at   = NOW()
        WHERE id = v_inventory_row.id;

      INSERT INTO inventory_reservations
        (order_id, product_id, location_id, size, quantity, status)
      VALUES
        (p_order_id, item.product_id, v_inventory_row.location_id,
         NULLIF(item.size, ''), v_take, 'reserved');

      v_remaining := v_remaining - v_take;
    END LOOP;
  END LOOP;

  UPDATE orders
    SET reserved_at = NOW(),
        expires_at  = NOW() + INTERVAL '2 hours'
    WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── PARTE 7: RPC apply_order_allocation — reasigna reservas manualmente ──────
-- Permite que el admin redistribuya el stock entre puestos desde el modal de
-- confirmación. Libera las reservas actuales del pedido e inserta las nuevas.
--
-- Parámetros:
--   p_order_id    UUID del pedido
--   p_allocations JSONB array: [{ product_id, location_id, size, quantity }]

CREATE OR REPLACE FUNCTION apply_order_allocation(
  p_order_id    UUID,
  p_allocations JSONB
)
RETURNS VOID AS $$
DECLARE
  v_alloc RECORD;
  v_inv_id UUID;
BEGIN
  -- Liberar reserved_qty de las reservas activas actuales
  FOR v_alloc IN
    SELECT ir.location_id, ir.product_id, ir.size, ir.quantity AS res_qty, i.id AS inv_id
    FROM inventory_reservations ir
    JOIN inventory i ON i.product_id = ir.product_id
      AND i.location_id = ir.location_id
      AND (ir.size IS NULL OR i.size = ir.size)
    WHERE ir.order_id = p_order_id AND ir.status IN ('reserved','confirmed')
  LOOP
    UPDATE inventory
      SET reserved_qty = GREATEST(0, reserved_qty - v_alloc.res_qty),
          updated_at   = NOW()
      WHERE id = v_alloc.inv_id;
  END LOOP;

  DELETE FROM inventory_reservations WHERE order_id = p_order_id;

  -- Aplicar nuevas asignaciones
  FOR v_alloc IN
    SELECT *
    FROM jsonb_to_recordset(p_allocations)
      AS x(product_id UUID, location_id UUID, size TEXT, quantity INTEGER)
  LOOP
    IF v_alloc.quantity <= 0 THEN CONTINUE; END IF;

    SELECT i.id INTO v_inv_id
    FROM inventory i
    WHERE i.product_id = v_alloc.product_id
      AND i.location_id = v_alloc.location_id
      AND (v_alloc.size IS NULL OR v_alloc.size = '' OR i.size = v_alloc.size)
    LIMIT 1;

    IF v_inv_id IS NOT NULL THEN
      UPDATE inventory
        SET reserved_qty = COALESCE(reserved_qty, 0) + v_alloc.quantity,
            updated_at   = NOW()
        WHERE id = v_inv_id;

      INSERT INTO inventory_reservations
        (order_id, product_id, location_id, size, quantity, status)
      VALUES
        (p_order_id, v_alloc.product_id, v_alloc.location_id,
         NULLIF(v_alloc.size, ''), v_alloc.quantity, 'reserved');
    END IF;
  END LOOP;

  UPDATE orders
    SET reserved_at = NOW(),
        expires_at  = NOW() + INTERVAL '2 hours'
    WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── PARTE 8: Función para cancelar pedidos expirados ─────────────────────────
-- Puede ser llamada por un Edge Function con cron o manualmente.

CREATE OR REPLACE FUNCTION cancel_expired_orders()
RETURNS INTEGER AS $$
DECLARE
  cancelled_count INTEGER := 0;
BEGIN
  UPDATE orders
    SET status = 'cancelled'
    WHERE status = 'pending'
      AND expires_at IS NOT NULL
      AND expires_at < NOW();

  GET DIAGNOSTICS cancelled_count = ROW_COUNT;
  RETURN cancelled_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICACIÓN DESPUÉS DE EJECUTAR:
--
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'inventory' AND column_name = 'reserved_qty';
--
--   SELECT table_name FROM information_schema.tables
--   WHERE table_name = 'inventory_reservations';
--
--   SELECT trigger_name FROM information_schema.triggers
--   WHERE trigger_schema = 'public' AND event_object_table = 'orders';
--
-- FLUJO DE PRUEBA:
--   1. INSERT un nuevo pedido con status='pending' → reservas creadas
--   2. UPDATE status='confirmed' → reservas pasan a 'confirmed'
--   3. UPDATE status='completed' → inventory decrementado, sales creado
--   4. UPDATE status='cancelled' (desde pending/confirmed) → reserved_qty liberado
-- ============================================================================
