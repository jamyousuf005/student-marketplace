'use server'

import { db } from '@/lib/db'
import { tasks, users } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkAdminAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { authorized: false, error: 'Unauthorized' }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id)
  })

  if (dbUser?.role !== 'admin') return { authorized: false, error: 'Forbidden' }

  return { authorized: true, user }
}

export async function adminCancelTask(taskId: string) {
  try {
    const auth = await checkAdminAuth()
    if (!auth.authorized) return { error: auth.error }

    await db.update(tasks)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(tasks.id, taskId))

    revalidatePath('/dashboard/admin')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Something went wrong' }
  }
}

export async function adminDeleteTask(taskId: string) {
  try {
    const auth = await checkAdminAuth()
    if (!auth.authorized) return { error: auth.error }

    await db.delete(tasks).where(eq(tasks.id, taskId))

    revalidatePath('/dashboard/admin')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Something went wrong' }
  }
}

export async function adminUpdateUserRole(targetUserId: string, newRole: 'student' | 'enterprise' | 'admin') {
  try {
    const auth = await checkAdminAuth()
    if (!auth.authorized) return { error: auth.error }

    await db.update(users)
      .set({ role: newRole, updatedAt: new Date() })
      .where(eq(users.id, targetUserId))

    revalidatePath('/dashboard/admin')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Something went wrong' }
  }
}
