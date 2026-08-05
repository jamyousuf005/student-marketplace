import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { db } from '@/lib/db'
import { users, studentProfiles, enterpriseProfiles } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'

  const redirectTarget = isLocalEnv
    ? `${origin}${next}`
    : forwardedHost
    ? `https://${forwardedHost}${next}`
    : `${origin}${next}`

  if (code) {
    const cookieStore = await cookies()
    let response = NextResponse.redirect(redirectTarget)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const user = data.user

      try {
        // Check if user exists in database
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, user.id)
        })

        if (!dbUser) {
          const selectedRoleCookie = cookieStore.get('oauth_role')
          const role = (selectedRoleCookie?.value as 'student' | 'enterprise') || 'student'

          // Insert user record
          await db.insert(users).values({
            id: user.id,
            email: user.email!,
            role: role,
            emailVerified: true,
          })

          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''
          const nameParts = fullName.trim().split(' ')
          const firstName = nameParts[0] || 'User'
          const lastName = nameParts.slice(1).join(' ') || ''
          const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture

          if (role === 'student') {
            await db.insert(studentProfiles).values({
              userId: user.id,
              firstName: firstName || 'Student',
              lastName: lastName || 'User',
              avatarUrl: avatarUrl || null,
            })
          } else {
            await db.insert(enterpriseProfiles).values({
              userId: user.id,
              companyName: fullName || 'New Company',
              logoUrl: avatarUrl || null,
            })
          }

          cookieStore.delete('oauth_role')
          response.cookies.delete('oauth_role')
        }

        return response
      } catch (dbErr) {
        console.error('Error initializing user profile on OAuth callback:', dbErr)
        return response // Still redirect to dashboard as auth session was established
      }
    } else if (error) {
      console.error('OAuth exchange error:', error.message)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could+not+authenticate+user`)
}
