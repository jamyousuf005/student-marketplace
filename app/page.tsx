import { createClient } from '@/supabase/server'
import { LandingHero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { StatsSection } from '@/components/landing/stats-section'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {user && (
        <div className="bg-primary/10 border-b border-primary/20 py-2.5 px-4 text-center text-xs sm:text-sm font-medium text-primary flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <span className="truncate max-w-full">Welcome back! Logged in as {user.email}.</span>
          <Link href="/dashboard" className="shrink-0">
            <Button size="sm" className="h-7 px-3 text-xs gap-1 bg-primary text-primary-foreground">
              Go to Dashboard <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      )}

      <main className="flex-1">
        <LandingHero />
        <HowItWorks />
        <StatsSection />
      </main>

      <footer className="border-t py-8 bg-muted/20 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Enterprise Student Marketplace. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:underline">Login</Link>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
