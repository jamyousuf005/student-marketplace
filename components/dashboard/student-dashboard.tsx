import { db } from '@/lib/db'
import { tasks, enterpriseProfiles, applications, studentProfiles } from '@/supabase/schema'
import { eq, desc } from 'drizzle-orm'
import { createClient } from '@/supabase/server'
import { TaskSearchList } from '@/components/dashboard/task-search-list'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const recentTasks = await db.query.tasks.findMany({
    orderBy: [desc(tasks.createdAt)],
    limit: 50,
  })
  
  const allEnterprises = await db.select().from(enterpriseProfiles)
  const enterpriseMap: Record<string, string> = {}
  const enterpriseUserIdMap: Record<string, string> = {}
  allEnterprises.forEach(e => {
    enterpriseMap[e.id] = e.companyName
    enterpriseUserIdMap[e.id] = e.userId
  })

  const appliedTaskIds: string[] = []
  
  if (user) {
    const student = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, user.id)
    })
    
    if (student) {
      const myApplications = await db.select({ taskId: applications.taskId })
        .from(applications)
        .where(eq(applications.studentId, student.id))
        
      myApplications.forEach(app => appliedTaskIds.push(app.taskId))
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Student Marketplace</h2>
        <p className="text-muted-foreground">Browse opportunities, apply to tasks, and build your professional portfolio.</p>
      </div>

      <TaskSearchList 
        tasks={recentTasks} 
        enterpriseMap={enterpriseMap} 
        enterpriseUserIdMap={enterpriseUserIdMap}
        appliedTaskIds={appliedTaskIds} 
      />
    </div>
  )
}

