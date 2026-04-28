import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { CalendarDays, CheckCircle2, Clock, XCircle } from "lucide-react"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { ForbiddenError } from "@/data/errors"
import { StatCard } from "@/components/admin/StatCard"
import { BookingsDataTable } from "@/components/admin/BookingsDataTable"

export const metadata = { title: "Đơn Hàng — TravelTour Admin" }

async function getAllBookings() {
  const user = await getSession()
  if (!user || user.role !== "admin") throw new ForbiddenError()

  const bookings = await db.bookings.findMany({
    orderBy: { booking_date: "desc" },
    take: 200,
    select: {
      id: true,
      booking_date: true,
      number_of_people: true,
      total_price: true,
      status: true,
      tours: { select: { title: true } },
      users: { select: { full_name: true, email: true } },
      payments: { select: { payment_status: true, amount: true } },
    },
  })

  return bookings.map((b) => ({
    id: b.id,
    tourTitle: b.tours?.title ?? "—",
    customer: b.users?.full_name ?? b.users?.email ?? "—",
    people: b.number_of_people,
    totalPrice: Number(b.total_price),
    status: b.status ?? "unknown",
    paymentStatus: b.payments?.payment_status ?? "unknown",
    date: b.booking_date,
  }))
}

export default async function AdminBookingsPage() {
  let bookings
  try {
    bookings = await getAllBookings()
  } catch {
    redirect("/")
  }

  const confirmed = bookings.filter((b) => b.status === "confirmed").length
  const pending   = bookings.filter((b) => b.status === "pending").length
  const cancelled = bookings.filter((b) => b.status === "cancelled").length

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold tracking-tight">Quản Lý Đơn Hàng</div>
        <p className="text-sm text-muted-foreground mt-0.5">Tất cả đơn đặt tour trong hệ thống</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Xác nhận" value={String(confirmed)} description="Đơn đã xác nhận" icon={CheckCircle2} />
        <StatCard title="Chờ xử lý" value={String(pending)}   description="Đơn đang chờ"     icon={Clock} />
        <StatCard title="Đã huỷ"    value={String(cancelled)} description="Đơn bị huỷ"        icon={XCircle} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Danh sách đơn hàng</p>
            <p className="text-xs text-muted-foreground">{bookings.length} đơn tổng cộng</p>
          </div>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </div>
        <BookingsDataTable data={bookings} />
      </Card>
    </div>
  )
}
