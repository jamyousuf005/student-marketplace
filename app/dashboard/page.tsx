import { createClient } from '@/supabase/server'
import { db } from '@/lib/db'
import { users } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import EnterpriseDashboard from '@/components/dashboard/enterprise-dashboard'
import StudentDashboard from '@/components/dashboard/student-dashboard'
import AdminDashboard from '@/components/dashboard/admin-dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id)
  })

  if (!dbUser) {
    return <div className="p-8 text-center text-destructive">User profile not found. Please contact support.</div>
  }

  if (dbUser.role === 'enterprise') {
    return <EnterpriseDashboard />
  } else if (dbUser.role === 'student') {
    return <StudentDashboard />
  }

  return <AdminDashboard />
}
