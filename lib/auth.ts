import { createClient } from '@/lib/supabase/server'

export type UserRole = 'admin' | 'manager' | 'staff'

export const PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['dashboard', 'inventario', 'ventas', 'reportes', 'configuracion', 'usuarios', 'pedidos'],
  manager: ['dashboard', 'inventario', 'ventas', 'reportes', 'pedidos'],
  staff: ['dashboard', 'ventas'],
}

export function canAccess(role: UserRole, section: string): boolean {
  return PERMISSIONS[role]?.includes(section) ?? false
}

export async function getCurrentUserProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function requireAuth() {
  const profile = await getCurrentUserProfile()
  if (!profile) throw new Error('Not authenticated')
  if (!profile.is_active) throw new Error('Account disabled')
  return profile
}
