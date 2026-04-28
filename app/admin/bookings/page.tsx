import { CalendarDays, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ForbiddenError } from "@/data/errors"
import { formatCurrency, formatDate } from "@/lib/format"

export const metadata = { title: "Đơn Hàng — TravelTour Admin" }

async function getAllBookings() {
  const user = await getSession()
  if (!user || user.role !== "admin") throw new ForbiddenError()

  const bookings = await db.bookings.findMany({
    orderBy: { booking_date: "desc" },
    take: 50,
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

function StatusIcon({ status }: { status: string }) {
  if (status === "confirmed") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
  if (status === "cancelled") return <XCircle className="h-3.5 w-3.5 text-red-500" />
  return <Clock className="h-3.5 w-3.5 text-amber-500" />
}

export default async function AdminBookingsPage() {
  let bookings
  try {
    bookings = await getAllBookings()
  } catch {
    redirect("/")
  }

  const confirmed = bookings.filter((b) => b.status === "confirmed").length
  const pending = bookings.filter((b) => b.status === "pending").length
  const cancelled = bookings.filter((b) => b.status === "cancelled").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Quản Lý Đơn Hàng</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Tất cả đơn đặt tour trong hệ thống</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Xác nhận", value: confirmed, color: "text-emerald-600" },
          { label: "Chờ xử lý", value: pending, color: "text-amber-600" },
          { label: "Đã huỷ", value: cancelled, color: "text-red-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Danh sách đơn hàng ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead scope="col" className="pl-6 text-xs">Tour</TableHead>
                <TableHead scope="col" className="text-xs">Khách hàng</TableHead>
                <TableHead scope="col" className="text-xs">Người</TableHead>
                <TableHead scope="col" className="text-xs">Tổng tiền</TableHead>
                <TableHead scope="col" className="text-xs">Trạng thái</TableHead>
                <TableHead scope="col" className="text-xs">Thanh toán</TableHead>
                <TableHead scope="col" className="pr-6 text-xs">Ngày</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="pl-6 font-medium text-sm max-w-[160px]">
                    <span className="truncate block">{b.tourTitle}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.customer}</TableCell>
                  <TableCell className="text-sm">{b.people}</TableCell>
                  <TableCell className="text-sm font-medium tabular-nums">{formatCurrency(b.totalPrice)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <StatusIcon status={b.status} />
                      <span className="text-xs capitalize">{b.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {b.paymentStatus === "completed" ? (
                      <Badge variant="default" className="text-[11px]">Đã thanh toán</Badge>
                    ) : b.paymentStatus === "pending" ? (
                      <Badge variant="secondary" className="text-[11px]">Chờ TT</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-[11px]">{b.paymentStatus}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="pr-6 text-sm text-muted-foreground tabular-nums">
                    {formatDate(b.date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
