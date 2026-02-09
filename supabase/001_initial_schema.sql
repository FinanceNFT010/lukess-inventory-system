-- ═══════════════════════════════════════════════════════════════════════════════
-- LUKESS HOME INVENTORY SYSTEM - INITIAL SCHEMA
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. EXTENSIONS
-- ══════════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. ENUMS
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');
CREATE TYPE payment_method AS ENUM ('cash', 'qr', 'card');
CREATE TYPE transaction_type AS ENUM ('sale', 'adjustment', 'return', 'transfer');

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. ORGANIZATIONS
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. LOCATIONS (Puestos/Sucursales)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_locations_org ON locations(organization_id);
CREATE INDEX idx_locations_active ON locations(organization_id, is_active);

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. PROFILES (Usuarios del sistema)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_org ON profiles(organization_id);
CREATE INDEX idx_profiles_location ON profiles(location_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(organization_id, role);

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. CATEGORIES
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

CREATE INDEX idx_categories_org ON categories(organization_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. PRODUCTS
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  cost NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
  brand TEXT,
  sizes TEXT[] NOT NULL DEFAULT '{}',
  colors TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, sku)
);

CREATE INDEX idx_products_org ON products(organization_id);
CREATE INDEX idx_products_sku ON products(organization_id, sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(organization_id, is_active);
CREATE INDEX idx_products_name ON products(organization_id, name);

-- ══════════════════════════════════════════════════════════════════════════════
-- 8. INVENTORY
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  max_stock INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, location_id)
);

CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_location ON inventory(location_id);
CREATE INDEX idx_inventory_low_stock ON inventory(product_id, location_id) WHERE quantity < min_stock;

-- ══════════════════════════════════════════════════════════════════════════════
-- 9. SALES
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  sold_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  customer_name TEXT,
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  discount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  tax NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  payment_method payment_method NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_org ON sales(organization_id);
CREATE INDEX idx_sales_location ON sales(location_id);
CREATE INDEX idx_sales_staff ON sales(sold_by);
CREATE INDEX idx_sales_date ON sales(organization_id, created_at DESC);
CREATE INDEX idx_sales_payment ON sales(organization_id, payment_method);

-- ══════════════════════════════════════════════════════════════════════════════
-- 10. SALE_ITEMS
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 11. INVENTORY_TRANSACTIONS (Auditoría de movimientos)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  transaction_type transaction_type NOT NULL,
  quantity_change INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inv_trans_inventory ON inventory_transactions(inventory_id);
CREATE INDEX idx_inv_trans_product ON inventory_transactions(product_id);
CREATE INDEX idx_inv_trans_location ON inventory_transactions(location_id);
CREATE INDEX idx_inv_trans_date ON inventory_transactions(created_at DESC);
CREATE INDEX idx_inv_trans_type ON inventory_transactions(transaction_type);

-- ══════════════════════════════════════════════════════════════════════════════
-- 12. AUDIT_LOG (Auditoría general del sistema)
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_org ON audit_log(organization_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_table ON audit_log(table_name);
CREATE INDEX idx_audit_date ON audit_log(organization_id, created_at DESC);

-- ══════════════════════════════════════════════════════════════════════════════
-- 13. FUNCTIONS & TRIGGERS
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Función: Actualizar updated_at automáticamente ────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Triggers para updated_at ──────────────────────────────────────────────────

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── Función: Auto-crear profile cuando se registra usuario ────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, organization_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'organization_id')::UUID, NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Trigger: Crear profile al registrarse ─────────────────────────────────────

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ── Función: Registrar transacción de inventario ──────────────────────────────

CREATE OR REPLACE FUNCTION log_inventory_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_change INTEGER;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.quantity != NEW.quantity THEN
    v_change := NEW.quantity - OLD.quantity;
    
    INSERT INTO inventory_transactions (
      inventory_id,
      product_id,
      location_id,
      transaction_type,
      quantity_change,
      quantity_before,
      quantity_after,
      created_by
    ) VALUES (
      NEW.id,
      NEW.product_id,
      NEW.location_id,
      (CASE 
        WHEN v_change < 0 THEN 'sale'
        ELSE 'adjustment'
      END)::transaction_type,
      v_change,
      OLD.quantity,
      NEW.quantity,
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Trigger: Log de cambios en inventario ─────────────────────────────────────

CREATE TRIGGER inventory_change_log
  AFTER UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION log_inventory_transaction();

-- ══════════════════════════════════════════════════════════════════════════════
-- 14. HABILITAR ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ══════════════════════════════════════════════════════════════════════════════
-- 15. POLÍTICAS RLS BÁSICAS (Se expandirán en 003_rls_policies.sql)
-- ══════════════════════════════════════════════════════════════════════════════

-- Permitir lectura pública de profiles (necesario para el trigger de signup)
CREATE POLICY "Enable insert for authentication users only"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 16. COMENTARIOS EN TABLAS
-- ══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE organizations IS 'Organizaciones/empresas multi-tenant';
COMMENT ON TABLE locations IS 'Ubicaciones físicas (puestos, sucursales)';
COMMENT ON TABLE profiles IS 'Perfiles de usuarios del sistema';
COMMENT ON TABLE categories IS 'Categorías de productos';
COMMENT ON TABLE products IS 'Catálogo de productos';
COMMENT ON TABLE inventory IS 'Stock por producto y ubicación';
COMMENT ON TABLE sales IS 'Registro de ventas';
COMMENT ON TABLE sale_items IS 'Items/líneas de cada venta';
COMMENT ON TABLE inventory_transactions IS 'Log de movimientos de inventario';
COMMENT ON TABLE audit_log IS 'Auditoría general del sistema';

-- ══════════════════════════════════════════════════════════════════════════════
-- RESUMEN DEL SCHEMA
-- ══════════════════════════════════════════════════════════════════════════════
--
-- ✅ 10 tablas creadas
-- ✅ 3 enums creados (user_role, payment_method, transaction_type)
-- ✅ Foreign keys con CASCADE apropiado
-- ✅ Índices para performance
-- ✅ Triggers para updated_at
-- ✅ Trigger para auto-crear profile al registrarse
-- ✅ Trigger para log de transacciones de inventario
-- ✅ RLS habilitado en todas las tablas
-- ✅ Constraints CHECK para validaciones
-- ✅ UUIDs como primary keys
--
-- PRÓXIMOS PASOS:
-- 1. Ejecutar 002_seed_demo_data.sql (datos de prueba)
-- 2. Ejecutar 003_rls_policies.sql (políticas completas de seguridad)
--
-- ══════════════════════════════════════════════════════════════════════════════
