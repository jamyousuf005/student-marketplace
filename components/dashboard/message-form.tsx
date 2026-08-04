'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { sendMessage } from '@/actions/messages'
import { toast } from 'sonner'
import { Send, Loader2 } from 'lucide-react'

export function MessageForm({ currentUserId, connections = [] }: { currentUserId: string, connections?: { id: string, name: string }[] }) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(connections.length > 0 ? connections[0].id : currentUserId)

  const handleSend = async (formData: FormData) => {
    setIsLoading(true)
    try {
      formData.append('receiverId', selectedUser)

      const result = await sendMessage(formData)
      if (result.error) toast.error(result.error)
      else {
        toast.success("Message sent!")
        const input = document.getElementById('content') as HTMLInputElement
        if (input) input.value = ''
      }
    } catch (e) {
      toast.error("Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSend} className="flex gap-2">
      {connections.length > 0 && (
        <select 
          className="flex h-9 w-48 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          disabled={isLoading}
        >
          {connections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}
      <Input 
        id="content"
        name="content"
        placeholder="Type your message..." 
        className="flex-1"
        disabled={isLoading || connections.length === 0}
        required
      />
      <Button type="submit" disabled={isLoading || connections.length === 0} size="icon">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </form>
  )
}
