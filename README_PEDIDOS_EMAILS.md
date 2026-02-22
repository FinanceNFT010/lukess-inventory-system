# Sistema de Inventario — Pedidos, estados y emails

## 1. Estados de pedidos

Tabla `orders.status` usa los siguientes valores:

- `pending`    → pedido creado desde la landing, sin reserva
- `reserved`   → cliente marcó "Ya Pagué" (stock reservado)
- `confirmed`  → admin confirmó que el pago llegó
- `shipped`    → admin marcó "En camino"
- `completed`  → admin marcó "Entregado" (stock descontado)
- `cancelled`  → admin canceló pedido (stock liberado)

El disparador (`trigger`) en Supabase (`handle_order_status_change`) se encarga de:

- Crear/actualizar filas en `inventory_reservations`.
- Descontar `inventory.quantity` al pasar a `completed`.
- Liberar reservas al pasar a `cancelled`.

---

## 2. Cambios de estado desde el dashboard

Archivo clave:

- `app/(dashboard)/pedidos/actions.ts`

### Server Action: `updateOrderStatus(...)`

Responsabilidades:

1. `UPDATE orders` en Supabase con:
   - `status = newStatus`
   - si `newStatus === 'cancelled'` y hay `cancellationReason`:
     - también `notes = cancellationReason`

2. Hacer `SELECT` del pedido completo para armar email:
   - JOIN con `order_items`
   - JOIN con `products(name)` para obtener nombre de producto

3. Llamar a `sendOrderStatusEmail(order, newStatus)` de `lib/notifications.ts`.

> Si la llamada al email falla, **el pedido igual se actualiza**  
> (el catch loggea el error pero no rompe el flujo).

---

## 3. Emails automáticos de estado

Archivo clave:

- `lib/notifications.ts`

### Función: `sendOrderStatusEmail(order, newStatus)`

- Solo se ejecuta si:
  - `order.notify_email === true`
  - `order.customer_email` no está vacío

- Mapeo estado → tipo de email (landing):

```ts
const STATUS_TO_EMAIL_TYPE = {
  confirmed: 'order_paid',
  shipped: 'order_shipped',
  completed: 'order_completed',
  cancelled: 'order_cancelled',
}
Construye orderData y hace:

ts
await fetch(`${LANDING_URL}/api/send-email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: emailType, orderData }),
})
Donde LANDING_URL viene de .env.local:

text
LANDING_URL=https://lukess-home.vercel.app
Importante: configurar también esa env variable en Vercel
para el proyecto lukess-inventory-system.

Logs de debug
notifications.ts tiene logs útiles:

Al inicio:

console.log('[email] llamado', { status, email, notify, emailType })

Antes del fetch:

console.log('[email] fetch →', landingUrl)

Después del fetch:

loggea si !res.ok e imprime error body: ...

Para debug, revisar los logs de Vercel de este proyecto.

4. Modal de cancelación con motivo
Archivo:

components/orders/CancelOrderModal.tsx
(o ruta equivalente según la implementación final)

Flujo:

Admin hace click en “Cancelar pedido”.

Se abre modal con 6 motivos predefinidos y opción “Otro motivo” con textarea.

Al confirmar, se llama:

updateOrderStatus(orderId, 'cancelled', ..., cancellationReason)

El motivo se guarda en orders.notes y se envía en orderData.cancellationReason a la landing.

El email order_cancelled debe mostrar este motivo (pendiente de completar en el template de la landing).

5. Debug rápido recomendado
Para ver estados / reservas:

sql
SELECT o.id, o.customer_name, o.status,
       ir.status AS reserva_status, ir.quantity
FROM orders o
LEFT JOIN inventory_reservations ir ON ir.order_id = o.id
ORDER BY o.created_at DESC
LIMIT 5;
Para ver preferencias de notificación del cliente:

sql
SELECT id, customer_name, customer_email,
       notify_email, notify_whatsapp, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;
Para errores de email:

Revisar Vercel → proyecto lukess-inventory-system → Logs.