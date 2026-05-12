"use server"

import { revalidatePath, updateTag } from "next/cache"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { ForbiddenError } from "@/data/errors"

async function requireAdmin() {
  const user = await getSession()
  if (!user || user.role !== "admin") throw new ForbiddenError()
}

export interface TourFormData {
  title: string
  description: string
  price: number
  duration: number
  max_capacity: number
  destination_id?: string
}

export async function createTour(data: TourFormData): Promise<string> {
  await requireAdmin()
  const tour = await db.tours.create({
    data: {
      title: data.title,
      description: data.description || null,
      price: data.price,
      duration: data.duration,
      max_capacity: data.max_capacity,
      destination_id: data.destination_id || null,
    },
    select: { id: true },
  })
  revalidatePath("/admin/tours")
  updateTag("tours")
  return tour.id
}

export async function updateTour(id: string, data: TourFormData) {
  await requireAdmin()
  await db.tours.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description || null,
      price: data.price,
      duration: data.duration,
      max_capacity: data.max_capacity,
      destination_id: data.destination_id || null,
    },
  })
  revalidatePath("/admin/tours")
  updateTag("tours")
}

export async function deleteTour(id: string) {
  await requireAdmin()
  await db.tours.delete({ where: { id } })
  revalidatePath("/admin/tours")
  updateTag("tours")
}
