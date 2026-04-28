import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminTopbar } from "@/components/admin/AdminTopbar"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = {
  title: "TravelTour Admin",
  description: "Admin dashboard for TravelTour platform",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()

  // Redirect non-admins immediately
  if (!user || user.role !== "admin") {
    redirect("/")
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      themes={["light", "admin-dark"]}
      disableTransitionOnChange
    >
      <div className="admin-shell flex h-screen bg-background text-foreground overflow-hidden">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <AdminTopbar user={user} />
          <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
