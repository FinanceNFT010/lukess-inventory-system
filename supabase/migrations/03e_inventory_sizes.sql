-- ============================================================================
-- MIGRACIÓN 03e: Canal de venta + auto-decrement en confirmación de pedido
-- ============================================================================
-- Fecha: 20/02/2026
-- Bloque: 3e-A
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

-- ── PARTE 5: Función + trigger auto-decrement + registro en ventas ────────────

CREATE OR REPLACE FUNCTION handle_order_confirmation()
RETURNS TRIGGER AS $$
DECLARE
  item           RECORD;
  payment_mapped payment_method;
BEGIN
  -- Solo actuar cuando el estado cambia A 'confirmed'
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN

    -- ── Mapear payment_method (TEXT en orders) al ENUM de sales ──────────────
    payment_mapped := CASE
      WHEN NEW.payment_method ILIKE '%efectivo%' OR NEW.payment_method ILIKE '%cash%'
        THEN 'cash'::payment_method
      WHEN NEW.payment_method ILIKE '%tarjeta%' OR NEW.payment_method ILIKE '%card%'
        THEN 'card'::payment_method
      ELSE 'qr'::payment_method
    END;

    -- ── Decrementar inventario por cada ítem del pedido ───────────────────────
    FOR item IN
      SELECT oi.product_id, oi.quantity, oi.size
      FROM order_items oi
      WHERE oi.order_id = NEW.id
    LOOP
      IF item.size IS NOT NULL AND item.size != '' THEN
        -- Descontar del registro de inventario con esa talla y más stock
        UPDATE inventory
        SET quantity   = GREATEST(0, quantity - item.quantity),
            updated_at = NOW()
        WHERE id = (
          SELECT id
          FROM inventory
          WHERE product_id = item.product_id
            AND size       = item.size
            AND quantity   > 0
          ORDER BY quantity DESC
          LIMIT 1
        );
      ELSE
        -- Sin talla: descontar del registro con más stock
        UPDATE inventory
        SET quantity   = GREATEST(0, quantity - item.quantity),
            updated_at = NOW()
        WHERE id = (
          SELECT id
          FROM inventory
          WHERE product_id = item.product_id
            AND quantity   > 0
          ORDER BY quantity DESC
          LIMIT 1
        );
      END IF;
    END LOOP;

    -- ── Registrar en historial de ventas (solo una vez por pedido) ────────────
    IF NOT EXISTS (SELECT 1 FROM sales WHERE order_id = NEW.id) THEN
      INSERT INTO sales (
        organization_id,
        location_id,
        sold_by,
        customer_name,
        subtotal,
        discount,
        tax,
        total,
        payment_method,
        canal,
        order_id,
        created_at
      ) VALUES (
        NEW.organization_id,
        NULL,                          -- pedido online: sin puesto físico
        NEW.managed_by,                -- quién lo gestionó (puede ser NULL)
        NEW.customer_name,
        NEW.subtotal,
        COALESCE(NEW.discount, 0),
        0,
        NEW.total,
        payment_mapped,
        'online',
        NEW.id,
        NOW()
      );
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Crear trigger ─────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trigger_handle_order_confirmation ON orders;

CREATE TRIGGER trigger_handle_order_confirmation
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_order_confirmation();

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
--   WHERE routine_name = 'handle_order_confirmation';
--
--   SELECT trigger_name FROM information_schema.triggers
--   WHERE trigger_name = 'trigger_handle_order_confirmation';
--
-- ============================================================================
-- NOTAS:
--   - inventory YA rastrea stock por talla (columna `size` en tabla inventory)
--   - El UI de inventario YA muestra desglose por talla desde la tabla inventory
--   - El trigger decrementa inventory.quantity por product_id + size
--   - sold_by y location_id ahora son nullable en sales (para pedidos online)
--   - Las ventas del POS existentes no se ven afectadas (canal = 'fisico' default)
-- ============================================================================
