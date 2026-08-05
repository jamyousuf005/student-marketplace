'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, LayoutDashboard, FileText, MessageSquare, User, ShieldAlert, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signout } from '@/actions/auth'

interface MobileNavProps {
  userEmail: string
  isAdmin: boolean
  unreadCount: number
}

export function MobileNav({ userEmail, isAdmin, unreadCount }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 w-9 rounded-lg"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="fixed inset-x-0 top-14 bg-background/95 backdrop-blur border-b shadow-xl p-4 space-y-3 z-50 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-primary" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/dashboard/contracts"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              <FileText className="h-4 w-4 text-primary" />
              <span>Contracts</span>
            </Link>

            <Link
              href="/dashboard/messages"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span>Messages</span>
              </div>
              {unreadCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              <User className="h-4 w-4 text-primary" />
              <span>Profile</span>
            </Link>

            {isAdmin && (
              <Link
                href="/dashboard/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t flex items-center justify-between">
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{userEmail}</span>
            <form action={signout}>
              <Button type="submit" variant="destructive" size="sm" className="h-8 text-xs gap-1.5">
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
