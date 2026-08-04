"use server"

import { db } from "@/lib/db"
import { tasks, users } from "@/supabase/schema"
import { eq } from "drizzle-orm"
import { createClient } from "@/supabase/server"
import { revalidatePath } from "next/cache"

export async function adminCancelTask(taskId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { error: "Unauthorized" }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id)
    })

    if (dbUser?.role !== "admin") return { error: "Forbidden" }

    await db.update(tasks)
      .set({ status: "cancelled" })
      .where(eq(tasks.id, taskId))

    revalidatePath("/dashboard/admin")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Something went wrong" }
  }
}
