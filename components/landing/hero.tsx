import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LayoutFreeform, ArrowRight, ShieldCheck, Zap, Briefcase, GraduationCap } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export function LandingHero() {
  return (
    <div className="relative overflow-hidden bg-background pt-4 sm:pt-8 pb-16 md:pb-32 border-b">
      {/* Background Gradients & Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-primary/20 via-emerald-500/10 to-transparent blur-3xl opacity-50 pointer-events-none" />

      {/* Ultra-Responsive Header Bar */}
      <header className="container mx-auto px-4 flex items-center justify-between h-16 mb-8 sm:mb-16 relative z-10">
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-primary to-emerald-500 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <LayoutFreeform className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <span className="font-extrabold text-sm sm:text-xl tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent hidden min-[360px]:inline">
            Student Marketplace
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <ThemeToggle />
          <Link href="/login" className="hidden sm:inline-block">
            <Button variant="ghost" size="sm" className="font-medium text-xs sm:text-sm px-3">
              Sign In
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 gap-1">
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Hero Content */}
      <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
        <Badge variant="outline" className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-primary/10 border-primary/20 text-primary mb-4 sm:mb-6 animate-pulse max-w-full truncate inline-flex items-center justify-center">
          <Zap className="h-3.5 w-3.5 mr-1.5 shrink-0 text-primary" />
          <span className="truncate">Enterprise-Grade University Talent Network</span>
        </Badge>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] mb-4 sm:mb-6">
          Connect Top University Talent with{' '}
          <span className="bg-gradient-to-r from-primary via-purple-500 to-emerald-400 bg-clip-text text-transparent">
            Enterprise Opportunities
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
          The all-in-one platform for companies to publish professional tasks, review verified student portfolios, manage milestones, and execute automated contracts seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25">
              <Briefcase className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Post a Project
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold border-muted-foreground/20 hover:bg-accent">
              <GraduationCap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Find Student Tasks
            </Button>
          </Link>
        </div>

        {/* Responsive Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-left max-w-3xl mx-auto pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 sm:bg-transparent">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-medium text-muted-foreground">Automated PDF Contracts</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 sm:bg-transparent">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-medium text-muted-foreground">Milestone Payments</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 sm:bg-transparent">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-medium text-muted-foreground">Direct Real-Time Chat</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 sm:bg-transparent">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-medium text-muted-foreground">Verified Student Skills</span>
          </div>
        </div>
      </div>
    </div>
  )
}
