"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { ForbiddenError } from "@/data/errors"

async function requireAdmin() {
  const user = await getSession()
  if (!user || user.role !== "admin") throw new ForbiddenError()
}

export interface VoucherFormData {
  code: string
  discount_percentage: number
  expiration_date?: string
}

function toExpirationDate(value?: string) {
  if (!value) return null
  const date = new Date(`${value}T23:59:59`)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function createVoucher(data: VoucherFormData) {
  await requireAdmin()
  await db.promotions.create({
    data: {
      code: data.code.trim().toUpperCase(),
      discount_percentage: data.discount_percentage,
      expiration_date: toExpirationDate(data.expiration_date),
    },
  })
  revalidatePath("/admin/vouchers")
}

export async function updateVoucher(id: string, data: VoucherFormData) {
  await requireAdmin()
  await db.promotions.update({
    where: { id },
    data: {
      code: data.code.trim().toUpperCase(),
      discount_percentage: data.discount_percentage,
      expiration_date: toExpirationDate(data.expiration_date),
    },
  })
  revalidatePath("/admin/vouchers")
}

export async function deleteVoucher(id: string) {
  await requireAdmin()
  await db.promotions.delete({ where: { id } })
  revalidatePath("/admin/vouchers")
}
