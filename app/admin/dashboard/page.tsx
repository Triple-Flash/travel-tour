import { Suspense } from "react"
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Clock,
} from "lucide-react"
import {
  getRevenueStats,
  getMonthlyRevenue,
  getTopToursByRevenue,
  getRecentTransactions,
} from "@/data/queries/bookings"
import { StatCard } from "@/components/admin/StatCard"
import { RevenueChart } from "@/components/admin/RevenueChart"
import { BookingStatusChart } from "@/components/admin/BookingStatusChart"
import { RecentTransactionsTable } from "@/components/admin/RecentTransactionsTable"
import { TopToursCard } from "@/components/admin/TopToursCard"
import { formatCurrency, formatCompact } from "@/lib/format"
import { DashboardSkeleton } from "@/components/admin/DashboardSkeleton"

export const metadata = {
  title: "Thống Kê — TravelTour Admin",
}

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}

async function DashboardContent() {
  const [stats, monthly, topTours, recent] = await Promise.all([
    getRevenueStats(),
    getMonthlyRevenue(6),
    getTopToursByRevenue(5),
    getRecentTransactions(10),
  ])

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Tổng Quan Doanh Thu</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Dữ liệu thống kê toàn nền tảng TravelTour
        </p>
      </div>

      {/* KPI cards — 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng Doanh Thu"
          value={formatCurrency(stats.totalRevenue)}
          description="Từ các thanh toán hoàn thành"
          icon={DollarSign}
        />
        <StatCard
          title="Tổng Đơn Hàng"
          value={stats.totalBookings.toLocaleString("vi-VN")}
          description={`${stats.confirmedCount} xác nhận · ${stats.pendingCount} chờ · ${stats.cancelledCount} huỷ`}
          icon={ShoppingCart}
        />
        <StatCard
          title="Giá Trị TB / Đơn"
          value={formatCompact(stats.avgBookingValue) + "đ"}
          description="Doanh thu / số đơn hoàn thành"
          icon={TrendingUp}
        />
        <StatCard
          title="Doanh Thu Chờ"
          value={formatCurrency(stats.pendingRevenue)}
          description="Từ các đơn chưa thanh toán"
          icon={Clock}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={monthly} />
        <BookingStatusChart stats={stats} />
      </div>

      {/* Table + Top Tours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactionsTable data={recent} />
        </div>
        <TopToursCard data={topTours} />
      </div>
    </div>
  )
}
