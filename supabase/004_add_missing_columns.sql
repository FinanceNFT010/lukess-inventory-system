-- Agregar columnas faltantes a products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;

-- Corregir columnas que permiten NULL pero no deberían
ALTER TABLE products 
ALTER COLUMN cost SET DEFAULT 0,
ALTER COLUMN cost SET NOT NULL;

-- Verificar que sizes y colors sean arrays (ya deberían estar bien)
-- (No es necesario modificar si ya son TEXT[] NOT NULL DEFAULT '{}')

COMMENT ON COLUMN products.low_stock_threshold IS 'Umbral de stock bajo para alertas';
