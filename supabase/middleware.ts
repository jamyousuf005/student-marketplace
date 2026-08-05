import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // Define public/auth routes
  const isAuthPage = url.pathname.startsWith('/login') || url.pathname.startsWith('/signup')
  const isAuthCallback = url.pathname.startsWith('/auth')
  const isHomePage = url.pathname === '/'

  // If user is not authenticated and trying to access a protected route
  if (!user && !isAuthPage && !isAuthCallback && !isHomePage) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user IS authenticated and trying to access login/signup
  if (user && isAuthPage) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // RBAC checks for admin dashboard
  if (user && url.pathname.startsWith('/dashboard/admin')) {
    const role = user.user_metadata?.role || user.app_metadata?.role
    if (role && role !== 'admin') {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
