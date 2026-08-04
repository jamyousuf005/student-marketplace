import { db } from '@/lib/db'
import { contracts, milestones, tasks, applications, users, enterpriseProfiles, studentProfiles } from '@/supabase/schema'
import { eq, and } from 'drizzle-orm'
import { createClient } from '@/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { ReviewForm } from '@/components/dashboard/review-form'
import { CompleteTaskButton } from '@/components/dashboard/complete-task-button'

export default async function ContractMilestonesPage(context: { params: Promise<{ id: string }> | { id: string } }) {
  const params = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const contractData = await db.query.contracts.findFirst({
    where: eq(contracts.id, params.id),
  })

  if (!contractData) {
    return <div className="p-8 text-center text-destructive">Contract not found</div>
  }

  const applicationData = await db.query.applications.findFirst({
    where: eq(applications.id, contractData.applicationId),
  })

  if (!applicationData) {
    return <div className="p-8 text-center text-destructive">Application not found</div>
  }

  const taskData = await db.query.tasks.findFirst({
    where: eq(tasks.id, applicationData.taskId),
  })

  const contractMilestones = await db.query.milestones.findMany({
    where: eq(milestones.contractId, params.id),
  })

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id)
  })

  // Reviewee ID logic: if current user is student, reviewee is enterprise user.
  // Wait, I need the actual user ID of the other party.
  const enterpriseId = taskData?.enterpriseId;
  const studentId = applicationData?.studentId;

  // Let's get the enterprise userId and student userId
  const enterpriseUser = await db.query.enterpriseProfiles.findFirst({
    where: eq(enterpriseProfiles.id, enterpriseId!)
  })
  const studentUser = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.id, studentId!)
  })

  const revieweeId = dbUser?.role === 'student' ? enterpriseUser?.userId : studentUser?.userId;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Contract Milestones</h2>
        <p className="text-muted-foreground">Track deliverables and payments for this contract.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Milestone Timeline</CardTitle>
          <CardDescription>All project deliverables are tracked here.</CardDescription>
        </CardHeader>
        <CardContent>
          {contractMilestones.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              No milestones have been created for this contract yet.
            </div>
          ) : (
            <div className="space-y-4">
              {contractMilestones.map(m => (
                <div key={m.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{m.title}</h4>
                    <p className="text-sm text-muted-foreground">{m.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">${m.amount}</div>
                    <div className={`text-xs font-semibold uppercase ${m.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {m.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {taskData?.status === 'in_progress' && dbUser?.role === 'enterprise' && (
        <div className="flex justify-end">
          <CompleteTaskButton taskId={taskData.id} />
        </div>
      )}

      {taskData?.status === 'completed' && revieweeId && (
        <ReviewForm taskId={taskData.id} revieweeId={revieweeId} />
      )}
    </div>
  )
}
