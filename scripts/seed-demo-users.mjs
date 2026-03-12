// scripts/seed-demo-users.mjs
// Run with: node scripts/seed-demo-users.mjs
// Requires: SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
//
// Creates two demo users for portfolio demo:
//   admin@lukess.demo  — role: admin
//   staff@lukess.demo  — role: staff

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// --- Load .env.local manually (no dotenv dependency needed) ---
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
// Puesto 1 - Central
const LOCATION_PUESTO1 = '22222222-2222-2222-2222-222222222221';
// Bodega Central (admin doesn't need a specific stall)
const LOCATION_BODEGA = '22222222-2222-2222-2222-222222222224';

const DEMO_USERS = [
  {
    email: 'admin@lukess.demo',
    password: 'Admin123!',
    full_name: 'Demo Admin',
    role: 'admin',
    location_id: LOCATION_BODEGA,
  },
  {
    email: 'staff@lukess.demo',
    password: 'Admin123!',
    full_name: 'Demo Staff',
    role: 'staff',
    location_id: LOCATION_PUESTO1,
  },
];

async function seedDemoUsers() {
  console.log('🚀 Seeding demo users...\n');

  for (const user of DEMO_USERS) {
    console.log(`Creating user: ${user.email} (${user.role})`);

    // 1. Check if auth user already exists
    const { data: existingList } = await supabase.auth.admin.listUsers();
    const existing = existingList?.users?.find((u) => u.email === user.email);

    let authUserId;

    if (existing) {
      console.log(`  ⚠️  Auth user already exists (id: ${existing.id}) — skipping auth creation`);
      authUserId = existing.id;
      // Update password to ensure it matches
      const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
        password: user.password,
        email_confirm: true,
      });
      if (updateErr) {
        console.error(`  ❌ Failed to update password:`, updateErr.message);
      } else {
        console.log(`  ✅ Password updated`);
      }
    } else {
      // 2. Create auth user
      const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

      if (authErr) {
        console.error(`  ❌ Auth creation failed:`, authErr.message);
        continue;
      }

      authUserId = authData.user.id;
      console.log(`  ✅ Auth user created (id: ${authUserId})`);
    }

    // 3. Upsert profile
    const { error: profileErr } = await supabase.from('profiles').upsert(
      {
        id: authUserId,
        organization_id: ORG_ID,
        location_id: user.location_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: true,
      },
      { onConflict: 'id' }
    );

    if (profileErr) {
      console.error(`  ❌ Profile upsert failed:`, profileErr.message);
    } else {
      console.log(`  ✅ Profile upserted (role: ${user.role})`);
    }

    console.log('');
  }

  console.log('✅ Done! Demo users ready:');
  console.log('   admin@lukess.demo  / Admin123!  (role: admin)');
  console.log('   staff@lukess.demo  / Admin123!  (role: staff)');
}

seedDemoUsers().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
