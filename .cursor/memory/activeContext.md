# Lukess Inventory System — Active Context

## Current Block
**Block 0** — Setup: migrar .cursorrules → .cursor/rules/ MDC

## Completed Blocks
(ninguno aún)

## Project URLs
- Inventory: https://lukess-inventory-system.vercel.app
- Landing: https://lukess-home.vercel.app
- Supabase: https://supabase.com/dashboard/project/lrcggpdgrqltqbxqnjgh

## Credentials Demo
- Email: admin@lukesshome.com
- Password: Admin123!

## Pending Blocks
1a → Roles: Schema BD + Trigger auth
1b → Roles: Login mejorado + Solicitar acceso  
1c → Roles: Panel gestión usuarios
1d → Roles: Middleware + sidebar por rol
2a → Pedidos: Schema + datos prueba
2b → Pedidos: Página lista + tabs
2c → Pedidos: Modal detalle + cambio estado
2d → Pedidos: Realtime + canal historial ventas
3a → Landing Auth: Schema + registro/login modal
3b → Landing Auth: Wishlist persistente Supabase
4a → Landing Checkout: Login obligatorio al pagar
4b → Landing Mis Pedidos: página /mis-pedidos
5  → Toggle published_to_landing
6a → Emails Resend: Setup + email cliente
6b → Emails Resend: Notificación admin + estados
7  → WhatsApp Business API
8  → Reportes ventas online vs físico
9  → GA4 + SEO + pulido final landing

## Known Issues
(ninguno)

## Important Notes
- Un solo proyecto Supabase para ambos repos
- MCP Supabase: activar SOLO en bloques con SQL (1a, 1c, 2a, 2c, 2d, 3a, 3b, 4b, 5, 6a, 8)
- MCP Vercel: activar SOLO si hay error de deploy
- Modelo: Claude Sonnet 4.6, Max Mode OFF por defecto
- Nuevo chat en Cursor por cada bloque — NUNCA acumular bloques




# Lukess Inventory System — Active Context
**Última actualización:** 19/02/2026 — 6:20 PM

## Bloque actual
**Bloque 2a** — Pedidos: Schema BD

## Bloques completados ✅
- Bloque 0 — Setup .cursor/rules/, memory bank, commands, .cursorignore
- Bloque 1a — Tablas profiles + access_requests, trigger handle_new_user, RLS
- Bloque 1b — Login 2 tabs: Iniciar Sesión + Solicitar Acceso
- Bloque 1c — Panel gestión usuarios + aprobación con contraseña temporal
- Bloque 1d-I — Middleware protección rutas + sidebar dinámico por rol
- Bloque 1d-II — Permisos granulares UI + campo puesto en staff (location_id)
- Bloque 1e — POS con selector de talla, fix historial ventas, fix duplicate key editar producto
- Bloque 1e-III — Staff sin location bloqueado en /ventas y /ventas/historial; audit log mejorado con stock changes estructurados, confirmación previa al guardar, y display con badge verde/rojo + banner warning

## Estado RBAC actual
- admin@lukesshome.com → admin → acceso total
- financenft01@gmail.com → manager → Dashboard, Inventario, Ventas, Reportes
- wildforestadriver01@gmail.com → staff → solo Ventas

## Bloques pendientes
2a    → Pedidos: Schema BD
2b    → Pedidos: Página lista
2c    → Pedidos: Modal detalle + estados
2d    → Pedidos: Realtime
3a    → Landing Auth: Schema + modal
3b    → Landing Auth: Wishlist Supabase
4a    → Checkout con auth
4b    → Mis Pedidos
5     → Toggle published_to_landing
6a    → Resend: email cliente
6b    → Resend: email admin
7     → WhatsApp Business API
8     → Reportes online vs físico
9     → GA4 + SEO + pulido landing

## Notas importantes
- Un solo Supabase para ambos proyectos
- MCP Supabase: activar SOLO en bloques con SQL
- MCP Vercel: activar SOLO si hay error de deploy
- Modelo: Claude Sonnet 4.6, Max Mode OFF por defecto
- Nuevo chat en Cursor por cada bloque
- Productos con ventas: solo desactivar, nunca eliminar
- Productos desactivados → desaparecen de landing page
