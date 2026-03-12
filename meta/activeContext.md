# activeContext.md — lukess-inventory-system (Admin Dashboard)
**Last Updated:** 2026-03-12
**Updated By:** Antigravity Agent

---

## CURRENT BLOCK
- **Block Number:** B12.2.x
- **Block Name:** Demo Premium Transformation
- **Status:** DONE
- **Completed:** 2026-03-12

---

## LAST COMPLETED BLOCK
- **Block Number:** B12.2.x
- **Block Name:** Demo Premium Transformation
- **Completed:** 2026-03-12
- **Commits:**
  - IS: `feat(demo): B12.2.x — demo user accounts, analytics seed data, premium login UX`

---

### Files Modified
- **IS:** `app/(auth)/login/page.tsx` (MODIFIED — Explorer Demo Credentials panel, Admin + Staff auto-fill buttons)
- **IS:** `scripts/seed-demo-users.mjs` (NEW — creates admin@lukess.demo + staff@lukess.demo via supabaseAdmin)
- **IS:** `meta/activeContext.md` (MODIFIED)

---

## DATABASE STATE
- **Supabase Project:** lrcggpdgrqltqbxqnjgh (ACTIVE_HEALTHY, sa-east-1, PostgreSQL 17.6)
- **Total Tables:** 19+
- **Migrations Applied (B12.2.x added 4):**
  - `b12_demo_seed_inventory` — 15 products × 4 locations seeded with realistic stock (variants by size+color)
  - `b12_demo_seed_sales` — 30 POS sales over 30 days (varied payment methods, customer names, sellers)
  - `b12_demo_seed_sale_items` — 47 sale_item rows linked to correct products + locations
  - `b12_demo_seed_transactions_and_update_inventory` — 13 inventory_transactions (type: sale) + quantity decrements
- **Demo Auth Users Created:**
  - `admin@lukess.demo` (id: 17e4af3c-8604-4b79-9dd2-1377c623d92c, role: admin, location: Bodega Central)
  - `staff@lukess.demo` (id: 44902dae-0c6f-4076-9312-cb0247bf2603, role: staff, location: Puesto 1 Central)
  - Password: `Admin123!` for both
- **Types Regenerated:** Not needed (no schema DDL changes).

---

## OPEN ISSUES
- [ ] SECURITY: 10 functions with mutable search_path (flagged by get_advisors): log_inventory_transaction, reserve_order_inventory, handle_order_status_change, cancel_expired_orders, apply_order_allocation, handle_new_user, update_updated_at_column, get_user_org_id, get_user_role, get_user_location_id
- [ ] SECURITY: Overly permissive RLS on: access_requests (INSERT), customers (INSERT/UPDATE), inventory_reservations (ALL), order_items (INSERT), orders (INSERT/UPDATE), subscribers (INSERT)
- [ ] SECURITY: Leaked Password Protection disabled in Supabase Auth
- [ ] TODO: No subscriber management module in sidebar (table `subscribers` exists but no UI)
- [ ] TODO: WhatsApp `pedido_listo_recojo` template must be submitted to Meta Business for approval
- [ ] TODO: is_featured sorting on landing page (lukess-home repo) — not implemented yet
- [ ] TODO: User must push the `marketing_schema.sql` migration to Supabase and regenerate typescript types
- [ ] TODO: User must push the `get_available_filters_by_category` migration to Supabase manually
- [ ] DEMO NOTE: Dashboard `formatCurrency()` displays amounts as "Bs X.XX" — product prices are USD, displayed as-is (intentional for demo)

---

## NEXT BLOCK
- **Block:** Phase 4 (optional)
- **Name:** Visual demo polish — consider adding `/demo` public landing redirect, Vercel domain aliasing `inventory.adrianoliver.dev`
- **Dependencies:** B12.2.x complete ✅

---

## BLOCK HISTORY
| Block | Name | Status | Date | Commit |
|---|---|---|---|---|
| B12.2.x | Demo Premium Transformation | ✅ DONE | 2026-03-12 | (see above) |
| 20-Portfolio | Open-Source Portfolio Demo Prep | ✅ DONE | 2026-03-10 | 98520db |
| 19-Audit | System Audit & Documentation | ✅ DONE | 2026-03-10 | TBD |
| 1to8 | Fundamentals (Roles to Reports) | ✅ DONE | Feb 2026 | — |
| 17-A-4.2 | Auto-trigger pickup flow emails | ✅ DONE | 2026-03-05 | TBD |
| 16-C-1 | Dashboard + Reportes Critical Fixes | ✅ DONE | 2026-03-04 | TBD |
| 16-C-2 | Inventory UX Improvements | ✅ DONE | 2026-03-04 | 01d905d |
| 16-C-3 | Marketing + Users Module Fixes | ✅ DONE | 2026-03-04 | c6daa0c |
| 16-C-4-A | Enhanced Banner Upload Form + DB Migration | ✅ DONE | 2026-03-04 | 3f8b046 |
| 16-C-4-C | Banner Edit Modal (Click-to-Edit) | ✅ DONE | 2026-03-04 | 7212c4d |
| 16-C.a.B | Admin Inventory - Thumbnail Upload Field | ✅ DONE | 2026-03-04 | TBD |
| 9c-A | Inventario: BD + formulario descuentos/is_new | ✅ DONE | 2026-02-27 | 4001f88 |
| 9c-B | Inventario: Upload múltiples imágenes | ✅ DONE | 2026-02-27 | 9a330bc |
| 9c-C | Create form parity + is_featured | ✅ DONE | 2026-02-26 | 5bdab26 |
| 10-E.1| Brand Foundation & Global Constants | ✅ DONE | 2026-02-27 | 100ac34 |
| 10-E.2| Navbar & Footer Redesign | ✅ DONE | 2026-02-27 | 888acdf |
| 10-E.3| Database Structure for Categories & Colors | ✅ DONE | 2026-02-27 | 6aab07d |
| 11-A | Design System Foundation — Zinc/Gold | ✅ DONE | 2026-02-27 | b68d188 |
| 11-B | Layout Shell Rebrand — Login/Sidebar/TopBar | ✅ DONE | 2026-02-27 | ad93be5 |
| 11-C | Dashboard + Inventario Redesign | ✅ DONE | 2026-02-28 | 6492283 |
| 11-D | Orders + Reports Plugins (Monochrome Branding Updates) | ✅ DONE | 2026-02-28 | 6492283 |
| 11-E | POS Rebrand and Order Allocation Bug Fix | ✅ DONE | 2026-02-28 | 6492283 |
| 12 | Marketing CMS (Banners & Discount Codes) | ✅ DONE | 2026-02-28 | 6492283 |
| 13 | BUGFIX SPRINT (Marketing, Allocations, Reports) | ✅ DONE | 2026-02-28 | 7e0ffee |
| 13-C | End-to-End Discount Consumption & Visibility | ✅ DONE | 2026-03-01 | d20fac8 |
| 13-D | End-to-End Discount Visibility (Orders, History, Reports) | ✅ DONE | 2026-03-01 | ff8e0e2 |
| 13-E | Fix missing math fields (Shipping and Discount) | ✅ DONE | 2026-03-01 | 59d6452 |
| 13-F | POS Store Select Fix & Reports Online Discounts | ✅ DONE | 2026-03-01 | 0f5a017 |
| 14-A | POS Stall Selection & Seller Permissions | ✅ DONE | 2026-03-01 | 9741d79 |
| 14-B | Restore Delivery Info in Modal + Discount Idempotency | ✅ DONE | 2026-03-01 | 14f7d56 |
| 15-B | Map WhatsApp Templates to Order Status Changes | ✅ DONE | 2026-03-01 | 2f1d723 |
| 15-C | Pre-Production Root Cleanup | ✅ DONE | 2026-03-03 | 1ad0c99 |
| 17-N | Fix Email UI & Meta API Formatting | ✅ DONE | 2026-03-07 | d36ae3b |
| 17-O | Fix WhatsApp Meta API Image & Cancelled Template Name | ✅ DONE | 2026-03-07 | ba08f6b |
| 17-P | Final WhatsApp Meta API Template Fix | ✅ DONE | 2026-03-07 | TBD |
| 17-Q | Sync WhatsApp Header Image to Supabase | ✅ DONE | 2026-03-07 | TBD |
| 16-A | Deep Code Cleanup (Logs & Dead Code) | ✅ DONE | 2026-03-03 | f2007b7 |
| 11-F | Dynamic Attributes (Database Analysis) | ✅ DONE | 2026-03-03 | — |
