"use client"

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { RevenueStats } from "@/data/queries/bookings"

interface BookingStatusChartProps {
  stats: RevenueStats
}

const COLORS = ["var(--chart-5)", "var(--chart-3)", "var(--chart-4)"]
const LABELS = ["Xác nhận", "Chờ xử lý", "Đã huỷ"]

export function BookingStatusChart({ stats }: BookingStatusChartProps) {
  const data = [
    { name: LABELS[0], value: stats.confirmedCount },
    { name: LABELS[1], value: stats.pendingCount },
    { name: LABELS[2], value: stats.cancelledCount },
  ].filter((d) => d.value > 0)

  const total = data.reduce((a, d) => a + d.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Trạng Thái Đơn Hàng</CardTitle>
        <CardDescription>Tổng {total} đơn</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground py-16">Chưa có dữ liệu</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
