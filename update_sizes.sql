-- ============================================================================
-- SCRIPT: Agregar tallas reales a los productos
-- ============================================================================
-- Este script actualiza los productos existentes para agregar tallas realistas
-- basadas en el tipo de producto (ropa, calzado, accesorios)
-- ============================================================================

-- 1. Productos de ropa (poleras, camisas, pantalones, chaquetas)
UPDATE products 
SET sizes = ARRAY['S', 'M', 'L', 'XL', 'XXL']
WHERE (
  LOWER(name) LIKE '%polera%' OR 
  LOWER(name) LIKE '%camisa%' OR 
  LOWER(name) LIKE '%pantalón%' OR 
  LOWER(name) LIKE '%pantalon%' OR
  LOWER(name) LIKE '%chaqueta%' OR
  LOWER(name) LIKE '%sudadera%' OR
  LOWER(name) LIKE '%buzo%'
)
AND (sizes IS NULL OR array_length(sizes, 1) IS NULL);

-- 2. Calzado (zapatillas, zapatos)
UPDATE products 
SET sizes = ARRAY['38', '39', '40', '41', '42', '43', '44']
WHERE (
  LOWER(name) LIKE '%zapatilla%' OR 
  LOWER(name) LIKE '%zapato%' OR
  LOWER(name) LIKE '%calzado%'
)
AND (sizes IS NULL OR array_length(sizes, 1) IS NULL);

-- 3. Accesorios sin talla (gorras, bufandas, etc)
UPDATE products 
SET sizes = ARRAY['Única']
WHERE (
  LOWER(name) LIKE '%gorra%' OR 
  LOWER(name) LIKE '%bufanda%' OR
  LOWER(name) LIKE '%guante%' OR
  LOWER(name) LIKE '%cinturón%' OR
  LOWER(name) LIKE '%cinturon%' OR
  LOWER(name) LIKE '%mochila%' OR
  LOWER(name) LIKE '%bolso%'
)
AND (sizes IS NULL OR array_length(sizes, 1) IS NULL);

-- 4. Verificar productos actualizados
SELECT 
  name,
  sku,
  sizes,
  CASE 
    WHEN array_length(sizes, 1) IS NULL THEN 'Sin tallas'
    ELSE array_length(sizes, 1)::text || ' tallas'
  END as tallas_count
FROM products
ORDER BY name;

-- ============================================================================
-- NOTA: Ejecuta este script en Supabase SQL Editor
-- ============================================================================
