"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { ForbiddenError } from "@/data/errors"

async function requireAdmin() {
  const user = await getSession()
  if (!user || user.role !== "admin") throw new ForbiddenError()
}

export async function deleteReview(id: string) {
  await requireAdmin()
  await db.reviews.delete({ where: { id } })
  revalidatePath("/admin/reviews")
}
