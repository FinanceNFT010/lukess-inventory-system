# PROJECT RULES — lukess-inventory-system (Admin Dashboard)

## Project Identity
- **Repo**: FinanceNFT010/lukess-inventory-system
- **Deploy**: https://lukess-inventory-system.vercel.app
- **Purpose**: Internal admin dashboard for Lukess Home: inventory, orders, reports, users
- **DB Project**: lrcggpdgrqltqbxqnjgh (Supabase sa-east-1) — SAME database as landing
- **Supabase Auth**: Email/password + role-based (admin / manager / staff)
- **Test credentials**: Use "Usar credencial" → "Continuar" to login as admin in Browser Sub-Agent tests

## Scope Boundaries
You work ONLY on files in this project.
NEVER modify `lukess-home` files from this workspace.
When a DB change is needed that affects BOTH projects, note it in activeContext.md under "Cross-project impact".

## Critical Context
- RBAC: admin > manager > staff. Staff only sees /ventas. Middleware protects all dashboard routes.
- `supabaseAdmin` (service_role) is used in Server Actions only to bypass RLS for admin operations. NEVER in client components.
- After ANY migration: immediately run `generate_typescript_types` and overwrite `types/database.types.ts`.
- Realtime channels: `pedidos-list` (orders) and `inventory-changes` (inventory + products). Do not add more than 2 channels per component.
- Recharts v3 is installed. Use it for all charts. Do NOT install chart.js or victory.
- `react-hook-form` + `zod` for ALL forms. No uncontrolled inputs.

## DB Tables Owned by This Project (read/write)
`products`, `inventory`, `inventory_transactions`, `inventory_reservations`, `sales`, `sale_items`, `orders` (write via admin), `order_items`, `profiles`, `organizations`, `locations`, `categories`, `audit_log`, `access_requests`

## Pending DB Migrations (run these BEFORE implementing related features)
- `add_discount_fields_to_products`: ADD COLUMN `discount_expires_at timestamptz`, ADD COLUMN `is_new_until timestamptz`
- `create_discount_codes_table`: full table with code, discount_type, amount, max_uses, used_count, expires_at, is_active
After these migrations: regenerate types + update forms.

## Environment Variables (all required)
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
RESEND_API_KEY, LANDING_URL, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, WHATSAPP_API_VERSION
