import { LoginForm } from '@/components/auth/login-form'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutFreeform, ArrowLeft, ShieldCheck, Zap } from 'lucide-react'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-background relative overflow-hidden">
      {/* Background Ambient Spheres */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Controls (Theme Toggle & Back Link) */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors bg-background/80 backdrop-blur px-3.5 py-1.5 rounded-full border border-border/50 shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>

        <div className="bg-background/80 backdrop-blur rounded-full border border-border/50 shadow-sm p-0.5">
          <ThemeToggle />
        </div>
      </div>

      {/* Left Visual Showcase Panel (Desktop lg:flex) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-10 xl:p-12 text-white flex-col justify-between overflow-hidden border-r border-border/20">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-primary/30 to-emerald-500/20 rounded-full blur-3xl opacity-60 pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/30">
              <LayoutFreeform className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Student Marketplace
            </span>
          </div>

          <div className="space-y-2 max-w-lg">
            <h2 className="text-2xl xl:text-3xl font-extrabold tracking-tight leading-snug">
              Where Top Students Meet Enterprise Projects.
            </h2>
          </div>
        </div>

        {/* Visual Showcase Image */}
        <div className="relative z-10 my-auto py-4 flex items-center justify-center">
          <div className="relative w-full  rounded-2xl overflow-hidden border border-white/15 shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent z-10 pointer-events-none" />
            <Image
              src="/login-img (2).jpg"
              alt="Enterprise Student Marketplace Collaboration"
              width={600}
              height={600}
              priority
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>© {new Date().getFullYear()} Enterprise Student Marketplace.</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="h-4 w-4" />
            <span>Verified Talent Platform</span>
          </div>
        </div>
      </div>

      {/* Right Form Container (Mobile & Desktop) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 pt-20 lg:pt-12 min-h-screen relative z-10">
        <LoginForm />
      </div>
    </main>
  )
}
