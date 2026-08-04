import { redirect } from 'next/navigation'
import { createClient } from '@/supabase/server'
import { Button } from '@/components/ui/button'
import { signout } from '@/actions/auth'
import { db } from '@/lib/db'
import { messages } from '@/supabase/schema'
import { eq, and } from 'drizzle-orm'
import { users } from '@/supabase/schema'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id)
  })

  const unreadMessages = await db.select().from(messages).where(and(
    eq(messages.receiverId, user.id),
    eq(messages.read, false)
  ))
  const unreadCount = unreadMessages.length

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="font-bold text-lg">Marketplace</div>
            <nav className="flex items-center space-x-4 text-sm font-medium">
              <a href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">Dashboard</a>
              <a href="/dashboard/contracts" className="transition-colors hover:text-foreground/80 text-foreground/60">Contracts</a>
              <a href="/dashboard/messages" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1">
                Messages
                {unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </a>
              <a href="/dashboard/profile" className="transition-colors hover:text-foreground/80 text-foreground/60">Profile</a>
              {dbUser?.role === 'admin' && (
                <a href="/dashboard/admin" className="transition-colors hover:text-foreground/80 text-primary font-bold">Admin</a>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <form action={signout}>
              <Button type="submit" variant="outline" size="sm">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto py-6">
        {children}
      </main>
    </div>
  )
}
