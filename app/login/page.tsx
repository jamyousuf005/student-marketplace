import { LoginForm } from '@/components/auth/login-form'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutFreeform, ShieldCheck, Zap, ArrowLeft } from 'lucide-react'

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
        <div className="relative z-10 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/30">
              <LayoutFreeform className="h-5 w-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Student Marketplace
            </span>
          </div>

          <div className="space-y-2.5 max-w-lg">

            <h2 className="text-2xl xl:text-3xl font-extrabold tracking-tight leading-snug">
              Where Top Students Meet Enterprise Projects.
            </h2>

          </div>
        </div>

        {/* High-Resolution SVG Illustration Showcase */}
        <div className="relative z-10 my-auto py-6 flex items-center justify-center">
          <div className="relative w-full max-w-md p-2 rounded-3xl bg-white/5 backdrop-blur border border-white/10 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <Image
              src="/signin-illustration.png"
              alt="Student & Enterprise Collaboration Workspace"
              width={650}
              height={620}
              priority
              className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Testimonial Quote & Footer */}
        <div className="relative z-10 space-y-4">
          {/* <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur border border-white/15 text-xs text-slate-200 leading-relaxed italic">
            "The marketplace streamlined our contract generation and allowed us to onboard talented student engineers within hours."
            <div className="not-italic font-bold text-white mt-1.5 flex items-center justify-between">
              <span>— Director of Engineering, TechScale</span>
              <div className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="text-[10px] text-slate-300">Verified Partner</span>
              </div>
            </div>
          </div> */}

          <div className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} Enterprise Student Marketplace. All rights reserved.
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
