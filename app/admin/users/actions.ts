"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { ForbiddenError } from "@/data/errors"

async function requireAdmin() {
  const user = await getSession()
  if (!user || user.role !== "admin") throw new ForbiddenError()
}

export async function updateUserRole(id: string, role: string) {
  await requireAdmin()
  await db.users.update({ where: { id }, data: { role } })
  revalidatePath("/admin/users")
}

export async function updateUser(id: string, data: { full_name: string; phone_number?: string }) {
  await requireAdmin()
  await db.users.update({
    where: { id },
    data: {
      full_name: data.full_name,
      phone_number: data.phone_number || null,
    },
  })
  revalidatePath("/admin/users")
}

export async function deleteUser(id: string) {
  await requireAdmin()
  await db.users.delete({ where: { id } })
  revalidatePath("/admin/users")
}
