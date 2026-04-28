import { MapPin, Clock, Star } from "lucide-react"
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
import { formatCurrency } from "@/lib/format"

export const metadata = { title: "Tours — TravelTour Admin" }

async function getAllTours() {
  const user = await getSession()
  if (!user || user.role !== "admin") throw new ForbiddenError()

  return db.tours.findMany({
    orderBy: { created_at: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      price: true,
      duration: true,
      max_capacity: true,
      destination_id: true,
      destinations: { select: { name: true, country: true } },
    },
  })
}

export default async function AdminToursPage() {
  let tours
  try {
    tours = await getAllTours()
  } catch {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Quản Lý Tours</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {tours.length} tour trong hệ thống
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Danh sách tours</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead scope="col" className="pl-6 text-xs">Tên tour</TableHead>
              <TableHead scope="col" className="text-xs">Điểm đến</TableHead>
              <TableHead scope="col" className="text-xs">Giá</TableHead>
              <TableHead scope="col" className="text-xs">Thời gian</TableHead>
              <TableHead scope="col" className="text-xs">Số chỗ tối đa</TableHead>
              <TableHead scope="col" className="pr-6 text-xs">Điểm đến ID</TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
              {tours.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="pl-6 font-medium text-sm max-w-[200px]">
                    <span className="truncate block">{t.title}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {t.destinations?.name ?? "—"}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium tabular-nums">
                    {formatCurrency(Number(t.price))}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {t.duration} ngày
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{t.max_capacity ?? "—"}</TableCell>
                  <TableCell className="pr-6">
                    <Badge variant="secondary" className="text-[11px]">
                      {t.destination_id ? "Có điểm đến" : "Chưa có"}
                    </Badge>
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
