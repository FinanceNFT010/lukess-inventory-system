-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) para Lukess Home Inventory System
-- Ejecutar en Supabase SQL Editor DESPUÉS del schema y seed
-- ═══════════════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════════════
-- Función helper: obtener org_id del usuario actual
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- Función helper: obtener rol del usuario actual
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- Función helper: obtener location_id del usuario actual
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_user_location_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT location_id FROM public.profiles WHERE id = auth.uid();
$$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. ORGANIZATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Solo ver tu propia organización
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (id = public.get_user_org_id());

-- Solo admin puede actualizar la organización
CREATE POLICY "Admin can update organization"
  ON organizations FOR UPDATE
  USING (id = public.get_user_org_id() AND public.get_user_role() = 'admin')
  WITH CHECK (id = public.get_user_org_id());


-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. LOCATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios ven las ubicaciones de su organización
CREATE POLICY "Users can view org locations"
  ON locations FOR SELECT
  USING (organization_id = public.get_user_org_id());

-- Solo admin puede crear ubicaciones
CREATE POLICY "Admin can insert locations"
  ON locations FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_org_id()
    AND public.get_user_role() = 'admin'
  );

-- Solo admin puede actualizar ubicaciones
CREATE POLICY "Admin can update locations"
  ON locations FOR UPDATE
  USING (organization_id = public.get_user_org_id() AND public.get_user_role() = 'admin')
  WITH CHECK (organization_id = public.get_user_org_id());


-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. PROFILES
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Todos ven perfiles de su organización
CREATE POLICY "Users can view org profiles"
  ON profiles FOR SELECT
  USING (organization_id = public.get_user_org_id());

-- Admin puede crear perfiles en su organización
CREATE POLICY "Admin can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_org_id()
    AND public.get_user_role() = 'admin'
  );

-- Usuarios pueden actualizar su propio perfil (campos limitados)
-- Admin/Manager pueden actualizar cualquier perfil de su org
CREATE POLICY "Users can update own profile or admin updates any"
  ON profiles FOR UPDATE
  USING (
    organization_id = public.get_user_org_id()
    AND (
      id = auth.uid()
      OR public.get_user_role() IN ('admin', 'manager')
    )
  )
  WITH CHECK (organization_id = public.get_user_org_id());

-- Permitir INSERT durante registro (cuando el profile aún no existe)
CREATE POLICY "Users can insert own profile on signup"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());


-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. CATEGORIES
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Todos ven categorías de su organización
CREATE POLICY "Users can view org categories"
  ON categories FOR SELECT
  USING (organization_id = public.get_user_org_id());

-- Admin/Manager pueden crear categorías
CREATE POLICY "Admin/Manager can insert categories"
  ON categories FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_org_id()
    AND public.get_user_role() IN ('admin', 'manager')
  );

-- Admin/Manager pueden actualizar categorías
CREATE POLICY "Admin/Manager can update categories"
  ON categories FOR UPDATE
  USING (
    organization_id = public.get_user_org_id()
    AND public.get_user_role() IN ('admin', 'manager')
  )
  WITH CHECK (organization_id = public.get_user_org_id());

-- Admin puede eliminar categorías
CREATE POLICY "Admin can delete categories"
  ON categories FOR DELETE
  USING (
    organization_id = public.get_user_org_id()
    AND public.get_user_role() = 'admin'
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. PRODUCTS
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Todos ven productos de su organización
CREATE POLICY "Users can view org products"
  ON products FOR SELECT
  USING (organization_id = public.get_user_org_id());

-- Admin/Manager pueden crear productos
CREATE POLICY "Admin/Manager can insert products"
  ON products FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_org_id()
    AND public.get_user_role() IN ('admin', 'manager')
  );

-- Admin/Manager pueden actualizar productos
CREATE POLICY "Admin/Manager can update products"
  ON products FOR UPDATE
  USING (
    organization_id = public.get_user_org_id()
    AND public.get_user_role() IN ('admin', 'manager')
  )
  WITH CHECK (organization_id = public.get_user_org_id());

-- Admin puede eliminar (desactivar) productos
CREATE POLICY "Admin can delete products"
  ON products FOR DELETE
  USING (
    organization_id = public.get_user_org_id()
    AND public.get_user_role() = 'admin'
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. INVENTORY
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Todos ven inventario de productos de su organización
-- Staff solo ve inventario de su ubicación asignada
CREATE POLICY "Users can view org inventory"
  ON inventory FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = inventory.product_id
        AND products.organization_id = public.get_user_org_id()
    )
    AND (
      public.get_user_role() IN ('admin', 'manager')
      OR location_id = public.get_user_location_id()
    )
  );

-- Admin/Manager pueden crear registros de inventario
CREATE POLICY "Admin/Manager can insert inventory"
  ON inventory FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = inventory.product_id
        AND products.organization_id = public.get_user_org_id()
    )
    AND public.get_user_role() IN ('admin', 'manager')
  );

-- Admin/Manager pueden actualizar todo el inventario
-- Staff solo puede actualizar inventario de su ubicación (para ventas)
CREATE POLICY "Users can update inventory based on role"
  ON inventory FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = inventory.product_id
        AND products.organization_id = public.get_user_org_id()
    )
    AND (
      public.get_user_role() IN ('admin', 'manager')
      OR location_id = public.get_user_location_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = inventory.product_id
        AND products.organization_id = public.get_user_org_id()
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. SALES
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Admin/Manager ven todas las ventas de su organización
-- Staff solo ve ventas de su ubicación
CREATE POLICY "Users can view org sales"
  ON sales FOR SELECT
  USING (
    organization_id = public.get_user_org_id()
    AND (
      public.get_user_role() IN ('admin', 'manager')
      OR location_id = public.get_user_location_id()
    )
  );

-- Todos pueden crear ventas en su organización
-- Staff solo puede vender en su ubicación asignada
CREATE POLICY "Users can insert sales in their location"
  ON sales FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_org_id()
    AND sold_by = auth.uid()
    AND (
      public.get_user_role() IN ('admin', 'manager')
      OR location_id = public.get_user_location_id()
    )
  );

-- Solo admin puede actualizar/anular ventas
CREATE POLICY "Admin can update sales"
  ON sales FOR UPDATE
  USING (
    organization_id = public.get_user_org_id()
    AND public.get_user_role() = 'admin'
  )
  WITH CHECK (organization_id = public.get_user_org_id());


-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. SALE_ITEMS
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Los usuarios ven items de ventas que pueden ver
CREATE POLICY "Users can view sale items"
  ON sale_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
        AND sales.organization_id = public.get_user_org_id()
        AND (
          public.get_user_role() IN ('admin', 'manager')
          OR sales.location_id = public.get_user_location_id()
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
        AND sales.organization_id = public.get_user_org_id()
        AND sales.sold_by = auth.uid()
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- RESUMEN DE POLÍTICAS
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- ┌─────────────────┬─────────────┬─────────────────────┬─────────────┐
-- │ Tabla           │ Admin       │ Manager             │ Staff       │
-- ├─────────────────┼─────────────┼─────────────────────┼─────────────┤
-- │ organizations   │ Ver/Editar  │ Ver                 │ Ver         │
-- │ locations       │ CRUD        │ Ver                 │ Ver         │
-- │ profiles        │ CRUD (org)  │ Ver/Editar (org)    │ Ver/Editar* │
-- │ categories      │ CRUD        │ Crear/Ver/Editar    │ Ver         │
-- │ products        │ CRUD        │ Crear/Ver/Editar    │ Ver         │
-- │ inventory       │ CRUD (org)  │ CRUD (org)          │ Ver/Edit**  │
-- │ sales           │ CRUD (org)  │ Ver/Crear (org)     │ Ver/Crear***│
-- │ sale_items      │ Ver/Crear   │ Ver/Crear           │ Ver/Crear***│
-- └─────────────────┴─────────────┴─────────────────────┴─────────────┘
--
-- * Staff solo puede editar su propio perfil
-- ** Staff solo ve/edita inventario de su ubicación
-- *** Staff solo ve/crea ventas en su ubicación asignada
--
-- Todas las políticas filtran por organization_id para aislamiento multi-tenant
