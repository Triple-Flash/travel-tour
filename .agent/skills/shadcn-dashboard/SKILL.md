---
name: shadcn-dashboard
description: >
  Revenue dashboard skill for TravelTour. Shadcn/ui + Tailwind v4 + Next.js 16 App Router.
  Default neutral (white/black) palette with full light/dark mode support.
  Trigger on: "dashboard", "revenue", "admin", "analytics", "stats", "KPI", "charts",
  "booking metrics", "sales overview", or any request to build/edit dashboard screens.
---

# TravelTour — Revenue Dashboard Skill

**Project path:** `/home/micahjordan/programming/nextjs/travel-tour`  
**Stack:** Next.js 16 App Router · shadcn/ui (base-nova) · Tailwind v4 · Lucide React · TypeScript strict  
**Route group:** `app/(dashboard)/`  
**Design:** Shadcn default — neutral zinc/white light + zinc-950 dark, zero aurora colors

---

## 1. Design Philosophy

This dashboard intentionally uses **shadcn's default neutral palette** — NOT the Aurora UI theme
from `globals.css`. The dashboard must feel like a professional SaaS product: clean, data-dense,
minimal color, high contrast.

| Principle | Rule |
|-----------|------|
| Color | Neutral zinc scale only. Accent = `hsl(var(--primary))` (black in light, white in dark) |
| Typography | DM Sans already loaded via `globals.css` — use it |
| Density | Compact cards, 4-column stat grid on desktop, 2-col on tablet, 1-col on mobile |
| Charts | Use Recharts (ships with shadcn `chart` component) |
| Mode | Toggle via `next-themes`. Class-based: `.dark` on `<html>` |
| Icons | Lucide React only — never emojis |
| Radius | `--radius: 0.75rem` (already set in globals.css) |

---

## 2. Theme Tokens (Dashboard-Specific)

Dashboard pages must NOT use Aurora custom properties (`--tt-bg`, `--aurora-*`, `--tt-glass`).
Use **only** shadcn CSS variables which already adapt for light/dark:

```css
/* These work in both modes automatically */
bg-background        /* white / zinc-950 */
bg-card              /* white / zinc-900 */
bg-muted             /* zinc-100 / zinc-800 */
text-foreground      /* zinc-950 / zinc-50 */
text-muted-foreground /* zinc-500 / zinc-400 */
border-border        /* zinc-200 / zinc-800 */
bg-primary           /* black / white */
text-primary-foreground /* white / black */
```

Chart color tokens (already in globals.css):
```
--chart-1: cyan   (#06B6D4)
--chart-2: violet (#8B5CF6)
--chart-3: orange (#F97316)
--chart-4: pink   (#EC4899)
--chart-5: emerald (#10B981)
```

---

## 3. Route Architecture

### ✅ Chosen Strategy — `/admin/*` Prefix

All admin/dashboard pages live under the real URL segment `admin/`. This is a **dedicated,
non-conflicting namespace** — completely separate from `(marketing)` routes (`/bookings`,
`/profile`, etc.) which remain untouched for regular users.

```
app/
├── (auth)/
│   └── login/page.tsx
│
├── (marketing)/                      ← public + authenticated user pages (unchanged)
│   ├── layout.tsx                    ← Aurora dark theme, no admin sidebar
│   ├── bookings/page.tsx             ← /bookings  (user's own booking list)
│   ├── checkout/...                  ← /checkout/...
│   ├── destinations/[id]/...         ← /destinations/[id]
│   ├── profile/page.tsx              ← /profile   (user profile)
│   ├── search/page.tsx               ← /search
│   └── tours/[id]/...               ← /tours/[id]
│
├── admin/                            ← NEW: /admin/* — admin-only section
│   ├── layout.tsx                    ← Admin shell: sidebar + topbar + theme toggle
│   ├── page.tsx                      ← /admin  (redirects to /admin/dashboard)
│   ├── dashboard/
│   │   └── page.tsx                  ← /admin/dashboard  (revenue overview)
│   ├── bookings/
│   │   └── page.tsx                  ← /admin/bookings   (all bookings management)
│   ├── tours/
│   │   └── page.tsx                  ← /admin/tours      (tour CRUD)
│   ├── users/
│   │   └── page.tsx                  ← /admin/users      (user management)
│   └── reviews/
│       └── page.tsx                  ← /admin/reviews    (moderation)
│
└── page.tsx                          ← / (home)
```

### Why `/admin/*` is the Right Choice

| Concern | Result |
|---------|--------|
| Route conflict with `(marketing)` | ✅ None — `/admin/bookings` ≠ `/bookings` |
| User pages stay intact | ✅ No files moved, no broken links |
| Role protection | ✅ Enforce `role === "admin"` in `admin/layout.tsx` once, covers all children |
| Separate layout/theme | ✅ `admin/layout.tsx` gets neutral sidebar; marketing keeps Aurora |
| URL clarity | ✅ `/admin/*` makes admin intent obvious |

### Admin Route Guard — `admin/layout.tsx`

Protect the entire `/admin` subtree in a single layout file:

```tsx
// app/admin/layout.tsx
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminTopbar } from "@/components/admin/AdminTopbar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession()

  // Redirect non-admins immediately — never render admin UI for regular users
  if (!user || user.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminTopbar user={user} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Admin Layout Shell Notes

- Left sidebar sticky, `w-64`, collapses to Sheet drawer on `< lg` breakpoint
- Top header: breadcrumb trail + theme toggle + admin avatar
- `<main>` scrollable independently from sidebar
- All data queries in `admin/*` pages must additionally verify `user.role === "admin"` at the DAL layer (defense in depth)

---

## 4. Sidebar Component Spec

```tsx
// Admin sidebar nav items — all under /admin/* prefix, use Lucide icons
const navItems = [
  { href: "/admin/dashboard", label: "Thống Kê", icon: LayoutDashboard },
  { href: "/admin/bookings",  label: "Đơn Hàng",  icon: CalendarDays },
  { href: "/admin/tours",     label: "Tours",     icon: MapPin },
  { href: "/admin/users",     label: "Khách hàng",     icon: Users },
  { href: "/admin/reviews",   label: "Đánh giá",   icon: Star },
]
```

Sidebar classes (light adapts, dark adapts automatically):
```tsx
// Sidebar shell
<aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0">

// Nav link — active state
<Link className={cn(
  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
  "text-muted-foreground hover:text-foreground hover:bg-muted",
  isActive && "bg-muted text-foreground"
)} />
```

---

## 5. Revenue Dashboard Page — Required Sections

### 5a. KPI Stat Cards (top row, 4 columns)

| Card | Metric | Data Source |
|------|--------|-------------|
| Total Revenue | Sum of `payments.amount` where `payment_status = "completed"` | `getRevenueStats()` |
| Total Bookings | Count of all bookings | `getRevenueStats()` |
| Avg Booking Value | Total revenue ÷ paid bookings | computed |
| Pending Payments | Sum of `payments.amount` where `payment_status = "pending"` | `getRevenueStats()` |

Stat card template:
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      {title}
    </CardTitle>
    <Icon className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{value}</div>
    <p className="text-xs text-muted-foreground mt-1">{description}</p>
  </CardContent>
</Card>
```

### 5b. Revenue Over Time — Line Chart

- X axis: months (last 6 months)
- Y axis: revenue in VND or USD
- Use shadcn `<ChartContainer>` + Recharts `<LineChart>`
- Color: `var(--chart-1)` (cyan)

### 5c. Bookings by Status — Donut / Pie Chart

- Segments: `confirmed`, `pending`, `cancelled`
- Colors: `chart-5` (green), `chart-3` (orange), `chart-4` (pink/red)
- Show legend below

### 5d. Recent Transactions Table

Columns: Tour Name | Customer | Amount | Status | Date  
Use shadcn `<Table>` component.  
`Badge` for status: `completed` → default, `pending` → secondary, `cancelled` → destructive.

### 5e. Top Tours by Revenue

Horizontal bar chart or ranked list cards showing which tours generate the most revenue.

---

## 6. Data Access Layer — New Revenue Queries

Add to `data/queries/bookings.ts` (follow DAL skill rules):

```ts
export interface RevenueStats {
  totalRevenue: number;        // sum of completed payments
  totalBookings: number;       // all bookings count
  avgBookingValue: number;     // totalRevenue / paid count
  pendingRevenue: number;      // sum of pending payments
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
}

export interface MonthlyRevenue {
  month: string;               // "Jan", "Feb", etc.
  revenue: number;
  bookings: number;
}

export interface TourRevenue {
  tourId: string;
  tourTitle: string;
  revenue: number;
  bookingCount: number;
}

export interface RecentTransaction {
  bookingId: string;
  tourTitle: string;
  customerName: string;
  amount: number;
  status: string;
  date: Date | null;
}

/** Admin-only: returns platform-wide revenue statistics. */
export async function getRevenueStats(): Promise<RevenueStats> { ... }

/** Admin-only: monthly revenue for last N months. */
export async function getMonthlyRevenue(months?: number): Promise<MonthlyRevenue[]> { ... }

/** Admin-only: top N tours sorted by revenue. */
export async function getTopToursByRevenue(limit?: number): Promise<TourRevenue[]> { ... }

/** Admin-only: most recent N transactions. */
export async function getRecentTransactions(limit?: number): Promise<RecentTransaction[]> { ... }
```

**Auth rule:** All revenue queries must call `requireAuth()` and check `user.role === "admin"`.
Throw `ForbiddenError()` if role is not admin.

---

## 7. Dark Mode Setup

### Install next-themes

```bash
npm install next-themes
```

### ThemeProvider wrapper

Create `components/theme-provider.tsx`:
```tsx
"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

Wrap in `app/layout.tsx`:
```tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
  {children}
</ThemeProvider>
```

### Theme Toggle Button

```tsx
"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### globals.css — Add Light Mode Overrides

The current `globals.css` is dark-only. For the dashboard to support true light/dark mode,
add a `.light` or `[data-theme="light"]` block **scoped to dashboard routes only**, OR add
a proper light mode `:root` block and move dark to `.dark`:

```css
/* Add AFTER existing :root block */
.dark {
  /* Keep existing :root values as dark defaults — they already are dark */
}

/* Light mode for dashboard */
.light {
  --background: #ffffff;
  --foreground: #09090b;
  --card: #ffffff;
  --card-foreground: #09090b;
  --popover: #ffffff;
  --popover-foreground: #09090b;
  --primary: #18181b;
  --primary-foreground: #fafafa;
  --secondary: #f4f4f5;
  --secondary-foreground: #18181b;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --accent: #f4f4f5;
  --accent-foreground: #18181b;
  --destructive: #ef4444;
  --border: #e4e4e7;
  --input: #e4e4e7;
  --ring: #18181b;
  --sidebar: #fafafa;
  --sidebar-foreground: #09090b;
  --sidebar-border: #e4e4e7;
}
```

> **Important:** The marketing pages (landing, tours, search, etc.) use the Aurora dark theme
> and must NOT be affected by this change. Apply the `.light` class only on `<html>` for
> dashboard sessions, or scope using a dashboard layout wrapper.

---

## 8. Required shadcn Components — Install Before Building

Run these if the components are not yet in `components/ui/`:

```bash
npx shadcn@latest add card
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add chart
npx shadcn@latest add skeleton
npx shadcn@latest add scroll-area
npx shadcn@latest add avatar
npx shadcn@latest add tooltip
```

Already installed (per `components/ui/`): `badge`, `button`, `card`, `dropdown-menu`,
`select`, `separator`, `sheet`, `tabs`.

---

## 9. Currency Formatting

All monetary values in this project are stored as `Decimal` in VND or USD. Use:

```ts
// utils/format.ts
export function formatCurrency(amount: number, currency = "VND"): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCompact(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`
  return String(amount)
}
```

---

## 10. Server Component Pattern

Revenue page is a Server Component — fetch all data server-side:

```tsx
// app/(dashboard)/revenue/page.tsx
import { getRevenueStats, getMonthlyRevenue, getTopToursByRevenue, getRecentTransactions }
  from "@/data/queries/bookings"

export default async function RevenuePage() {
  const [stats, monthly, topTours, recent] = await Promise.all([
    getRevenueStats(),
    getMonthlyRevenue(6),
    getTopToursByRevenue(5),
    getRecentTransactions(10),
  ])

  return (
    <div className="space-y-6">
      <StatsGrid stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={monthly} />
        <BookingStatusChart stats={stats} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactionsTable data={recent} />
        </div>
        <TopToursCard data={topTours} />
      </div>
    </div>
  )
}
```

Chart sub-components that use `useTheme()` or browser APIs must be `"use client"`.

---

## 11. Loading & Skeleton States

Each section should have a `loading.tsx` or Suspense fallback using `<Skeleton>`:

```tsx
// Skeleton for stat cards
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {Array.from({ length: 4 }).map((_, i) => (
    <Card key={i}>
      <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
      <CardContent><Skeleton className="h-8 w-32 mt-1" /></CardContent>
    </Card>
  ))}
</div>
```

---

## 12. Accessibility & UX Rules

| Rule | Implementation |
|------|---------------|
| Color not only indicator | Always pair color with text label or icon |
| ARIA labels | `aria-label` on icon-only buttons |
| Table headers | Use `<TableHead scope="col">` |
| Focus visible | Shadcn handles this via `--ring` variable |
| Reduced motion | Already in `globals.css` |
| Responsive | Sidebar collapses to Sheet on `< lg` breakpoint |

---

## 13. Anti-Patterns for Dashboard

- ❌ Do NOT use Aurora CSS classes (`aurora-bg`, `glass-card`, `animate-pulse-glow`) in dashboard
- ❌ Do NOT use `--tt-*` custom properties in dashboard components
- ❌ Do NOT use `background-color: #0B1120 !important` override from body — dashboard has its own bg
- ❌ Do NOT import `PrismaClient` directly in page files — use DAL queries only
- ❌ Do NOT skip `requireAuth()` + role check in revenue queries
- ❌ Do NOT use emojis as chart labels or card icons

---

## 14. Pre-Delivery Checklist

- [ ] All revenue queries throw `ForbiddenError` for non-admin roles
- [ ] `getRevenueStats()` returns plain objects (Decimal → Number converted)
- [ ] Light mode: text passes 4.5:1 contrast check
- [ ] Dark mode: chart colors visible against dark background
- [ ] Sidebar active state clearly distinguishable
- [ ] Theme toggle persists across page navigations
- [ ] No horizontal scroll at 375px viewport
- [ ] Skeleton shown during data fetch (Suspense)
- [ ] `npx tsc --noEmit` returns 0 errors after changes
