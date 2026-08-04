'use server'

import { createClient } from '@/supabase/server'
import { db } from '@/lib/db'
import { messages } from '@/supabase/schema'
import { revalidatePath } from 'next/cache'

export async function sendMessage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const content = formData.get('content') as string
  const receiverId = formData.get('receiverId') as string // In a real app, this comes from UI selection

  if (!content) return { error: 'Message cannot be empty' }
  if (!receiverId) return { error: 'No recipient selected' }

  try {
    await db.insert(messages).values({
      senderId: user.id,
      receiverId: receiverId,
      content,
    })

    revalidatePath('/dashboard/messages')
    return { success: true }
  } catch (err) {
    return { error: 'Failed to send message' }
  }
}
