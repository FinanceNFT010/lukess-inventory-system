import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Route permissions: which roles can access each route
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/configuracion/usuarios': ['admin'],
  '/configuracion': ['admin', 'manager'],
  '/reportes': ['admin', 'manager'],
  '/inventario/nuevo': ['admin', 'manager'],
  '/inventario': ['admin', 'manager', 'staff'],
  '/ventas': ['admin', 'manager', 'staff'],
  '/': ['admin', 'manager', 'staff'],
}

// Public routes that never require auth
const PUBLIC_ROUTES = ['/login']

function getRequiredRoles(pathname: string): string[] | null {
  // Check exact and prefix matches, most specific first
  const sortedRoutes = Object.keys(ROUTE_PERMISSIONS).sort(
    (a, b) => b.length - a.length
  )
  for (const route of sortedRoutes) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return ROUTE_PERMISSIONS[route]
    }
  }
  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get session
  const { data: { user } } = await supabase.auth.getUser()

  // Not authenticated → redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Get user role from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  // No profile or inactive → redirect to login
  if (!profile || !profile.is_active) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('reason', 'account_disabled')
    const redirectResponse = NextResponse.redirect(loginUrl)
    // Clear auth cookies
    request.cookies.getAll().forEach(cookie => {
      if (cookie.name.includes('auth') || cookie.name.includes('supabase')) {
        redirectResponse.cookies.delete(cookie.name)
      }
    })
    return redirectResponse
  }

  // Check route permissions
  const requiredRoles = getRequiredRoles(pathname)
  if (requiredRoles && !requiredRoles.includes(profile.role)) {
    // Redirect to highest accessible route for this role
    const fallback = profile.role === 'staff' ? '/ventas' : '/'
    return NextResponse.redirect(new URL(fallback, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
