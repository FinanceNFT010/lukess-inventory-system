-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED: Datos demo realistas para Lukess Home
-- Ejecutar en Supabase SQL Editor DESPUÉS del schema inicial
-- ═══════════════════════════════════════════════════════════════════════════════

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. ORGANIZACIÓN
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO organizations (id, name, slug)
VALUES ('11111111-1111-1111-1111-111111111111', 'Lukess Home', 'lukess-home')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. UBICACIONES (4 ubicaciones: 3 puestos + 1 bodega)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO locations (id, organization_id, name, address, phone, is_active) VALUES
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Puesto 1 - Central', 'Mercado Central, Puesto 1', '78001001', true),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Puesto 2 - Norte', 'Mercado Norte, Puesto 15', '78001002', true),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Puesto 3 - Sur', 'Mercado Sur, Puesto 8', '78001003', true),
  ('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111111', 'Bodega Central', 'Av. Buenos Aires 1234', '78001000', true)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. CATEGORÍAS (5 categorías)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO categories (id, organization_id, name, description) VALUES
  ('33333333-3333-3333-3333-333333333331', '11111111-1111-1111-1111-111111111111', 'Camisas',     'Camisas manga larga y corta'),
  ('33333333-3333-3333-3333-333333333332', '11111111-1111-1111-1111-111111111111', 'Polos',       'Polos y camisetas'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Pantalones',  'Jeans, chinos y pantalones de vestir'),
  ('33333333-3333-3333-3333-333333333334', '11111111-1111-1111-1111-111111111111', 'Chaquetas',   'Chaquetas, casacas y abrigos'),
  ('33333333-3333-3333-3333-333333333335', '11111111-1111-1111-1111-111111111111', 'Accesorios',  'Cinturones, gorras y complementos')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. PRODUCTOS (30 productos de ropa masculina)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO products (id, organization_id, category_id, sku, name, description, price, cost, brand, sizes, colors) VALUES

-- ── CAMISAS (8 productos) ─────────────────────────────────────────────────────
('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'CAM-TH-001',
 'Camisa Oxford Classic Fit', 'Camisa Oxford de algodón 100%, corte clásico',
 320.00, 180.00, 'Tommy Hilfiger',
 ARRAY['S','M','L','XL'], ARRAY['Blanco','Celeste','Rosa']),

('44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'CAM-TH-002',
 'Camisa Slim Fit Rayas', 'Camisa slim fit con rayas verticales',
 350.00, 195.00, 'Tommy Hilfiger',
 ARRAY['S','M','L','XL'], ARRAY['Azul','Blanco']),

('44444444-4444-4444-4444-444444444403', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'CAM-COL-001',
 'Camisa Manga Larga Outdoor', 'Camisa técnica con protección UV',
 280.00, 155.00, 'Columbia',
 ARRAY['M','L','XL','XXL'], ARRAY['Beige','Verde','Gris']),

('44444444-4444-4444-4444-444444444404', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'CAM-COL-002',
 'Camisa Franela a Cuadros', 'Camisa franela gruesa para invierno',
 250.00, 140.00, 'Columbia',
 ARRAY['S','M','L','XL'], ARRAY['Rojo','Azul','Negro']),

('44444444-4444-4444-4444-444444444405', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'CAM-LEV-001',
 'Camisa Denim Classic', 'Camisa de jean clásica con botones',
 290.00, 160.00, 'Levi''s',
 ARRAY['S','M','L','XL'], ARRAY['Azul','Celeste']),

('44444444-4444-4444-4444-444444444406', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'CAM-LEV-002',
 'Camisa Western Denim', 'Camisa estilo western en denim suave',
 310.00, 170.00, 'Levi''s',
 ARRAY['M','L','XL'], ARRAY['Azul','Negro']),

('44444444-4444-4444-4444-444444444407', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'CAM-RL-001',
 'Camisa Polo Button-Down', 'Camisa button-down de algodón premium',
 420.00, 230.00, 'Ralph Lauren',
 ARRAY['S','M','L','XL'], ARRAY['Blanco','Azul','Rosa']),

('44444444-4444-4444-4444-444444444408', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 'CAM-HB-001',
 'Camisa Lino Casual', 'Camisa de lino ligera para verano',
 180.00, 95.00, 'H&M',
 ARRAY['S','M','L','XL','XXL'], ARRAY['Blanco','Beige','Celeste']),

-- ── POLOS / CAMISETAS (8 productos) ──────────────────────────────────────────
('44444444-4444-4444-4444-444444444409', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', 'POL-NIKE-001',
 'Polo Dri-FIT Victory', 'Polo deportivo con tecnología Dri-FIT',
 200.00, 110.00, 'Nike',
 ARRAY['S','M','L','XL'], ARRAY['Negro','Blanco','Rojo','Azul']),

('44444444-4444-4444-4444-444444444410', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', 'POL-NIKE-002',
 'Camiseta Sportswear Club', 'Camiseta algodón con logo bordado',
 120.00, 65.00, 'Nike',
 ARRAY['S','M','L','XL','XXL'], ARRAY['Negro','Blanco','Gris']),

('44444444-4444-4444-4444-444444444411', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', 'POL-ADI-001',
 'Polo Essentials Piqué', 'Polo piqué con 3 rayas clásicas',
 180.00, 100.00, 'Adidas',
 ARRAY['S','M','L','XL'], ARRAY['Negro','Blanco','Marino']),

('44444444-4444-4444-4444-444444444412', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', 'POL-ADI-002',
 'Camiseta Trefoil Essentials', 'Camiseta con logo Trefoil clásico',
 110.00, 58.00, 'Adidas',
 ARRAY['S','M','L','XL','XXL'], ARRAY['Negro','Blanco','Verde']),

('44444444-4444-4444-4444-444444444413', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', 'POL-TH-001',
 'Polo Classic Fit Bandera', 'Polo con logo bandera bordado',
 280.00, 155.00, 'Tommy Hilfiger',
 ARRAY['S','M','L','XL'], ARRAY['Blanco','Marino','Rojo']),

('44444444-4444-4444-4444-444444444414', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', 'POL-LAC-001',
 'Polo L.12.12 Classic', 'Polo petit piqué icónico',
 350.00, 190.00, 'Lacoste',
 ARRAY['S','M','L','XL'], ARRAY['Blanco','Negro','Verde','Azul']),

('44444444-4444-4444-4444-444444444415', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', 'POL-COL-001',
 'Polo Tech Trail', 'Polo técnico de secado rápido',
 160.00, 85.00, 'Columbia',
 ARRAY['M','L','XL','XXL'], ARRAY['Gris','Azul','Negro']),

('44444444-4444-4444-4444-444444444416', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333332', 'POL-PUM-001',
 'Camiseta ESS Logo', 'Camiseta con logo estampado',
 95.00, 48.00, 'Puma',
 ARRAY['S','M','L','XL'], ARRAY['Negro','Blanco','Rojo']),

-- ── PANTALONES (8 productos) ─────────────────────────────────────────────────
('44444444-4444-4444-4444-444444444417', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'PAN-LEV-001',
 'Jean 501 Original Fit', 'Jean clásico corte recto original',
 380.00, 210.00, 'Levi''s',
 ARRAY['28','30','32','34','36'], ARRAY['Azul','Negro']),

('44444444-4444-4444-4444-444444444418', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'PAN-LEV-002',
 'Jean 511 Slim Fit', 'Jean slim fit con elastano',
 350.00, 195.00, 'Levi''s',
 ARRAY['28','30','32','34','36'], ARRAY['Azul','Negro','Gris']),

('44444444-4444-4444-4444-444444444419', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'PAN-LEV-003',
 'Jean 505 Regular Fit', 'Jean regular fit clásico',
 340.00, 185.00, 'Levi''s',
 ARRAY['30','32','34','36','38'], ARRAY['Azul','Negro']),

('44444444-4444-4444-4444-444444444420', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'PAN-TH-001',
 'Chino Stretch Slim', 'Pantalón chino slim con elastano',
 300.00, 165.00, 'Tommy Hilfiger',
 ARRAY['28','30','32','34','36'], ARRAY['Beige','Marino','Negro']),

('44444444-4444-4444-4444-444444444421', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'PAN-ADI-001',
 'Pantalón Tiro 3 Rayas', 'Pantalón deportivo con 3 rayas',
 220.00, 120.00, 'Adidas',
 ARRAY['S','M','L','XL'], ARRAY['Negro','Marino','Gris']),

('44444444-4444-4444-4444-444444444422', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'PAN-NIKE-001',
 'Jogger Sportswear Club', 'Jogger de algodón felpa',
 200.00, 108.00, 'Nike',
 ARRAY['S','M','L','XL'], ARRAY['Negro','Gris']),

('44444444-4444-4444-4444-444444444423', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'PAN-COL-001',
 'Pantalón Cargo Silver Ridge', 'Pantalón cargo convertible outdoor',
 260.00, 145.00, 'Columbia',
 ARRAY['30','32','34','36','38'], ARRAY['Beige','Verde','Gris']),

('44444444-4444-4444-4444-444444444424', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'PAN-HB-001',
 'Jean Skinny Fit', 'Jean skinny elástico básico',
 150.00, 80.00, 'H&M',
 ARRAY['28','30','32','34','36'], ARRAY['Negro','Azul','Gris']),

-- ── CHAQUETAS (6 productos) ──────────────────────────────────────────────────
('44444444-4444-4444-4444-444444444425', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333334', 'CHA-COL-001',
 'Chaqueta Watertight II', 'Chaqueta impermeable ligera Omni-Tech',
 520.00, 290.00, 'Columbia',
 ARRAY['S','M','L','XL'], ARRAY['Negro','Azul','Rojo']),

('44444444-4444-4444-4444-444444444426', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333334', 'CHA-COL-002',
 'Chaleco Powder Lite', 'Chaleco acolchado térmico',
 420.00, 235.00, 'Columbia',
 ARRAY['M','L','XL','XXL'], ARRAY['Negro','Azul','Gris']),

('44444444-4444-4444-4444-444444444427', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333334', 'CHA-NIKE-001',
 'Windrunner Jacket', 'Cortavientos clásico con capucha',
 480.00, 265.00, 'Nike',
 ARRAY['S','M','L','XL'], ARRAY['Negro','Blanco','Azul']),

('44444444-4444-4444-4444-444444444428', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333334', 'CHA-ADI-001',
 'Chaqueta Essentials 3 Rayas', 'Chaqueta con cierre y 3 rayas',
 380.00, 210.00, 'Adidas',
 ARRAY['S','M','L','XL'], ARRAY['Negro','Marino','Rojo']),

('44444444-4444-4444-4444-444444444429', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333334', 'CHA-LEV-001',
 'Trucker Jacket Denim', 'Chaqueta trucker de jean icónica',
 450.00, 250.00, 'Levi''s',
 ARRAY['S','M','L','XL'], ARRAY['Azul','Negro']),

('44444444-4444-4444-4444-444444444430', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333334', 'CHA-TH-001',
 'Bomber Jacket Classic', 'Bomber con logo bordado',
 580.00, 320.00, 'Tommy Hilfiger',
 ARRAY['S','M','L','XL'], ARRAY['Negro','Marino'])

ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. INVENTARIO (stock distribuido en 3 puestos)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO inventory (product_id, location_id, quantity, min_stock) VALUES
-- Puesto 1 (Central) - más stock
('44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222221', 25, 5),
('44444444-4444-4444-4444-444444444402', '22222222-2222-2222-2222-222222222221', 18, 5),
('44444444-4444-4444-4444-444444444403', '22222222-2222-2222-2222-222222222221', 12, 5),
('44444444-4444-4444-4444-444444444404', '22222222-2222-2222-2222-222222222221', 15, 5),
('44444444-4444-4444-4444-444444444405', '22222222-2222-2222-2222-222222222221', 20, 5),
('44444444-4444-4444-4444-444444444406', '22222222-2222-2222-2222-222222222221', 10, 5),
('44444444-4444-4444-4444-444444444407', '22222222-2222-2222-2222-222222222221', 8, 3),
('44444444-4444-4444-4444-444444444408', '22222222-2222-2222-2222-222222222221', 30, 5),
('44444444-4444-4444-4444-444444444409', '22222222-2222-2222-2222-222222222221', 22, 5),
('44444444-4444-4444-4444-444444444410', '22222222-2222-2222-2222-222222222221', 35, 5),
('44444444-4444-4444-4444-444444444411', '22222222-2222-2222-2222-222222222221', 20, 5),
('44444444-4444-4444-4444-444444444412', '22222222-2222-2222-2222-222222222221', 28, 5),
('44444444-4444-4444-4444-444444444413', '22222222-2222-2222-2222-222222222221', 15, 5),
('44444444-4444-4444-4444-444444444414', '22222222-2222-2222-2222-222222222221', 10, 3),
('44444444-4444-4444-4444-444444444415', '22222222-2222-2222-2222-222222222221', 18, 5),
('44444444-4444-4444-4444-444444444416', '22222222-2222-2222-2222-222222222221', 40, 5),
('44444444-4444-4444-4444-444444444417', '22222222-2222-2222-2222-222222222221', 14, 5),
('44444444-4444-4444-4444-444444444418', '22222222-2222-2222-2222-222222222221', 16, 5),
('44444444-4444-4444-4444-444444444419', '22222222-2222-2222-2222-222222222221', 12, 5),
('44444444-4444-4444-4444-444444444420', '22222222-2222-2222-2222-222222222221', 10, 5),
('44444444-4444-4444-4444-444444444421', '22222222-2222-2222-2222-222222222221', 20, 5),
('44444444-4444-4444-4444-444444444422', '22222222-2222-2222-2222-222222222221', 18, 5),
('44444444-4444-4444-4444-444444444423', '22222222-2222-2222-2222-222222222221', 8, 3),
('44444444-4444-4444-4444-444444444424', '22222222-2222-2222-2222-222222222221', 25, 5),
('44444444-4444-4444-4444-444444444425', '22222222-2222-2222-2222-222222222221', 6, 3),
('44444444-4444-4444-4444-444444444426', '22222222-2222-2222-2222-222222222221', 7, 3),
('44444444-4444-4444-4444-444444444427', '22222222-2222-2222-2222-222222222221', 5, 3),
('44444444-4444-4444-4444-444444444428', '22222222-2222-2222-2222-222222222221', 9, 3),
('44444444-4444-4444-4444-444444444429', '22222222-2222-2222-2222-222222222221', 8, 3),
('44444444-4444-4444-4444-444444444430', '22222222-2222-2222-2222-222222222221', 4, 2),

-- Puesto 2 (Norte) - stock medio
('44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222222', 15, 5),
('44444444-4444-4444-4444-444444444402', '22222222-2222-2222-2222-222222222222', 10, 5),
('44444444-4444-4444-4444-444444444403', '22222222-2222-2222-2222-222222222222', 8, 5),
('44444444-4444-4444-4444-444444444404', '22222222-2222-2222-2222-222222222222', 10, 5),
('44444444-4444-4444-4444-444444444405', '22222222-2222-2222-2222-222222222222', 12, 5),
('44444444-4444-4444-4444-444444444406', '22222222-2222-2222-2222-222222222222', 6, 3),
('44444444-4444-4444-4444-444444444407', '22222222-2222-2222-2222-222222222222', 5, 3),
('44444444-4444-4444-4444-444444444408', '22222222-2222-2222-2222-222222222222', 20, 5),
('44444444-4444-4444-4444-444444444409', '22222222-2222-2222-2222-222222222222', 15, 5),
('44444444-4444-4444-4444-444444444410', '22222222-2222-2222-2222-222222222222', 22, 5),
('44444444-4444-4444-4444-444444444411', '22222222-2222-2222-2222-222222222222', 14, 5),
('44444444-4444-4444-4444-444444444412', '22222222-2222-2222-2222-222222222222', 18, 5),
('44444444-4444-4444-4444-444444444413', '22222222-2222-2222-2222-222222222222', 8, 5),
('44444444-4444-4444-4444-444444444414', '22222222-2222-2222-2222-222222222222', 6, 3),
('44444444-4444-4444-4444-444444444415', '22222222-2222-2222-2222-222222222222', 12, 5),
('44444444-4444-4444-4444-444444444416', '22222222-2222-2222-2222-222222222222', 25, 5),
('44444444-4444-4444-4444-444444444417', '22222222-2222-2222-2222-222222222222', 10, 5),
('44444444-4444-4444-4444-444444444418', '22222222-2222-2222-2222-222222222222', 12, 5),
('44444444-4444-4444-4444-444444444419', '22222222-2222-2222-2222-222222222222', 8, 5),
('44444444-4444-4444-4444-444444444420', '22222222-2222-2222-2222-222222222222', 6, 3),
('44444444-4444-4444-4444-444444444421', '22222222-2222-2222-2222-222222222222', 14, 5),
('44444444-4444-4444-4444-444444444422', '22222222-2222-2222-2222-222222222222', 12, 5),
('44444444-4444-4444-4444-444444444423', '22222222-2222-2222-2222-222222222222', 5, 3),
('44444444-4444-4444-4444-444444444424', '22222222-2222-2222-2222-222222222222', 18, 5),
('44444444-4444-4444-4444-444444444425', '22222222-2222-2222-2222-222222222222', 4, 2),
('44444444-4444-4444-4444-444444444426', '22222222-2222-2222-2222-222222222222', 5, 3),
('44444444-4444-4444-4444-444444444427', '22222222-2222-2222-2222-222222222222', 3, 2),
('44444444-4444-4444-4444-444444444428', '22222222-2222-2222-2222-222222222222', 6, 3),
('44444444-4444-4444-4444-444444444429', '22222222-2222-2222-2222-222222222222', 5, 3),
('44444444-4444-4444-4444-444444444430', '22222222-2222-2222-2222-222222222222', 2, 2),

-- Puesto 3 (Sur) - menos stock, algunos productos con stock bajo
('44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222223', 8, 5),
('44444444-4444-4444-4444-444444444402', '22222222-2222-2222-2222-222222222223', 4, 5),
('44444444-4444-4444-4444-444444444403', '22222222-2222-2222-2222-222222222223', 3, 5),
('44444444-4444-4444-4444-444444444404', '22222222-2222-2222-2222-222222222223', 6, 5),
('44444444-4444-4444-4444-444444444405', '22222222-2222-2222-2222-222222222223', 7, 5),
('44444444-4444-4444-4444-444444444406', '22222222-2222-2222-2222-222222222223', 2, 3),
('44444444-4444-4444-4444-444444444407', '22222222-2222-2222-2222-222222222223', 3, 3),
('44444444-4444-4444-4444-444444444408', '22222222-2222-2222-2222-222222222223', 12, 5),
('44444444-4444-4444-4444-444444444409', '22222222-2222-2222-2222-222222222223', 10, 5),
('44444444-4444-4444-4444-444444444410', '22222222-2222-2222-2222-222222222223', 15, 5),
('44444444-4444-4444-4444-444444444411', '22222222-2222-2222-2222-222222222223', 8, 5),
('44444444-4444-4444-4444-444444444412', '22222222-2222-2222-2222-222222222223', 10, 5),
('44444444-4444-4444-4444-444444444413', '22222222-2222-2222-2222-222222222223', 4, 5),
('44444444-4444-4444-4444-444444444414', '22222222-2222-2222-2222-222222222223', 3, 3),
('44444444-4444-4444-4444-444444444415', '22222222-2222-2222-2222-222222222223', 6, 5),
('44444444-4444-4444-4444-444444444416', '22222222-2222-2222-2222-222222222223', 18, 5),
('44444444-4444-4444-4444-444444444417', '22222222-2222-2222-2222-222222222223', 5, 5),
('44444444-4444-4444-4444-444444444418', '22222222-2222-2222-2222-222222222223', 7, 5),
('44444444-4444-4444-4444-444444444419', '22222222-2222-2222-2222-222222222223', 4, 5),
('44444444-4444-4444-4444-444444444420', '22222222-2222-2222-2222-222222222223', 3, 3),
('44444444-4444-4444-4444-444444444421', '22222222-2222-2222-2222-222222222223', 9, 5),
('44444444-4444-4444-4444-444444444422', '22222222-2222-2222-2222-222222222223', 8, 5),
('44444444-4444-4444-4444-444444444423', '22222222-2222-2222-2222-222222222223', 2, 3),
('44444444-4444-4444-4444-444444444424', '22222222-2222-2222-2222-222222222223', 10, 5),
('44444444-4444-4444-4444-444444444425', '22222222-2222-2222-2222-222222222223', 2, 2),
('44444444-4444-4444-4444-444444444426', '22222222-2222-2222-2222-222222222223', 3, 3),
('44444444-4444-4444-4444-444444444427', '22222222-2222-2222-2222-222222222223', 1, 2),
('44444444-4444-4444-4444-444444444428', '22222222-2222-2222-2222-222222222223', 4, 3),
('44444444-4444-4444-4444-444444444429', '22222222-2222-2222-2222-222222222223', 3, 3),
('44444444-4444-4444-4444-444444444430', '22222222-2222-2222-2222-222222222223', 1, 2)

ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. VENTAS DEMO (20 ventas en los últimos 7 días)
-- ══════════════════════════════════════════════════════════════════════════════

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
    SELECT id INTO v_admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
  END IF;
  
  -- Si tampoco hay perfiles, salir
  IF v_admin_id IS NULL THEN
    RAISE NOTICE 'No se encontró usuario admin. Crea el usuario primero.';
    RETURN;
  END IF;

  -- Asegurarse de que el profile existe para el admin
  INSERT INTO profiles (id, organization_id, location_id, email, full_name, role)
  VALUES (v_admin_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'admin@lukesshome.com', 'Lucas Administrador', 'admin')
  ON CONFLICT (id) DO UPDATE SET
    organization_id = '11111111-1111-1111-1111-111111111111',
    location_id = '22222222-2222-2222-2222-222222222221';

  -- ═══ VENTA 1: Hace 6 días, Puesto 1, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', v_admin_id, 'Carlos Mendoza', 700.00, 0, 0, 700.00, 'cash', v_now - INTERVAL '6 days 3 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444401', 1, 320.00, 320.00),
    (v_sale_id, '44444444-4444-4444-4444-444444444417', 1, 380.00, 380.00);

  -- ═══ VENTA 2: Hace 6 días, Puesto 1, QR ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', v_admin_id, NULL, 240.00, 0, 0, 240.00, 'qr', v_now - INTERVAL '6 days 1 hour');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444410', 2, 120.00, 240.00);

  -- ═══ VENTA 3: Hace 5 días, Puesto 2, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', v_admin_id, 'María Gutiérrez', 830.00, 0, 0, 830.00, 'cash', v_now - INTERVAL '5 days 4 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444407', 1, 420.00, 420.00),
    (v_sale_id, '44444444-4444-4444-4444-444444444418', 1, 350.00, 350.00),
    (v_sale_id, '44444444-4444-4444-4444-444444444416', 1, 95.00, 60.00);

  -- ═══ VENTA 4: Hace 5 días, Puesto 1, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', v_admin_id, 'Roberto Flores', 520.00, 0, 0, 520.00, 'cash', v_now - INTERVAL '5 days 2 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444425', 1, 520.00, 520.00);

  -- ═══ VENTA 5: Hace 4 días, Puesto 1, QR ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', v_admin_id, NULL, 460.00, 0, 0, 460.00, 'qr', v_now - INTERVAL '4 days 5 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444409', 1, 200.00, 200.00),
    (v_sale_id, '44444444-4444-4444-4444-444444444423', 1, 260.00, 260.00);

  -- ═══ VENTA 6: Hace 4 días, Puesto 3, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222223', v_admin_id, 'Ana Vargas', 730.00, 0, 0, 730.00, 'cash', v_now - INTERVAL '4 days 3 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444414', 1, 350.00, 350.00),
    (v_sale_id, '44444444-4444-4444-4444-444444444417', 1, 380.00, 380.00);

  -- ═══ VENTA 7: Hace 4 días, Puesto 1, Tarjeta ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', v_admin_id, 'Diego Salinas', 1060.00, 0, 0, 1060.00, 'card', v_now - INTERVAL '4 days 1 hour');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444430', 1, 580.00, 580.00),
    (v_sale_id, '44444444-4444-4444-4444-444444444427', 1, 480.00, 480.00);

  -- ═══ VENTA 8: Hace 3 días, Puesto 2, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', v_admin_id, 'Fernando Ríos', 560.00, 0, 0, 560.00, 'cash', v_now - INTERVAL '3 days 6 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444405', 1, 290.00, 290.00),
    (v_sale_id, '44444444-4444-4444-4444-444444444420', 1, 300.00, 270.00);

  -- ═══ VENTA 9: Hace 3 días, Puesto 1, QR ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', v_admin_id, NULL, 350.00, 0, 0, 350.00, 'qr', v_now - INTERVAL '3 days 4 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444414', 1, 350.00, 350.00);

  -- ═══ VENTA 10: Hace 3 días, Puesto 1, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', v_admin_id, 'Jorge Mamani', 295.00, 0, 0, 295.00, 'cash', v_now - INTERVAL '3 days 2 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444416', 1, 95.00, 95.00),
    (v_sale_id, '44444444-4444-4444-4444-444444444409', 1, 200.00, 200.00);

  -- ═══ VENTA 11: Hace 2 días, Puesto 1, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', v_admin_id, 'Pedro Condori', 640.00, 0, 0, 640.00, 'cash', v_now - INTERVAL '2 days 5 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444403', 1, 280.00, 280.00),
    (v_sale_id, '44444444-4444-4444-4444-444444444418', 1, 350.00, 350.00);

  -- ═══ VENTA 12: Hace 2 días, Puesto 2, QR ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', v_admin_id, NULL, 400.00, 0, 0, 400.00, 'qr', v_now - INTERVAL '2 days 3 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444411', 1, 180.00, 180.00),
    (v_sale_id, '44444444-4444-4444-4444-444444444421', 1, 220.00, 220.00);

  -- ═══ VENTA 13: Hace 2 días, Puesto 3, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222223', v_admin_id, 'Sergio Quispe', 830.00, 0, 0, 830.00, 'cash', v_now - INTERVAL '2 days 1 hour');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444429', 1, 450.00, 450.00),
    (v_sale_id, '44444444-4444-4444-4444-444444444417', 1, 380.00, 380.00);

  -- ═══ VENTA 14: Hace 1 día, Puesto 1, Tarjeta ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', v_admin_id, 'Lucía Torrez', 900.00, 0, 0, 900.00, 'card', v_now - INTERVAL '1 day 6 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444407', 1, 420.00, 420.00),
    (v_sale_id, '44444444-4444-4444-4444-444444444427', 1, 480.00, 480.00);

  -- ═══ VENTA 15: Hace 1 día, Puesto 1, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', v_admin_id, NULL, 230.00, 0, 0, 230.00, 'cash', v_now - INTERVAL '1 day 4 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444410', 1, 120.00, 120.00),
    (v_sale_id, '44444444-4444-4444-4444-444444444412', 1, 110.00, 110.00);

  -- ═══ VENTA 16: Hace 1 día, Puesto 2, QR ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', v_admin_id, 'Marco Chávez', 550.00, 0, 0, 550.00, 'qr', v_now - INTERVAL '1 day 2 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444402', 1, 350.00, 350.00),
    (v_sale_id, '44444444-4444-4444-4444-444444444409', 1, 200.00, 200.00);

  -- ═══ VENTA 17: Hoy, Puesto 1, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', v_admin_id, 'Andrés Rojas', 670.00, 0, 0, 670.00, 'cash', v_now - INTERVAL '3 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444401', 1, 320.00, 320.00),
    (v_sale_id, '44444444-4444-4444-4444-444444444418', 1, 350.00, 350.00);

  -- ═══ VENTA 18: Hoy, Puesto 1, QR ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', v_admin_id, NULL, 380.00, 0, 0, 380.00, 'qr', v_now - INTERVAL '2 hours');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444428', 1, 380.00, 380.00);

  -- ═══ VENTA 19: Hoy, Puesto 3, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222223', v_admin_id, 'Raúl Fernández', 540.00, 0, 0, 540.00, 'cash', v_now - INTERVAL '1 hour');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444405', 1, 290.00, 290.00),
    (v_sale_id, '44444444-4444-4444-4444-444444444423', 1, 260.00, 250.00);

  -- ═══ VENTA 20: Hoy, Puesto 1, Efectivo ═══
  v_sale_id := gen_random_uuid();
  INSERT INTO sales (id, organization_id, location_id, sold_by, customer_name, subtotal, discount, tax, total, payment_method, created_at)
  VALUES (v_sale_id, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', v_admin_id, 'Valentina Cruz', 470.00, 0, 0, 470.00, 'cash', v_now - INTERVAL '30 minutes');
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES
    (v_sale_id, '44444444-4444-4444-4444-444444444413', 1, 280.00, 280.00),
    (v_sale_id, '44444444-4444-4444-4444-444444444415', 1, 160.00, 160.00);

  RAISE NOTICE 'Seed completado: 30 productos, 90 registros de inventario, 20 ventas';
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- RESUMEN DEL SEED
-- ══════════════════════════════════════════════════════════════════════════════
--
-- ✅ 1 organización: Lukess Home
-- ✅ 4 ubicaciones: 3 puestos + 1 bodega
-- ✅ 5 categorías: Camisas, Polos, Pantalones, Chaquetas, Accesorios
-- ✅ 30 productos con marcas reales (Tommy Hilfiger, Nike, Levi's, Columbia, etc.)
-- ✅ 90 registros de inventario (30 productos × 3 puestos)
-- ✅ 20 ventas distribuidas en los últimos 7 días
-- ✅ Métodos de pago variados: 60% efectivo, 30% QR, 10% tarjeta
-- ✅ Stock bajo en algunos productos del Puesto 3
--
-- PRÓXIMO PASO:
-- Ejecutar 003_rls_policies.sql para configurar seguridad RLS
--
-- ══════════════════════════════════════════════════════════════════════════════
