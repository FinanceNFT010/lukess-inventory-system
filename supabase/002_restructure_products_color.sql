-- ============================================================================
-- MIGRACIÓN 002: Reestructuración de Products - Un Producto por Color
-- ============================================================================
-- Fecha: 18 de Febrero 2026
-- Descripción: Cambiar de colors[] (array) a color (string único)
--              Agregar sku_group para agrupar variantes del mismo modelo
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 1: ALTERACIÓN DEL SCHEMA
-- ═══════════════════════════════════════════════════════════════════════════

-- Agregar columna para color único (reemplaza el array colors)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT NULL;

-- Agregar columna para agrupar variantes del mismo modelo
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sku_group TEXT DEFAULT NULL;

-- Crear índice para búsquedas por sku_group
CREATE INDEX IF NOT EXISTS idx_products_sku_group ON products(sku_group);

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 2: LIMPIAR DATOS ANTIGUOS
-- ═══════════════════════════════════════════════════════════════════════════

-- Eliminar order_items primero (si existe la tabla)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') THEN
    DELETE FROM order_items 
    WHERE product_id IN (
      SELECT id FROM products 
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE slug = 'lukess-home'
      )
    );
  END IF;
END $$;

-- Eliminar sale_items de productos demo
DELETE FROM sale_items 
WHERE product_id IN (
  SELECT id FROM products 
  WHERE organization_id IN (
    SELECT id FROM organizations WHERE slug = 'lukess-home'
  )
);

-- Eliminar inventory de productos demo
DELETE FROM inventory 
WHERE product_id IN (
  SELECT id FROM products 
  WHERE organization_id IN (
    SELECT id FROM organizations WHERE slug = 'lukess-home'
  )
);

-- Eliminar productos demo antiguos
DELETE FROM products 
WHERE organization_id IN (
  SELECT id FROM organizations WHERE slug = 'lukess-home'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 3: INSERTAR PRODUCTOS DE PRUEBA REALISTAS
-- ═══════════════════════════════════════════════════════════════════════════

-- Obtener IDs necesarios
DO $$
DECLARE
  v_org_id UUID;
  v_cat_camisas UUID;
  v_cat_pantalones UUID;
  v_cat_polos UUID;
  v_cat_shorts UUID;
  v_cat_chaquetas UUID;
  v_cat_accesorios UUID;
  v_loc1_id UUID;
  v_loc2_id UUID;
  v_loc3_id UUID;
BEGIN
  -- Obtener organization_id
  SELECT id INTO v_org_id FROM organizations WHERE slug = 'lukess-home' LIMIT 1;
  
  -- Obtener o crear categorías
  INSERT INTO categories (organization_id, name) VALUES (v_org_id, 'Camisas')
  ON CONFLICT DO NOTHING RETURNING id INTO v_cat_camisas;
  IF v_cat_camisas IS NULL THEN
    SELECT id INTO v_cat_camisas FROM categories WHERE organization_id = v_org_id AND name = 'Camisas';
  END IF;
  
  INSERT INTO categories (organization_id, name) VALUES (v_org_id, 'Pantalones')
  ON CONFLICT DO NOTHING RETURNING id INTO v_cat_pantalones;
  IF v_cat_pantalones IS NULL THEN
    SELECT id INTO v_cat_pantalones FROM categories WHERE organization_id = v_org_id AND name = 'Pantalones';
  END IF;
  
  INSERT INTO categories (organization_id, name) VALUES (v_org_id, 'Polos')
  ON CONFLICT DO NOTHING RETURNING id INTO v_cat_polos;
  IF v_cat_polos IS NULL THEN
    SELECT id INTO v_cat_polos FROM categories WHERE organization_id = v_org_id AND name = 'Polos';
  END IF;
  
  INSERT INTO categories (organization_id, name) VALUES (v_org_id, 'Shorts')
  ON CONFLICT DO NOTHING RETURNING id INTO v_cat_shorts;
  IF v_cat_shorts IS NULL THEN
    SELECT id INTO v_cat_shorts FROM categories WHERE organization_id = v_org_id AND name = 'Shorts';
  END IF;
  
  INSERT INTO categories (organization_id, name) VALUES (v_org_id, 'Chaquetas')
  ON CONFLICT DO NOTHING RETURNING id INTO v_cat_chaquetas;
  IF v_cat_chaquetas IS NULL THEN
    SELECT id INTO v_cat_chaquetas FROM categories WHERE organization_id = v_org_id AND name = 'Chaquetas';
  END IF;
  
  INSERT INTO categories (organization_id, name) VALUES (v_org_id, 'Accesorios')
  ON CONFLICT DO NOTHING RETURNING id INTO v_cat_accesorios;
  IF v_cat_accesorios IS NULL THEN
    SELECT id INTO v_cat_accesorios FROM categories WHERE organization_id = v_org_id AND name = 'Accesorios';
  END IF;
  
  -- Obtener ubicaciones
  SELECT id INTO v_loc1_id FROM locations WHERE organization_id = v_org_id ORDER BY name LIMIT 1;
  SELECT id INTO v_loc2_id FROM locations WHERE organization_id = v_org_id ORDER BY name OFFSET 1 LIMIT 1;
  SELECT id INTO v_loc3_id FROM locations WHERE organization_id = v_org_id ORDER BY name OFFSET 2 LIMIT 1;
  
  -- ─────────────────────────────────────────────────────────────────────────
  -- GRUPO 1: Camisas Columbia (CAM-COL)
  -- ─────────────────────────────────────────────────────────────────────────
  
  -- Camisa Columbia - Azul marino
  INSERT INTO products (organization_id, category_id, sku, sku_group, name, brand, color, sizes, price, cost, description, image_url, is_active)
  VALUES (
    v_org_id, v_cat_camisas, 'CAM-COL-001-AZUL', 'CAM-COL-001',
    'Camisa Columbia - Azul marino', 'Columbia', 'Azul marino',
    ARRAY['S', 'M', 'L', 'XL'], 200.00, 110.00,
    'Camisa de manga larga Columbia, 100% algodón, ideal para uso casual y formal',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80',
    true
  );
  
  -- Camisa Columbia - Verde militar
  INSERT INTO products (organization_id, category_id, sku, sku_group, name, brand, color, sizes, price, cost, description, image_url, is_active)
  VALUES (
    v_org_id, v_cat_camisas, 'CAM-COL-001-VERDE', 'CAM-COL-001',
    'Camisa Columbia - Verde militar', 'Columbia', 'Verde militar',
    ARRAY['S', 'M', 'L', 'XL'], 200.00, 110.00,
    'Camisa de manga larga Columbia, 100% algodón, ideal para uso casual y formal',
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400&q=80',
    true
  );
  
  -- Camisa Columbia - Blanca
  INSERT INTO products (organization_id, category_id, sku, sku_group, name, brand, color, sizes, price, cost, description, image_url, is_active)
  VALUES (
    v_org_id, v_cat_camisas, 'CAM-COL-001-BLANCO', 'CAM-COL-001',
    'Camisa Columbia - Blanca', 'Columbia', 'Blanco',
    ARRAY['S', 'M', 'L', 'XL'], 180.00, 100.00,
    'Camisa de manga larga Columbia, 100% algodón, ideal para uso casual y formal',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80',
    true
  );
  
  -- ─────────────────────────────────────────────────────────────────────────
  -- GRUPO 2: Pantalón Chino (PAN-CHI)
  -- ─────────────────────────────────────────────────────────────────────────
  
  -- Pantalón Chino - Beige
  INSERT INTO products (organization_id, category_id, sku, sku_group, name, brand, color, sizes, price, cost, description, image_url, is_active)
  VALUES (
    v_org_id, v_cat_pantalones, 'PAN-CHI-001-BEIGE', 'PAN-CHI-001',
    'Pantalón Chino - Beige', 'Dockers', 'Beige',
    ARRAY['38', '40', '42', '44'], 170.00, 95.00,
    'Pantalón chino de corte clásico, tela resistente y cómoda',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80',
    true
  );
  
  -- Pantalón Chino - Negro
  INSERT INTO products (organization_id, category_id, sku, sku_group, name, brand, color, sizes, price, cost, description, image_url, is_active)
  VALUES (
    v_org_id, v_cat_pantalones, 'PAN-CHI-001-NEGRO', 'PAN-CHI-001',
    'Pantalón Chino - Negro', 'Dockers', 'Negro',
    ARRAY['38', '40', '42', '44'], 170.00, 95.00,
    'Pantalón chino de corte clásico, tela resistente y cómoda',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80',
    true
  );
  
  -- Pantalón Chino - Gris
  INSERT INTO products (organization_id, category_id, sku, sku_group, name, brand, color, sizes, price, cost, description, image_url, is_active)
  VALUES (
    v_org_id, v_cat_pantalones, 'PAN-CHI-001-GRIS', 'PAN-CHI-001',
    'Pantalón Chino - Gris', 'Dockers', 'Gris',
    ARRAY['38', '40', '42', '44'], 190.00, 105.00,
    'Pantalón chino de corte clásico, tela resistente y cómoda',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80',
    true
  );
  
  -- ─────────────────────────────────────────────────────────────────────────
  -- GRUPO 3: Polo Lacoste (POL-LAC)
  -- ─────────────────────────────────────────────────────────────────────────
  
  -- Polo Lacoste - Negro
  INSERT INTO products (organization_id, category_id, sku, sku_group, name, brand, color, sizes, price, cost, description, image_url, is_active)
  VALUES (
    v_org_id, v_cat_polos, 'POL-LAC-001-NEGRO', 'POL-LAC-001',
    'Polo Lacoste - Negro', 'Lacoste', 'Negro',
    ARRAY['S', 'M', 'L', 'XL'], 230.00, 130.00,
    'Polo clásico Lacoste con logo bordado, 100% algodón piqué',
    'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&q=80',
    true
  );
  
  -- Polo Lacoste - Blanco
  INSERT INTO products (organization_id, category_id, sku, sku_group, name, brand, color, sizes, price, cost, description, image_url, is_active)
  VALUES (
    v_org_id, v_cat_polos, 'POL-LAC-001-BLANCO', 'POL-LAC-001',
    'Polo Lacoste - Blanco', 'Lacoste', 'Blanco',
    ARRAY['S', 'M', 'L', 'XL'], 230.00, 130.00,
    'Polo clásico Lacoste con logo bordado, 100% algodón piqué',
    'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=400&q=80',
    true
  );
  
  -- ─────────────────────────────────────────────────────────────────────────
  -- GRUPO 4: Short Deportivo (SHO-DEP)
  -- ─────────────────────────────────────────────────────────────────────────
  
  -- Short Deportivo - Azul
  INSERT INTO products (organization_id, category_id, sku, sku_group, name, brand, color, sizes, price, cost, description, image_url, is_active)
  VALUES (
    v_org_id, v_cat_shorts, 'SHO-DEP-001-AZUL', 'SHO-DEP-001',
    'Short Deportivo - Azul', 'Nike', 'Azul',
    ARRAY['S', 'M', 'L', 'XL'], 90.00, 50.00,
    'Short deportivo con tecnología Dri-FIT, ideal para entrenamientos',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80',
    true
  );
  
  -- Short Deportivo - Negro
  INSERT INTO products (organization_id, category_id, sku, sku_group, name, brand, color, sizes, price, cost, description, image_url, is_active)
  VALUES (
    v_org_id, v_cat_shorts, 'SHO-DEP-001-NEGRO', 'SHO-DEP-001',
    'Short Deportivo - Negro', 'Nike', 'Negro',
    ARRAY['S', 'M', 'L', 'XL'], 90.00, 50.00,
    'Short deportivo con tecnología Dri-FIT, ideal para entrenamientos',
    'https://images.unsplash.com/photo-1519235106638-30cc49b5dbc5?w=400&q=80',
    true
  );
  
  -- ─────────────────────────────────────────────────────────────────────────
  -- GRUPO 5: Chaqueta Bomber (CHA-BOM)
  -- ─────────────────────────────────────────────────────────────────────────
  
  -- Chaqueta Bomber - Negra
  INSERT INTO products (organization_id, category_id, sku, sku_group, name, brand, color, sizes, price, cost, description, image_url, is_active)
  VALUES (
    v_org_id, v_cat_chaquetas, 'CHA-BOM-001-NEGRO', 'CHA-BOM-001',
    'Chaqueta Bomber - Negra', 'Alpha Industries', 'Negro',
    ARRAY['S', 'M', 'L', 'XL'], 300.00, 170.00,
    'Chaqueta bomber clásica con forro acolchado, cierre frontal',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
    true
  );
  
  -- ─────────────────────────────────────────────────────────────────────────
  -- GRUPO 6: Accesorios (sin sku_group)
  -- ─────────────────────────────────────────────────────────────────────────
  
  -- Gorra NY - Negra
  INSERT INTO products (organization_id, category_id, sku, name, brand, color, sizes, price, cost, description, image_url, is_active)
  VALUES (
    v_org_id, v_cat_accesorios, 'GOR-NY-001-NEGRO',
    'Gorra NY - Negra', 'New Era', 'Negro',
    ARRAY[]::TEXT[], 75.00, 40.00,
    'Gorra ajustable New York Yankees, talla única',
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80',
    true
  );
  
  -- Gorra NY - Azul
  INSERT INTO products (organization_id, category_id, sku, name, brand, color, sizes, price, cost, description, image_url, is_active)
  VALUES (
    v_org_id, v_cat_accesorios, 'GOR-NY-001-AZUL',
    'Gorra NY - Azul', 'New Era', 'Azul',
    ARRAY[]::TEXT[], 75.00, 40.00,
    'Gorra ajustable New York Yankees, talla única',
    'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=400&q=80',
    true
  );
  
  -- Cinturón de cuero - Negro
  INSERT INTO products (organization_id, category_id, sku, name, brand, color, sizes, price, cost, description, image_url, is_active)
  VALUES (
    v_org_id, v_cat_accesorios, 'CIN-CUE-001-NEGRO',
    'Cinturón de cuero - Negro', 'Tommy Hilfiger', 'Negro',
    ARRAY[]::TEXT[], 85.00, 45.00,
    'Cinturón de cuero genuino con hebilla metálica, talla única ajustable',
    'https://images.unsplash.com/photo-1624222247344-550fb60583c2?w=400&q=80',
    true
  );
  
  -- Cinturón de cuero - Café
  INSERT INTO products (organization_id, category_id, sku, name, brand, color, sizes, price, cost, description, image_url, is_active)
  VALUES (
    v_org_id, v_cat_accesorios, 'CIN-CUE-001-CAFE',
    'Cinturón de cuero - Café', 'Tommy Hilfiger', 'Café',
    ARRAY[]::TEXT[], 85.00, 45.00,
    'Cinturón de cuero genuino con hebilla metálica, talla única ajustable',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
    true
  );
  
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 4: INSERTAR INVENTORY (Stock por ubicación)
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_org_id UUID;
  v_loc1_id UUID;
  v_loc2_id UUID;
  v_loc3_id UUID;
  v_product RECORD;
BEGIN
  -- Obtener IDs
  SELECT id INTO v_org_id FROM organizations WHERE slug = 'lukess-home' LIMIT 1;
  SELECT id INTO v_loc1_id FROM locations WHERE organization_id = v_org_id ORDER BY name LIMIT 1;
  SELECT id INTO v_loc2_id FROM locations WHERE organization_id = v_org_id ORDER BY name OFFSET 1 LIMIT 1;
  SELECT id INTO v_loc3_id FROM locations WHERE organization_id = v_org_id ORDER BY name OFFSET 2 LIMIT 1;
  
  -- Insertar inventory para cada producto con size y color
  FOR v_product IN 
    SELECT id, sku, sizes, color FROM products WHERE organization_id = v_org_id
  LOOP
    -- Para cada ubicación
    DECLARE
      v_sizes TEXT[];
      v_size TEXT;
      v_loc_ids UUID[] := ARRAY[v_loc1_id, v_loc2_id, v_loc3_id];
      v_loc_id UUID;
      v_stock_amounts INT[] := ARRAY[12, 10, 8]; -- Stock por ubicación
      v_idx INT := 1;
    BEGIN
      -- Obtener tallas del producto (o usar 'Única' si no tiene)
      v_sizes := CASE 
        WHEN array_length(v_product.sizes, 1) > 0 THEN v_product.sizes
        ELSE ARRAY['Única']
      END;
      
      -- Ajustar cantidades según tipo de producto
      IF v_product.sku LIKE 'CAM-COL%' THEN
        v_stock_amounts := ARRAY[12, 10, 8];  -- Stock alto
      ELSIF v_product.sku LIKE 'PAN-CHI%' THEN
        v_stock_amounts := ARRAY[6, 5, 4];    -- Stock medio
      ELSIF v_product.sku LIKE 'POL-LAC%' THEN
        v_stock_amounts := ARRAY[2, 1, 2];    -- Stock bajo (alerta)
      ELSIF v_product.sku LIKE 'SHO-DEP%' THEN
        v_stock_amounts := ARRAY[4, 3, 3];    -- Stock medio-bajo
      ELSIF v_product.sku LIKE 'CHA-BOM%' THEN
        v_stock_amounts := ARRAY[1, 1, 1];    -- Stock bajo premium
      ELSIF v_product.sku LIKE 'GOR-NY%' THEN
        v_stock_amounts := ARRAY[0, 0, 0];    -- Sin stock
      ELSIF v_product.sku LIKE 'CIN-CUE%' THEN
        v_stock_amounts := ARRAY[7, 6, 5];    -- Stock medio
      ELSE
        v_stock_amounts := ARRAY[5, 5, 5];    -- Default
      END IF;
      
      -- Para cada ubicación
      FOREACH v_loc_id IN ARRAY v_loc_ids
      LOOP
        -- Para cada talla
        FOREACH v_size IN ARRAY v_sizes
        LOOP
          INSERT INTO inventory (
            product_id, 
            location_id, 
            size, 
            color, 
            quantity, 
            min_stock
          ) VALUES (
            v_product.id,
            v_loc_id,
            v_size,
            v_product.color,
            v_stock_amounts[v_idx],
            5
          );
        END LOOP;
        v_idx := v_idx + 1;
      END LOOP;
    END;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 5: VERIFICACIÓN
-- ═══════════════════════════════════════════════════════════════════════════

-- Ver productos creados con su nuevo esquema
SELECT 
  sku,
  sku_group,
  name,
  color,
  sizes,
  price,
  brand
FROM products
WHERE organization_id IN (SELECT id FROM organizations WHERE slug = 'lukess-home')
ORDER BY sku_group NULLS LAST, color;

-- Ver stock total por producto
SELECT 
  p.sku,
  p.name,
  p.color,
  SUM(i.quantity) as stock_total,
  COUNT(i.id) as ubicaciones
FROM products p
LEFT JOIN inventory i ON p.id = i.product_id
WHERE p.organization_id IN (SELECT id FROM organizations WHERE slug = 'lukess-home')
GROUP BY p.id, p.sku, p.name, p.color
ORDER BY p.sku;

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================
