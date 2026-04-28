import { Users, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { formatDate } from "@/lib/format"

export const metadata = { title: "Khách hàng — TravelTour Admin" }

async function getAllUsers() {
  const user = await getSession()
  if (!user || user.role !== "admin") throw new ForbiddenError()

  return db.users.findMany({
    orderBy: { created_at: "desc" },
    take: 50,
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      created_at: true,
      _count: { select: { bookings: true } },
    },
  })
}

export default async function AdminUsersPage() {
  let users
  try {
    users = await getAllUsers()
  } catch {
    redirect("/")
  }

  const admins = users.filter((u) => u.role === "admin").length
  const customers = users.filter((u) => u.role !== "admin").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Quản Lý Khách Hàng</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{users.length} tài khoản trong hệ thống</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Khách hàng", value: customers, icon: Users },
          { label: "Admin", value: admins, icon: ShieldCheck },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Danh sách người dùng</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead scope="col" className="pl-6 text-xs">Người dùng</TableHead>
                <TableHead scope="col" className="text-xs">Email</TableHead>
                <TableHead scope="col" className="text-xs">Vai trò</TableHead>
                <TableHead scope="col" className="text-xs">Đơn đặt</TableHead>
                <TableHead scope="col" className="pr-6 text-xs">Ngày tham gia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const initials = (u.full_name ?? u.email ?? "?")
                  .split(" ")
                  .slice(-2)
                  .map((s) => s[0])
                  .join("")
                  .toUpperCase()
                return (
                  <TableRow key={u.id}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[11px] font-semibold bg-muted text-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{u.full_name ?? "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      {u.role === "admin" ? (
                        <Badge variant="default" className="text-[11px]">Admin</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[11px]">Khách hàng</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{u._count.bookings}</TableCell>
                    <TableCell className="pr-6 text-sm text-muted-foreground tabular-nums">
                      {formatDate(u.created_at)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
