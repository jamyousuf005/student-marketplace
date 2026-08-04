import { db } from '@/lib/db'
import { tasks, enterpriseProfiles, applications, studentProfiles } from '@/supabase/schema'
import { eq, desc, inArray } from 'drizzle-orm'
import { createClient } from '@/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { CreateTaskForm } from './create-task-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AcceptApplicationButton } from './accept-application-button'
import { StudentProfileDialog } from './student-profile-dialog'
import { TaskActions } from './task-actions'

export default async function EnterpriseDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const enterprise = await db.query.enterpriseProfiles.findFirst({
    where: eq(enterpriseProfiles.userId, user.id)
  })

  if (!enterprise) return null

  const enterpriseTasks = await db.query.tasks.findMany({
    where: eq(tasks.enterpriseId, enterprise.id),
    orderBy: [desc(tasks.createdAt)]
  })

  const taskIds = enterpriseTasks.map(t => t.id)
  
  // Fetch applications for these tasks
  let incomingApplications: any[] = []
  if (taskIds.length > 0) {
    const rawApplications = await db.select({
      id: applications.id,
      coverLetter: applications.coverLetter,
      status: applications.status,
      createdAt: applications.createdAt,
      taskTitle: tasks.title,
      studentFirstName: studentProfiles.firstName,
      studentLastName: studentProfiles.lastName,
      studentBio: studentProfiles.bio,
      studentEducation: studentProfiles.education,
      studentSkills: studentProfiles.skills,
    })
    .from(applications)
    .innerJoin(tasks, eq(applications.taskId, tasks.id))
    .innerJoin(studentProfiles, eq(applications.studentId, studentProfiles.id))
    .where(inArray(applications.taskId, taskIds))
    .orderBy(desc(applications.createdAt))
    
    incomingApplications = rawApplications
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Enterprise Dashboard</h2>
        <p className="text-muted-foreground">Manage your tasks and applications.</p>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="applications">Applications ({incomingApplications.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="mt-0">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Post a New Task</h3>
              <CreateTaskForm />
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Your Posted Tasks</h3>
              {enterpriseTasks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    You haven't posted any tasks yet.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {enterpriseTasks.map((task) => (
                    <Card key={task.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                            <CardDescription>{task.category}</CardDescription>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            task.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {task.status === 'in_progress' ? 'Assigned' : 
                             task.status === 'completed' ? 'Completed' : 'Open'}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                        <div className="mt-4 font-semibold">${task.budget}</div>
                        <TaskActions task={task} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="mt-0 space-y-4">
          <h3 className="text-xl font-semibold">Incoming Applications</h3>
          {incomingApplications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No applications received yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {incomingApplications.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{app.studentFirstName} {app.studentLastName}</CardTitle>
                        <CardDescription>Applied to: {app.taskTitle}</CardDescription>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        app.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground italic line-clamp-3">
                      "{app.coverLetter}"
                    </p>
                  </CardContent>
                  <CardFooter className="flex-col gap-2 items-stretch">
                    <StudentProfileDialog student={app} />
                    {app.status === 'pending' && (
                      <AcceptApplicationButton applicationId={app.id} />
                    )}
                    {app.status === 'accepted' && (
                      <span className="text-sm text-green-600 font-medium text-center">Contract Generated</span>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
