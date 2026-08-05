'use server'

import { createClient } from '@/supabase/server'
import { db } from '@/lib/db'
import { tasks, applications, enterpriseProfiles, studentProfiles, contracts } from '@/supabase/schema'
import { revalidatePath } from 'next/cache'
import { eq, desc, and } from 'drizzle-orm'
import { z } from 'zod'
import { uploadFileToStorage } from '@/lib/storage'
import { generateContractHtml } from '@/lib/pdf/contract-generator'


const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  budget: z.number().positive('Budget must be a positive number'),
  category: z.string().min(2, 'Category is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
})

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const enterprise = await db.query.enterpriseProfiles.findFirst({
    where: eq(enterpriseProfiles.userId, user.id)
  })

  if (!enterprise) return { error: 'Not authorized: Enterprise account required' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const rawBudget = formData.get('budget') as string
  const budget = parseInt(rawBudget, 10)
  const category = formData.get('category') as string
  const rawSkills = (formData.get('skills') as string) || ''
  const skills = rawSkills.split(',').map(s => s.trim()).filter(Boolean)

  const validation = taskSchema.safeParse({ title, description, budget, category, skills })
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  try {
    await db.insert(tasks).values({
      enterpriseId: enterprise.id,
      title: validation.data.title,
      description: validation.data.description,
      budget: validation.data.budget,
      category: validation.data.category,
      requiredSkills: validation.data.skills,
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    return { error: 'Failed to create task' }
  }
}

export async function submitApplicationForm(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const taskId = formData.get('taskId') as string
  const coverLetter = formData.get('coverLetter') as string
  const experience = formData.get('experience') as string
  const rawSkills = formData.get('skills') as string
  const resumeFile = formData.get('resume') as File | null

  if (!taskId) return { error: 'Task ID missing' }
  if (!coverLetter || coverLetter.trim().length < 10) {
    return { error: 'Proposal/Cover letter must be at least 10 characters long' }
  }

  const student = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, user.id)
  })

  if (!student) return { error: 'Not authorized: Student account required' }

  // Check if task exists and is open
  const targetTask = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId)
  })

  if (!targetTask || targetTask.status !== 'open') {
    return { error: 'Task is not accepting applications' }
  }

  // Check for duplicate application
  const existingApp = await db.query.applications.findFirst({
    where: and(
      eq(applications.taskId, taskId),
      eq(applications.studentId, student.id)
    )
  })

  if (existingApp) {
    return { error: 'You have already applied to this task' }
  }

  try {
    let resumeUrl = student.resumeUrl

    if (resumeFile && resumeFile.size > 0) {
      const extension = resumeFile.name.split('.').pop() || 'pdf'
      const filePath = `student_${user.id}_resume_${Date.now()}.${extension}`
      const arrayBuffer = await resumeFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      resumeUrl = await uploadFileToStorage('resumes', filePath, buffer, resumeFile.type)
    }

    // Optionally update student profile skills/education
    const skillsList = rawSkills ? rawSkills.split(',').map(s => s.trim()).filter(Boolean) : student.skills

    await db.update(studentProfiles).set({
      education: experience ? experience.trim() : student.education,
      skills: skillsList,
      resumeUrl: resumeUrl,
      updatedAt: new Date()
    }).where(eq(studentProfiles.id, student.id))

    await db.insert(applications).values({
      taskId,
      studentId: student.id,
      coverLetter: coverLetter.trim(),
    })

    revalidatePath(`/dashboard/tasks/${taskId}`)
    revalidatePath('/dashboard/tasks')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    console.error(err)
    return { error: err?.message || 'Failed to submit application' }
  }
}

export async function applyToTask(taskId: string, coverLetter: string) {
  const formData = new FormData()
  formData.append('taskId', taskId)
  formData.append('coverLetter', coverLetter)
  return await submitApplicationForm(formData)
}


export async function getRecentTasks() {
  return await db.query.tasks.findMany({
    orderBy: [desc(tasks.createdAt)],
    limit: 20,
  })
}

export async function acceptApplication(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const enterprise = await db.query.enterpriseProfiles.findFirst({
    where: eq(enterpriseProfiles.userId, user.id)
  })

  if (!enterprise) return { error: 'Not authorized: Enterprise account required' }

  try {
    const app = await db.query.applications.findFirst({
      where: eq(applications.id, applicationId)
    })

    if (!app) return { error: 'Application not found' }

    // Verify task ownership
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, app.taskId)
    })

    if (!task || task.enterpriseId !== enterprise.id) {
      return { error: 'Forbidden: You do not own this task' }
    }

    // Update application status
    await db.update(applications)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(applications.id, applicationId))

    // Update task status
    await db.update(tasks)
      .set({ status: 'in_progress', updatedAt: new Date() })
      .where(eq(tasks.id, app.taskId))

    // Check if contract already exists
    const existingContract = await db.query.contracts.findFirst({
      where: eq(contracts.applicationId, applicationId)
    })

    if (!existingContract) {
      // Fetch details for contract generation
      const student = await db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.id, app.studentId)
      })

      const [newContract] = await db.insert(contracts).values({
        applicationId: applicationId,
      }).returning()

      // Generate HTML contract document link
      if (newContract && student) {
        const contractData = {
          contractId: newContract.id,
          taskTitle: task.title,
          taskDescription: task.description,
          budget: task.budget,
          category: task.category,
          enterpriseName: enterprise.companyName,
          studentName: `${student.firstName} ${student.lastName}`,
          createdDate: new Date().toLocaleDateString(),
        }

        const contractHtml = generateContractHtml(contractData)
        const buffer = Buffer.from(contractHtml, 'utf-8')
        const filePath = `contract_${newContract.id}.html`
        
        try {
          const pdfUrl = await uploadFileToStorage('contracts', filePath, buffer, 'text/html')
          await db.update(contracts).set({ pdfUrl }).where(eq(contracts.id, newContract.id))
        } catch (storageErr) {
          console.error('Failed to upload contract document:', storageErr)
        }
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/contracts')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: 'Failed to accept application' }
  }
}


export async function deleteTask(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const enterprise = await db.query.enterpriseProfiles.findFirst({
    where: eq(enterpriseProfiles.userId, user.id)
  })

  if (!enterprise) return { error: 'Not authorized: Enterprise account required' }

  // Verify ownership
  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId)
  })

  if (!task || task.enterpriseId !== enterprise.id) {
    return { error: 'Forbidden: You do not own this task' }
  }

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

  const enterprise = await db.query.enterpriseProfiles.findFirst({
    where: eq(enterpriseProfiles.userId, user.id)
  })

  if (!enterprise) return { error: 'Not authorized: Enterprise account required' }

  // Verify task ownership
  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId)
  })

  if (!task || task.enterpriseId !== enterprise.id) {
    return { error: 'Forbidden: You do not own this task' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const rawBudget = formData.get('budget') as string
  const budget = parseInt(rawBudget, 10)
  const category = formData.get('category') as string
  const skillsStr = (formData.get('skills') as string) || ''
  const skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean)

  const validation = taskSchema.safeParse({ title, description, budget, category, skills })
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  try {
    await db.update(tasks)
      .set({
        title: validation.data.title,
        description: validation.data.description,
        budget: validation.data.budget,
        category: validation.data.category,
        requiredSkills: validation.data.skills,
        updatedAt: new Date()
      })
      .where(eq(tasks.id, taskId))
    
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    return { error: 'Failed to update task' }
  }
}
