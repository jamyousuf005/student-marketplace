"use server"

import { db } from "@/lib/db"
import { reviews, tasks } from "@/supabase/schema"
import { eq } from "drizzle-orm"
import { createClient } from "@/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitReview(taskId: string, revieweeId: string, rating: number, comment: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { error: "Unauthorized" }

    await db.insert(reviews).values({
      taskId,
      reviewerId: user.id,
      revieweeId,
      rating,
      comment
    })

    revalidatePath("/dashboard/contracts")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Something went wrong" }
  }
}

export async function completeTask(taskId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { error: "Unauthorized" }

    await db.update(tasks).set({ status: "completed" }).where(eq(tasks.id, taskId))

    revalidatePath("/dashboard/contracts")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Something went wrong" }
  }
}
