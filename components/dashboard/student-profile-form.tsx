'use client'

import { useState } from 'react'
import { updateStudentProfile } from '@/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function StudentProfileForm({ initialData }: { initialData: any }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      const result = await updateStudentProfile(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Profile updated successfully!')
      }
    } catch (e) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" defaultValue={initialData?.firstName || ''} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" defaultValue={initialData?.lastName || ''} required />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio" 
              name="bio" 
              defaultValue={initialData?.bio || ''} 
              placeholder="Tell us a little bit about yourself..."
              className="min-h-[100px]" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Input id="education" name="education" defaultValue={initialData?.education || ''} placeholder="University Name, Degree" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Input 
              id="skills" 
              name="skills" 
              defaultValue={initialData?.skills?.join(', ') || ''} 
              placeholder="React, Next.js, TypeScript" 
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
