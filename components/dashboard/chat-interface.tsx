'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { sendMessage, fetchMessages } from '@/actions/messages'
import { toast } from 'sonner'
import { Search, Send, Loader2, MessageSquare, Building2, UserCheck, User } from 'lucide-react'

interface MessageItem {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string | Date
}

interface ConnectionItem {
  id: string
  name: string
  type: 'enterprise' | 'student'
}

interface ChatInterfaceProps {
  currentUserId: string
  userMessages: MessageItem[]
  connections: ConnectionItem[]
  nameMap: Record<string, string>
  initialRecipientId?: string
}

export function ChatInterface({
  currentUserId,
  userMessages,
  connections,
  nameMap,
  initialRecipientId,
}: ChatInterfaceProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<MessageItem[]>(userMessages)

  const defaultRecipientId = useMemo(() => {
    if (initialRecipientId && connections.some(c => c.id === initialRecipientId)) {
      return initialRecipientId
    }
    return connections.length > 0 ? connections[0].id : ''
  }, [initialRecipientId, connections])

  const [selectedRecipientId, setSelectedRecipientId] = useState(defaultRecipientId)

  useEffect(() => {
    if (initialRecipientId && connections.some(c => c.id === initialRecipientId)) {
      setSelectedRecipientId(initialRecipientId)
    }
  }, [initialRecipientId, connections])

  // Smart polling using Next.js Server Action (polls every 3s only when tab is focused/visible)
  useEffect(() => {
    let isMounted = true

    const pollMessages = async () => {
      if (document.hidden) return // Don't poll when user is on another tab
      try {
        const res = await fetchMessages()
        if (isMounted && res.messages && res.messages.length > 0) {
          setMessages(res.messages)
        }
      } catch (err) {
        // Silently catch polling errors
      }
    }

    const interval = setInterval(pollMessages, 3000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [currentUserId])

  const filteredConnections = useMemo(() => {
    if (!searchTerm.trim()) return connections
    const query = searchTerm.toLowerCase().trim()
    return connections.filter(c => c.name.toLowerCase().includes(query))
  }, [connections, searchTerm])

  const activePartner = useMemo(() => {
    return connections.find(c => c.id === selectedRecipientId)
  }, [connections, selectedRecipientId])

  // Filter messages exchanged between current user and active recipient
  const activeConversationMessages = useMemo(() => {
    if (!selectedRecipientId) return messages
    return messages.filter(
      m => (m.senderId === currentUserId && m.receiverId === selectedRecipientId) ||
           (m.senderId === selectedRecipientId && m.receiverId === currentUserId)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [messages, currentUserId, selectedRecipientId])

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedRecipientId) {
      toast.error('Please select a contact to message')
      return
    }

    const form = e.currentTarget
    const content = new FormData(form).get('content') as string
    if (!content || !content.trim()) return

    // Reset the form immediately for UX
    form.reset()
    setIsLoading(true)

    // Optimistic update — show the message immediately
    const tempId = crypto.randomUUID()
    const newMessage: MessageItem = {
      id: tempId,
      senderId: currentUserId,
      receiverId: selectedRecipientId,
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [newMessage, ...prev])

    // Build fresh FormData with the extracted values for the server action
    const serverFormData = new FormData()
    serverFormData.append('content', content)
    serverFormData.append('receiverId', selectedRecipientId)

    try {
      const result = await sendMessage(serverFormData)
      if (result.error) {
        toast.error(result.error)
        // Revert optimistic update on failure
        setMessages(prev => prev.filter(m => m.id !== tempId))
      }
    } catch (err) {
      toast.error('Failed to send message')
      setMessages(prev => prev.filter(m => m.id !== tempId))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex-1 flex flex-col overflow-hidden border-primary/20 shadow-lg h-[75vh]">
      {/* Top Header Contact Selector & Search Bar */}
      <CardHeader className="border-b bg-card p-4 space-y-3">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
          {/* Active Chat Header */}
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                {activePartner ? activePartner.name : 'Select Contact'}
              </CardTitle>
              <CardDescription className="text-xs">
                {activePartner?.type === 'enterprise' ? 'Enterprise Partner' : 'University Student'}
              </CardDescription>
            </div>
          </div>

          {/* Contact Search & Selection */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search company or student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs h-9 bg-background"
              />
            </div>

            <select
              value={selectedRecipientId}
              onChange={(e) => setSelectedRecipientId(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            >
              {filteredConnections.length === 0 ? (
                <option value="">No contacts found</option>
              ) : (
                filteredConnections.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </CardHeader>

      {/* Message Feed / Conversation History */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
        {!selectedRecipientId ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
            <User className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-sm">No contact selected.</p>
            <p className="text-xs">Use the contact selector above to start messaging.</p>
          </div>
        ) : activeConversationMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-sm">No previous messages with {activePartner?.name}.</p>
            <p className="text-xs">Type a message below to start the conversation.</p>
          </div>
        ) : (
          <div className="space-y-4 flex flex-col-reverse">
            {activeConversationMessages.map((msg) => {
              const isMine = msg.senderId === currentUserId
              const senderName = isMine ? 'You' : (nameMap[msg.senderId] || 'Partner')

              return (
                <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <span className="text-[11px] text-muted-foreground mb-1 font-medium">
                    {senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                    isMine
                      ? 'bg-primary text-primary-foreground rounded-tr-xs shadow-sm'
                      : 'bg-card text-foreground border rounded-tl-xs shadow-xs'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      {/* Bottom Message Input Bar */}
      <div className="p-3 border-t bg-card">
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <Input
            name="content"
            placeholder={activePartner ? `Message ${activePartner.name}...` : 'Select a contact to send a message...'}
            disabled={isLoading || !selectedRecipientId}
            className="flex-1 text-sm bg-background"
            required
            autoComplete="off"
          />
          <Button type="submit" disabled={isLoading || !selectedRecipientId} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </div>
    </Card>
  )
}
