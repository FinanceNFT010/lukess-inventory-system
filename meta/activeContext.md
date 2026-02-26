# activeContext.md — lukess-inventory-system (Admin Dashboard)
**Last Updated:** 2026-02-26
**Updated By:** Manual (initial setup)

---

## CURRENT BLOCK
- **Block Number:** 9c-A
- **Block Name:** Inventario: BD + formulario de producto (descuentos + is_new)
- **Status:** PENDING
- **Started:** —

---

## LAST COMPLETED BLOCK
- **Block Number:** 5
- **Block Name:** Toggle published_to_landing por producto
- **Completed:** ~2026-02-22
- **Commit:** (verify via GitHub MCP list_commits)

---

## FILES CHANGED THIS SESSION
_(none yet — updated by agent on block completion)_

---

## DATABASE STATE
- **Supabase Project:** lrcggpdgrqltqbxqnjgh (ACTIVE_HEALTHY, sa-east-1, PostgreSQL 17.6)
- **Total Tables:** 17 (as of 2026-02-26 per MCP audit)
- **Last Known Migration:** ~2026-02-21 (verify with `list_migrations`)
- **Types Regenerated:** UNKNOWN — run `generate_typescript_types` at start of next DB block
- **Pending Migrations (REQUIRED before 9c-A):**
  - `add_discount_and_new_fields_to_products`: ADD COLUMN `discount_expires_at timestamptz`, ADD COLUMN `is_new_until timestamptz`
  - `create_discount_codes_table`: new table with code, discount_type (enum: percent/fixed), amount, min_order, max_uses, used_count, expires_at, is_active, created_at

---

## OPEN ISSUES
- [ ] SECURITY: 10 functions with mutable search_path (flagged by get_advisors): log_inventory_transaction, reserve_order_inventory, handle_order_status_change, cancel_expired_orders, apply_order_allocation, handle_new_user, update_updated_at_column, get_user_org_id, get_user_role, get_user_location_id
- [ ] SECURITY: Overly permissive RLS on: access_requests (INSERT), customers (INSERT/UPDATE), inventory_reservations (ALL), order_items (INSERT), orders (INSERT/UPDATE), subscribers (INSERT)
- [ ] SECURITY: Leaked Password Protection disabled in Supabase Auth
- [ ] UI: `products.discount` field exists in DB but NOT in product form (nuevo/edición)
- [ ] UI: `products.images[]` field exists in DB but form only handles `image_url` (single image)
- [ ] UI: `products.is_new` exists in DB but no toggle in form
- [ ] UI: `products.is_featured` exists in DB but no toggle in form
- [ ] TODO: No subscriber management module in sidebar (table `subscribers` exists but no UI)
- [ ] TODO: WhatsApp templates (pago_confirmado, pedido_en_camino, pedido_entregado, pedido_cancelado) must be approved in Meta Business for notifications to work

---

## NEXT BLOCK
- **Block:** 9c-A
- **Name:** Inventario: BD + formulario de producto
- **Dependencies:** None — this is the starting block
- **Scope:** Migration for discount_expires_at + is_new_until + create discount_codes table + UI in product form for discount %, expiry date, is_new toggle, is_new_until, is_featured toggle + preview precio tachado/final

---

## BLOCK HISTORY
| Block | Name | Status | Date | Commit |
|---|---|---|---|---|
| 1a | Roles — Schema BD + Trigger auth | ✅ DONE | 2026-02-17 | — |
| 1b | Roles — Login mejorado + Solicitar acceso | ✅ DONE | 2026-02-17 | — |
| 1c | Roles — Panel gestión usuarios | ✅ DONE | 2026-02-17 | — |
| 1d | Roles — Middleware protección de rutas + sidebar por rol | ✅ DONE | 2026-02-17 | — |
| 2a | Pedidos — Schema + datos prueba | ✅ DONE | 2026-02-18 | — |
| 2b | Pedidos — Página lista + tabs + filtros | ✅ DONE | 2026-02-19 | — |
| 2c | Pedidos — Modal detalle + cambio estado + venta | ✅ DONE | 2026-02-19 | — |
| 2d | Pedidos — Realtime badge + canal historial | ✅ DONE | 2026-02-20 | — |
| 3a | Auth compradores — Schema + registro/login modal | ✅ DONE | 2026-02-20 | — |
| 3b | Auth compradores — Wishlist persistente | ✅ DONE | 2026-02-20 | — |
| 4a | Checkout auth — Login obligatorio al pagar | ✅ DONE | 2026-02-21 | — |
| 4b | Mis Pedidos — /mis-pedidos funcional | ✅ DONE | 2026-02-21 | — |
| 5 | Toggle published_to_landing | ✅ DONE | ~2026-02-22 | — |
| 6a | Resend: setup + email confirmación | ✅ DONE | ~2026-02-22 | — |
| 6b | Resend: email notificación admin + estados | ✅ DONE | ~2026-02-22 | — |
| 8a | Reportes: ventas online vs físico + gráficos | ✅ DONE | ~2026-02-22 | — |
| 8b | Reportes: exportar CSV + métricas avanzadas | ✅ DONE | ~2026-02-22 | — |
| 9c-A | Inventario: BD + formulario descuentos/is_new | ⬜ PENDING | — | — |
| 9c-B | Inventario: Upload múltiples imágenes | ⬜ PENDING | — | — |
