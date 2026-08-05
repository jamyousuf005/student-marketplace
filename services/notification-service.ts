import { db } from '@/lib/db'
import { notifications } from '@/supabase/schema'
import { eq, desc } from 'drizzle-orm'

export async function createNotification({
  userId,
  title,
  content,
  link,
}: {
  userId: string
  title: string
  content: string
  link?: string
}) {
  try {
    await db.insert(notifications).values({
      userId,
      title,
      content,
      link: link || null,
    })
  } catch (err) {
    console.error('Failed to create notification:', err)
  }
}

export async function getUserNotifications(userId: string) {
  return await db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: [desc(notifications.createdAt)],
    limit: 20,
  })
}
