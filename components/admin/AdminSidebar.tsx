"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CalendarDays,
  MapPin,
  Users,
  Star,
  Compass,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { href: "/admin/dashboard", label: "Thống Kê",  icon: LayoutDashboard },
  { href: "/admin/bookings",  label: "Đơn Hàng",  icon: CalendarDays },
  { href: "/admin/tours",     label: "Tours",      icon: MapPin },
  { href: "/admin/users",     label: "Khách hàng", icon: Users },
  { href: "/admin/reviews",   label: "Đánh giá",   icon: Star },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Compass className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-none">TravelTour</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest">Admin</p>
        </div>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Menu
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                "text-muted-foreground hover:text-foreground hover:bg-muted",
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

      {/* Footer */}
      <div className="px-5 py-4">
        <p className="text-[11px] text-muted-foreground">© 2026 TravelTour</p>
      </div>
    </aside>
  )
}
