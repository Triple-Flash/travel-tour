import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { ForbiddenError } from "@/data/errors"
import { VouchersDataTable } from "@/components/admin/VouchersDataTable"

export const metadata = { title: "Voucher - TravelTour Admin" }

async function getAllVouchers() {
  const user = await getSession()
  if (!user || user.role !== "admin") throw new ForbiddenError()

  const vouchers = await db.promotions.findMany({
    orderBy: { expiration_date: "asc" },
    take: 200,
    select: {
      id: true,
      code: true,
      discount_percentage: true,
      expiration_date: true,
    },
  })

  return vouchers.map((voucher) => ({
    id: voucher.id,
    code: voucher.code,
    discount_percentage: voucher.discount_percentage ?? 0,
    expiration_date: voucher.expiration_date,
  }))
}

export default async function AdminVouchersPage() {
  let vouchers
  try {
    vouchers = await getAllVouchers()
  } catch {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold tracking-tight">Quản lý voucher</div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {vouchers.length} voucher trong hệ thống
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <VouchersDataTable data={vouchers} />
      </Card>
    </div>
  )
}
