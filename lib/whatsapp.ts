export interface OrderForWhatsApp {
  id: string
  customer_name: string
  customer_phone: string | null
  notify_whatsapp: boolean
  delivery_method: string
  shipping_address: string | null
  pickup_location: string | null
  total: number
  cancellation_reason?: string | null
}

/**
 * Approved Meta template → body variable positions:
 *
 * pedido_recibido:  "Hola {{1}}, recibimos tu pedido #{{2}} por Bs {{3}}."
 *                   {{1}}=name  {{2}}=order  {{3}}=total
 *
 * pago_confirmado:  "Pago confirmado para el pedido #{{1}}, {{2}}."
 *                   {{1}}=order  {{2}}=name
 *
 * pedido_en_camino: "Tu pedido #{{1}} fue despachado, {{2}}. Dirección de entrega: {{3}}"
 *                   {{1}}=order  {{2}}=name  {{3}}=address
 *
 * pedido_entregado: "Tu pedido #{{1}} fue entregado, {{2}}!"  +  HEADER IMAGE
 *                   {{1}}=order  {{2}}=name
 *
 * pedido_cancelado: "Tu pedido #{{1}} fue cancelado, {{2}}. Motivo: {{3}}"
 *                   {{1}}=order  {{2}}=name  {{3}}=reason
 */

const STATUS_TO_TEMPLATE: Record<string, string> = {
  pending: 'pedido_recibido',
  confirmed: 'pago_confirmado',
  shipped: 'pedido_en_camino',
  completed: 'pedido_entregado',
  cancelled: 'pedido_cancelado',
}

/** URL for the header image on the `pedido_entregado` template */
const ENTREGADO_HEADER_IMAGE =
  'https://lukess-home.vercel.app/images/entregado.png'

function resolveTemplateName(
  status: string,
  deliveryMethod: string
): string | undefined {
  if (status === 'shipped' && deliveryMethod === 'pickup') {
    return 'pedido_listo_recojo'
  }
  return STATUS_TO_TEMPLATE[status]
}

/**
 * Returns body variables in the exact {{1}}, {{2}}, {{3}} order
 * as approved in Meta Business Manager.
 */
function buildBodyVariables(
  templateName: string,
  order: OrderForWhatsApp
): string[] {
  const orderNumber = order.id.substring(0, 8).toUpperCase()

  switch (templateName) {
    case 'pedido_recibido':
      return [
        order.customer_name,
        orderNumber,
        `${order.total.toFixed(2)}`,
      ]

    case 'pago_confirmado':
      return [orderNumber, order.customer_name]

    case 'pedido_en_camino':
      return [
        orderNumber,
        order.customer_name,
        order.shipping_address ?? 'Tu dirección',
      ]

    case 'pedido_listo_recojo':
      return [
        orderNumber,
        order.customer_name,
        order.pickup_location ?? 'la caseta asignada',
      ]

    case 'pedido_entregado':
      return [orderNumber, order.customer_name]

    case 'pedido_cancelado':
      return [
        orderNumber,
        order.customer_name,
        order.cancellation_reason ?? 'Problemas con el stock o pago',
      ]

    default:
      return [orderNumber, order.customer_name]
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

  const variables = buildBodyVariables(templateName, order)

  // `pedido_entregado` has an approved HEADER image component
  const headerImage =
    templateName === 'pedido_entregado' ? ENTREGADO_HEADER_IMAGE : undefined

  const landingUrl = process.env.LANDING_URL ?? 'https://lukess-home.vercel.app'
  const url = `${landingUrl}/api/send-whatsapp`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: formattedPhone, templateName, variables, headerImage }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`[whatsapp] ${res.status} — ${text}`)
  }
}
