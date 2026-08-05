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
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Briefcase, 
  Users, 
  DollarSign, 
  PlusCircle, 
  Sparkles, 
  FileCheck2, 
  GraduationCap, 
  TrendingUp, 
  Layers,
  Inbox
} from 'lucide-react'

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
      studentResumeUrl: studentProfiles.resumeUrl,
      studentAvatarUrl: studentProfiles.avatarUrl,
      studentUserId: studentProfiles.userId,
    })
    .from(applications)
    .innerJoin(tasks, eq(applications.taskId, tasks.id))
    .innerJoin(studentProfiles, eq(applications.studentId, studentProfiles.id))
    .where(inArray(applications.taskId, taskIds))
    .orderBy(desc(applications.createdAt))
    
    incomingApplications = rawApplications
  }

  // Analytics Metrics
  const totalBudget = enterpriseTasks.reduce((acc, t) => acc + (t.budget || 0), 0)
  const openTasksCount = enterpriseTasks.filter(t => t.status === 'open').length
  const assignedTasksCount = enterpriseTasks.filter(t => t.status === 'in_progress').length
  const pendingAppsCount = incomingApplications.filter(a => a.status === 'pending').length

  return (
    <div className="space-y-8 pb-12">
      {/* Visual Enterprise Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-purple-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur border border-white/20">
              <Building2 className="h-3.5 w-3.5 text-emerald-300" />
              <span>Enterprise Client Workspace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {enterprise.companyName}!
            </h1>
            <p className="text-white/80 text-sm max-w-xl leading-relaxed">
              Manage your university task listings, review incoming student talent applications, and track active contracts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur border border-white/20 p-3 rounded-xl text-center min-w-[100px]">
              <div className="text-2xl font-black">{enterpriseTasks.length}</div>
              <div className="text-[11px] text-white/80 font-medium">Total Tasks</div>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 p-3 rounded-xl text-center min-w-[100px]">
              <div className="text-2xl font-black">{incomingApplications.length}</div>
              <div className="text-[11px] text-white/80 font-medium">Applicants</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border bg-card/60 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Task Budget
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span>Allocated across {enterpriseTasks.length} tasks</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border bg-card/60 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Open Tasks
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Briefcase className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTasksCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Accepting student applications</p>
          </CardContent>
        </Card>

        <Card className="border bg-card/60 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Applications
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAppsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting your hiring decision</p>
          </CardContent>
        </Card>

        <Card className="border bg-card/60 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Contracts
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedTasksCount}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress with students</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs defaultValue="tasks" className="w-full space-y-6">
        <div className="flex items-center justify-between border-b pb-2">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="tasks" className="gap-2 text-sm font-medium">
              <Layers className="h-4 w-4" />
              <span>Posted Tasks ({enterpriseTasks.length})</span>
            </TabsTrigger>
            <TabsTrigger value="applications" className="gap-2 text-sm font-medium relative">
              <Users className="h-4 w-4" />
              <span>Incoming Applications ({incomingApplications.length})</span>
              {pendingAppsCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Tasks Tab Content */}
        <TabsContent value="tasks" className="mt-0 space-y-8">
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Create Task Form Container */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <PlusCircle className="h-4 w-4" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">Post a New Task</h3>
              </div>
              <CreateTaskForm />
            </div>

            {/* Tasks List Container */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight">Your Task Listings</h3>
                <Badge variant="outline" className="text-xs">
                  Showing {enterpriseTasks.length} tasks
                </Badge>
              </div>

              {enterpriseTasks.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted/20">
                  <CardContent className="p-12 text-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                      <Inbox className="h-6 w-6" />
                    </div>
                    <h4 className="text-base font-semibold">No tasks posted yet</h4>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Use the form on the left to publish your first task and connect with qualified university students.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {enterpriseTasks.map((task) => (
                    <Card key={task.id} className="border bg-card/70 backdrop-blur hover:border-primary/50 transition-all duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <Badge variant="secondary" className="text-[11px] font-normal mb-1">
                              {task.category}
                            </Badge>
                            <CardTitle className="text-lg font-bold">{task.title}</CardTitle>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                            task.status === 'in_progress' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                            task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }`}>
                            {task.status === 'in_progress' ? 'Assigned' : 
                             task.status === 'completed' ? 'Completed' : 'Open'}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {task.description}
                        </p>
                        
                        {task.requiredSkills && task.requiredSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {task.requiredSkills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-[10px] bg-muted/30">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t text-sm font-semibold">
                          <span className="text-emerald-500 font-bold text-base">
                            ${task.budget.toLocaleString()}
                          </span>
                          <TaskActions task={task} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Applications Tab Content */}
        <TabsContent value="applications" className="mt-0 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight">Applicant Roster</h3>
            <p className="text-xs text-muted-foreground">
              Review student qualifications and issue formal contracts.
            </p>
          </div>

          {incomingApplications.length === 0 ? (
            <Card className="border-dashed border-2 bg-muted/20">
              <CardContent className="p-12 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h4 className="text-base font-semibold">No applications received yet</h4>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  When students apply to your open tasks, their detailed profiles and cover letters will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {incomingApplications.map((app) => (
                <Card key={app.id} className="border bg-card/70 backdrop-blur hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-base shadow">
                          {app.studentFirstName?.[0]}{app.studentLastName?.[0]}
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold">
                            {app.studentFirstName} {app.studentLastName}
                          </CardTitle>
                          <CardDescription className="text-xs text-muted-foreground">
                            Applied to: <span className="font-semibold text-foreground">{app.taskTitle}</span>
                          </CardDescription>
                        </div>
                      </div>

                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                        app.status === 'accepted' 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-muted/40 p-3 rounded-lg border border-border/50 text-xs text-muted-foreground italic leading-relaxed line-clamp-3">
                      "{app.coverLetter}"
                    </div>

                    {app.studentSkills && app.studentSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {app.studentSkills.slice(0, 4).map((s: string) => (
                          <Badge key={s} variant="secondary" className="text-[10px] px-2 py-0">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex-col gap-2 items-stretch border-t pt-3 bg-muted/10">
                    <StudentProfileDialog student={app} />
                    {app.status === 'pending' && (
                      <AcceptApplicationButton applicationId={app.id} />
                    )}
                    {app.status === 'accepted' && (
                      <div className="text-xs text-emerald-500 font-bold text-center py-1.5 bg-emerald-500/10 rounded-md border border-emerald-500/20 flex items-center justify-center gap-1.5">
                        <FileCheck2 className="h-4 w-4" /> Contract Active
                      </div>
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
