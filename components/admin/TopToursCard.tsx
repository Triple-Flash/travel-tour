import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TourRevenue } from "@/data/queries/bookings"
import { formatCompact, formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

interface TopToursCardProps {
  data: TourRevenue[]
}

export function TopToursCard({ data }: TopToursCardProps) {
  const max = data[0]?.revenue ?? 1

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Tour Doanh Thu Cao Nhất</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Chưa có dữ liệu</p>
        ) : (
          data.map((tour, i) => {
            const pct = Math.round((tour.revenue / max) * 100)
            return (
              <div key={tour.tourId} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium truncate">{tour.tourTitle}</span>
                  </div>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                    {formatCompact(tour.revenue)}đ
                  </span>
                </div>
                {/* Bar */}
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", [
                      "bg-[var(--chart-1)]",
                      "bg-[var(--chart-2)]",
                      "bg-[var(--chart-3)]",
                      "bg-[var(--chart-4)]",
                      "bg-[var(--chart-5)]",
                    ][i % 5])}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {tour.bookingCount} đơn · {formatCurrency(tour.revenue)}
                </p>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
