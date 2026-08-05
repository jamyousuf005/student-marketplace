'use client'

import { useState } from 'react'
import { createMilestone, updateMilestoneStatus } from '@/actions/milestones'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, CheckCircle2, Clock, Loader2, Flag } from 'lucide-react'

interface MilestoneItem {
  id: string
  contractId: string
  title: string
  description: string
  amount: number
  status: 'pending' | 'in_progress' | 'completed' | 'approved'
}

interface MilestoneListProps {
  contractId: string
  milestones: MilestoneItem[]
  isEnterprise: boolean
}

export function MilestoneList({ contractId, milestones, isEnterprise }: MilestoneListProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  async function handleAddMilestone(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append('contractId', contractId)

    try {
      const res = await createMilestone(formData)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Milestone added successfully!')
        setShowAddForm(false)
      }
    } catch (err) {
      toast.error('Failed to add milestone')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleStatusUpdate(milestoneId: string, nextStatus: 'pending' | 'in_progress' | 'completed' | 'approved') {
    try {
      const res = await updateMilestoneStatus(milestoneId, nextStatus)
      if (res.error) toast.error(res.error)
      else toast.success(`Milestone updated to ${nextStatus}`)
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Flag className="h-5 w-5 text-primary" /> Project Milestones
        </h3>
        {isEnterprise && (
          <Button size="sm" variant="outline" onClick={() => setShowAddForm(!showAddForm)} className="gap-1">
            <Plus className="h-4 w-4" /> {showAddForm ? 'Cancel' : 'Add Milestone'}
          </Button>
        )}
      </div>

      {/* Add Milestone Form */}
      {showAddForm && (
        <Card className="border-primary/20 bg-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Create New Milestone</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMilestone} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Milestone Title</Label>
                  <Input id="title" name="title" placeholder="e.g. Design Prototype Delivery" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input id="amount" name="amount" type="number" placeholder="500" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deliverables / Description</Label>
                <Textarea id="description" name="description" placeholder="Describe the required deliverables for this milestone..." rows={3} />
              </div>
              <Button type="submit" size="sm" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Milestone
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Milestones List */}
      {milestones.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-muted-foreground text-sm">
            No milestones configured for this contract yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {milestones.map((m) => (
            <Card key={m.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base">{m.title}</h4>
                  <Badge 
                    variant={
                      m.status === 'approved' ? 'success' :
                      m.status === 'completed' ? 'default' :
                      m.status === 'in_progress' ? 'secondary' : 'outline'
                    }
                    className="capitalize text-[11px]"
                  >
                    {m.status.replace('_', ' ')}
                  </Badge>
                </div>
                {m.description && (
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                )}
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <span className="font-bold text-emerald-500 text-lg">${m.amount}</span>
                <div className="flex gap-1">
                  {m.status === 'pending' && (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => handleStatusUpdate(m.id, 'in_progress')}>
                      Start Work
                    </Button>
                  )}
                  {m.status === 'in_progress' && (
                    <Button size="sm" variant="default" className="text-xs" onClick={() => handleStatusUpdate(m.id, 'completed')}>
                      Mark Submitted
                    </Button>
                  )}
                  {m.status === 'completed' && isEnterprise && (
                    <Button size="sm" variant="outline" className="text-xs border-emerald-500 text-emerald-500 hover:bg-emerald-500/10" onClick={() => handleStatusUpdate(m.id, 'approved')}>
                      Approve Deliverables
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
