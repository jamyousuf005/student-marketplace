'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { deleteTask, updateTask } from '@/actions/tasks'
import { toast } from 'sonner'
import { Trash2, Edit2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

export function TaskActions({ task }: { task: any }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return
    setIsDeleting(true)
    try {
      const result = await deleteTask(task.id)
      if (result.error) toast.error(result.error)
      else toast.success('Task deleted')
    } catch (e) {
      toast.error('Failed to delete task')
    } finally {
      setIsDeleting(false)
      router.refresh()
    }
  }

  const handleEdit = async (formData: FormData) => {
    setIsEditing(true)
    try {
      const result = await updateTask(task.id, formData)
      if (result.error) toast.error(result.error)
      else {
        toast.success('Task updated')
        setOpen(false)
        router.refresh()
      }
    } catch (e) {
      toast.error('Failed to update task')
    } finally {
      setIsEditing(false)
    }
  }

  return (
    <div className="flex items-center gap-2 mt-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="outline" size="sm" className="flex-1" />}>
          <Edit2 className="w-4 h-4 mr-2" /> Edit
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update your task details.</DialogDescription>
          </DialogHeader>
          <form action={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={task.title} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={task.description} required />
            </div>
            <div>
              <Label htmlFor="budget">Budget ($)</Label>
              <Input id="budget" name="budget" type="number" defaultValue={task.budget} required />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={task.category} required />
            </div>
            <div>
              <Label htmlFor="skills">Required Skills (comma separated)</Label>
              <Input id="skills" name="skills" defaultValue={task.requiredSkills?.join(', ')} />
            </div>
            <Button type="submit" className="w-full" disabled={isEditing}>
              {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting} className="flex-1">
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4 mr-2" /> Delete</>}
      </Button>
    </div>
  )
}
