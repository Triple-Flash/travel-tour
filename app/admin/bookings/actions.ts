"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { ForbiddenError } from "@/data/errors"

async function requireAdmin() {
  const user = await getSession()
  if (!user || user.role !== "admin") throw new ForbiddenError()
  return user
}

export async function updateBookingStatus(id: string, status: string) {
  await requireAdmin()
  await db.bookings.update({ where: { id }, data: { status } })
  revalidatePath("/admin/bookings")
}

export async function deleteBooking(id: string) {
  await requireAdmin()
  await db.bookings.delete({ where: { id } })
  revalidatePath("/admin/bookings")
}
