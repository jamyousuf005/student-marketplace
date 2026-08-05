'use server'

import { createClient } from '@/supabase/server'
import { db } from '@/lib/db'
import { milestones, contracts, applications, tasks, enterpriseProfiles, studentProfiles } from '@/supabase/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createMilestone(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const contractId = formData.get('contractId') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const rawAmount = formData.get('amount') as string
  const amount = parseInt(rawAmount, 10)

  if (!contractId || !title || isNaN(amount) || amount <= 0) {
    return { error: 'Please provide valid milestone title and amount' }
  }

  try {
    const contract = await db.query.contracts.findFirst({
      where: eq(contracts.id, contractId)
    })
    if (!contract) return { error: 'Contract not found' }

    await db.insert(milestones).values({
      contractId,
      title: title.trim(),
      description: description ? description.trim() : '',
      amount,
      status: 'pending',
    })

    revalidatePath(`/dashboard/contracts/${contractId}`)
    return { success: true }
  } catch (err: any) {
    return { error: err?.message || 'Failed to create milestone' }
  }
}

export async function updateMilestoneStatus(milestoneId: string, status: 'pending' | 'in_progress' | 'completed' | 'approved') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  try {
    const milestone = await db.query.milestones.findFirst({
      where: eq(milestones.id, milestoneId)
    })
    if (!milestone) return { error: 'Milestone not found' }

    await db.update(milestones)
      .set({ status })
      .where(eq(milestones.id, milestoneId))

    revalidatePath(`/dashboard/contracts/${milestone.contractId}`)
    return { success: true }
  } catch (err: any) {
    return { error: err?.message || 'Failed to update milestone' }
  }
}
