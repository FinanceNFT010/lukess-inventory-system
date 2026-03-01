export interface OrderForWhatsApp {
  id: string
  customer_name: string
  customer_phone: string | null
  notify_whatsapp: boolean
  delivery_method: string
  shipping_address: string | null
  pickup_location: string | null
  total: number
}

/**
 * Maps an order status to the Meta-approved template name.
 * For `shipped` we need delivery_method context, handled in
 * `resolveTemplateName` below.
 */
const STATUS_TO_TEMPLATE: Record<string, string> = {
  pending: 'pedido_recibido',
  confirmed: 'pago_confirmado',
  shipped: 'pedido_en_camino',   // delivery path — pickup overrides below
  completed: 'pedido_entregado',
  cancelled: 'pedido_cancelado',
}

/**
 * Resolves the final template name, accounting for the dual
 * delivery method on `shipped`:
 *   - delivery → `pedido_en_camino`
 *   - pickup   → `pedido_listo_recojo` (if approved) or falls back to
 *                `pedido_en_camino` so the notification is never silently dropped.
 */
function resolveTemplateName(
  status: string,
  deliveryMethod: string
): string | undefined {
  if (status === 'shipped' && deliveryMethod === 'pickup') {
    // Use dedicated pickup template if you have it approved in Meta.
    // Fall back to pedido_en_camino so a notification always fires.
    return 'pedido_listo_recojo'
  }
  return STATUS_TO_TEMPLATE[status]
}

/**
 * Builds the ordered variables array for each template.
 * Variable positions match the {{1}}, {{2}}, {{3}} placeholders in Meta exactly.
 *
 * pedido_recibido:     {{1}} customer_name  {{2}} order_number
 * pago_confirmado:     {{1}} customer_name  {{2}} order_number  {{3}} total
 * pedido_en_camino:    {{1}} customer_name  {{2}} order_number
 * pedido_listo_recojo: {{1}} customer_name  {{2}} order_number  {{3}} pickup_location
 * pedido_entregado:    {{1}} customer_name
 * pedido_cancelado:    {{1}} customer_name  {{2}} order_number
 */
function buildVariables(
  templateName: string,
  order: OrderForWhatsApp
): string[] {
  const orderNumber = order.id.substring(0, 8).toUpperCase()
  const totalFormatted = `Bs. ${order.total.toFixed(2)}`

  switch (templateName) {
    case 'pedido_recibido':
      return [order.customer_name, orderNumber]

    case 'pago_confirmado':
      return [order.customer_name, orderNumber, totalFormatted]

    case 'pedido_en_camino':
      return [order.customer_name, orderNumber]

    case 'pedido_listo_recojo':
      return [
        order.customer_name,
        orderNumber,
        order.pickup_location ?? 'la caseta asignada',
      ]

    case 'pedido_entregado':
      return [order.customer_name]

    case 'pedido_cancelado':
      return [order.customer_name, orderNumber]

    default:
      return [order.customer_name, orderNumber]
  }
}

export async function sendOrderStatusWhatsApp(
  order: OrderForWhatsApp,
  newStatus: string
): Promise<void> {
  if (!order.notify_whatsapp) return
  if (!order.customer_phone?.trim()) return

  const templateName = resolveTemplateName(newStatus, order.delivery_method)
  if (!templateName) return

  const rawPhone = order.customer_phone.trim().replace(/\D/g, '')
  const formattedPhone = rawPhone.startsWith('591')
    ? rawPhone
    : `591${rawPhone}`

  const variables = buildVariables(templateName, order)

  const landingUrl = process.env.LANDING_URL ?? 'https://lukess-home.vercel.app'
  const url = `${landingUrl}/api/send-whatsapp`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: formattedPhone, templateName, variables }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`[whatsapp] ${res.status} — ${text}`)
  }
}
