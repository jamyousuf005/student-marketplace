'use client'

import { useState } from 'react'
import { submitApplicationForm } from '@/actions/tasks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Upload, FileCheck, CheckCircle2, Send, User, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface TaskApplicationFormProps {
  taskId: string
  taskTitle: string
  hasApplied: boolean
  taskStatus: string
  studentProfile?: {
    firstName: string
    lastName: string
    bio?: string | null
    education?: string | null
    skills?: string[] | null
    resumeUrl?: string | null
  } | null
}

export function TaskApplicationForm({
  taskId,
  taskTitle,
  hasApplied,
  taskStatus,
  studentProfile,
}: TaskApplicationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [applied, setApplied] = useState(hasApplied)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  if (applied) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-6 text-center space-y-3">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
          <h3 className="text-xl font-bold text-emerald-500">Application Submitted!</h3>
          <p className="text-sm text-muted-foreground">
            You have successfully applied for <strong>{taskTitle}</strong>. The hiring company will review your proposal and respond.
          </p>
          <div className="pt-2">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">Return to Marketplace</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (taskStatus !== 'open') {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          This task is currently <strong>{taskStatus.replace('_', ' ')}</strong> and no longer accepting applications.
        </CardContent>
      </Card>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('taskId', taskId)

    try {
      const res = await submitApplicationForm(formData)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Application submitted successfully!')
        setApplied(true)
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Send className="h-5 w-5 text-primary" /> Apply for this Opportunity
        </CardTitle>
        <CardDescription>
          Submit your proposal, confirm your qualifications, and attach your resume.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Info Summary */}
          <div className="p-4 rounded-lg bg-muted/40 border space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4 text-primary" /> Applicant Details
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block">Name:</span>
                <span className="font-medium text-foreground">
                  {studentProfile?.firstName || 'Student'} {studentProfile?.lastName || 'User'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Education:</span>
                <span className="font-medium text-foreground">
                  {studentProfile?.education || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Proposal / Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter" className="font-medium flex items-center justify-between">
              <span>Proposal & Cover Letter <span className="text-destructive">*</span></span>
              <span className="text-xs text-muted-foreground">Min 10 characters</span>
            </Label>
            <Textarea
              id="coverLetter"
              name="coverLetter"
              required
              rows={5}
              placeholder="Introduce yourself, explain why you are the ideal candidate for this task, and outline your relevant skills..."
              className="resize-none"
            />
          </div>

          {/* Skills & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience">Relevant Experience / Education</Label>
              <Input
                id="experience"
                name="experience"
                defaultValue={studentProfile?.education || ''}
                placeholder="e.g. BS Computer Science - 3rd Year"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input
                id="skills"
                name="skills"
                defaultValue={studentProfile?.skills?.join(', ') || ''}
                placeholder="React, TypeScript, Python"
              />
            </div>
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <Label htmlFor="resume" className="font-medium flex items-center gap-1">
              <Upload className="h-4 w-4 text-primary" /> Attach / Update Resume (PDF)
            </Label>
            
            <div className="flex items-center gap-3">
              <Input
                id="resume"
                name="resume"
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="cursor-pointer file:cursor-pointer"
              />
            </div>

            {studentProfile?.resumeUrl && !selectedFile && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileCheck className="h-3.5 w-3.5 text-emerald-500" /> Existing resume attached:{' '}
                <a href={studentProfile.resumeUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                  View Current Resume PDF
                </a>
              </p>
            )}

            {selectedFile && (
              <Badge variant="success" className="text-xs py-1">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </Badge>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full font-semibold gap-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Submitting Application...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" /> Submit Application
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
