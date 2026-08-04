import { db } from '@/lib/db'
import { tasks, users, contracts } from '@/supabase/schema'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { count } from 'drizzle-orm'

export default async function AdminDashboard() {
  const totalUsers = await db.select({ count: count() }).from(users)
  const totalTasks = await db.select({ count: count() }).from(tasks)
  const totalContracts = await db.select({ count: count() }).from(contracts)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Portal</h2>
        <p className="text-muted-foreground">System overview and platform statistics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers[0].count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks[0].count}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContracts[0].count}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Platform Moderation</h3>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No flagged content or disputes require attention at this time.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
