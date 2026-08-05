'use client'

import { useState } from 'react'
import { createTask } from '@/actions/tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function CreateTaskForm() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    
    try {
      const result = await createTask(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Task created successfully!')
      }
    } catch (e) {
      toast.error('Failed to create task')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="e.g. Build a React component" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" required placeholder="Describe the task in detail..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input id="budget" name="budget" type="number" min="1" required placeholder="500" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" required placeholder="Web Development" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Required Skills (comma separated)</Label>
            <Input id="skills" name="skills" required placeholder="React, TypeScript, Tailwind" />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publish Task
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
