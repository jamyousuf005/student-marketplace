'use server'

import { createClient } from '@/supabase/server'
import { db } from '@/lib/db'
import { messages } from '@/supabase/schema'
import { eq, or, desc } from 'drizzle-orm'

export async function sendMessage(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const content = formData.get('content') as string
  const receiverId = formData.get('receiverId') as string

  if (!content) return { error: 'Message cannot be empty' }
  if (!receiverId) return { error: 'No recipient selected' }

  try {
    await db.insert(messages).values({
      senderId: user.id,
      receiverId: receiverId,
      content,
    })

    return { success: true }
  } catch (err) {
    return { error: 'Failed to send message' }
  }
}

export async function fetchMessages() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', messages: [] }

  try {
    const userMessages = await db.query.messages.findMany({
      where: or(
        eq(messages.senderId, user.id),
        eq(messages.receiverId, user.id)
      ),
      orderBy: [desc(messages.createdAt)],
      limit: 100,
    })

    return { messages: userMessages, userId: user.id }
  } catch (err) {
    return { error: 'Failed to fetch messages', messages: [] }
  }
}
