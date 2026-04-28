import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { ForbiddenError } from "@/data/errors"
import { ToursDataTable } from "@/components/admin/ToursDataTable"

export const metadata = { title: "Tours — TravelTour Admin" }

async function getAllTours() {
  const user = await getSession()
  if (!user || user.role !== "admin") throw new ForbiddenError()

  const tours = await db.tours.findMany({
    orderBy: { created_at: "desc" },
    take: 200,
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      duration: true,
      max_capacity: true,
      destination_id: true,
      destinations: { select: { name: true } },
    },
  })

  return tours.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    destinationName: t.destinations?.name ?? null,
    price: Number(t.price),
    duration: t.duration,
    max_capacity: t.max_capacity,
    destination_id: t.destination_id,
  }))
}

export default async function AdminToursPage() {
  let tours
  try {
    tours = await getAllTours()
  } catch {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold tracking-tight">Quản Lý Tours</div>
        <p className="text-sm text-muted-foreground mt-0.5">{tours.length} tour trong hệ thống</p>
      </div>

      <Card className="overflow-hidden p-0">
        <ToursDataTable data={tours} />
      </Card>
    </div>
  )
}
