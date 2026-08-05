import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/supabase/server'
import { Button } from '@/components/ui/button'
import { signout } from '@/actions/auth'
import { db } from '@/lib/db'
import { messages, users } from '@/supabase/schema'
import { eq, and } from 'drizzle-orm'
import { getUserNotifications } from '@/services/notification-service'
import { NotificationBell } from '@/components/dashboard/notification-bell'
import { ThemeToggle } from '@/components/theme-toggle'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import Link from 'next/link'

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

  let dbUser = null
  let unreadCount = 0
  let notifications: any[] = []

  try {
    dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id)
    })

    const unreadMessages = await db.select({ id: messages.id })
      .from(messages)
      .where(and(
        eq(messages.receiverId, user.id),
        eq(messages.read, false)
      ))
    unreadCount = unreadMessages.length

    notifications = await getUserNotifications(user.id)
  } catch (err) {
    console.error('Error in DashboardLayout data fetching:', err)
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-bold text-lg text-primary tracking-tight">
              Marketplace
            </Link>
            <nav className="hidden md:flex items-center space-x-4 text-sm font-medium">
              <Link href="/dashboard" className="transition-colors hover:text-foreground text-foreground/70">
                Dashboard
              </Link>
              <Link href="/dashboard/contracts" className="transition-colors hover:text-foreground text-foreground/70">
                Contracts
              </Link>
              <Link href="/dashboard/messages" className="transition-colors hover:text-foreground text-foreground/70 flex items-center gap-1.5">
                Messages
                {unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/dashboard/profile" className="transition-colors hover:text-foreground text-foreground/70">
                Profile
              </Link>
              {dbUser?.role === 'admin' && (
                <Link href="/dashboard/admin" className="transition-colors hover:text-primary text-primary font-bold">
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell notifications={notifications} />
            <ThemeToggle />
            <span className="text-xs text-muted-foreground hidden lg:inline">{user.email}</span>
            <div className="hidden md:block">
              <form action={signout}>
                <Button type="submit" variant="outline" size="sm" className="text-xs">
                  Sign Out
                </Button>
              </form>
            </div>
            <MobileNav userEmail={user.email || ''} isAdmin={dbUser?.role === 'admin'} unreadCount={unreadCount} />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  )
}
