import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { ForbiddenError } from "@/data/errors"
import { StatCard } from "@/components/admin/StatCard"
import { UsersDataTable } from "@/components/admin/UsersDataTable"
import { Users, ShieldCheck } from "lucide-react"

export const metadata = { title: "Khách hàng — TravelTour Admin" }

async function getAllUsers() {
  const user = await getSession()
  if (!user || user.role !== "admin") throw new ForbiddenError()

  const users = await db.users.findMany({
    orderBy: { created_at: "desc" },
    take: 200,
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      phone_number: true,
      created_at: true,
      _count: { select: { bookings: true } },
    },
  })

  return users.map((u) => ({
    id: u.id,
    full_name: u.full_name,
    email: u.email,
    role: u.role,
    phone_number: u.phone_number,
    bookingCount: u._count.bookings,
    created_at: u.created_at,
  }))
}

export default async function AdminUsersPage() {
  let users
  try {
    users = await getAllUsers()
  } catch {
    redirect("/")
  }

  const admins    = users.filter((u) => u.role === "admin").length
  const customers = users.filter((u) => u.role !== "admin").length

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold tracking-tight">Quản Lý Khách Hàng</div>
        <p className="text-sm text-muted-foreground mt-0.5">{users.length} tài khoản trong hệ thống</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Khách hàng" value={String(customers)} description="Tài khoản thường" icon={Users} />
        <StatCard title="Admin"      value={String(admins)}    description="Quản trị viên"    icon={ShieldCheck} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold">Danh sách người dùng</p>
          <p className="text-xs text-muted-foreground">{users.length} tài khoản</p>
        </div>
        <UsersDataTable data={users} />
      </Card>
    </div>
  )
}
