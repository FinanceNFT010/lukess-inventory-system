-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED: Datos demo realistas para Lukess Home
-- Ejecutar en Supabase SQL Editor DESPUÉS del schema inicial
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── 1. Organización ──────────────────────────────────────────────────────────

INSERT INTO organizations (id, name, slug)
VALUES ('org_lukess_001', 'Lukess Home', 'lukess-home')
ON CONFLICT (id) DO NOTHING;

-- ── 2. Ubicaciones (3 puestos) ───────────────────────────────────────────────

INSERT INTO locations (id, organization_id, name, address, phone, is_active) VALUES
  ('loc_puesto_01', 'org_lukess_001', 'Puesto 1 - Central', 'Mercado Central, Puesto 1', '78001001', true),
  ('loc_puesto_02', 'org_lukess_001', 'Puesto 2 - Norte', 'Mercado Norte, Puesto 15', '78001002', true),
  ('loc_puesto_03', 'org_lukess_001', 'Puesto 3 - Sur', 'Mercado Sur, Puesto 8', '78001003', true)
ON CONFLICT (id) DO NOTHING;

-- ── 3. Categorías ────────────────────────────────────────────────────────────

INSERT INTO categories (id, organization_id, name, description) VALUES
  ('cat_camisas',    'org_lukess_001', 'Camisas',     'Camisas manga larga y corta'),
  ('cat_polos',      'org_lukess_001', 'Polos',       'Polos y camisetas'),
  ('cat_pantalones', 'org_lukess_001', 'Pantalones',  'Jeans, chinos y pantalones de vestir'),
  ('cat_chaquetas',  'org_lukess_001', 'Chaquetas',   'Chaquetas, casacas y abrigos'),
  ('cat_accesorios', 'org_lukess_001', 'Accesorios',  'Cinturones, gorras y complementos')
ON CONFLICT (id) DO NOTHING;

-- ── 4. Productos (30 productos de ropa masculina) ───────────────────────────

INSERT INTO products (id, organization_id, category_id, sku, name, description, price, cost, brand, sizes, colors) VALUES

-- ── CAMISAS (8) ──────────────────────────────────────────────────────────────
('prod_001', 'org_lukess_001', 'cat_camisas', 'CAM-TH-001',
 'Camisa Oxford Classic Fit', 'Camisa Oxford de algodón 100%, corte clásico',
 320.00, 180.00, 'Tommy Hilfiger',
 ARRAY['S','M','L','XL'], ARRAY['Blanco','Celeste','Rosa']),

('prod_002', 'org_lukess_001', 'cat_camisas', 'CAM-TH-002',
 'Camisa Slim Fit Rayas', 'Camisa slim fit con rayas verticales',
 350.00, 195.00, 'Tommy Hilfiger',
 ARRAY['S','M','L','XL'], ARRAY['Azul','Blanco']),

('prod_003', 'org_lukess_001', 'cat_camisas', 'CAM-COL-001',
 'Camisa Manga Larga Outdoor', 'Camisa técnica con protección UV',
 280.00, 155.00, 'Columbia',
 ARRAY['M','L','XL','XXL'], ARRAY['Beige','Verde','Gris']),

('prod_004', 'org_lukess_001', 'cat_camisas', 'CAM-COL-002',
 'Camisa Franela a Cuadros', 'Camisa franela gruesa para invierno',
 250.00, 140.00, 'Columbia',
 ARRAY['S','M','L','XL'], ARRAY['Rojo','Azul','Negro']),

('prod_005', 'org_lukess_001', 'cat_camisas', 'CAM-LEV-001',
 'Camisa Denim Classic', 'Camisa de jean clásica con botones',
 290.00, 160.00, 'Levi''s',
 ARRAY['S','M','L','XL'], ARRAY['Azul','Celeste']),

('prod_006', 'org_lukess_001', 'cat_camisas', 'CAM-LEV-002',
 'Camisa Western Denim', 'Camisa estilo western en denim suave',
 310.00, 170.00, 'Levi''s',
 ARRAY['M','L','XL'], ARRAY['Azul','Negro']),

('prod_007', 'org_lukess_001', 'cat_camisas', 'CAM-RL-001',
 'Camisa Polo Button-Down', 'Camisa button-down de algodón premium',
 420.00, 230.00, 'Ralph Lauren',
 ARRAY['S','M','L','XL'], ARRAY['Blanco','Azul','Rosa']),

('prod_008', 'org_lukess_001', 'cat_camisas', 'CAM-HB-001',
 'Camisa Lino Casual', 'Camisa de lino ligera para verano',
 180.00, 95.00, 'H&M',
 ARRAY['S','M','L','XL','XXL'], ARRAY['Blanco','Beige','Celeste']),

-- ── POLOS / CAMISETAS (8) ───────────────────────────────────────────────────
('prod_009', 'org_lukess_001', 'cat_polos', 'POL-NIKE-001',
 'Polo Dri-FIT Victory', 'Polo deportivo con tecnología Dri-FIT',
 200.00, 110.00, 'Nike',
 ARRAY['S','M','L','XL'], ARRAY['Negro','Blanco','Rojo','Azul']),

('prod_010', 'org_lukess_001', 'cat_polos', 'POL-NIKE-002',
 'Camiseta Sportswear Club', 'Camiseta algodón con logo bordado',
 120.00, 65.00, 'Nike',
 ARRAY['S','M','L','XL','XXL'], ARRAY['Negro','Blanco','Gris']),

('prod_011', 'org_lukess_001', 'cat_polos', 'POL-ADI-001',
 'Polo Essentials Piqué', 'Polo piqué con 3 rayas clásicas',
 180.00, 100.00, 'Adidas',
 ARRAY['S','M','L','XL'], ARRAY['Negro','Blanco','Marino']),

('prod_012', 'org_lukess_001', 'cat_polos', 'POL-ADI-002',
 'Camiseta Trefoil Essentials', 'Camiseta con logo Trefoil clásico',
 110.00, 58.00, 'Adidas',
 ARRAY['S','M','L','XL','XXL'], ARRAY['Negro','Blanco','Verde']),

('prod_013', 'org_lukess_001', 'cat_polos', 'POL-TH-001',
 'Polo Classic Fit Bandera', 'Polo con logo bandera bordado',
 280.00, 155.00, 'Tommy Hilfiger',
 ARRAY['S','M','L','XL'], ARRAY['Blanco','Marino','Rojo']),

('prod_014', 'org_lukess_001', 'cat_polos', 'POL-LAC-001',
 'Polo L.12.12 Classic', 'Polo petit piqué icónico',
 350.00, 190.00, 'Lacoste',
 ARRAY['S','M','L','XL'], ARRAY['Blanco','Negro','Verde','Azul']),

('prod_015', 'org_lukess_001', 'cat_polos', 'POL-COL-001',
 'Polo Tech Trail', 'Polo técnico de secado rápido',
 160.00, 85.00, 'Columbia',
 ARRAY['M','L','XL','XXL'], ARRAY['Gris','Azul','Negro']),

('prod_016', 'org_lukess_001', 'cat_polos', 'POL-PUM-001',
 'Camiseta ESS Logo', 'Camiseta con logo estampado',
 95.00, 48.00, 'Puma',
 ARRAY['S','M','L','XL'], ARRAY['Negro','Blanco','Rojo']),

-- ── PANTALONES (8) ──────────────────────────────────────────────────────────
('prod_017', 'org_lukess_001', 'cat_pantalones', 'PAN-LEV-001',
 'Jean 501 Original Fit', 'Jean clásico corte recto original',
 380.00, 210.00, 'Levi''s',
 ARRAY['28','30','32','34','36'], ARRAY['Azul','Negro']),

('prod_018', 'org_lukess_001', 'cat_pantalones', 'PAN-LEV-002',
 'Jean 511 Slim Fit', 'Jean slim fit con elastano',
 350.00, 195.00, 'Levi''s',
 ARRAY['28','30','32','34','36'], ARRAY['Azul','Negro','Gris']),

('prod_019', 'org_lukess_001', 'cat_pantalones', 'PAN-LEV-003',
 'Jean 505 Regular Fit', 'Jean regular fit clásico',
 340.00, 185.00, 'Levi''s',
 ARRAY['30','32','34','36','38'], ARRAY['Azul','Negro']),

('prod_020', 'org_lukess_001', 'cat_pantalones', 'PAN-TH-001',
 'Chino Stretch Slim', 'Pantalón chino slim con elastano',
 300.00, 165.00, 'Tommy Hilfiger',
 ARRAY['28','30','32','34','36'], ARRAY['Beige','Marino','Negro']),

('prod_021', 'org_lukess_001', 'cat_pantalones', 'PAN-ADI-001',
 'Pantalón Tiro 3 Rayas', 'Pantalón deportivo con 3 rayas',
 220.00, 120.00, 'Adidas',
 ARRAY['S','M','L','XL'], ARRAY['Negro','Marino','Gris']),

('prod_022', 'org_lukess_001', 'cat_pantalones', 'PAN-NIKE-001',
 'Jogger Sportswear Club', 'Jogger de algodón felpa',
 200.00, 108.00, 'Nike',
 ARRAY['S','M','L','XL'], ARRAY['Negro','Gris']),

('prod_023', 'org_lukess_001', 'cat_pantalones', 'PAN-COL-001',
 'Pantalón Cargo Silver Ridge', 'Pantalón cargo convertible outdoor',
 260.00, 145.00, 'Columbia',
 ARRAY['30','32','34','36','38'], ARRAY['Beige','Verde','Gris']),

('prod_024', 'org_lukess_001', 'cat_pantalones', 'PAN-HB-001',
 'Jean Skinny Fit', 'Jean skinny elástico básico',
 150.00, 80.00, 'H&M',
 ARRAY['28','30','32','34','36'], ARRAY['Negro','Azul','Gris']),

-- ── CHAQUETAS (6) ───────────────────────────────────────────────────────────
('prod_025', 'org_lukess_001', 'cat_chaquetas', 'CHA-COL-001',
 'Chaqueta Watertight II', 'Chaqueta impermeable ligera Omni-Tech',
 520.00, 290.00, 'Columbia',
 ARRAY['S','M','L','XL'], ARRAY['Negro','Azul','Rojo']),

('prod_026', 'org_lukess_001', 'cat_chaquetas', 'CHA-COL-002',
 'Chaleco Powder Lite', 'Chaleco acolchado térmico',
 420.00, 235.00, 'Columbia',
 ARRAY['M','L','XL','XXL'], ARRAY['Negro','Azul','Gris']),

('prod_027', 'org_lukess_001', 'cat_chaquetas', 'CHA-NIKE-001',
 'Windrunner Jacket', 'Cortavientos clásico con capucha',
 480.00, 265.00, 'Nike',
 ARRAY['S','M','L','XL'], ARRAY['Negro','Blanco','Azul']),

('prod_028', 'org_lukess_001', 'cat_chaquetas', 'CHA-ADI-001',
 'Chaqueta Essentials 3 Rayas', 'Chaqueta con cierre y 3 rayas',
 380.00, 210.00, 'Adidas',
 ARRAY['S','M','L','XL'], ARRAY['Negro','Marino','Rojo']),

('prod_029', 'org_lukess_001', 'cat_chaquetas', 'CHA-LEV-001',
 'Trucker Jacket Denim', 'Chaqueta trucker de jean icónica',
 450.00, 250.00, 'Levi''s',
 ARRAY['S','M','L','XL'], ARRAY['Azul','Negro']),

('prod_030', 'org_lukess_001', 'cat_chaquetas', 'CHA-TH-001',
 'Bomber Jacket Classic', 'Bomber con logo bordado',
 580.00, 320.00, 'Tommy Hilfiger',
 ARRAY['S','M','L','XL'], ARRAY['Negro','Marino'])

ON CONFLICT (id) DO NOTHING;

-- ── 5. Inventario (stock distribuido en 3 puestos) ──────────────────────────

INSERT INTO inventory (product_id, location_id, quantity, min_stock) VALUES
-- Puesto 1 (Central) - más stock
('prod_001', 'loc_puesto_01', 25, 5), ('prod_002', 'loc_puesto_01', 18, 5),
('prod_003', 'loc_puesto_01', 12, 5), ('prod_004', 'loc_puesto_01', 15, 5),
('prod_005', 'loc_puesto_01', 20, 5), ('prod_006', 'loc_puesto_01', 10, 5),
('prod_007', 'loc_puesto_01', 8, 3),  ('prod_008', 'loc_puesto_01', 30, 5),
('prod_009', 'loc_puesto_01', 22, 5), ('prod_010', 'loc_puesto_01', 35, 5),
('prod_011', 'loc_puesto_01', 20, 5), ('prod_012', 'loc_puesto_01', 28, 5),
('prod_013', 'loc_puesto_01', 15, 5), ('prod_014', 'loc_puesto_01', 10, 3),
('prod_015', 'loc_puesto_01', 18, 5), ('prod_016', 'loc_puesto_01', 40, 5),
('prod_017', 'loc_puesto_01', 14, 5), ('prod_018', 'loc_puesto_01', 16, 5),
('prod_019', 'loc_puesto_01', 12, 5), ('prod_020', 'loc_puesto_01', 10, 5),
('prod_021', 'loc_puesto_01', 20, 5), ('prod_022', 'loc_puesto_01', 18, 5),
('prod_023', 'loc_puesto_01', 8, 3),  ('prod_024', 'loc_puesto_01', 25, 5),
('prod_025', 'loc_puesto_01', 6, 3),  ('prod_026', 'loc_puesto_01', 7, 3),
('prod_027', 'loc_puesto_01', 5, 3),  ('prod_028', 'loc_puesto_01', 9, 3),
('prod_029', 'loc_puesto_01', 8, 3),  ('prod_030', 'loc_puesto_01', 4, 2),

-- Puesto 2 (Norte) - stock medio
('prod_001', 'loc_puesto_02', 15, 5), ('prod_002', 'loc_puesto_02', 10, 5),
('prod_003', 'loc_puesto_02', 8, 5),  ('prod_004', 'loc_puesto_02', 10, 5),
('prod_005', 'loc_puesto_02', 12, 5), ('prod_006', 'loc_puesto_02', 6, 3),
('prod_007', 'loc_puesto_02', 5, 3),  ('prod_008', 'loc_puesto_02', 20, 5),
('prod_009', 'loc_puesto_02', 15, 5), ('prod_010', 'loc_puesto_02', 22, 5),
('prod_011', 'loc_puesto_02', 14, 5), ('prod_012', 'loc_puesto_02', 18, 5),
('prod_013', 'loc_puesto_02', 8, 5),  ('prod_014', 'loc_puesto_02', 6, 3),
('prod_015', 'loc_puesto_02', 12, 5), ('prod_016', 'loc_puesto_02', 25, 5),
('prod_017', 'loc_puesto_02', 10, 5), ('prod_018', 'loc_puesto_02', 12, 5),
('prod_019', 'loc_puesto_02', 8, 5),  ('prod_020', 'loc_puesto_02', 6, 3),
('prod_021', 'loc_puesto_02', 14, 5), ('prod_022', 'loc_puesto_02', 12, 5),
('prod_023', 'loc_puesto_02', 5, 3),  ('prod_024', 'loc_puesto_02', 18, 5),
('prod_025', 'loc_puesto_02', 4, 2),  ('prod_026', 'loc_puesto_02', 5, 3),
('prod_027', 'loc_puesto_02', 3, 2),  ('prod_028', 'loc_puesto_02', 6, 3),
('prod_029', 'loc_puesto_02', 5, 3),  ('prod_030', 'loc_puesto_02', 2, 2),

-- Puesto 3 (Sur) - menos stock, algunos productos con stock bajo
('prod_001', 'loc_puesto_03', 8, 5),  ('prod_002', 'loc_puesto_03', 4, 5),
('prod_003', 'loc_puesto_03', 3, 5),  ('prod_004', 'loc_puesto_03', 6, 5),
('prod_005', 'loc_puesto_03', 7, 5),  ('prod_006', 'loc_puesto_03', 2, 3),
('prod_007', 'loc_puesto_03', 3, 3),  ('prod_008', 'loc_puesto_03', 12, 5),
('prod_009', 'loc_puesto_03', 10, 5), ('prod_010', 'loc_puesto_03', 15, 5),
('prod_011', 'loc_puesto_03', 8, 5),  ('prod_012', 'loc_puesto_03', 10, 5),
('prod_013', 'loc_puesto_03', 4, 5),  ('prod_014', 'loc_puesto_03', 3, 3),
('prod_015', 'loc_puesto_03', 6, 5),  ('prod_016', 'loc_puesto_03', 18, 5),
('prod_017', 'loc_puesto_03', 5, 5),  ('prod_018', 'loc_puesto_03', 7, 5),
('prod_019', 'loc_puesto_03', 4, 5),  ('prod_020', 'loc_puesto_03', 3, 3),
('prod_021', 'loc_puesto_03', 9, 5),  ('prod_022', 'loc_puesto_03', 8, 5),
('prod_023', 'loc_puesto_03', 2, 3),  ('prod_024', 'loc_puesto_03', 10, 5),
('prod_025', 'loc_puesto_03', 2, 2),  ('prod_026', 'loc_puesto_03', 3, 3),
('prod_027', 'loc_puesto_03', 1, 2),  ('prod_028', 'loc_puesto_03', 4, 3),
('prod_029', 'loc_puesto_03', 3, 3),  ('prod_030', 'loc_puesto_03', 1, 2)

ON CONFLICT DO NOTHING;

-- ── 6. Ventas demo (20 ventas en los últimos 7 días) ────────────────────────
-- Nota: sold_by debe ser el UUID del usuario admin.
-- Reemplaza 'USER_ID_HERE' con el id real de auth.users del admin.
-- Puedes obtenerlo con: SELECT id FROM auth.users WHERE email = 'admin@lukesshome.com';

DO $$
DECLARE
  v_admin_id UUID;
  v_sale_id UUID;
  v_now TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- Obtener el ID del usuario admin
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@lukesshome.com' LIMIT 1;
  
  -- Si no existe el admin, usar un profile existente
  IF v_admin_id IS NULL THEN
    SELECT id INTO v_admin_id FROM profiles LIMIT 1;
  END IF;
  
  -- Si tampoco hay perfiles, salir
  IF v_admin_id IS NULL THEN
    RAISE NOTICE 'No se encontró usuario admin. Crea el usuario primero.';
    RETURN;
  END IF;

  -- Asegurarse de que el profile existe para el admin
  INSERT INTO profiles (id, organization_id, location_id, email, full_name, role)
  VALUES (v_admin_id, 'org_lukess_001', 'loc_puesto_01', 'admin@lukesshome.com', 'Lucas Administrador', 'admin')
  ON CONFLICT (id) DO UPDATE SET
    organization_id = 'org_lukess_001',
    location_id = 'loc_puesto_01';

  -- ═══ VENTA 1: Hace 6 días, Puesto 1, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_01', v_admin_id, 'Carlos Mendoza', 700.00, 0, 0, 700.00, 'cash', v_now - INTERVAL '6 days 3 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_001', 1, 320.00, 320.00),
    (v_sale_id, 'prod_017', 1, 380.00, 380.00);

  -- ═══ VENTA 2: Hace 6 días, Puesto 1, QR ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_01', v_admin_id, NULL, 240.00, 0, 0, 240.00, 'qr', v_now - INTERVAL '6 days 1 hour');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_010', 2, 120.00, 240.00);

  -- ═══ VENTA 3: Hace 5 días, Puesto 2, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_02', v_admin_id, 'María Gutiérrez', 830.00, 0, 0, 830.00, 'cash', v_now - INTERVAL '5 days 4 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_007', 1, 420.00, 420.00),
    (v_sale_id, 'prod_018', 1, 350.00, 350.00),
    (v_sale_id, 'prod_016', 1, 95.00, 60.00);

  -- ═══ VENTA 4: Hace 5 días, Puesto 1, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_01', v_admin_id, 'Roberto Flores', 520.00, 0, 0, 520.00, 'cash', v_now - INTERVAL '5 days 2 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_025', 1, 520.00, 520.00);

  -- ═══ VENTA 5: Hace 4 días, Puesto 1, QR ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_01', v_admin_id, NULL, 460.00, 0, 0, 460.00, 'qr', v_now - INTERVAL '4 days 5 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_009', 1, 200.00, 200.00),
    (v_sale_id, 'prod_023', 1, 260.00, 260.00);

  -- ═══ VENTA 6: Hace 4 días, Puesto 3, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_03', v_admin_id, 'Ana Vargas', 730.00, 0, 0, 730.00, 'cash', v_now - INTERVAL '4 days 3 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_014', 1, 350.00, 350.00),
    (v_sale_id, 'prod_017', 1, 380.00, 380.00);

  -- ═══ VENTA 7: Hace 4 días, Puesto 1, Tarjeta ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_01', v_admin_id, 'Diego Salinas', 1060.00, 0, 0, 1060.00, 'card', v_now - INTERVAL '4 days 1 hour');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_030', 1, 580.00, 580.00),
    (v_sale_id, 'prod_027', 1, 480.00, 480.00);

  -- ═══ VENTA 8: Hace 3 días, Puesto 2, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_02', v_admin_id, 'Fernando Ríos', 560.00, 0, 0, 560.00, 'cash', v_now - INTERVAL '3 days 6 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_005', 1, 290.00, 290.00),
    (v_sale_id, 'prod_020', 1, 300.00, 270.00);

  -- ═══ VENTA 9: Hace 3 días, Puesto 1, QR ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_01', v_admin_id, NULL, 350.00, 0, 0, 350.00, 'qr', v_now - INTERVAL '3 days 4 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_014', 1, 350.00, 350.00);

  -- ═══ VENTA 10: Hace 3 días, Puesto 1, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_01', v_admin_id, 'Jorge Mamani', 295.00, 0, 0, 295.00, 'cash', v_now - INTERVAL '3 days 2 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_016', 1, 95.00, 95.00),
    (v_sale_id, 'prod_009', 1, 200.00, 200.00);

  -- ═══ VENTA 11: Hace 2 días, Puesto 1, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_01', v_admin_id, 'Pedro Condori', 640.00, 0, 0, 640.00, 'cash', v_now - INTERVAL '2 days 5 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_003', 1, 280.00, 280.00),
    (v_sale_id, 'prod_018', 1, 350.00, 350.00);

  -- ═══ VENTA 12: Hace 2 días, Puesto 2, QR ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_02', v_admin_id, NULL, 400.00, 0, 0, 400.00, 'qr', v_now - INTERVAL '2 days 3 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_011', 1, 180.00, 180.00),
    (v_sale_id, 'prod_021', 1, 220.00, 220.00);

  -- ═══ VENTA 13: Hace 2 días, Puesto 3, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_03', v_admin_id, 'Sergio Quispe', 830.00, 0, 0, 830.00, 'cash', v_now - INTERVAL '2 days 1 hour');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_029', 1, 450.00, 450.00),
    (v_sale_id, 'prod_017', 1, 380.00, 380.00);

  -- ═══ VENTA 14: Hace 1 día, Puesto 1, Tarjeta ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_01', v_admin_id, 'Lucía Torrez', 900.00, 0, 0, 900.00, 'card', v_now - INTERVAL '1 day 6 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_007', 1, 420.00, 420.00),
    (v_sale_id, 'prod_027', 1, 480.00, 480.00);

  -- ═══ VENTA 15: Hace 1 día, Puesto 1, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_01', v_admin_id, NULL, 230.00, 0, 0, 230.00, 'cash', v_now - INTERVAL '1 day 4 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_010', 1, 120.00, 120.00),
    (v_sale_id, 'prod_012', 1, 110.00, 110.00);

  -- ═══ VENTA 16: Hace 1 día, Puesto 2, QR ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_02', v_admin_id, 'Marco Chávez', 550.00, 0, 0, 550.00, 'qr', v_now - INTERVAL '1 day 2 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_002', 1, 350.00, 350.00),
    (v_sale_id, 'prod_009', 1, 200.00, 200.00);

  -- ═══ VENTA 17: Hoy, Puesto 1, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_01', v_admin_id, 'Andrés Rojas', 670.00, 0, 0, 670.00, 'cash', v_now - INTERVAL '3 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_001', 1, 320.00, 320.00),
    (v_sale_id, 'prod_018', 1, 350.00, 350.00);

  -- ═══ VENTA 18: Hoy, Puesto 1, QR ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_01', v_admin_id, NULL, 380.00, 0, 0, 380.00, 'qr', v_now - INTERVAL '2 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_028', 1, 380.00, 380.00);

  -- ═══ VENTA 19: Hoy, Puesto 3, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_03', v_admin_id, 'Raúl Fernández', 540.00, 0, 0, 540.00, 'cash', v_now - INTERVAL '1 hour');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_005', 1, 290.00, 290.00),
    (v_sale_id, 'prod_023', 1, 260.00, 250.00);

  -- ═══ VENTA 20: Hoy, Puesto 1, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, 'org_lukess_001', 'loc_puesto_01', v_admin_id, 'Valentina Cruz', 470.00, 0, 0, 470.00, 'cash', v_now - INTERVAL '30 minutes');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, 'prod_013', 1, 280.00, 280.00),
    (v_sale_id, 'prod_015', 1, 160.00, 160.00);

  RAISE NOTICE 'Seed completado: 30 productos, 90 registros de inventario, 20 ventas';
END $$;
