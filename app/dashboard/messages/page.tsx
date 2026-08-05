import { db } from '@/lib/db'
import { messages, studentProfiles, enterpriseProfiles } from '@/supabase/schema'
import { eq, or, desc, and } from 'drizzle-orm'
import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { ChatInterface } from '@/components/dashboard/chat-interface'

interface MessagesPageProps {
  searchParams?: Promise<{
    recipientId?: string
  }>
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const params = searchParams ? await searchParams : {}
  const initialRecipientId = params.recipientId

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch user's message history
  const userMessages = await db.query.messages.findMany({
    where: or(
      eq(messages.senderId, user.id),
      eq(messages.receiverId, user.id)
    ),
    orderBy: [desc(messages.createdAt)],
    limit: 100,
  })

  // Mark unread messages addressed to current user as read
  await db.update(messages)
    .set({ read: true })
    .where(and(
      eq(messages.receiverId, user.id),
      eq(messages.read, false)
    ))

  // Fetch all students & enterprises for contact selection
  const allStudents = await db.select().from(studentProfiles)
  const allEnterprises = await db.select().from(enterpriseProfiles)

  const nameMap: Record<string, string> = {}
  const connectionMap = new Map<string, { id: string; name: string; type: 'enterprise' | 'student' }>()

  // Map enterprises
  allEnterprises.forEach(e => {
    if (e.userId !== user.id) {
      nameMap[e.userId] = e.companyName
      connectionMap.set(e.userId, {
        id: e.userId,
        name: `${e.companyName} (Company)`,
        type: 'enterprise'
      })
    }
  })

  // Map students
  allStudents.forEach(s => {
    if (s.userId !== user.id) {
      const studentFullName = `${s.firstName} ${s.lastName}`.trim()
      nameMap[s.userId] = studentFullName
      connectionMap.set(s.userId, {
        id: s.userId,
        name: `${studentFullName} (Student)`,
        type: 'student'
      })
    }
  })

  const connectionOptions = Array.from(connectionMap.values())

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Direct Messaging</h2>
        <p className="text-muted-foreground">Communicate directly with students and enterprise clients.</p>
      </div>

      <ChatInterface
        currentUserId={user.id}
        userMessages={userMessages}
        connections={connectionOptions}
        nameMap={nameMap}
        initialRecipientId={initialRecipientId}
      />
    </div>
  )
}
