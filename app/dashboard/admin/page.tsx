import { db } from '@/lib/db'
import { tasks, users, contracts } from '@/supabase/schema'
import { eq, desc } from 'drizzle-orm'
import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AdminTaskTable } from '@/components/dashboard/admin-task-table'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id)
  })

  if (dbUser?.role !== 'admin') {
    redirect('/dashboard')
  }

  // Fetch some stats for the admin
  const allTasks = await db.query.tasks.findMany({
    orderBy: [desc(tasks.createdAt)],
    limit: 50,
  })

  const allUsers = await db.select().from(users)
  const allContracts = await db.select().from(contracts)

  const openTasks = allTasks.filter(t => t.status === 'open').length
  const completedTasks = allTasks.filter(t => t.status === 'completed').length

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">Manage tasks, users, and platform activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allContracts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTasks}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks} completed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks & Moderation</CardTitle>
          <CardDescription>Review open tasks and take action if needed.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminTaskTable tasks={allTasks} />
        </CardContent>
      </Card>
    </div>
  )
}
