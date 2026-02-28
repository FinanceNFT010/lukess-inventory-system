# activeContext.md — lukess-inventory-system (Admin Dashboard)
**Last Updated:** 2026-02-27
**Updated By:** Antigravity Agent

---

## CURRENT BLOCK
- **Block Number:** 11-E
- **Block Name:** POS Rebrand and Order Allocation Bug Fix
- **Status:** DONE
- **Started:** 2026-02-28

---

## LAST COMPLETED BLOCK
- **Block Number:** 11-E
- **Block Name:** POS Rebrand and Order Allocation Bug Fix
- **Completed:** 2026-02-28
- **Commit:** TBD

---

## FILES CHANGED THIS SESSION (Block 11-E)
- `app/(dashboard)/ventas/pos-client.tsx`
- `app/(dashboard)/pedidos/pedidos-client.tsx`
- `app/layout.tsx`

---

## DATABASE STATE
- **Supabase Project:** lrcggpdgrqltqbxqnjgh (ACTIVE_HEALTHY, sa-east-1, PostgreSQL 17.6)
- **Total Tables:** 18+
- **Migrations Applied (11-E):** None
- **Types Regenerated:** No (no DB changes)

---

## OPEN ISSUES
- [ ] SECURITY: 10 functions with mutable search_path (flagged by get_advisors): log_inventory_transaction, reserve_order_inventory, handle_order_status_change, cancel_expired_orders, apply_order_allocation, handle_new_user, update_updated_at_column, get_user_org_id, get_user_role, get_user_location_id
- [ ] SECURITY: Overly permissive RLS on: access_requests (INSERT), customers (INSERT/UPDATE), inventory_reservations (ALL), order_items (INSERT), orders (INSERT/UPDATE), subscribers (INSERT)
- [ ] SECURITY: Leaked Password Protection disabled in Supabase Auth
- [ ] TODO: No subscriber management module in sidebar (table `subscribers` exists but no UI)
- [ ] TODO: WhatsApp templates (pago_confirmado, pedido_en_camino, pedido_entregado, pedido_cancelado) must be approved in Meta Business for notifications to work
- [ ] TODO: is_featured sorting on landing page (lukess-home repo) — not implemented yet

---

## NEXT BLOCK
- **Block:** 11-F
- **Name:** TBD
- **Dependencies:** 11-E complete ✅
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
| 11-C | Dashboard + Inventario Redesign | ✅ DONE | 2026-02-28 | TBD |
| 11-D | Orders + Reports Plugins (Monochrome Branding Updates) | ✅ DONE | 2026-02-28 | TBD |
| 11-E | POS Rebrand and Order Allocation Bug Fix | ✅ DONE | 2026-02-28 | TBD |
