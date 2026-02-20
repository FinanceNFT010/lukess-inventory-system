# Lukess Inventory System — Active Context
**Última actualización:** 20/02/2026 — Bloque 2a completado

## Bloque actual
**Bloque 2b** — Pedidos: Página lista + tabs + filtros

## Bloques completados ✅
- Bloque 0  — Setup .cursor/rules/, memory bank, commands
- Bloque 1a — Tablas profiles + access_requests, trigger handle_new_user, RLS
- Bloque 1b — Login 2 tabs: Iniciar Sesión + Solicitar Acceso
- Bloque 1c — Panel gestión usuarios + aprobación con contraseña temporal
- Bloque 1d-I  — Middleware protección rutas + sidebar dinámico por rol
- Bloque 1d-II — Permisos granulares UI + staff location assignment
- Bloque 1e-I   — Fix sale_items color/size nullable + stock deduction
- Bloque 1e-II  — Fix location_id en cart + nuevo usuario is_active
- Bloque 1e-III — Staff sin puesto: mensaje amigable + audit log mejorado
- Bloque 1e-IV-a — Historial solo cambios reales + modal advertencia stock
- Bloque 1e-IV  — Filtros POS mejorados + historial ventas mejorado +
                   location removido del sidebar
- Bloque 2a  — Orders schema (CASE B: columnas añadidas), RLS policies,
               8 órdenes demo, Order types en lib/types.ts

## Estado RBAC
- admin@lukesshome.com        → admin   → acceso total
- financenft01@gmail.com      → manager → Dashboard, Inventario, Ventas, Reportes
- wildforestadriver01@gmail.com → staff  → solo Ventas (su puesto)

## Reglas de negocio importantes
- Productos con ventas → solo desactivar, nunca eliminar
- Productos desactivados/eliminados → desaparecen de landing page
- Staff sin location_id → ve mensaje "Puesto no asignado" en Ventas
- Admin puede cambiar rol de cualquier usuario EXCEPTO a sí mismo
- Stock se descuenta por location_id del cart item al finalizar venta
- Tallas: S, M, L, XL (ropa superior) | 38, 40, 42, 44 (pantalones/shorts)
- sale_items.color y sale_items.size son nullable
- Audit log solo registra stocks que realmente cambiaron (diff !== 0)

## Bloques pendientes
2b  → Pedidos: Página lista + tabs + filtros
2c  → Pedidos: Modal detalle + cambio de estado
2d  → Pedidos: Realtime badge en sidebar
3a  → Landing Auth: Schema + modal registro/login
3b  → Landing Auth: Wishlist persistente Supabase
4a  → Checkout: login obligatorio al pagar
4b  → Mis Pedidos: /mis-pedidos
5   → Toggle published_to_landing
6a  → Emails Resend: setup + email cliente
6b  → Emails Resend: notificación admin + estados
7   → WhatsApp Business API
8   → Reportes ventas online vs físico
9   → GA4 + SEO + pulido final landing

## Notas técnicas
- Un solo Supabase para ambos proyectos (inventario + landing)
- MCP Supabase: activar SOLO en bloques con SQL
- MCP Vercel: activar SOLO si hay error de deploy
- Modelo: Claude Sonnet 4.6, Max Mode OFF por defecto
- Nuevo chat en Cursor por cada bloque
- Commits al final de cada bloque verificado
