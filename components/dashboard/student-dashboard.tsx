import { db } from '@/lib/db'
import { tasks, enterpriseProfiles, applications, studentProfiles } from '@/supabase/schema'
import { eq, desc } from 'drizzle-orm'
import { createClient } from '@/supabase/server'
import { TaskSearchList } from '@/components/dashboard/task-search-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Briefcase, CheckCircle2, DollarSign, Sparkles, Rocket } from 'lucide-react'

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
  let studentProfile = null
  
  if (user) {
    studentProfile = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, user.id)
    })
    
    if (studentProfile) {
      const myApplications = await db.select({ taskId: applications.taskId })
        .from(applications)
        .where(eq(applications.studentId, studentProfile.id))
        
      myApplications.forEach(app => appliedTaskIds.push(app.taskId))
    }
  }

  const totalAvailableBudget = recentTasks.reduce((acc, t) => acc + (t.budget || 0), 0)

  return (
    <div className="space-y-8 pb-12">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur border border-white/20">
              <GraduationCap className="h-3.5 w-3.5 text-amber-300" />
              <span>Student Developer Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome, {studentProfile ? studentProfile.firstName : 'Student'}!
            </h1>
            <p className="text-white/80 text-sm max-w-xl leading-relaxed">
              Explore real-world enterprise projects, apply with your verified skills, and earn income while building your professional portfolio.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur border border-white/20 p-3 rounded-xl text-center min-w-[110px]">
              <div className="text-2xl font-black">{recentTasks.length}</div>
              <div className="text-[11px] text-white/80 font-medium">Open Tasks</div>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 p-3 rounded-xl text-center min-w-[110px]">
              <div className="text-2xl font-black">{appliedTaskIds.length}</div>
              <div className="text-[11px] text-white/80 font-medium">My Applications</div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Analytics Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border bg-card/60 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Available Marketplace Pool
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAvailableBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total budget listed by enterprises</p>
          </CardContent>
        </Card>

        <Card className="border bg-card/60 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Applications
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appliedTaskIds.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Submitted task proposals</p>
          </CardContent>
        </Card>

        <Card className="border bg-card/60 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Verified Companies
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Rocket className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allEnterprises.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active client partners on platform</p>
          </CardContent>
        </Card>
      </div>

      {/* Task Search & Filter Grid */}
      <TaskSearchList 
        tasks={recentTasks} 
        enterpriseMap={enterpriseMap} 
        enterpriseUserIdMap={enterpriseUserIdMap}
        appliedTaskIds={appliedTaskIds} 
      />
    </div>
  )
}
