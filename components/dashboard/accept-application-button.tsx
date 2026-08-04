'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { acceptApplication } from '@/actions/tasks'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AcceptApplicationButton({ applicationId }: { applicationId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      const result = await acceptApplication(applicationId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Application accepted! Contract has been generated.")
        router.refresh()
      }
    } catch (e) {
      toast.error("Failed to accept application")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button className="w-full" onClick={handleAccept} disabled={isLoading}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Accept & Generate Contract
    </Button>
  )
}
