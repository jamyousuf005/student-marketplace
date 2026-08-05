'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FilePlus, 
  Search, 
  UserCheck, 
  FileCheck2, 
  Layers, 
  Star,
  ArrowRight,
  Building2,
  GraduationCap,
  CheckCircle2
} from 'lucide-react'

export function HowItWorks() {
  const [roleMode, setRoleMode] = useState<'enterprise' | 'student'>('enterprise')

  const enterpriseSteps = [
    {
      step: '01',
      icon: FilePlus,
      title: 'Post a Task',
      description: 'Define your project scope, budget, required tech stack, and deadlines in under 2 minutes.',
      tag: 'Step 1'
    },
    {
      step: '02',
      icon: UserCheck,
      title: 'Review Candidates',
      description: 'Evaluate student applicant profiles, resumes, education history, and cover letter proposals.',
      tag: 'Step 2'
    },
    {
      step: '03',
      icon: FileCheck2,
      title: 'Execute Contract',
      description: 'Select a student to automatically generate formal legal PDF contracts with dual digital signatures.',
      tag: 'Step 3'
    },
    {
      step: '04',
      icon: Layers,
      title: 'Approve Milestones',
      description: 'Track progress via milestone checkpoints, communicate live, and approve final deliverables.',
      tag: 'Step 4'
    },
  ]

  const studentSteps = [
    {
      step: '01',
      icon: Search,
      title: 'Discover Opportunities',
      description: 'Filter real enterprise projects by technology category, budget thresholds, and required skills.',
      tag: 'Step 1'
    },
    {
      step: '02',
      icon: FilePlus,
      title: 'Submit Proposal',
      description: 'Apply with your verified student profile, showcase past work, and attach a customized cover letter.',
      tag: 'Step 2'
    },
    {
      step: '03',
      icon: FileCheck2,
      title: 'Sign Legal Contract',
      description: 'Review contract terms, digitally sign your assignment contract, and begin project work.',
      tag: 'Step 3'
    },
    {
      step: '04',
      icon: Star,
      title: 'Earn & Build Reputation',
      description: 'Complete project milestones, receive direct earnings, and build 5-star ratings on your profile.',
      tag: 'Step 4'
    },
  ]

  const steps = roleMode === 'enterprise' ? enterpriseSteps : studentSteps

  return (
    <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-purple-600/15 via-primary/15 to-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border-purple-500/30 text-purple-300 mb-4">
            Interactive Step-By-Step Process
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
            How The Marketplace Works
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Connecting university developers with leading companies through a transparent 4-step collaborative journey.
          </p>

          {/* Dual Role Selector Tabs */}
          <div className="inline-flex p-1.5 rounded-2xl bg-white/10 backdrop-blur border border-white/15 mt-8">
            <button
              onClick={() => setRoleMode('enterprise')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                roleMode === 'enterprise'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>For Enterprise Clients</span>
            </button>
            <button
              onClick={() => setRoleMode('student')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                roleMode === 'student'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>For University Students</span>
            </button>
          </div>
        </div>

        {/* Process Stepper Flow Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon
            const isLast = idx === steps.length - 1
            return (
              <div key={idx} className="relative group">
                {/* Horizontal Connector Line for Desktop */}
                {!isLast && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-[2px] bg-gradient-to-r from-purple-500/40 to-transparent -translate-x-6 z-0" />
                )}

                <div className="h-full p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between relative z-10 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-purple-500/10">
                  <div>
                    {/* Step badge & icon */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-3xl font-black font-mono text-white/20 group-hover:text-purple-400/50 transition-colors">
                        {item.step}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-purple-400 mb-1 uppercase tracking-wider">
                      {item.tag}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center text-xs font-medium text-emerald-400 gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Verified Milestone</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
