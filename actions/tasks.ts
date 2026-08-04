'use server'

import { createClient } from '@/supabase/server'
import { db } from '@/lib/db'
import { tasks, applications, enterpriseProfiles, studentProfiles, contracts } from '@/supabase/schema'
import { revalidatePath } from 'next/cache'
import { eq, desc } from 'drizzle-orm'

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get enterprise profile
  const enterprise = await db.query.enterpriseProfiles.findFirst({
    where: eq(enterpriseProfiles.userId, user.id)
  })

  if (!enterprise) return { error: 'Not an enterprise account' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const budget = parseInt(formData.get('budget') as string)
  const category = formData.get('category') as string
  const rawSkills = formData.get('skills') as string
  const skills = rawSkills.split(',').map(s => s.trim())

  try {
    await db.insert(tasks).values({
      enterpriseId: enterprise.id,
      title,
      description,
      budget,
      category,
      requiredSkills: skills,
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    return { error: 'Failed to create task' }
  }
}

export async function applyToTask(taskId: string, coverLetter: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const student = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, user.id)
  })

  if (!student) return { error: 'Not a student account' }

  try {
    await db.insert(applications).values({
      taskId,
      studentId: student.id,
      coverLetter,
    })

    revalidatePath('/dashboard/tasks')
    return { success: true }
  } catch (err) {
    return { error: 'Failed to apply to task' }
  }
}

export async function getRecentTasks() {
  return await db.query.tasks.findMany({
    orderBy: [desc(tasks.createdAt)],
    limit: 10,
  })
}

export async function acceptApplication(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  try {
    const app = await db.query.applications.findFirst({
      where: eq(applications.id, applicationId)
    })

    if (!app) return { error: 'Application not found' }

    // Update application status
    await db.update(applications)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(applications.id, applicationId))

    // Update task status
    await db.update(tasks)
      .set({ status: 'in_progress', updatedAt: new Date() })
      .where(eq(tasks.id, app.taskId))

    // Automatically create a Contract
    await db.insert(contracts).values({
      applicationId: applicationId,
    })

    revalidatePath('/dashboard/applications')
    return { success: true }
  } catch (err) {
    return { error: 'Failed to accept application' }
  }
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  try {
    await db.delete(tasks).where(eq(tasks.id, taskId))
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    return { error: 'Failed to delete task' }
  }
}

export async function updateTask(taskId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const budget = parseInt(formData.get('budget') as string)
  const category = formData.get('category') as string
  const skillsStr = formData.get('skills') as string
  const skills = skillsStr ? skillsStr.split(',').map(s => s.trim()) : []

  try {
    await db.update(tasks)
      .set({ title, description, budget, category, requiredSkills: skills, updatedAt: new Date() })
      .where(eq(tasks.id, taskId))
    
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    return { error: 'Failed to update task' }
  }
}
