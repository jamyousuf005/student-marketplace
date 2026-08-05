import { db } from '@/lib/db'
import { tasks, enterpriseProfiles, studentProfiles, applications } from '@/supabase/schema'
import { eq, and } from 'drizzle-orm'
import { createClient } from '@/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TaskApplicationForm } from '@/components/dashboard/task-application-form'
import { DollarSign, Tag, Building2, ArrowLeft, Calendar, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface TaskPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TaskDetailPage({ params }: TaskPageProps) {
  const { id: taskId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId)
  })

  if (!task) {
    notFound()
  }

  const enterprise = await db.query.enterpriseProfiles.findFirst({
    where: eq(enterpriseProfiles.id, task.enterpriseId)
  })

  const student = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, user.id)
  })

  let hasApplied = false
  if (student) {
    const existingApp = await db.query.applications.findFirst({
      where: and(
        eq(applications.taskId, task.id),
        eq(applications.studentId, student.id)
      )
    })
    hasApplied = !!existingApp
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Opportunities
          </Button>
        </Link>
      </div>

      {/* Task Details Header */}
      <Card className="border-primary/20 shadow-md">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" /> {task.category}
                </Badge>
                <Badge 
                  variant={task.status === 'open' ? 'success' : 'secondary'} 
                  className="capitalize"
                >
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold">{task.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm mt-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{enterprise?.companyName || 'Enterprise Partner'}</span>
                {enterprise?.website && (
                  <a 
                    href={enterprise.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-primary hover:underline text-xs"
                  >
                    Visit Website
                  </a>
                )}
              </CardDescription>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-right">
              <span className="text-xs text-muted-foreground block font-medium">Agreed Budget</span>
              <span className="text-2xl font-bold text-emerald-500 flex items-center justify-end">
                <DollarSign className="h-5 w-5" />{task.budget.toLocaleString()}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 border-t pt-6">
          {/* Required Skills */}
          {task.requiredSkills && task.requiredSkills.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {task.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1 text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Overview & Deliverables</h4>
            <div className="text-sm leading-relaxed text-foreground whitespace-pre-line bg-muted/20 p-4 rounded-lg border">
              {task.description}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Posted on {new Date(task.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified Enterprise Partner
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Application Form */}
      <TaskApplicationForm
        taskId={task.id}
        taskTitle={task.title}
        hasApplied={hasApplied}
        taskStatus={task.status}
        studentProfile={student}
      />
    </div>
  )
}
