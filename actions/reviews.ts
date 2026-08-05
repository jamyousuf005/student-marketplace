'use server'

import { db } from '@/lib/db'
import { reviews, tasks, enterpriseProfiles, studentProfiles, applications } from '@/supabase/schema'
import { eq, and } from 'drizzle-orm'
import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(taskId: string, revieweeId: string, rating: number, comment: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { error: 'Unauthorized' }

    if (rating < 1 || rating > 5) {
      return { error: 'Rating must be between 1 and 5 stars' }
    }

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId)
    })

    if (!task) return { error: 'Task not found' }

    // Check if user already reviewed
    const existingReview = await db.query.reviews.findFirst({
      where: and(
        eq(reviews.taskId, taskId),
        eq(reviews.reviewerId, user.id)
      )
    })

    if (existingReview) {
      return { error: 'You have already submitted a review for this task' }
    }

    await db.insert(reviews).values({
      taskId,
      reviewerId: user.id,
      revieweeId,
      rating,
      comment: comment?.trim() || null
    })

    revalidatePath('/dashboard/contracts')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Something went wrong' }
  }
}

export async function completeTask(taskId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { error: 'Unauthorized' }

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId)
    })

    if (!task) return { error: 'Task not found' }

    const enterprise = await db.query.enterpriseProfiles.findFirst({
      where: eq(enterpriseProfiles.id, task.enterpriseId)
    })

    if (!enterprise || enterprise.userId !== user.id) {
      return { error: 'Forbidden: Only the enterprise client can mark a task as completed' }
    }

    await db.update(tasks).set({ status: 'completed', updatedAt: new Date() }).where(eq(tasks.id, taskId))

    revalidatePath('/dashboard/contracts')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Something went wrong' }
  }
}
