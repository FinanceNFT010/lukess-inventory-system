# Lukess Inventory System — Active Context
**Última actualización:** 21/02/2026 03:00 AM — Bloque 3e completo ✅


## Bloque actual
**Bloque 4a** — Checkout auth: login obligatorio al pagar (proyecto: prueba)


## Bloques completados ✅
- Bloque 0      — Setup .cursor/rules/, memory bank, commands
- Bloque 1a     — Tablas profiles + access_requests, trigger handle_new_user, RLS
- Bloque 1b     — Login 2 tabs: Iniciar Sesión + Solicitar Acceso
- Bloque 1c     — Panel gestión usuarios + aprobación con contraseña temporal
- Bloque 1d-I   — Middleware protección rutas + sidebar dinámico por rol
- Bloque 1d-II  — Permisos granulares UI + staff location assignment
- Bloque 1e-I   — Fix sale_items color/size nullable + stock deduction
- Bloque 1e-II  — Fix location_id en cart + nuevo usuario is_active
- Bloque 1e-III — Staff sin puesto: mensaje amigable + audit log mejorado
- Bloque 1e-IV-a — Historial solo cambios reales + modal advertencia stock
- Bloque 1e-IV  — Filtros POS mejorados + historial ventas mejorado +
                   location removido del sidebar
- Bloque 2a     — Orders schema (CASE B: columnas añadidas), RLS policies,
                  8 órdenes demo, Order types en lib/types.ts
- Bloque 2b     — Página /pedidos: lista con tabs por estado, filtros
                  (búsqueda/fecha/pago), 4 stats cards, order cards con
                  border coloreado por estado, badge en sidebar
- Bloque 2c     — Modal detalle pedido + flujo estados (stepper visual +
                  dropdown), server actions updateOrderStatus/saveInternalNote,
                  notas internas con auto-save, botón rápido "Confirmar" en cards
- Bloque 2d     — Realtime badge sidebar: usePendingOrders hook +
                  PendingOrdersBadge, toast "¡Nuevo pedido online!" via
                  CustomEvent, suscripción Realtime INSERT en pedidos
- Bloque 3e-A   — Sistema de reservas de inventario completo:
                  · inventory.reserved_qty: stock reservado por ubicación
                  · inventory_reservations: tabla con status
                    reserved → confirmed → completed / released
                  · RPC reserve_order_inventory: prioridad
                    Puesto 1 → Puesto 2 → Puesto 3 → Bodega Central
                  · pending  → reserved_qty sube (soft reserve)
                  · confirmed → reserva se confirma (hard hold)
                  · completed → quantity baja + historial ventas registrado
                  · cancelled → reserved_qty se libera automáticamente
                  · Dashboard muestra disponible = quantity - reserved_qty
                  · Badge "🔒 X reservados" si hay reservas activas
                  · Modal pedidos muestra de qué puesto viene el stock
- Bloque 3e-B   — Landing per-size stock:
                  · getStockBySize() agrupa inventory por talla
                  · Tallas agotadas: disabled + tachado + "Agotado"
                  · Tallas con 1-3 stock: "⚠️ Últimas X"
                  · Cantidad máxima = stock de talla seleccionada
                  · Cambiar talla resetea cantidad a 1
                  · Botón inteligente por estado de talla


## Estado RBAC
- admin@lukesshome.com          → admin   → acceso total
- financenft01@gmail.com        → manager → Dashboard, Inventario, Ventas, Reportes
- wildforestadriver01@gmail.com → staff   → solo Ventas (su puesto asignado)


## Reglas de negocio importantes
- Productos con ventas → solo desactivar, nunca eliminar
- Productos desactivados → desaparecen de landing automáticamente
- Staff sin location_id → ve mensaje "Puesto no asignado" en Ventas
- Admin puede cambiar rol de cualquier usuario EXCEPTO a sí mismo
- Stock se descuenta por location_id del cart item al finalizar venta POS
- Tallas ropa superior: S, M, L, XL
- Tallas pantalones/shorts: 38, 40, 42, 44
- sale_items.color y sale_items.size son nullable
- Audit log solo registra stocks que realmente cambiaron (diff !== 0)
- inventory: una fila por product + location + size
- sales.canal: 'fisico' (POS) | 'online' (pedido completado)
- orders.canal: 'online' por defecto (landing)
- Prioridad reservas: Puesto 1 → Puesto 2 → Puesto 3 → Bodega Central
- Si Puesto 1 cubre todo el pedido → solo se descuenta de Puesto 1
- Si no alcanza → se distribuye en cascada al siguiente puesto


## ⚠️ Lecciones críticas aprendidas (20/02/2026)
- SIEMPRE verificar que Cursor tiene abierto el proyecto correcto antes
  de cualquier prompt. Preguntar: "¿Cuál es la carpeta raíz?"
  Landing = c:\LukessHome\pagina web\prueba
  Dashboard = c:\LukessHome\lukess-inventory-system
- Bugs de inventario/reservas → ir PRIMERO a SQL Editor de Supabase
  antes de tocar código. Confirmar que el dato está bien en DB.
- Después de cada git push → esperar deploy Vercel (~2 min) y hacer
  prueba real antes de concluir que algo funciona o no
- Si Cursor empieza a decir que archivos no existen → está en el
  proyecto equivocado. Cerrar y abrir la carpeta correcta.
- Nuevo chat en Cursor por cada bloque SIN EXCEPCIONES


## Bloques pendientes
4a  → Checkout: login obligatorio al pagar (landing)
4b  → Mis Pedidos: /mis-pedidos funcional (landing)
5   → Toggle published_to_landing (dashboard + landing)
6a  → Emails Resend: setup + email confirmación al cliente
6b  → Emails Resend: notificación admin + cambios de estado
7   → WhatsApp Business API: notificaciones pedidos
8   → Reportes: ventas online vs físico comparativo
9   → GA4 + SEO dinámico + pulido final landing


## Notas técnicas
- Un solo Supabase para ambos proyectos (inventario + landing)
- MCP Supabase: activar SOLO en bloques con SQL o verificación DB
- MCP Vercel: activar SOLO si hay error de deploy
- Modelo default: Claude Sonnet 4.6, Max Mode OFF
- Max Mode ON solo si: muchos archivos + lógica compleja + DB juntos
- Nuevo chat en Cursor por cada bloque
- Commits al final de cada bloque verificado y testeado
