import { db } from '@/lib/db'
import { messages, users, studentProfiles, enterpriseProfiles } from '@/supabase/schema'
import { eq, or, desc, and } from 'drizzle-orm'
import { createClient } from '@/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { MessageForm } from '../../../components/dashboard/message-form'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch user's messages
  const userMessages = await db.query.messages.findMany({
    where: or(
      eq(messages.senderId, user.id),
      eq(messages.receiverId, user.id)
    ),
    orderBy: [desc(messages.createdAt)],
    limit: 50,
  })

  // Mark any unread messages addressed to the current user as read
  await db.update(messages)
    .set({ read: true })
    .where(and(
      eq(messages.receiverId, user.id),
      eq(messages.read, false)
    ))

  // Find all contracts involving this user to establish valid chat connections
  const { contracts, applications, tasks } = await import('@/supabase/schema')
  const userContracts = await db.select({
    enterpriseUserId: enterpriseProfiles.userId,
    studentUserId: studentProfiles.userId,
    enterpriseName: enterpriseProfiles.companyName,
    studentName: studentProfiles.firstName,
  })
  .from(contracts)
  .innerJoin(applications, eq(contracts.applicationId, applications.id))
  .innerJoin(tasks, eq(applications.taskId, tasks.id))
  .innerJoin(enterpriseProfiles, eq(tasks.enterpriseId, enterpriseProfiles.id))
  .innerJoin(studentProfiles, eq(applications.studentId, studentProfiles.id))
  .where(or(
    eq(enterpriseProfiles.userId, user.id),
    eq(studentProfiles.userId, user.id)
  ))

  const connections = new Map<string, string>()
  userContracts.forEach(c => {
    if (c.enterpriseUserId === user.id) {
      connections.set(c.studentUserId, c.studentName || 'Student')
    } else {
      connections.set(c.enterpriseUserId, c.enterpriseName || 'Enterprise')
    }
  })

  const connectionOptions = Array.from(connections.entries()).map(([id, name]) => ({ id, name }))

  // To build a proper UI, we need to know the names of the people we're talking to.
  // For simplicity, we'll fetch all profiles and map them.
  const allStudents = await db.select().from(studentProfiles)
  const allEnterprises = await db.select().from(enterpriseProfiles)

  const nameMap = new Map<string, string>()
  allStudents.forEach(s => nameMap.set(s.userId, `${s.firstName} ${s.lastName}`))
  allEnterprises.forEach(e => nameMap.set(e.userId, e.companyName))

  // For the MVP, we just render a simple feed of recent messages.
  // In a real Socket.io app, this would be a full client-side chat interface.

  return (
    <div className="max-w-4xl mx-auto space-y-8 h-[80vh] flex flex-col">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
        <p className="text-muted-foreground">Communicate directly with your partners.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle>Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {userMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No messages yet. Send one to get started!
            </div>
          ) : (
            <div className="space-y-4 flex flex-col-reverse">
              {userMessages.map(msg => {
                const isMine = msg.senderId === user.id
                return (
                  <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-muted-foreground mb-1">
                      {isMine ? 'You' : (nameMap.get(msg.senderId) || 'Unknown User')}
                    </span>
                    <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${isMine ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
        <div className="p-4 border-t bg-background">
          <MessageForm currentUserId={user.id} connections={connectionOptions} />
        </div>
      </Card>
    </div>
  )
}
// Trigger rebuild
