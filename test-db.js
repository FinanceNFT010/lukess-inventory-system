const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';

envFile.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data: orderData, error } = await supabaseAdmin
        .from('orders')
        .select(`
      id,
      customer_name,
      customer_email,
      notify_email,
      customer_phone,
      notify_whatsapp,
      delivery_method,
      payment_method,
      whatsapp_last_status_sent,
      maps_link,
      shipping_address,
      pickup_location,
      shipping_cost,
      gps_distance_km,
      subtotal,
      total,
      discount_code_id,
      order_items (
        quantity,
        unit_price,
        size,
        color,
        products ( name, image_url )
      )
    `)
        .eq('id', '6493b82f-c4ea-4d02-848f-14091bc53537')
        .single()

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('--- DB DATA ---');
        console.log('notify_email exists:', 'notify_email' in orderData);
        console.log('notify_email value:', orderData.notify_email);
        console.log('Type of notify_email:', typeof orderData.notify_email);
        console.log('if (orderData.notify_email) evaluates to:', orderData.notify_email ? 'TRUE' : 'FALSE');
        if (orderData.notify_email && orderData.customer_email) {
            console.log('WOULD TRIGGER EMAIL');
        } else {
            console.log('WOULD NOT TRIGGER EMAIL');
        }
    }
}

test();
