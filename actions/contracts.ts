'use server'

import { createClient } from '@/supabase/server'
import { db } from '@/lib/db'
import { contracts, users } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function signContract(contractId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  try {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id)
    })

    if (!dbUser) return { error: 'User not found' }

    if (dbUser.role === 'enterprise') {
      await db.update(contracts)
        .set({ signedByEnterprise: true })
        .where(eq(contracts.id, contractId))
    } else if (dbUser.role === 'student') {
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
