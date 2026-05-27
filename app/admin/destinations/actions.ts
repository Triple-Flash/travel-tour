"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { ForbiddenError } from "@/data/errors"

async function requireAdmin() {
  const user = await getSession()
  if (!user || user.role !== "admin") throw new ForbiddenError()
}

export interface DestinationFormData {
  name: string
  country: string
  description?: string
  image_url?: string
}

export async function createDestination(data: DestinationFormData): Promise<string> {
  await requireAdmin()
  const destination = await db.destinations.create({
    data: {
      name: data.name.trim(),
      country: data.country.trim(),
      description: data.description?.trim() || null,
      image_url: data.image_url?.trim() || null,
    },
  })
  revalidatePath("/admin/destinations")
  revalidatePath("/admin/tours")
  revalidatePath("/", "layout")
  return destination.id
}

export async function updateDestination(id: string, data: DestinationFormData) {
  await requireAdmin()
  await db.destinations.update({
    where: { id },
    data: {
      name: data.name.trim(),
      country: data.country.trim(),
      description: data.description?.trim() || null,
      image_url: data.image_url?.trim() || null,
    },
  })
  revalidatePath("/admin/destinations")
  revalidatePath("/admin/tours")
  revalidatePath("/", "layout")
}

export async function deleteDestination(id: string) {
  await requireAdmin()
  await db.destinations.delete({ where: { id } })
  revalidatePath("/admin/destinations")
  revalidatePath("/admin/tours")
  revalidatePath("/", "layout")
}
