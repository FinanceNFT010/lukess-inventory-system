'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { OrderStatus } from '@/lib/types'

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  internalNote?: string,
  fulfillmentNotes?: string
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    if (!profile?.is_active || profile.role === 'staff') {
      return { error: 'Sin permisos para cambiar estado de pedidos' }
    }

    const updateData: Record<string, unknown> = {
      status: newStatus,
      managed_by: user.id,
      updated_at: new Date().toISOString(),
    }

    if (internalNote?.trim()) {
      updateData.internal_notes = internalNote.trim()
    }

    if (fulfillmentNotes?.trim()) {
      updateData.fulfillment_notes = fulfillmentNotes.trim()
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) return { error: error.message }

    revalidatePath('/pedidos')
    return { success: true }
  } catch (err) {
    console.error('updateOrderStatus error:', err)
    return { error: 'Error interno del servidor' }
  }
}

export async function saveInternalNote(orderId: string, note: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    if (!profile?.is_active || profile.role === 'staff') {
      return { error: 'Sin permisos' }
    }

    const { error } = await supabase
      .from('orders')
      .update({ internal_notes: note.trim() || null, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) return { error: error.message }

    revalidatePath('/pedidos')
    return { success: true }
  } catch (err) {
    console.error('saveInternalNote error:', err)
    return { error: 'Error interno del servidor' }
  }
}
