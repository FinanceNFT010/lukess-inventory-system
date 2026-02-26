# activeContext.md — lukess-inventory-system
_Última actualización: 22/02/2026 - 1:00 AM_

## Estado actual: PRODUCCIÓN ✅
URL: https://lukess-inventory-system.vercel.app
Stack: Next.js · Supabase · Tailwind · TypeScript · Resend · WhatsApp Cloud API · Recharts · date-fns

---

## ✅ Implementado y funcionando

### Gestión de pedidos (/pedidos)
- Lista con tabs por estado: pending / confirmed / shipped / completed / cancelled
- Filtros por nombre, fecha, método de pago
- 4 stats cards con totales
- Modal detalle con stepper visual del flujo de estados
- Cambio de estado con server actions (`updateOrderStatus`)
- Notas internas con auto-save
- Botón rápido "Confirmar" desde cards de pending
- Realtime badge en sidebar — toast "¡Nuevo pedido online!" al llegar pedido
- Modal de cancelación con motivo obligatorio

### Sistema de inventario
- Toggle `published_to_landing` por producto (Bloque 5)
- Stock sincronizado con 3 ubicaciones físicas
- `reserved_qty` — stock disponible real = quantity - reserved_qty
- Badge 🔒 X reservados en dashboard
- Modal de pedidos muestra de qué puesto viene cada reserva
- `isLowStock` usa stock disponible real

### Notificaciones automáticas (al cambiar estado del pedido)
- Email al cliente según estado — Resend ✅
- WhatsApp al cliente via plantillas Meta ⏳ (pendiente verificar)
  - confirmed → `pago_confirmado`
  - shipped → `pedido_en_camino`
  - completed → `pedido_entregado`
  - cancelled → `pedido_cancelado`

### Reportes (/reportes) — Bloque 8a + 8b ✅
**Filtros:** por fecha (esta semana / este mes / últimos 3 meses / personalizado) + por canal (online / físico / todos)

**6 KPI cards:**
- Ingresos totales, Pedidos totales, Ventas Online, Ventas Físico
- Ticket Promedio (AOV), Tasa de Cancelación (rojo si >20%)
- Línea "Último pedido: hace X · cliente · Bs XXX · canal"

**Gráficos:**
- BarChart apilado por día (azul=online, naranja=físico)
- Donut chart proporción online vs físico
- Horizontal BarChart ventas por categoría
- BarChart actividad por día de semana (barra máxima resaltada)

**Tablas y alertas:**
- Top 10 productos más vendidos (medallas dorado/plata/bronce)
- Tabla detalle por día con scroll (máx 30 filas)
- Alertas stock crítico con días estimados de agotamiento
- Dead stock — productos sin movimiento en 60 días

**Impacto de descuentos:**
- brutos = SUM(total), netos = SUM(subtotal), diferencia siempre positiva
- Mini BarChart 2 barras + % descuento promedio

**CSV Export:**
- Botón "⬇ Exportar CSV" — 100% client-side
- BOM UTF-8 para compatibilidad con Excel en español
- 3 secciones: resumen, detalle por día, top 10 productos
- Nombre: `reporte-lukess-[desde]-[hasta].csv`

---

## ⏳ Pendiente verificar mañana

### WhatsApp — prueba end-to-end
- Verificar que plantillas estén aprobadas en Meta
- Cambiar estado de un pedido de prueba
- Confirmar en Vercel logs que llega mensaje al cliente

---

## 🔜 Próximos bloques
Los bloques 9a-9d son principalmente de la landing page.
El inventario no tiene bloques pendientes definidos en el roadmap actual.

---

## 🗂️ Archivos clave

| Archivo | Propósito |
|---|---|
| `app/(dashboard)/pedidos/page.tsx` | Lista de pedidos con filtros |
| `app/(dashboard)/pedidos/actions.ts` | Server actions — cambio de estado |
| `app/(dashboard)/reportes/page.tsx` | Server Component — 6 queries paralelas |
| `app/(dashboard)/reportes/reports-client.tsx` | Client Component — todos los gráficos |
| `components/reportes/FiltrosReportes.tsx` | Filtros client-side con router.push |
| `lib/notifications.ts` | Emails por estado (Resend) |
| `lib/whatsapp.ts` | WhatsApp por estado (Cloud API) |
| `lib/supabase.ts` | Cliente Supabase |

---

## 🗄️ Esquema de tablas relevante

```sql
orders: id, customer_name, customer_phone, customer_email,
        subtotal, discount, total, status, canal,
        payment_method, payment_proof, notes,
        notify_whatsapp, created_at

order_items: id, order_id, product_id, quantity,
             unit_price, size, color, subtotal

products: id, sku, name, price, cost, stock,
          category_id, is_active, published_to_landing,
          discount, is_featured, is_new, created_at

inventory: id, product_id, location_id, quantity,
           min_stock, max_stock, updated_at

inventory_reservations: id, order_id, product_id,
                        location_id, quantity, status,
                        reserved_at, released_at

categories: id, name
locations: id, name, address
