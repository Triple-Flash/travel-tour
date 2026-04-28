"use client"

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { RevenueStats } from "@/data/queries/bookings"

interface BookingStatusChartProps {
  stats: RevenueStats
}

// Sophisticated neutral-leaning palette — no garish primaries
const SEGMENT_COLORS = [
  { color: "#22c55e", label: "Xác nhận" },   // emerald green — success
  { color: "#f59e0b", label: "Chờ xử lý" },  // warm amber — waiting
  { color: "#f43f5e", label: "Đã huỷ" },     // rose red — danger
]

export function BookingStatusChart({ stats }: BookingStatusChartProps) {
  const data = [
    { name: SEGMENT_COLORS[0].label, value: stats.confirmedCount,  fill: SEGMENT_COLORS[0].color },
    { name: SEGMENT_COLORS[1].label, value: stats.pendingCount,    fill: SEGMENT_COLORS[1].color },
    { name: SEGMENT_COLORS[2].label, value: stats.cancelledCount,  fill: SEGMENT_COLORS[2].color },
  ].filter((d) => d.value > 0)

  const total = data.reduce((a, d) => a + d.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Trạng Thái Đơn Hàng</CardTitle>
        <CardDescription>Tổng {total} đơn</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pb-2">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground py-16">Chưa có dữ liệu</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={2}
                stroke="hsl(var(--card))"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value) => [`${value} đơn`, ""]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                formatter={(value) => (
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* Center summary stats */}
        {total > 0 && (
          <div className="mt-1 flex w-full justify-around border-t border-border pt-4 pb-1">
            {SEGMENT_COLORS.map((seg, i) => {
              const val = [stats.confirmedCount, stats.pendingCount, stats.cancelledCount][i]
              if (val === 0) return null
              return (
                <div key={seg.label} className="flex flex-col items-center gap-0.5">
                  <span className="text-lg font-bold tabular-nums" style={{ color: seg.color }}>
                    {val}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{seg.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
