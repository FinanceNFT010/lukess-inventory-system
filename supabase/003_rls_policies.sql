-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) para Lukess Home Inventory System
-- Ejecutar en Supabase SQL Editor DESPUÉS del schema y seed
-- ═══════════════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════════════
-- FUNCIONES HELPER PARA RLS
-- ══════════════════════════════════════════════════════════════════════════════

-- Función helper: obtener organization_id del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Función helper: obtener rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Función helper: obtener location_id del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_location_id()
RETURNS UUID AS $$
  SELECT location_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. ORGANIZATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
DROP POLICY IF EXISTS "Admin can update organization" ON organizations;

-- Solo ver tu propia organización
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (id = get_user_org_id());

-- Solo admin puede actualizar la organización
CREATE POLICY "Admin can update organization"
  ON organizations FOR UPDATE
  USING (id = get_user_org_id() AND get_user_role() = 'admin')
  WITH CHECK (id = get_user_org_id());


-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. LOCATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view org locations" ON locations;
DROP POLICY IF EXISTS "Admin can insert locations" ON locations;
DROP POLICY IF EXISTS "Admin can update locations" ON locations;

-- Todos los usuarios ven las ubicaciones de su organización
CREATE POLICY "Users can view org locations"
  ON locations FOR SELECT
  USING (organization_id = get_user_org_id());

-- Solo admin puede crear ubicaciones
CREATE POLICY "Admin can insert locations"
  ON locations FOR INSERT
  WITH CHECK (
    organization_id = get_user_org_id()
    AND get_user_role() = 'admin'
  );

-- Solo admin puede actualizar ubicaciones
CREATE POLICY "Admin can update locations"
  ON locations FOR UPDATE
  USING (organization_id = get_user_org_id() AND get_user_role() = 'admin')
  WITH CHECK (organization_id = get_user_org_id());


-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. PROFILES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view org profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile or admin updates any" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile on signup" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authentication users only" ON profiles;

-- Todos ven perfiles de su organización
CREATE POLICY "Users can view org profiles"
  ON profiles FOR SELECT
  USING (organization_id = get_user_org_id());

-- Admin puede crear perfiles en su organización
CREATE POLICY "Admin can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    organization_id = get_user_org_id()
    AND get_user_role() = 'admin'
  );

-- Usuarios pueden actualizar su propio perfil (campos limitados)
-- Admin/Manager pueden actualizar cualquier perfil de su org
CREATE POLICY "Users can update own profile or admin updates any"
  ON profiles FOR UPDATE
  USING (
    organization_id = get_user_org_id()
    AND (
      id = auth.uid()
      OR get_user_role() IN ('admin', 'manager')
    )
  )
  WITH CHECK (organization_id = get_user_org_id());

-- Permitir INSERT durante registro (cuando el profile aún no existe)
CREATE POLICY "Users can insert own profile on signup"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());


-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. CATEGORIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view org categories" ON categories;
DROP POLICY IF EXISTS "Admin/Manager can insert categories" ON categories;
DROP POLICY IF EXISTS "Admin/Manager can update categories" ON categories;
DROP POLICY IF EXISTS "Admin can delete categories" ON categories;

-- Todos ven categorías de su organización
CREATE POLICY "Users can view org categories"
  ON categories FOR SELECT
  USING (organization_id = get_user_org_id());

-- Admin/Manager pueden crear categorías
CREATE POLICY "Admin/Manager can insert categories"
  ON categories FOR INSERT
  WITH CHECK (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('admin', 'manager')
  );

-- Admin/Manager pueden actualizar categorías
CREATE POLICY "Admin/Manager can update categories"
  ON categories FOR UPDATE
  USING (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('admin', 'manager')
  )
  WITH CHECK (organization_id = get_user_org_id());

-- Admin puede eliminar categorías
CREATE POLICY "Admin can delete categories"
  ON categories FOR DELETE
  USING (
    organization_id = get_user_org_id()
    AND get_user_role() = 'admin'
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. PRODUCTS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view org products" ON products;
DROP POLICY IF EXISTS "Admin/Manager can insert products" ON products;
DROP POLICY IF EXISTS "Admin/Manager can update products" ON products;
DROP POLICY IF EXISTS "Admin can delete products" ON products;

-- Todos ven productos de su organización
CREATE POLICY "Users can view org products"
  ON products FOR SELECT
  USING (organization_id = get_user_org_id());

-- Admin/Manager pueden crear productos
CREATE POLICY "Admin/Manager can insert products"
  ON products FOR INSERT
  WITH CHECK (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('admin', 'manager')
  );

-- Admin/Manager pueden actualizar productos
CREATE POLICY "Admin/Manager can update products"
  ON products FOR UPDATE
  USING (
    organization_id = get_user_org_id()
    AND get_user_role() IN ('admin', 'manager')
  )
  WITH CHECK (organization_id = get_user_org_id());

-- Admin puede eliminar (desactivar) productos
CREATE POLICY "Admin can delete products"
  ON products FOR DELETE
  USING (
    organization_id = get_user_org_id()
    AND get_user_role() = 'admin'
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. INVENTORY
-- ═══════════════════════════════════════════════════════════════════════════════

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view org inventory" ON inventory;
DROP POLICY IF EXISTS "Admin/Manager can insert inventory" ON inventory;
DROP POLICY IF EXISTS "Users can update inventory based on role" ON inventory;

-- Todos ven inventario de productos de su organización
-- Staff solo ve inventario de su ubicación asignada
CREATE POLICY "Users can view org inventory"
  ON inventory FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = inventory.product_id
        AND products.organization_id = get_user_org_id()
    )
    AND (
      get_user_role() IN ('admin', 'manager')
      OR location_id = get_user_location_id()
    )
  );

-- Admin/Manager pueden crear registros de inventario
CREATE POLICY "Admin/Manager can insert inventory"
  ON inventory FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = inventory.product_id
        AND products.organization_id = get_user_org_id()
    )
    AND get_user_role() IN ('admin', 'manager')
  );

-- Admin/Manager pueden actualizar todo el inventario
-- Staff solo puede actualizar inventario de su ubicación (para ventas)
CREATE POLICY "Users can update inventory based on role"
  ON inventory FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = inventory.product_id
        AND products.organization_id = get_user_org_id()
    )
    AND (
      get_user_role() IN ('admin', 'manager')
      OR location_id = get_user_location_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = inventory.product_id
        AND products.organization_id = get_user_org_id()
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. SALES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view org sales" ON sales;
DROP POLICY IF EXISTS "Users can insert sales in their location" ON sales;
DROP POLICY IF EXISTS "Admin can update sales" ON sales;

-- Admin/Manager ven todas las ventas de su organización
-- Staff solo ve ventas de su ubicación
CREATE POLICY "Users can view org sales"
  ON sales FOR SELECT
  USING (
    organization_id = get_user_org_id()
    AND (
      get_user_role() IN ('admin', 'manager')
      OR location_id = get_user_location_id()
    )
  );

-- Todos pueden crear ventas en su organización
-- Staff solo puede vender en su ubicación asignada
CREATE POLICY "Users can insert sales in their location"
  ON sales FOR INSERT
  WITH CHECK (
    organization_id = get_user_org_id()
    AND sold_by = auth.uid()
    AND (
      get_user_role() IN ('admin', 'manager')
      OR location_id = get_user_location_id()
    )
  );

-- Solo admin puede actualizar/anular ventas
CREATE POLICY "Admin can update sales"
  ON sales FOR UPDATE
  USING (
    organization_id = get_user_org_id()
    AND get_user_role() = 'admin'
  )
  WITH CHECK (organization_id = get_user_org_id());


-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. SALE_ITEMS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view sale items" ON sale_items;
DROP POLICY IF EXISTS "Users can insert sale items" ON sale_items;

-- Los usuarios ven items de ventas que pueden ver
CREATE POLICY "Users can view sale items"
  ON sale_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
        AND sales.organization_id = get_user_org_id()
        AND (
          get_user_role() IN ('admin', 'manager')
          OR sales.location_id = get_user_location_id()
        )
    )
  );

-- Todos pueden insertar items cuando crean una venta
CREATE POLICY "Users can insert sale items"
  ON sale_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
        AND sales.organization_id = get_user_org_id()
        AND sales.sold_by = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. INVENTORY_TRANSACTIONS (Opcional - para auditoría)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view org inventory transactions" ON inventory_transactions;
DROP POLICY IF EXISTS "System can insert inventory transactions" ON inventory_transactions;

-- Admin/Manager ven todas las transacciones de su organización
-- Staff solo ve transacciones de su ubicación
CREATE POLICY "Users can view org inventory transactions"
  ON inventory_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = inventory_transactions.product_id
        AND products.organization_id = get_user_org_id()
    )
    AND (
      get_user_role() IN ('admin', 'manager')
      OR location_id = get_user_location_id()
    )
  );

-- El sistema puede insertar transacciones (triggers)
CREATE POLICY "System can insert inventory transactions"
  ON inventory_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = inventory_transactions.product_id
        AND products.organization_id = get_user_org_id()
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. AUDIT_LOG (Opcional - para auditoría general)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Admin can view audit log" ON audit_log;
DROP POLICY IF EXISTS "System can insert audit log" ON audit_log;

-- Solo admin puede ver el audit log
CREATE POLICY "Admin can view audit log"
  ON audit_log FOR SELECT
  USING (
    organization_id = get_user_org_id()
    AND get_user_role() = 'admin'
  );

-- El sistema puede insertar en audit log
CREATE POLICY "System can insert audit log"
  ON audit_log FOR INSERT
  WITH CHECK (organization_id = get_user_org_id());


-- ═══════════════════════════════════════════════════════════════════════════════
-- RESUMEN DE POLÍTICAS RLS
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- ┌─────────────────────────┬─────────────┬─────────────────────┬─────────────┐
-- │ Tabla                   │ Admin       │ Manager             │ Staff       │
-- ├─────────────────────────┼─────────────┼─────────────────────┼─────────────┤
-- │ organizations           │ Ver/Editar  │ Ver                 │ Ver         │
-- │ locations               │ CRUD        │ Ver                 │ Ver         │
-- │ profiles                │ CRUD (org)  │ Ver/Editar (org)    │ Ver/Editar* │
-- │ categories              │ CRUD        │ Crear/Ver/Editar    │ Ver         │
-- │ products                │ CRUD        │ Crear/Ver/Editar    │ Ver         │
-- │ inventory               │ CRUD (org)  │ CRUD (org)          │ Ver/Edit**  │
-- │ sales                   │ CRUD (org)  │ Ver/Crear (org)     │ Ver/Crear***│
-- │ sale_items              │ Ver/Crear   │ Ver/Crear           │ Ver/Crear***│
-- │ inventory_transactions  │ Ver (org)   │ Ver (org)           │ Ver**       │
-- │ audit_log               │ Ver (org)   │ -                   │ -           │
-- └─────────────────────────┴─────────────┴─────────────────────┴─────────────┘
--
-- * Staff solo puede editar su propio perfil
-- ** Staff solo ve/edita inventario de su ubicación
-- *** Staff solo ve/crea ventas en su ubicación asignada
--
-- FUNCIONES HELPER:
-- - get_user_org_id() → UUID: Retorna organization_id del usuario actual
-- - get_user_role() → TEXT: Retorna rol del usuario (admin/manager/staff)
-- - get_user_location_id() → UUID: Retorna location_id asignada al usuario
--
-- AISLAMIENTO MULTI-TENANT:
-- Todas las políticas filtran por organization_id usando get_user_org_id()
-- para garantizar que los usuarios solo vean datos de su organización.
--
-- ═══════════════════════════════════════════════════════════════════════════════
