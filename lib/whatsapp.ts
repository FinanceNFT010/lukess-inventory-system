export interface OrderForWhatsApp {
  id: string
  customer_name: string
  customer_phone: string | null
  notify_whatsapp: boolean
  shipping_address: string | null
  delivery_method: string
}

const STATUS_TO_TEMPLATE: Record<string, string> = {
  confirmed: 'pago_confirmado',
  shipped: 'pedido_en_camino',
  completed: 'pedido_entregado',
  cancelled: 'pedido_cancelado',
}

function buildVariables(
  templateName: string,
  orderId: string,
  order: OrderForWhatsApp,
  cancellationReason?: string
): string[] {
  const shortId = orderId.substring(0, 8).toUpperCase()

  switch (templateName) {
    case 'pago_confirmado':
      return [shortId, order.customer_name]

    case 'pedido_en_camino':
      return [
        shortId,
        order.customer_name,
        order.shipping_address ?? 'Recojo en tienda',
      ]

    case 'pedido_entregado':
      return [shortId, order.customer_name]

    case 'pedido_cancelado':
      return [
        shortId,
        order.customer_name,
        cancellationReason ?? 'Sin especificar',
      ]

    default:
      return [shortId, order.customer_name]
  }
}

export async function sendOrderStatusWhatsApp(
  order: OrderForWhatsApp,
  newStatus: string,
  cancellationReason?: string
): Promise<void> {
  const templateName = STATUS_TO_TEMPLATE[newStatus]

  console.log('[whatsapp] llamado', {
    status: newStatus,
    phone: order.customer_phone,
    notify: order.notify_whatsapp,
    templateName: templateName ?? 'sin mapeo — no se envía',
  })

  if (!order.notify_whatsapp) return
  if (!order.customer_phone?.trim()) return
  if (!templateName) return

  const rawPhone = order.customer_phone.trim().replace(/\D/g, '')
  const formattedPhone = rawPhone.startsWith('591')
    ? rawPhone
    : `591${rawPhone}`

  const variables = buildVariables(templateName, order.id, order, cancellationReason)

  const landingUrl = process.env.LANDING_URL ?? 'https://lukess-home.vercel.app'
  const url = `${landingUrl}/api/send-whatsapp`

  try {
    console.log('[whatsapp] fetch →', url)

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: formattedPhone,
        templateName,
        variables,
      }),
    })

    console.log('[whatsapp] response', { ok: res.ok, status: res.status })

    if (!res.ok) {
      const text = await res.text()
      console.error('[whatsapp] error body:', text)
    }
  } catch (err) {
    console.error('[sendOrderStatusWhatsApp] Error enviando notificación de WhatsApp:', err)
  }
}
