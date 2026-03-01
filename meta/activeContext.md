# activeContext.md — lukess-inventory-system (Admin Dashboard)
**Last Updated:** 2026-02-28
**Updated By:** Antigravity Agent

---

## CURRENT BLOCK
- **Block Number:** 13-D
- **Block Name:** End-to-End Discount Consumption & Visibility - UI Updates
- **Status:** DONE
- **Started:** 2026-03-01
- **Completed:** 2026-03-01

---

## LAST COMPLETED BLOCK
- **Block Number:** 13-D
- **Block Name:** End-to-End Discount Consumption & Visibility - UI Updates
- **Completed:** 2026-03-01
- **Commit:** ff8e0e2

---

- `app/(dashboard)/pedidos/pedidos-client.tsx` (MODIFIED - display discount_amount badge)
- `app/(dashboard)/pedidos/order-detail-modal.tsx` (MODIFIED - display discount_amount row)
- `app/(dashboard)/ventas/historial/sales-history-client.tsx` (MODIFIED - added Subtotal and Dto. columns)
- `app/(dashboard)/reportes/reports-client.tsx` (MODIFIED - revenue calculations with discount_amount, new KPI Total Descontado, chart tooltips)
- Previously in 13-C: `lib/types.ts`, `types/database.types.ts`, and Database RPC `consume_order_discount`.

---

## DATABASE STATE
- **Supabase Project:** lrcggpdgrqltqbxqnjgh (ACTIVE_HEALTHY, sa-east-1, PostgreSQL 17.6)
- **Total Tables:** 19+ 
- **Migrations Applied (14):** Created `banners` bucket policies, added `max_uses`, `usage_count` columns to `discount_codes`. Re-applied CREATE TABLE and RLS policies for `banners` and `discount_codes` via MCP (`marketing_rls_fixes`). Applied `marketing_schema_nullability_and_rls` to fix NOT NULL columns and RLS rules for discounts & banners. Fixed `discount_type` missing in insert payload. Applied `update_inventory_allocation_priority` for P1->P2->P3->Bodega cascading logic.
- **Types Regenerated:** Yes (Generated locally via Supabase MCP `generate_typescript_types`).

---

## OPEN ISSUES
- [ ] SECURITY: 10 functions with mutable search_path (flagged by get_advisors): log_inventory_transaction, reserve_order_inventory, handle_order_status_change, cancel_expired_orders, apply_order_allocation, handle_new_user, update_updated_at_column, get_user_org_id, get_user_role, get_user_location_id
- [ ] SECURITY: Overly permissive RLS on: access_requests (INSERT), customers (INSERT/UPDATE), inventory_reservations (ALL), order_items (INSERT), orders (INSERT/UPDATE), subscribers (INSERT)
- [ ] SECURITY: Leaked Password Protection disabled in Supabase Auth
- [ ] TODO: No subscriber management module in sidebar (table `subscribers` exists but no UI)
- [ ] TODO: WhatsApp templates (pago_confirmado, pedido_en_camino, pedido_entregado, pedido_cancelado) must be approved in Meta Business for notifications to work
- [ ] TODO: is_featured sorting on landing page (lukess-home repo) — not implemented yet
- [ ] TODO: User must push the `marketing_schema.sql` migration to Supabase and regenerate typescript types (From Block 12, though types were regenerated this sprint).

---

## NEXT BLOCK
- **Block:** 14
- **Name:** TBD
- **Dependencies:** 13 complete ✅
- **Scope:** TBD

---

## BLOCK HISTORY
| Block | Name | Status | Date | Commit |
|---|---|---|---|---|
| 1to8 | Fundamentals (Roles to Reports) | ✅ DONE | Feb 2026 | — |
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
