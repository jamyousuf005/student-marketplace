'use server'

import { createClient } from '@/supabase/server'
import { db } from '@/lib/db'
import { contracts, applications, tasks, studentProfiles, enterpriseProfiles } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function signContract(contractId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  try {
    const contract = await db.query.contracts.findFirst({
      where: eq(contracts.id, contractId)
    })

    if (!contract) return { error: 'Contract not found' }

    const application = await db.query.applications.findFirst({
      where: eq(applications.id, contract.applicationId)
    })

    if (!application) return { error: 'Associated application not found' }

    const student = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.id, application.studentId)
    })

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, application.taskId)
    })

    if (!task) return { error: 'Associated task not found' }

    const enterprise = await db.query.enterpriseProfiles.findFirst({
      where: eq(enterpriseProfiles.id, task.enterpriseId)
    })

    const isStudentParty = student?.userId === user.id
    const isEnterpriseParty = enterprise?.userId === user.id

    if (!isStudentParty && !isEnterpriseParty) {
      return { error: 'Forbidden: You are not a party to this contract' }
    }

    if (isEnterpriseParty) {
      await db.update(contracts)
        .set({ signedByEnterprise: true })
        .where(eq(contracts.id, contractId))
    } else if (isStudentParty) {
      await db.update(contracts)
        .set({ signedByStudent: true })
        .where(eq(contracts.id, contractId))
    }

    revalidatePath('/dashboard/contracts')
    return { success: true }
  } catch (err) {
    return { error: 'Failed to sign contract' }
  }
}
