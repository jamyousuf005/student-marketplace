'use client'

import { useState } from 'react'
import { Bell, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface NotificationItem {
  id: string
  title: string
  content: string
  read: boolean
  link?: string | null
  createdAt: string | Date
}

interface NotificationBellProps {
  notifications: NotificationItem[]
}

export function NotificationBell({ notifications }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-foreground/80 hover:text-foreground"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-card/95 backdrop-blur-md shadow-2xl p-3 z-50 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="font-bold text-sm">Notifications</span>
            <Badge variant="outline" className="text-[10px]">
              {unreadCount} unread
            </Badge>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors space-y-1">
                  <div className="font-semibold text-foreground flex justify-between items-start">
                    <span>{n.title}</span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{n.content}</p>
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={() => setIsOpen(false)}
                      className="text-primary hover:underline font-medium inline-flex items-center gap-1 pt-1"
                    >
                      View Details <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
