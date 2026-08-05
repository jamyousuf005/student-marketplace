import { db } from '@/lib/db'
import { contracts, milestones, applications, tasks, users, studentProfiles, enterpriseProfiles } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '@/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, CheckCircle2, Clock, DollarSign, Plus, Flag } from 'lucide-react'
import Link from 'next/link'
import { MilestoneList } from '@/components/dashboard/milestone-list'

interface ContractDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ContractDetailPage({ params }: ContractDetailPageProps) {
  const { id: contractId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id)
  })
  if (!dbUser) redirect('/login')

  const contract = await db.query.contracts.findFirst({
    where: eq(contracts.id, contractId)
  })
  if (!contract) notFound()

  const application = await db.query.applications.findFirst({
    where: eq(applications.id, contract.applicationId)
  })
  if (!application) notFound()

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, application.taskId)
  })
  if (!task) notFound()

  const contractMilestones = await db.query.milestones.findMany({
    where: eq(milestones.contractId, contractId)
  })

  const isEnterprise = dbUser.role === 'enterprise'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/contracts">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Active Contracts
          </Button>
        </Link>
      </div>

      <Card className="border-primary/20 shadow-md">
        <CardHeader>
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <Badge variant="outline" className="mb-2 text-xs">
                Contract #{contract.id.slice(0, 8)}
              </Badge>
              <CardTitle className="text-2xl font-bold">{task.title}</CardTitle>
              <CardDescription>
                Category: {task.category} • Task Status: <strong className="capitalize">{task.status.replace('_', ' ')}</strong>
              </CardDescription>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-right">
              <span className="text-xs text-muted-foreground block font-medium">Total Contract Budget</span>
              <span className="text-2xl font-bold text-emerald-500 flex items-center justify-end">
                <DollarSign className="h-5 w-5" />{task.budget.toLocaleString()}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 border-t pt-6">
          <MilestoneList
            contractId={contract.id}
            milestones={contractMilestones}
            isEnterprise={isEnterprise}
          />
        </CardContent>
      </Card>
    </div>
  )
}
