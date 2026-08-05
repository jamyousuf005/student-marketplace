'use client'

import { useState } from 'react'
import { updateEnterpriseProfile } from '@/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Image as ImageIcon } from 'lucide-react'

export function EnterpriseProfileForm({ initialData }: { initialData: any }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      const result = await updateEnterpriseProfile(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Company profile updated successfully!')
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
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" name="companyName" defaultValue={initialData?.companyName || ''} required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" type="url" defaultValue={initialData?.website || ''} placeholder="https://example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo" className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4" /> Company Logo
            </Label>
            <Input id="logo" name="logo" type="file" accept="image/*" />
            {initialData?.logoUrl && (
              <p className="text-xs text-muted-foreground truncate">
                Current Logo: <a href={initialData.logoUrl} target="_blank" rel="noreferrer" className="underline">View Logo</a>
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Company Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              defaultValue={initialData?.description || ''} 
              placeholder="What does your company do?"
              className="min-h-[100px]" 
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
