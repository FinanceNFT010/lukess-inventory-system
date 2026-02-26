# activeContext.md — lukess-inventory-system (Admin Dashboard)
**Last Updated:** 2026-02-27
**Updated By:** Antigravity Agent

---

## CURRENT BLOCK
- **Block Number:** —
- **Block Name:** —
- **Status:** PENDING
- **Started:** —

---

## LAST COMPLETED BLOCK
- **Block Number:** 9c-B
- **Block Name:** Inventario: Upload múltiples imágenes
- **Completed:** 2026-02-27
- **Commit:** pending...

---

## FILES CHANGED THIS SESSION (Block 9c-B)
- `components/inventory/ImageUploader.tsx` — [NEW] Client component for drag & drop multi-image upload with Supabase Storage integration limit checking
- `app/(dashboard)/inventario/[id]/edit-product-form.tsx` — [MODIFY] Replaced single `image_url` text input with `ImageUploader` component, updated form state (`productImages`) and Supabase `performSave` API call to handle `images` array properly.

---

## DATABASE STATE
- **Supabase Project:** lrcggpdgrqltqbxqnjgh (ACTIVE_HEALTHY, sa-east-1, PostgreSQL 17.6)
- **Total Tables:** 18+
- **Migrations Applied (9c-B):** None (Schema already supported `images` array field).
- **Types Regenerated:** N/A

---

## OPEN ISSUES
- [ ] SECURITY: 10 functions with mutable search_path (flagged by get_advisors): log_inventory_transaction, reserve_order_inventory, handle_order_status_change, cancel_expired_orders, apply_order_allocation, handle_new_user, update_updated_at_column, get_user_org_id, get_user_role, get_user_location_id
- [ ] SECURITY: Overly permissive RLS on: access_requests (INSERT), customers (INSERT/UPDATE), inventory_reservations (ALL), order_items (INSERT), orders (INSERT/UPDATE), subscribers (INSERT)
- [ ] SECURITY: Leaked Password Protection disabled in Supabase Auth
- [ ] UI: `products.discount` field exists in DB but NOT in product form (nuevo)
- [ ] UI: `products.is_new` exists in DB but no toggle in form (nuevo)
- [ ] UI: `products.is_featured` exists in DB but no toggle in form (nuevo/edicion)
- [ ] TODO: No subscriber management module in sidebar (table `subscribers` exists but no UI)
- [ ] TODO: WhatsApp templates (pago_confirmado, pedido_en_camino, pedido_entregado, pedido_cancelado) must be approved in Meta Business for notifications to work

---

## NEXT BLOCK
- **Block:** TBD
- **Name:** TBD
- **Dependencies:** 9c-B complete ✅
- **Scope:** Defines next goal with Adrian.

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
| 9c-A | Inventario: BD + formulario descuentos/is_new | ✅ DONE | 2026-02-27 | 4001f88 |
| 9c-B | Inventario: Upload múltiples imágenes | ✅ DONE | 2026-02-27 | pending |
