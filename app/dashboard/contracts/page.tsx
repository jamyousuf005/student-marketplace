import { db } from '@/lib/db'
import { contracts, applications, tasks, users, studentProfiles, enterpriseProfiles } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '@/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SignContractButton } from '@/components/dashboard/sign-contract-button'
import { CompleteTaskButton } from '@/components/dashboard/complete-task-button'
import { ReviewForm } from '@/components/dashboard/review-form'
import { FileText, CheckCircle2, Clock, DollarSign, Award } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function ContractsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id)
  })

  if (!dbUser) redirect('/login')

  const student = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, user.id)
  })

  const enterprise = await db.query.enterpriseProfiles.findFirst({
    where: eq(enterpriseProfiles.userId, user.id)
  })

  // Fetch all contracts with relations
  const allContracts = await db.select({
    contractId: contracts.id,
    pdfUrl: contracts.pdfUrl,
    signedEnterprise: contracts.signedByEnterprise,
    signedStudent: contracts.signedByStudent,
    createdAt: contracts.createdAt,
    taskId: tasks.id,
    taskTitle: tasks.title,
    taskStatus: tasks.status,
    budget: tasks.budget,
    studentId: applications.studentId,
    enterpriseId: tasks.enterpriseId,
    studentUserId: studentProfiles.userId,
    enterpriseUserId: enterpriseProfiles.userId,
  })
  .from(contracts)
  .innerJoin(applications, eq(contracts.applicationId, applications.id))
  .innerJoin(tasks, eq(applications.taskId, tasks.id))
  .innerJoin(studentProfiles, eq(applications.studentId, studentProfiles.id))
  .innerJoin(enterpriseProfiles, eq(tasks.enterpriseId, enterpriseProfiles.id))

  // Filter based on logged-in user
  let userContracts = allContracts
  if (dbUser.role === 'student' && student) {
    userContracts = allContracts.filter(c => c.studentId === student.id)
  } else if (dbUser.role === 'enterprise' && enterprise) {
    userContracts = allContracts.filter(c => c.enterpriseId === enterprise.id)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Active Contracts & Milestones</h2>
        <p className="text-muted-foreground">Review assignment contracts, digital signatures, and milestone deliverables.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {userContracts.length === 0 ? (
          <Card className="col-span-2 border-dashed p-8 text-center text-muted-foreground space-y-2">
            <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <h3 className="text-base font-semibold">No contracts found</h3>
            <p className="text-xs">Once an enterprise accepts an application, the generated assignment contract will appear here.</p>
          </Card>
        ) : (
          userContracts.map((contract) => {
            const bothSigned = contract.signedEnterprise && contract.signedStudent
            const isEnterprise = dbUser.role === 'enterprise'
            const targetRevieweeId = isEnterprise ? contract.studentUserId : contract.enterpriseUserId

            return (
              <Card key={contract.contractId} className="flex flex-col border-primary/20 shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-2 text-xs">
                        Contract #{contract.contractId.slice(0, 8)}
                      </Badge>
                      <CardTitle className="text-xl font-bold line-clamp-1">{contract.taskTitle}</CardTitle>
                    </div>
                    <span className="font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-sm">
                      ${contract.budget.toLocaleString()}
                    </span>
                  </div>
                  <CardDescription className="text-xs">
                    Status: <strong className="capitalize">{contract.taskStatus.replace('_', ' ')}</strong>
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  {/* Digital Signature Status */}
                  <div className="p-3 bg-muted/30 rounded-lg border space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span>Enterprise Client Signature:</span>
                      <span className={contract.signedEnterprise ? "text-emerald-500 font-bold flex items-center gap-1" : "text-amber-500 font-medium"}>
                        {contract.signedEnterprise ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        {contract.signedEnterprise ? "Signed" : "Pending Signature"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Student Candidate Signature:</span>
                      <span className={contract.signedStudent ? "text-emerald-500 font-bold flex items-center gap-1" : "text-amber-500 font-medium"}>
                        {contract.signedStudent ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        {contract.signedStudent ? "Signed" : "Pending Signature"}
                      </span>
                    </div>
                  </div>

                  {/* Task Actions when fully signed */}
                  {bothSigned && isEnterprise && contract.taskStatus !== 'completed' && (
                    <div className="pt-2">
                      <CompleteTaskButton taskId={contract.taskId} />
                    </div>
                  )}

                  {/* Review submission when completed */}
                  {bothSigned && contract.taskStatus === 'completed' && targetRevieweeId && (
                    <div className="pt-2 border-t">
                      <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-amber-500" /> Post Feedback & Rating
                      </h4>
                      <ReviewForm taskId={contract.taskId} revieweeId={targetRevieweeId} />
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col gap-2 border-t pt-4 bg-muted/10">
                  <div className="w-full flex gap-2">
                    <SignContractButton 
                      contractId={contract.contractId} 
                      alreadySigned={isEnterprise ? Boolean(contract.signedEnterprise) : Boolean(contract.signedStudent)} 
                    />
                  </div>

                  {contract.pdfUrl && (
                    <a href={contract.pdfUrl} target="_blank" rel="noreferrer" className="w-full">
                      <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                        <FileText className="h-4 w-4 text-primary" /> View Official Contract Document
                      </Button>
                    </a>
                  )}
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
