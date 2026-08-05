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
    } catch (dbError: any) {
      console.error('Failed to save user to DB:', dbError)
      // Return the actual error message to help debug
      return { error: `DB Error: ${dbError?.message || JSON.stringify(dbError) || 'Unknown error'}` }
    }
  }

  // If email confirmation is required, don't auto-login
  if (data.user && !data.user.email_confirmed_at) {
    return { success: true, needsVerification: true }
  }

  return { success: true }
}

export async function verifyOtp(email: string, token: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Update db to set emailVerified to true
    await db.update(users).set({ emailVerified: true }).where(eq(users.id, data.user.id))
  }

  return { success: true }
}

export async function requestPasswordReset(email: string) {
  try {
    const parsed = z.string().email().safeParse(email)

    if (!parsed.success) {
      return { error: 'Please enter a valid email address' }
    }

    const supabase = await createClient()

    // Use signInWithOtp to send a short numeric OTP the user can type manually.
    // shouldCreateUser: false ensures this only works for existing accounts.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    })

    if (error) {
      const msg = error.message || 'Failed to send verification code. Please try again.'
      return { error: msg }
    }

    return {
      success: true,
      message: 'Verification code sent successfully.',
    }
  } catch (err: any) {
    console.error(err)
    return {
      error: err.message || 'Failed to send verification code.',
    }
  }
}

export async function verifyResetOtp(
  email: string,
  token: string
) {
  try {
    const emailValidation = z.string().email().safeParse(email)

    if (!emailValidation.success) {
      return {
        error: 'Invalid email address.',
      }
    }

    if (!token || token.trim().length < 4) {
      return {
        error: 'Please enter the full verification code.',
      }
    }

    const supabase = await createClient()

    // type: 'email' matches the signInWithOtp flow used in requestPasswordReset
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    if (error) {
      return {
        error: error.message,
      }
    }

    if (!data.session) {
      return {
        error: 'Unable to verify code. Please request a new one.',
      }
    }

    return {
      success: true,
      message: 'Verification successful.',
    }
  } catch (err: any) {
    console.error(err)

    return {
      error: err.message || 'OTP verification failed.',
    }
  }
}

export async function resetPassword(password: string) {
  try {
    const parsed = z
      .string()
      .min(8, 'Password must be at least 8 characters long.')
      .safeParse(password)

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0].message,
      }
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        error: 'Your recovery session has expired. Please request a new verification code.',
      }
    }

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return {
        error: error.message,
      }
    }

    await supabase.auth.signOut()

    return {
      success: true,
      message: 'Password updated successfully.',
    }
  } catch (err: any) {
    console.error(err)

    return {
      error: err.message || 'Unable to update password.',
    }
  }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
