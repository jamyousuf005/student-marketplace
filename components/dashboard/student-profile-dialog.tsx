'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, MessageSquare, ExternalLink, GraduationCap, User, Sparkles } from "lucide-react"
import Link from "next/link"

export function StudentProfileDialog({ student }: { student: any }) {
  const hasResume = !!student.studentResumeUrl

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" className="w-full gap-1" />}>
        <User className="h-4 w-4" /> View Full Applicant Profile & CV
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>{student.studentFirstName} {student.studentLastName}</span>
            {hasResume && (
              <Badge variant="success" className="text-xs">
                Resume Attached
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Applicant Profile & Applied Proposal for <strong>{student.taskTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Cover Letter / Proposal */}
          <div className="space-y-1.5 bg-primary/5 p-4 rounded-lg border border-primary/10">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Proposal / Cover Letter
            </h4>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {student.coverLetter || 'No cover letter provided.'}
            </p>
          </div>

          {/* Education / Experience */}
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5" /> Education & Background
            </h4>
            <p className="text-sm text-foreground bg-muted/30 p-3 rounded-md border">
              {student.studentEducation || 'No education background listed.'}
            </p>
          </div>

          {/* Bio */}
          {student.studentBio && (
            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bio</h4>
              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border">
                {student.studentBio}
              </p>
            </div>
          )}

          {/* Skills */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Listed Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {student.studentSkills && student.studentSkills.length > 0 ? (
                student.studentSkills.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No skills listed.</span>
              )}
            </div>
          </div>

          {/* Resume PDF Download / View Section */}
          <div className="pt-2 border-t space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Applicant Resume / CV</h4>
            {hasResume ? (
              <a
                href={student.studentResumeUrl}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <Button variant="default" className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                  <FileText className="h-4 w-4" /> View & Download Full Resume (PDF) <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            ) : (
              <div className="p-3 bg-muted/30 rounded-md border text-center text-xs text-muted-foreground">
                No resume file attached with this application.
              </div>
            )}

            {/* Direct Message Button */}
            {student.studentUserId && (
              <Link href={`/dashboard/messages?recipientId=${student.studentUserId}`} className="block">
                <Button variant="outline" className="w-full gap-2 text-xs">
                  <MessageSquare className="h-4 w-4 text-primary" /> Send Direct Message to Applicant
                </Button>
              </Link>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
