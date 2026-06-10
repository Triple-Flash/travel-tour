"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  ChevronRight,
  Compass,
  LayoutDashboard,
  MapPin,
  Star,
  TicketPercent,
  Users,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin/dashboard", label: "Thống kê", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Đơn hàng", icon: CalendarDays },
  { href: "/admin/tours", label: "Tours", icon: MapPin },
  { href: "/admin/destinations", label: "Điểm đến", icon: Compass },
  { href: "/admin/vouchers", label: "Voucher", icon: TicketPercent },
  { href: "/admin/users", label: "Khách hàng", icon: Users },
  { href: "/admin/reviews", label: "Đánh giá", icon: Star },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card sticky top-0">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Compass className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none text-foreground">TravelTour</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            Admin
          </p>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                "text-muted-foreground hover:bg-muted hover:text-foreground",
                isActive && "bg-muted text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-foreground")} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="h-3 w-3 opacity-50" />}
            </Link>
          )
        })}
      </nav>

      <Separator />

      <div className="px-5 py-4">
        <p className="text-[11px] text-muted-foreground">© 2026 TravelTour</p>
      </div>
    </aside>
  )
}
