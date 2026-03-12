// scripts/seed-demo-analytics-es.mjs
// Run with: node scripts/seed-demo-analytics-es.mjs
// Requires: SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
//
// Blocks B12.2.2 - Demo en Español Neutro
// Re-seeds the database with realistic Spanish demo data for 60 days.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// --- Load .env.local manually ---
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');

const envFile = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const value = trimmed.slice(eqIdx + 1).trim();
  env[key] = value;
}

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ORG_ID = '11111111-1111-1111-1111-111111111111';

// Constants
const LOCATIONS = [
  { id: '22222222-2222-2222-2222-222222222221', name: 'Puesto 1 Central', weight: 4 },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Puesto 2 Norte', weight: 3 },
  { id: '22222222-2222-2222-2222-222222222223', name: 'Puesto 3 Sur', weight: 2 },
  { id: '22222222-2222-2222-2222-222222222224', name: 'Bodega Central', weight: 0 }, // Bodega doesn't sell directly
];

const PROFILES = [
  '17e4af3c-8604-4b79-9dd2-1377c623d92c', // Admin
  '44902dae-0c6f-4076-9312-cb0247bf2603', // Staff
];

const CUSTOMER_NAMES = [
  "Carlos Mendoza", "Ana Sofía Vargas", "Rodrigo Guzmán", "Diego Fernández", "Lucía Navarro",
  "Mateo Castillo", "Valentina Rojas", "Santiago Silva", "Camila Castro", "Sebastián Reyes",
  "Isabella Flores", "Martín Ortiz", "Daniela Vega", "Alejandro Morales", "Mariana Ríos",
  "Javier Cruz", "Valeria Herrera", "Lucas Delgado", "Sofía Medina", "Tomás Aguilar",
  "Renata Salazar", "Emilio Paredes", "Victoria Montoya", "Felipe Arce", "Gabriela Cordero"
];

const PAYMENT_METHODS = [
  { method: 'qr', weight: 4 },
  { method: 'cash', weight: 4 },
  { method: 'card', weight: 3 }
];

// Helpers
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomWeighted(arr) {
  const totalWeight = arr.reduce((acc, item) => acc + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of arr) {
    if (random < item.weight) return item;
    random -= item.weight;
  }
  return arr[0];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFixedUUID(index, prefix) {
  const hex = index.toString(16).padStart(12, '0');
  return `a0000000-0000-0000-${prefix}-` + hex;
}

async function runSeed() {
  console.log('🚀 Iniciando Seed en Español Neutro (B12.2.2)...\n');

  // --- FASE 1: Limpieza ---
  console.log('🧹 Fase 1: Limpiando datos analíticos previos...');
  
  const { error: err1 } = await supabase.from('inventory_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: err2 } = await supabase.from('sale_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: err3 } = await supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: err4 } = await supabase.from('inventory').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (err1 || err2 || err3 || err4) {
    console.error('❌ Error limpiando BD:', err1?.message || err2?.message || err3?.message || err4?.message);
    process.exit(1);
  }
  console.log('✅ Bases limpias.\n');

  // --- FASE 2: Inventario Masivo ---
  console.log('📦 Fase 2: Creando inventario para todo el catálogo...');
  
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, name, price, sizes, colors')
    .eq('organization_id', ORG_ID)
    .eq('is_active', true);
    
  if (prodErr || !products || products.length === 0) {
    console.error('❌ Error obteniendo productos o cero encontrados:', prodErr?.message);
    process.exit(1);
  }
  
  console.log(`   Se encontraron ${products.length} productos.`);

  const newInventory = [];
  
  for (const product of products) {
    // Si no tiene tallas ni colores, usa por defecto
    const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['ONE_SIZE'];
    const colors = product.colors && product.colors.length > 0 ? product.colors : ['Default'];
    
    // Solo un par de combinaciones para no explotar la BD, digamos la primera
    const size = sizes[0];
    const color = colors[0];

    // Distribuimos para las 4 sucursales
    for (const loc of LOCATIONS) {
      let qty = 0;
      if (loc.id === '22222222-2222-2222-2222-222222222224') {
         // Bodega
         qty = getRandomInt(20, 50);
      } else {
         // Puestos - forzamos que algunos tengan stock bajo
         const isLowStock = Math.random() < 0.15; // 15% chance
         qty = isLowStock ? getRandomInt(0, 3) : getRandomInt(5, 20);
      }

      newInventory.push({
        product_id: product.id,
        location_id: loc.id,
        quantity: qty,
        min_stock: 5,
        size: size,
        color: color
      });
    }
  }

  const { error: invErr } = await supabase.from('inventory').insert(newInventory);
  if (invErr) {
    console.error('❌ Error insertando inventario:', invErr.message);
    process.exit(1);
  }
  console.log(`✅ ${newInventory.length} filas de inventario creadas.\n`);

  // Necesitamos el inventario recargado para relacionar items
  const { data: allInventory } = await supabase
    .from('inventory')
    .select('id, product_id, location_id, quantity, size, color')
    .gt('quantity', 0); // Solo de donde podamos vender

  // --- FASE 3: Ventas a 60 días ---
  console.log('📊 Fase 3: Generando >50 ventas ficticias (60 días)...');
  
  const NUM_SALES = getRandomInt(65, 85);
  const sales = [];
  const saleItems = [];
  const transactions = [];

  for (let i = 0; i < NUM_SALES; i++) {
    const saleId = generateFixedUUID(i + 1, '1000');
    
    const daysAgo = getRandomInt(0, 60);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(getRandomInt(9, 19), getRandomInt(0, 59), 0, 0);

    const isOnline = Math.random() < 0.15; // 15% online
    const loc = isOnline 
      ? LOCATIONS[3] // Bodega para online
      : getRandomWeighted(LOCATIONS.slice(0, 3)); // Puestos físicos

    const profile = getRandomElement(PROFILES);
    const customerName = getRandomElement(CUSTOMER_NAMES);
    const payment = getRandomWeighted(PAYMENT_METHODS).method;
    const canal = isOnline ? 'online' : 'fisico';

    // Agregamos de 1 a 3 items
    const numItems = getRandomInt(1, 3);
    let totalSale = 0;
    
    // Para simplificar, obtenemos invDisponible de la sucursal
    const invLoc = allInventory.filter(inv => inv.location_id === loc.id);
    if (invLoc.length === 0) continue; // No hay inventario en esta loc

    for (let j = 0; j < numItems; j++) {
      const invRow = getRandomElement(invLoc);
      const _prod = products.find(p => p.id === invRow.product_id);
      if (!_prod) continue;
      
      const qty = 1; // 1 unidad por item
      const unitPrice = _prod.price;
      const subtotal = qty * unitPrice;
      totalSale += subtotal;

      saleItems.push({
        sale_id: saleId,
        product_id: _prod.id,
        quantity: qty,
        unit_price: unitPrice,
        subtotal: subtotal,
        size: invRow.size,
        color: invRow.color,
        location_id: loc.id
      });

      transactions.push({
        inventory_id: invRow.id,
        product_id: _prod.id,
        location_id: loc.id,
        transaction_type: 'sale',
        quantity_change: -qty,
        quantity_before: invRow.quantity,
        quantity_after: invRow.quantity - qty,
        reference_id: saleId,
        notes: `Venta POS — ${customerName}`,
        created_by: profile,
        created_at: date.toISOString()
      });
      
      // Update our local counter so we don't go negative conceptually
      invRow.quantity -= qty;
    }

    if (totalSale === 0) continue; // Skip empty sales

    // Posible descuento
    const hasDiscount = Math.random() < 0.2;
    const discount = hasDiscount ? (totalSale * 0.1) : 0; // 10% discount
    
    sales.push({
      id: saleId,
      organization_id: ORG_ID,
      location_id: loc.id,
      sold_by: profile,
      customer_name: customerName,
      subtotal: totalSale,
      discount: discount,
      tax: 0,
      total: totalSale - discount,
      payment_method: payment,
      canal: canal,
      created_at: date.toISOString()
    });
  }

  // Insertar en BD
  const { error: sErr } = await supabase.from('sales').insert(sales);
  if (sErr) throw sErr;
  
  const { error: siErr } = await supabase.from('sale_items').insert(saleItems);
  if (siErr) throw siErr;

  const { error: tErr } = await supabase.from('inventory_transactions').insert(transactions);
  if (tErr) throw tErr;

  // Actualizar el inventario físico (Sync with DB)
  console.log(`✅ ${sales.length} Ventas, ${saleItems.length} Elementos, ${transactions.length} Transacciones.`);
  
  console.log('🔄 Actualizando cantidades definitivas en inventario...');
  // Since we mutated local array, we can just upsert
  const { error: updErr } = await supabase.from('inventory').upsert(
    allInventory.map(inv => ({
      id: inv.id,
      product_id: inv.product_id,
      location_id: inv.location_id,
      size: inv.size,
      color: inv.color,
      quantity: inv.quantity
    }))
  );
  if (updErr) throw updErr;

  console.log(`✅ Cantidades descontadas con éxito.\n`);

  console.log('🎉 Seed analítico B12.2.2 FINALIZADO.');
}

runSeed().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
