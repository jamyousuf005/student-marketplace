'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { signContract } from '@/actions/contracts'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SignContractButton({ contractId, alreadySigned }: { contractId: string, alreadySigned: boolean }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  if (alreadySigned) {
    return <Button className="w-full" disabled variant="secondary">Already Signed</Button>
  }

  const handleSign = async () => {
    setIsLoading(true)
    try {
      const result = await signContract(contractId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Contract signed successfully!")
        router.refresh()
      }
    } catch (e) {
      toast.error("Failed to sign contract")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button className="w-full" onClick={handleSign} disabled={isLoading}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Sign Contract
    </Button>
  )
}
