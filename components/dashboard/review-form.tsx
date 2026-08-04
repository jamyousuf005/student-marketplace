"use client"

import { useState } from "react"
import { submitReview } from "@/actions/reviews"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2, Star } from "lucide-react"

export function ReviewForm({ taskId, revieweeId }: { taskId: string, revieweeId: string }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      const result = await submitReview(taskId, revieweeId, rating, comment)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Review submitted!")
        setSubmitted(true)
      }
    } catch (e) {
      toast.error("Failed to submit review")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-green-600 font-medium">Thank you for your review!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
        <CardDescription>Share your experience working on this task.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => setRating(star)}>
              <Star className={`h-8 w-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <Textarea 
          placeholder="Write your feedback..." 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={handleSubmit} disabled={loading || !comment}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Review
        </Button>
      </CardFooter>
    </Card>
  )
}
