import { createClient } from '@/supabase/server'
import { db } from '@/lib/db'
import { users, studentProfiles, enterpriseProfiles } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { StudentProfileForm } from '@/components/dashboard/student-profile-form'
import { EnterpriseProfileForm } from '@/components/dashboard/enterprise-profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id)
  })

  if (!dbUser) redirect('/login')

  if (dbUser.role === 'student') {
    const profile = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, user.id)
    })
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Your Profile</h2>
          <p className="text-muted-foreground">Manage your student profile information.</p>
        </div>
        <StudentProfileForm initialData={profile} />
      </div>
    )
  }

  if (dbUser.role === 'enterprise') {
    const profile = await db.query.enterpriseProfiles.findFirst({
      where: eq(enterpriseProfiles.userId, user.id)
    })
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Company Profile</h2>
          <p className="text-muted-foreground">Manage your enterprise profile information.</p>
        </div>
        <EnterpriseProfileForm initialData={profile} />
      </div>
    )
  }

  return null
}
