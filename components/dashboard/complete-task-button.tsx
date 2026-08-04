"use client"

import { useState } from "react"
import { completeTask } from "@/actions/reviews"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle } from "lucide-react"

export function CompleteTaskButton({ taskId }: { taskId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleComplete() {
    setLoading(true)
    try {
      const result = await completeTask(taskId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Task marked as completed!")
      }
    } catch (e) {
      toast.error("Failed to complete task")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleComplete} disabled={loading} className="w-full sm:w-auto">
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle className="mr-2 h-4 w-4" />
      )}
      Mark Task as Completed
    </Button>
  )
}
