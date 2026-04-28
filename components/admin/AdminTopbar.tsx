"use client"

import { Bell } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/admin/ThemeToggle"
import { usePathname } from "next/navigation"
import type { SessionUser } from "@/lib/auth"

const breadcrumbs: Record<string, string> = {
  "/admin/dashboard": "Thống Kê",
  "/admin/bookings":  "Đơn Hàng",
  "/admin/tours":     "Tours",
  "/admin/users":     "Khách hàng",
  "/admin/reviews":   "Đánh giá",
}

interface AdminTopbarProps {
  user: SessionUser
}

export function AdminTopbar({ user }: AdminTopbarProps) {
  const pathname = usePathname()
  const currentLabel = breadcrumbs[pathname] ?? "Admin"
  const initials = user.full_name
    .split(" ")
    .slice(-2)
    .map((s) => s[0])
    .join("")
    .toUpperCase()

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6 shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Admin</span>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">{currentLabel}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        <Button variant="ghost" size="icon" aria-label="Thông báo">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            id="admin-user-menu-trigger"
            className="ml-1 flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors outline-none"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-[11px] font-semibold bg-muted text-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
              {user.full_name}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Hồ sơ</DropdownMenuItem>
            <DropdownMenuItem>Cài đặt</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
