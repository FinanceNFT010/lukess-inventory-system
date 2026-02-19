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
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return null

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) return null
    return profile
  } catch {
    return null
  }
}

export async function requireAuth() {
  const profile = await getCurrentUserProfile()
  if (!profile) throw new Error('Not authenticated')
  if (!profile.is_active) throw new Error('Account disabled')
  return profile
}

export async function getDefaultOrgId(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
      .maybeSingle()
    return data?.id ?? null
  } catch {
    return null
  }
}
