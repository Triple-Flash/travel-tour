import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export const metadata = { title: "Đánh Giá — TravelTour Admin" }

async function getAllReviews() {
  const user = await getSession()
  if (!user || user.role !== "admin") throw new ForbiddenError()

  return db.reviews.findMany({
    orderBy: { created_at: "desc" },
    take: 50,
    select: {
      id: true,
      rating: true,
      comment: true,
      created_at: true,
      tours: { select: { title: true } },
      users: { select: { full_name: true, email: true } },
    },
  })
}

function StarRating({ rating }: { rating: number | null }) {
  const r = rating ?? 0
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < r ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{r}/5</span>
    </div>
  )
}

export default async function AdminReviewsPage() {
  let reviews
  try {
    reviews = await getAllReviews()
  } catch {
    redirect("/")
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating ?? 0), 0) / reviews.length).toFixed(1)
      : "—"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Quản Lý Đánh Giá</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {reviews.length} đánh giá · Điểm trung bình: {avgRating}/5
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tất cả đánh giá</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead scope="col" className="pl-6 text-xs">Tour</TableHead>
                <TableHead scope="col" className="text-xs">Khách hàng</TableHead>
                <TableHead scope="col" className="text-xs">Điểm</TableHead>
                <TableHead scope="col" className="text-xs">Nhận xét</TableHead>
                <TableHead scope="col" className="pr-6 text-xs">Ngày</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="pl-6 font-medium text-sm max-w-[160px]">
                    <span className="truncate block">{r.tours?.title ?? "—"}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.users?.full_name ?? r.users?.email ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StarRating rating={r.rating} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[240px]">
                    <span className="line-clamp-2">{r.comment ?? "—"}</span>
                  </TableCell>
                  <TableCell className="pr-6 text-sm text-muted-foreground tabular-nums">
                    {formatDate(r.created_at)}
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
