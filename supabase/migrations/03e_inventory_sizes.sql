-- ============================================================================
-- MIGRACIÓN 03e: Canal de venta + auto-decrement al completar pedido
-- ============================================================================
-- Fecha: 20/02/2026
-- Bloque: 3e-A / Fix 3e-A.2
--
-- NOTA DE AUDITORÍA:
--   La tabla `inventory_sizes` NO es necesaria porque la tabla `inventory`
--   ya rastrea stock por (product_id, location_id, size) con una fila por
--   combinación. El UI ya muestra el desglose por talla.
--
-- EJECUTAR EN:
--   https://supabase.com/dashboard/project/lrcggpdgrqltqbxqnjgh/editor
-- ============================================================================

-- ── PARTE 1: Columna canal en orders ─────────────────────────────────────────

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS canal TEXT DEFAULT 'online'
  CHECK (canal IN ('online', 'fisico'));

COMMENT ON COLUMN orders.canal IS 'Canal de origen: online (landing) | fisico (punto de venta)';

-- ── PARTE 2: Columna canal en sales ──────────────────────────────────────────

ALTER TABLE sales
ADD COLUMN IF NOT EXISTS canal TEXT DEFAULT 'fisico'
  CHECK (canal IN ('online', 'fisico'));

COMMENT ON COLUMN sales.canal IS 'Canal de venta: fisico (POS) | online (pedido confirmado)';

-- ── PARTE 3: Hacer sold_by y location_id nullable en sales ───────────────────
-- Necesario para registrar ventas online que no tienen vendedor ni puesto físico

ALTER TABLE sales
  ALTER COLUMN sold_by DROP NOT NULL;

ALTER TABLE sales
  ALTER COLUMN location_id DROP NOT NULL;

-- ── PARTE 4: Columna order_id en sales para trazabilidad ─────────────────────

ALTER TABLE sales
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sales_order_id ON sales(order_id);
CREATE INDEX IF NOT EXISTS idx_sales_canal ON sales(canal);
CREATE INDEX IF NOT EXISTS idx_orders_canal ON orders(canal);

-- ── PARTE 5: Función + trigger (fires on 'completed', not 'confirmed') ────────
--
-- FIX 3e-A.2: Mover decrement + registro a 'completed' para que el admin
-- pueda confirmar y enviar sin afectar inventario hasta que el pedido termine.
-- También incluye restore de inventario si un pedido completed se cancela.
-- También inserta sale_items por cada order_item (para que el modal muestre productos).

DROP TRIGGER IF EXISTS trigger_handle_order_confirmation ON orders;
DROP TRIGGER IF EXISTS handle_order_completion ON orders;
DROP FUNCTION IF EXISTS handle_order_confirmation();
DROP FUNCTION IF EXISTS handle_order_completion();

CREATE OR REPLACE FUNCTION handle_order_completion()
RETURNS TRIGGER AS $$
DECLARE
  item           RECORD;
  payment_mapped payment_method;
  v_org_id       UUID;
  v_sale_id      UUID;
BEGIN

  -- ── ON COMPLETED: decrement inventory + register in sales ────────────────
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN

    -- Resolve organization_id from products if order doesn't have it
    v_org_id := COALESCE(
      NEW.organization_id,
      (SELECT p.organization_id
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = NEW.id
       LIMIT 1)
    );

    -- Map payment_method TEXT → ENUM
    payment_mapped := CASE
      WHEN NEW.payment_method ILIKE '%efectivo%' OR NEW.payment_method ILIKE '%cash%'
        THEN 'cash'::payment_method
      WHEN NEW.payment_method ILIKE '%tarjeta%' OR NEW.payment_method ILIKE '%card%'
        THEN 'card'::payment_method
      ELSE 'qr'::payment_method
    END;

    -- Only create sale record if not already created for this order
    IF NOT EXISTS (SELECT 1 FROM sales WHERE order_id = NEW.id) THEN

      -- Insert one sales header row for the whole order
      INSERT INTO sales (
        organization_id, location_id, sold_by,
        customer_name, subtotal, discount, tax, total,
        payment_method, canal, order_id, notes, created_at
      ) VALUES (
        v_org_id,
        NULL,
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

      -- Insert one sale_item per order line (so modal shows products)
      INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal, size, color, location_id)
      SELECT v_sale_id, oi.product_id, oi.quantity, oi.unit_price, oi.subtotal,
             oi.size, oi.color, NULL
      FROM order_items oi
      WHERE oi.order_id = NEW.id;

    END IF;

    -- Decrement inventory by size for each order item
    FOR item IN
      SELECT oi.product_id, oi.quantity, oi.size
      FROM order_items oi
      WHERE oi.order_id = NEW.id
    LOOP
      IF item.size IS NOT NULL AND item.size != '' THEN
        UPDATE inventory
        SET quantity = GREATEST(0, quantity - item.quantity), updated_at = NOW()
        WHERE id = (
          SELECT id FROM inventory
          WHERE product_id = item.product_id AND size = item.size AND quantity > 0
          ORDER BY quantity DESC LIMIT 1
        );
      ELSE
        UPDATE inventory
        SET quantity = GREATEST(0, quantity - item.quantity), updated_at = NOW()
        WHERE id = (
          SELECT id FROM inventory
          WHERE product_id = item.product_id AND quantity > 0
          ORDER BY quantity DESC LIMIT 1
        );
      END IF;
    END LOOP;

  END IF;

  -- ── ON CANCELLED (was completed): restore inventory ──────────────────────
  IF NEW.status = 'cancelled' AND OLD.status = 'completed' THEN
    FOR item IN
      SELECT oi.product_id, oi.quantity, oi.size
      FROM order_items oi
      WHERE oi.order_id = NEW.id
    LOOP
      IF item.size IS NOT NULL AND item.size != '' THEN
        UPDATE inventory
        SET quantity = quantity + item.quantity, updated_at = NOW()
        WHERE id = (
          SELECT id FROM inventory
          WHERE product_id = item.product_id AND size = item.size
          ORDER BY quantity ASC LIMIT 1
        );
      ELSE
        UPDATE inventory
        SET quantity = quantity + item.quantity, updated_at = NOW()
        WHERE id = (
          SELECT id FROM inventory
          WHERE product_id = item.product_id
          ORDER BY quantity ASC LIMIT 1
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER handle_order_completion
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_completion();

-- ── PARTE 6: RLS para la columna order_id (usa políticas existentes de sales) ─
-- No se necesitan políticas adicionales; sales ya tiene RLS activo.

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- Después de ejecutar, verificar con:
--
--   SELECT column_name, data_type, is_nullable, column_default
--   FROM information_schema.columns
--   WHERE table_name IN ('orders', 'sales')
--     AND column_name IN ('canal', 'order_id')
--   ORDER BY table_name;
--
--   SELECT routine_name FROM information_schema.routines
--   WHERE routine_name = 'handle_order_completion';
--
--   SELECT trigger_name FROM information_schema.triggers
--   WHERE trigger_name = 'handle_order_completion';
--
-- ============================================================================
-- NOTAS:
--   - inventory YA rastrea stock por talla (columna `size` en tabla inventory)
--   - El UI de inventario YA muestra desglose por talla desde la tabla inventory
--   - El trigger se dispara en 'completed' (no en 'confirmed')
--   - Inserta 1 fila en sales + 1 fila en sale_items por producto del pedido
--   - Cancelar un pedido 'completed' restaura el inventario automáticamente
--   - sold_by y location_id ahora son nullable en sales (para pedidos online)
--   - Las ventas del POS existentes no se ven afectadas (canal = 'fisico' default)
-- ============================================================================
