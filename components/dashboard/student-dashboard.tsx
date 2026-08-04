import { db } from '@/lib/db'
import { tasks, enterpriseProfiles, applications, studentProfiles } from '@/supabase/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ApplyButton } from '@/components/dashboard/apply-button'
import { createClient } from '@/supabase/server'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const recentTasks = await db.query.tasks.findMany({
    orderBy: [desc(tasks.createdAt)],
    limit: 20,
  })
  
  const allEnterprises = await db.select().from(enterpriseProfiles)
  const enterpriseMap = new Map(allEnterprises.map(e => [e.id, e.companyName]))

  const appliedTaskIds = new Set<string>()
  
  if (user) {
    const student = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, user.id)
    })
    
    if (student) {
      const myApplications = await db.select({ taskId: applications.taskId })
        .from(applications)
        .where(eq(applications.studentId, student.id))
        
      myApplications.forEach(app => appliedTaskIds.add(app.taskId))
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
        <p className="text-muted-foreground">Find the perfect task and start earning.</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Available Tasks</h3>
        {recentTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No tasks available right now. Check back later!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentTasks.map((task) => (
              <Card key={task.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1">{task.title}</CardTitle>
                    <span className="font-bold text-green-600">${task.budget}</span>
                  </div>
                  <CardDescription className="text-xs">
                    Posted by {enterpriseMap.get(task.enterpriseId) || 'Unknown Company'} • {task.category}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {task.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {task.requiredSkills?.map((skill) => (
                      <span key={skill} className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <ApplyButton taskId={task.id} hasApplied={appliedTaskIds.has(task.id)} taskStatus={task.status} />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
