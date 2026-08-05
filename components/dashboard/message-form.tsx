'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { sendMessage } from '@/actions/messages'
import { toast } from 'sonner'
import { Send, Loader2, Search, UserCheck } from 'lucide-react'

interface MessageFormProps {
  currentUserId: string
  connections?: Array<{ id: string; name: string; type: 'enterprise' | 'student' }>
  initialRecipientId?: string
}

export function MessageForm({ currentUserId, connections = [], initialRecipientId }: MessageFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const defaultUser = useMemo(() => {
    if (initialRecipientId && connections.some(c => c.id === initialRecipientId)) {
      return initialRecipientId
    }
    return connections.length > 0 ? connections[0].id : currentUserId
  }, [initialRecipientId, connections, currentUserId])

  const [selectedUser, setSelectedUser] = useState(defaultUser)

  useEffect(() => {
    if (initialRecipientId && connections.some(c => c.id === initialRecipientId)) {
      setSelectedUser(initialRecipientId)
    }
  }, [initialRecipientId, connections])

  const filteredConnections = useMemo(() => {
    if (!searchTerm.trim()) return connections
    const query = searchTerm.toLowerCase().trim()
    return connections.filter(c => c.name.toLowerCase().includes(query))
  }, [connections, searchTerm])

  const handleSend = async (formData: FormData) => {
    if (!selectedUser) {
      toast.error('Please select a recipient to message')
      return
    }

    setIsLoading(true)
    try {
      formData.append('receiverId', selectedUser)

      const result = await sendMessage(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Message sent!')
        const input = document.getElementById('content') as HTMLInputElement
        if (input) input.value = ''
      }
    } catch (e) {
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSend} className="space-y-3">
      {/* Recipient Selection & Search */}
      <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search company or student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-xs h-9 bg-background/80"
          />
        </div>

        <select 
          className="flex h-9 w-full md:w-64 rounded-md border border-input bg-background/80 px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          disabled={isLoading}
        >
          {filteredConnections.length === 0 ? (
            <option value="">No matching recipient found</option>
          ) : (
            filteredConnections.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Message Input Bar */}
      <div className="flex gap-2">
        <Input 
          id="content"
          name="content"
          placeholder="Type your message here..." 
          className="flex-1 text-sm bg-background"
          disabled={isLoading || !selectedUser}
          required
        />
        <Button type="submit" disabled={isLoading || !selectedUser} className="gap-2">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span>Send</span>
        </Button>
      </div>
    </form>
  )
}
