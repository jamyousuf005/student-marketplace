"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { adminCancelTask } from "@/actions/admin"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function AdminTaskTable({ tasks }: { tasks: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleCancel(taskId: string) {
    setLoadingId(taskId)
    try {
      const result = await adminCancelTask(taskId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Task cancelled successfully")
      }
    } catch (e) {
      toast.error("Failed to cancel task")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted text-muted-foreground border-b">
          <tr>
            <th className="p-4 font-medium">Title</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium">Budget</th>
            <th className="p-4 font-medium">Created</th>
            <th className="p-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-muted/50">
              <td className="p-4 font-medium">{task.title}</td>
              <td className="p-4">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  task.status === "open" ? "bg-primary text-primary-foreground" : 
                  task.status === "cancelled" ? "bg-destructive text-destructive-foreground" : 
                  "bg-secondary text-secondary-foreground"
                }`}>
                  {task.status}
                </span>
              </td>
              <td className="p-4">${task.budget}</td>
              <td className="p-4">{new Date(task.createdAt).toLocaleDateString()}</td>
              <td className="p-4 text-right">
                {task.status !== "cancelled" && task.status !== "completed" && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleCancel(task.id)}
                    disabled={loadingId === task.id}
                  >
                    {loadingId === task.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cancel Task
                  </Button>
                )}
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
