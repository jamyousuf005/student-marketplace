'use server'

import { createClient } from '@/supabase/server'
import { db } from '@/lib/db'
import { studentProfiles, enterpriseProfiles } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function updateStudentProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const bio = formData.get('bio') as string
  const education = formData.get('education') as string
  const rawSkills = formData.get('skills') as string
  const skills = rawSkills ? rawSkills.split(',').map(s => s.trim()) : []

  try {
    await db.update(studentProfiles)
      .set({
        firstName,
        lastName,
        bio,
        education,
        skills,
        updatedAt: new Date(),
      })
      .where(eq(studentProfiles.userId, user.id))

    revalidatePath('/dashboard/profile')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: 'Failed to update profile' }
  }
}

export async function updateEnterpriseProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const companyName = formData.get('companyName') as string
  const description = formData.get('description') as string
  const website = formData.get('website') as string

  try {
    await db.update(enterpriseProfiles)
      .set({
        companyName,
        description,
        website,
        updatedAt: new Date(),
      })
      .where(eq(enterpriseProfiles.userId, user.id))

    revalidatePath('/dashboard/profile')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: 'Failed to update profile' }
  }
}
