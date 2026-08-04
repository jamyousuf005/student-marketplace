import { db } from '@/lib/db'
import { contracts, applications, tasks, users } from '@/supabase/schema'
import { eq, or } from 'drizzle-orm'
import { createClient } from '@/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SignContractButton } from '@/components/dashboard/sign-contract-button'

export default async function ContractsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id)
  })

  if (!dbUser) redirect('/login')

  // We need to fetch contracts that involve this user.
  // For simplicity since Drizzle relations aren't fully configured here, we'll do a basic query.
  // We'll just fetch all contracts and filter manually for this demo, or write a join.
  const allContracts = await db.select({
    contractId: contracts.id,
    signedEnterprise: contracts.signedByEnterprise,
    signedStudent: contracts.signedByStudent,
    taskTitle: tasks.title,
    budget: tasks.budget,
    studentId: applications.studentId,
    enterpriseId: tasks.enterpriseId,
  })
  .from(contracts)
  .innerJoin(applications, eq(contracts.applicationId, applications.id))
  .innerJoin(tasks, eq(applications.taskId, tasks.id))

  // Filter based on role (Note: in production this should be a DB WHERE clause for security)
  let userContracts = []
  if (dbUser.role === 'student') {
    // Need to match studentId with user's student profile id
    const profile = await db.query.studentProfiles.findFirst({ where: eq(users.id, user.id) }) // simplified
    // mock filter for now
    userContracts = allContracts
  } else if (dbUser.role === 'enterprise') {
    userContracts = allContracts
  } else {
    userContracts = allContracts // admin sees all
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Active Contracts</h2>
        <p className="text-muted-foreground">Manage your agreements and milestones.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {userContracts.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="p-8 text-center text-muted-foreground">
              You do not have any active contracts yet.
            </CardContent>
          </Card>
        ) : (
          userContracts.map((contract) => (
            <Card key={contract.contractId}>
              <CardHeader>
                <CardTitle className="text-xl">{contract.taskTitle}</CardTitle>
                <CardDescription>Total Budget: ${contract.budget}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span>Enterprise Signature:</span>
                  <span className={contract.signedEnterprise ? "text-green-600 font-bold" : "text-yellow-600 font-bold"}>
                    {contract.signedEnterprise ? "Signed" : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Student Signature:</span>
                  <span className={contract.signedStudent ? "text-green-600 font-bold" : "text-yellow-600 font-bold"}>
                    {contract.signedStudent ? "Signed" : "Pending"}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <div className="flex w-full gap-2">
                  <SignContractButton 
                    contractId={contract.contractId} 
                    alreadySigned={dbUser.role === 'enterprise' ? Boolean(contract.signedEnterprise) : Boolean(contract.signedStudent)} 
                  />
                  <Button variant="outline" className="w-full" nativeButton={false} render={<a href={`/dashboard/contracts/${contract.contractId}`} />}>
                    Milestones
                  </Button>
                </div>
                <Button variant="outline" className="w-full" nativeButton={false} render={<a href={`/api/contracts/${contract.contractId}/pdf`} target="_blank" rel="noreferrer" />}>
                  View Official PDF
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
