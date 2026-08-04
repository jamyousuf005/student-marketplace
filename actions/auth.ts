'use server'

import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users, studentProfiles, enterpriseProfiles } from '@/supabase/schema'
import { eq } from 'drizzle-orm'

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const parsed = signInSchema.safeParse({ email, password })

  if (!parsed.success) {
    return { error: 'Invalid email or password' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Ensure the user actually exists in our public users table
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id)
    })

    if (!dbUser) {
      // If they don't exist in our DB (deleted), forcibly sign them out of Supabase
      await supabase.auth.signOut()
      return { error: 'Your account has been deleted or deactivated.' }
    }
  }

  return { success: true }
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as 'student' | 'enterprise'

  if (!role) {
    return { error: 'Please select an account type' }
  }

  const parsed = signInSchema.safeParse({ email, password })

  if (!parsed.success) {
    return { error: 'Invalid email or password' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    if (data.user.identities && data.user.identities.length === 0) {
      return { error: 'This email is already registered. Please sign in instead.' }
    }
    try {
      // Create user record with the exact ID from Supabase Auth
      await db.insert(users).values({
        id: data.user.id,
        email: data.user.email!,
        role: role,
        emailVerified: !!data.user.email_confirmed_at,
      })

      // Create corresponding profile
      if (role === 'student') {
        await db.insert(studentProfiles).values({
          userId: data.user.id,
          firstName: 'Student', // Placeholder to be updated in onboarding
          lastName: 'User',
        })
      } else {
        await db.insert(enterpriseProfiles).values({
          userId: data.user.id,
          companyName: 'New Company', // Placeholder
        })
      }
    } catch (dbError) {
      console.error('Failed to save user to DB:', dbError)
      // Note: Ideally, you'd want to handle this rollback in a real production system
      return { error: 'Account created but failed to initialize profile. Please contact support.' }
    }
  }

  return { success: true }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
