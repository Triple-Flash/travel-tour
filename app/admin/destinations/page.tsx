import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { ForbiddenError } from "@/data/errors"
import { DestinationsDataTable } from "@/components/admin/DestinationsDataTable"

export const metadata = { title: "Điểm đến - TravelTour Admin" }

async function getAllDestinations() {
  const user = await getSession()
  if (!user || user.role !== "admin") throw new ForbiddenError()

  const destinations = await db.destinations.findMany({
    orderBy: [{ country: "asc" }, { name: "asc" }],
    take: 200,
    select: {
      id: true,
      name: true,
      country: true,
      description: true,
      image_url: true,
      _count: { select: { tours: true } },
    },
  })

  return destinations.map((destination) => ({
    id: destination.id,
    name: destination.name,
    country: destination.country,
    description: destination.description,
    image_url: destination.image_url,
    tourCount: destination._count.tours,
  }))
}

export default async function AdminDestinationsPage() {
  let destinations
  try {
    destinations = await getAllDestinations()
  } catch {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold tracking-tight">Quản lý điểm đến</div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {destinations.length} điểm đến trong hệ thống
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <DestinationsDataTable data={destinations} />
      </Card>
    </div>
  )
}
