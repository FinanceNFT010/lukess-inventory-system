-- ============================================================================
-- SISTEMA DE VARIANTES DE PRODUCTO
-- ============================================================================
-- Este script implementa un sistema de variantes para productos
-- Permite tracking individual de combinaciones Talla + Color
-- ============================================================================

-- ── PASO 1: Crear tabla de variantes ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  
  -- Identificación de variante
  sku TEXT NOT NULL,  -- SKU único: "POL-ADIDAS-40-BLANCO"
  size TEXT,          -- "38", "40", "42", "M", "L", "XL"
  color TEXT,         -- "Blanco", "Negro", "Azul"
  
  -- Pricing (puede variar por talla)
  price NUMERIC(10,2) NOT NULL,
  cost NUMERIC(10,2),
  
  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(organization_id, sku),
  UNIQUE(product_id, size, color)  -- No duplicar misma combinación
);

-- ── PASO 2: Modificar tabla inventory ───────────────────────────────────────

-- Agregar columna variant_id
ALTER TABLE public.inventory
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE;

-- Hacer product_id opcional (para migración gradual)
ALTER TABLE public.inventory
ALTER COLUMN product_id DROP NOT NULL;

-- Agregar constraint: debe tener product_id O variant_id
ALTER TABLE public.inventory
ADD CONSTRAINT inventory_product_or_variant_check 
CHECK (
  (product_id IS NOT NULL AND variant_id IS NULL) OR 
  (product_id IS NULL AND variant_id IS NOT NULL)
);

-- Modificar unique constraint para incluir variant_id
ALTER TABLE public.inventory
DROP CONSTRAINT IF EXISTS inventory_product_id_location_id_key;

-- Nuevo constraint único
CREATE UNIQUE INDEX IF NOT EXISTS inventory_variant_location_unique 
ON public.inventory(variant_id, location_id) 
WHERE variant_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS inventory_product_location_unique 
ON public.inventory(product_id, location_id) 
WHERE product_id IS NOT NULL;

-- ── PASO 3: Índices para performance ────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_variants_product 
ON public.product_variants(product_id);

CREATE INDEX IF NOT EXISTS idx_variants_org 
ON public.product_variants(organization_id);

CREATE INDEX IF NOT EXISTS idx_variants_sku 
ON public.product_variants(organization_id, sku);

CREATE INDEX IF NOT EXISTS idx_variants_active 
ON public.product_variants(product_id, is_active) 
WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_inventory_variant 
ON public.inventory(variant_id) 
WHERE variant_id IS NOT NULL;

-- ── PASO 4: Trigger para updated_at ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_product_variants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_product_variants_updated_at ON public.product_variants;

CREATE TRIGGER set_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION update_product_variants_updated_at();

-- ── PASO 5: Row Level Security (RLS) ────────────────────────────────────────

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Policy: Ver variantes de tu organización
DROP POLICY IF EXISTS "Users can view variants of their org" ON public.product_variants;
CREATE POLICY "Users can view variants of their org"
ON public.product_variants FOR SELECT
TO authenticated
USING (organization_id = get_user_org_id());

-- Policy: Admin/Manager pueden crear variantes
DROP POLICY IF EXISTS "Admin and managers can create variants" ON public.product_variants;
CREATE POLICY "Admin and managers can create variants"
ON public.product_variants FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = get_user_org_id() AND
  get_user_role() IN ('admin', 'manager')
);

-- Policy: Admin/Manager pueden actualizar variantes
DROP POLICY IF EXISTS "Admin and managers can update variants" ON public.product_variants;
CREATE POLICY "Admin and managers can update variants"
ON public.product_variants FOR UPDATE
TO authenticated
USING (
  organization_id = get_user_org_id() AND
  get_user_role() IN ('admin', 'manager')
);

-- Policy: Solo admin puede eliminar variantes
DROP POLICY IF EXISTS "Only admins can delete variants" ON public.product_variants;
CREATE POLICY "Only admins can delete variants"
ON public.product_variants FOR DELETE
TO authenticated
USING (
  organization_id = get_user_org_id() AND
  get_user_role() = 'admin'
);

-- ── PASO 6: Funciones helper ────────────────────────────────────────────────

-- Función para obtener stock total de un producto (sumando todas sus variantes)
CREATE OR REPLACE FUNCTION get_product_total_stock(p_product_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_stock INTEGER;
BEGIN
  SELECT COALESCE(SUM(i.quantity), 0)
  INTO total_stock
  FROM public.inventory i
  INNER JOIN public.product_variants pv ON i.variant_id = pv.id
  WHERE pv.product_id = p_product_id;
  
  RETURN total_stock;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener número de variantes activas de un producto
CREATE OR REPLACE FUNCTION get_product_variants_count(p_product_id UUID)
RETURNS INTEGER AS $$
DECLARE
  variant_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO variant_count
  FROM public.product_variants
  WHERE product_id = p_product_id AND is_active = TRUE;
  
  RETURN variant_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── PASO 7: Vista helper para queries comunes ───────────────────────────────

CREATE OR REPLACE VIEW product_variants_with_stock AS
SELECT 
  pv.id,
  pv.organization_id,
  pv.product_id,
  pv.sku,
  pv.size,
  pv.color,
  pv.price,
  pv.cost,
  pv.is_active,
  pv.created_at,
  pv.updated_at,
  p.name as product_name,
  p.brand as product_brand,
  p.category_id,
  COALESCE(SUM(i.quantity), 0) as total_stock,
  json_agg(
    json_build_object(
      'location_id', i.location_id,
      'location_name', l.name,
      'quantity', i.quantity,
      'min_stock', i.min_stock
    )
  ) FILTER (WHERE i.id IS NOT NULL) as stock_by_location
FROM public.product_variants pv
INNER JOIN public.products p ON pv.product_id = p.id
LEFT JOIN public.inventory i ON pv.id = i.variant_id
LEFT JOIN public.locations l ON i.location_id = l.id
GROUP BY pv.id, p.name, p.brand, p.category_id;

-- ── PASO 8: Comentarios para documentación ──────────────────────────────────

COMMENT ON TABLE public.product_variants IS 
'Variantes de productos (combinaciones de talla y color con stock individual)';

COMMENT ON COLUMN public.product_variants.sku IS 
'SKU único de la variante, ej: POL-ADIDAS-40-BLANCO';

COMMENT ON COLUMN public.product_variants.size IS 
'Talla de la variante (38, 40, M, L, XL, etc)';

COMMENT ON COLUMN public.product_variants.color IS 
'Color de la variante (Blanco, Negro, Azul, etc)';

COMMENT ON COLUMN public.product_variants.is_active IS 
'Si FALSE, la variante no se muestra en POS ni inventario';

COMMENT ON FUNCTION get_product_total_stock IS 
'Retorna stock total de un producto sumando todas sus variantes';

COMMENT ON FUNCTION get_product_variants_count IS 
'Retorna número de variantes activas de un producto';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

-- NOTAS IMPORTANTES:
-- 1. Este script es IDEMPOTENT (se puede ejecutar múltiples veces sin error)
-- 2. NO elimina datos existentes en inventory
-- 3. Productos sin variantes siguen funcionando (product_id en inventory)
-- 4. Migración gradual: puedes tener productos con y sin variantes
-- 5. Para migrar productos existentes a variantes, ejecuta script separado

-- PRÓXIMOS PASOS:
-- 1. Ejecutar este script en Supabase SQL Editor
-- 2. Verificar que no haya errores
-- 3. Modificar formularios de creación/edición
-- 4. Actualizar queries en toda la aplicación
-- 5. Probar exhaustivamente antes de producción
