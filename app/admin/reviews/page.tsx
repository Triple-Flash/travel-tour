import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Star, TrendingUp, ThumbsDown } from "lucide-react"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { ForbiddenError } from "@/data/errors"
import { StatCard } from "@/components/admin/StatCard"
import { ReviewsDataTable } from "@/components/admin/ReviewsDataTable"

export const metadata = { title: "Đánh Giá — TravelTour Admin" }

async function getAllReviews() {
  const user = await getSession()
  if (!user || user.role !== "admin") throw new ForbiddenError()

  return db.reviews.findMany({
    orderBy: { created_at: "desc" },
    take: 200,
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

  const highRated = reviews.filter((r) => (r.rating ?? 0) >= 4).length
  const lowRated  = reviews.filter((r) => (r.rating ?? 0) <= 2).length

  const rows = reviews.map((r) => ({
    id: r.id,
    tourTitle: r.tours?.title ?? "—",
    customer: r.users?.full_name ?? r.users?.email ?? "—",
    rating: r.rating,
    comment: r.comment,
    created_at: r.created_at,
  }))

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold tracking-tight">Quản Lý Đánh Giá</div>
        <p className="text-sm text-muted-foreground mt-0.5">
          {reviews.length} đánh giá · Điểm trung bình: {avgRating}/5
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Trung bình" value={`${avgRating}★`} description="Điểm TB toàn hệ thống" icon={Star} />
        <StatCard title="Đánh giá cao" value={String(highRated)} description="4 sao trở lên" icon={TrendingUp} />
        <StatCard title="Đánh giá thấp" value={String(lowRated)} description="2 sao trở xuống" icon={ThumbsDown} />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Tất cả đánh giá</p>
            <p className="text-xs text-muted-foreground">{reviews.length} nhận xét</p>
          </div>
          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
        </div>
        <ReviewsDataTable data={rows} />
      </Card>
    </div>
  )
}
