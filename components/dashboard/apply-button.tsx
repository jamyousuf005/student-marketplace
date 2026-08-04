'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { applyToTask } from '@/actions/tasks'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function ApplyButton({ taskId, hasApplied = false, taskStatus = 'open' }: { taskId: string, hasApplied?: boolean, taskStatus?: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [applied, setApplied] = useState(hasApplied)

  const handleApply = async () => {
    setIsLoading(true)
    try {
      const result = await applyToTask(taskId, "I am very interested in this task and have the required skills.")
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Successfully applied to task!")
        setApplied(true)
      }
    } catch (e) {
      toast.error("Failed to apply")
    } finally {
      setIsLoading(false)
    }
  }

  if (taskStatus === 'in_progress' || taskStatus === 'completed') {
    return <Button className="w-full" disabled variant="outline">Already Assigned</Button>
  }

  if (applied) {
    return <Button className="w-full" disabled variant="secondary">Applied</Button>
  }

  return (
    <Button className="w-full" onClick={handleApply} disabled={isLoading}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Quick Apply
    </Button>
  )
}
