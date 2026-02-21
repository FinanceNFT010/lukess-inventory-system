'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { OrderStatus } from '@/lib/types'

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  internalNote?: string,
  fulfillmentNotes?: string
) {
  try {
    // Validar autenticación y permisos con el cliente de sesión
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

    // Usar service role para el UPDATE: evita problemas de RLS con cookies
    const { data: updated, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select('id')

    if (error) return { error: error.message }

    if (!updated || updated.length === 0) {
      return { error: 'Pedido no encontrado o no se pudo actualizar.' }
    }

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

    const { error } = await supabaseAdmin
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
