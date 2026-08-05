'use server'

import { createClient } from '@/supabase/server'
import { db } from '@/lib/db'
import { studentProfiles, enterpriseProfiles } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { uploadFileToStorage } from '@/lib/storage'

export async function updateStudentProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const bio = formData.get('bio') as string
  const education = formData.get('education') as string
  const rawSkills = formData.get('skills') as string
  const skills = rawSkills ? rawSkills.split(',').map(s => s.trim()).filter(Boolean) : []

  const resumeFile = formData.get('resume') as File | null
  const avatarFile = formData.get('avatar') as File | null

  let resumeUrl: string | undefined = undefined
  let avatarUrl: string | undefined = undefined

  try {
    if (resumeFile && resumeFile.size > 0) {
      const extension = resumeFile.name.split('.').pop() || 'pdf'
      const filePath = `student_${user.id}_resume.${extension}`
      const arrayBuffer = await resumeFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      resumeUrl = await uploadFileToStorage('resumes', filePath, buffer, resumeFile.type)
    }

    if (avatarFile && avatarFile.size > 0) {
      const extension = avatarFile.name.split('.').pop() || 'jpg'
      const filePath = `student_${user.id}_avatar.${extension}`
      const arrayBuffer = await avatarFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      avatarUrl = await uploadFileToStorage('avatars', filePath, buffer, avatarFile.type)
    }

    const updateData: any = {
      firstName,
      lastName,
      bio,
      education,
      skills,
      updatedAt: new Date(),
    }

    if (resumeUrl) updateData.resumeUrl = resumeUrl
    if (avatarUrl) updateData.avatarUrl = avatarUrl

    await db.update(studentProfiles)
      .set(updateData)
      .where(eq(studentProfiles.userId, user.id))

    revalidatePath('/dashboard/profile')
    return { success: true }
  } catch (err: any) {
    console.error(err)
    return { error: err?.message || 'Failed to update profile' }
  }
}

export async function updateEnterpriseProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const companyName = formData.get('companyName') as string
  const description = formData.get('description') as string
  const website = formData.get('website') as string
  const logoFile = formData.get('logo') as File | null

  let logoUrl: string | undefined = undefined

  try {
    if (logoFile && logoFile.size > 0) {
      const extension = logoFile.name.split('.').pop() || 'png'
      const filePath = `enterprise_${user.id}_logo.${extension}`
      const arrayBuffer = await logoFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      logoUrl = await uploadFileToStorage('avatars', filePath, buffer, logoFile.type)
    }

    const updateData: any = {
      companyName,
      description,
      website,
      updatedAt: new Date(),
    }

    if (logoUrl) updateData.logoUrl = logoUrl

    await db.update(enterpriseProfiles)
      .set(updateData)
      .where(eq(enterpriseProfiles.userId, user.id))

    revalidatePath('/dashboard/profile')
    return { success: true }
  } catch (err: any) {
    console.error(err)
    return { error: err?.message || 'Failed to update profile' }
  }
}
