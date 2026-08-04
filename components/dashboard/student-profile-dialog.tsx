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

export function StudentProfileDialog({ student }: { student: any }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" className="w-full mb-2" />}>
        View Profile
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{student.studentFirstName} {student.studentLastName}</DialogTitle>
          <DialogDescription>
            Applicant Profile
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="text-sm font-semibold mb-1">Bio</h4>
            <p className="text-sm text-muted-foreground">{student.studentBio || 'No bio provided.'}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Education</h4>
            <p className="text-sm text-muted-foreground">{student.studentEducation || 'No education provided.'}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {student.studentSkills && student.studentSkills.length > 0 ? (
                student.studentSkills.map((skill: string) => (
                  <span key={skill} className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No skills listed.</span>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
