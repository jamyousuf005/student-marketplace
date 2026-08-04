import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5 [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>
      <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center gap-6">
        <div className="text-center space-y-2 mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground">The premier platform for student-enterprise collaboration.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
