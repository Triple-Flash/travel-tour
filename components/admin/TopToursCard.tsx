import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TourRevenue } from "@/data/queries/bookings"
import { formatCurrency } from "@/lib/format"
import { Trophy, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface TopToursCardProps {
  data: TourRevenue[]
}

// Medal colors for top 3
const RANK_STYLES = [
  { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400", bar: "from-amber-400 to-amber-500", badge: "🥇" },
  { bg: "bg-slate-50 dark:bg-slate-800/40",  text: "text-slate-500 dark:text-slate-400",  bar: "from-slate-400 to-slate-500",  badge: "🥈" },
  { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600 dark:text-orange-400", bar: "from-orange-400 to-orange-500", badge: "🥉" },
]

const DEFAULT_BAR = "from-blue-400 to-indigo-500"

export function TopToursCard({ data }: TopToursCardProps) {
  const max = data[0]?.revenue ?? 1

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-5 pt-5 pb-4 border-b border-border flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            Tour Doanh Thu Cao Nhất
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Top {data.length} tour theo doanh thu</p>
        </div>
        <TrendingUp className="h-4 w-4 text-emerald-500" />
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Chưa có dữ liệu</p>
        ) : (
          data.map((tour, i) => {
            const pct = Math.round((tour.revenue / max) * 100)
            const style = RANK_STYLES[i] ?? null
            const barClass = style?.bar ?? DEFAULT_BAR

            return (
              <div key={tour.tourId} className="space-y-2 group">
                {/* Row: rank + name + revenue */}
                <div className={cn(
                  "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors",
                  style ? style.bg : "bg-muted/40 hover:bg-muted/60"
                )}>
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank badge */}
                    <span className="shrink-0 text-base leading-none">{style?.badge ?? String(i + 1)}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate leading-tight">
                        {tour.tourTitle}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {tour.bookingCount} đơn đặt
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn("text-sm font-bold tabular-nums", style?.text ?? "text-foreground")}>
                      {formatCurrency(tour.revenue)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{pct}% max</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", barClass)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
