/**
 * data/queries/destinations.ts
 * Pure read functions for the `destinations` domain.
 * Public — no auth required.
 */
import { db } from "@/lib/db";
import { NotFoundError } from "@/data/errors";

// ─── Plain TS types ───────────────────────────────────────────────────────────

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string | null;
  image_url: string | null;
  tour_count: number;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Returns all destinations with a count of their tours. */
export async function getDestinations(): Promise<Destination[]> {
  const destinations = await db.destinations.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      country: true,
      description: true,
      image_url: true,
      tours: { select: { id: true } },
    },
  });

  return destinations.map((d) => ({
    id: d.id,
    name: d.name,
    country: d.country,
    description: d.description,
    image_url: d.image_url,
    tour_count: d.tours.length,
  }));
}

/** Returns top N destinations ordered by tour count (descending) for homepage. */
export async function getTopDestinations(limit = 6): Promise<Destination[]> {
  const destinations = await db.destinations.findMany({
    select: {
      id: true,
      name: true,
      country: true,
      description: true,
      image_url: true,
      tours: { select: { id: true } },
    },
  });

  return destinations
    .map((d) => ({
      id: d.id,
      name: d.name,
      country: d.country,
      description: d.description,
      image_url: d.image_url,
      tour_count: d.tours.length,
    }))
    .sort((a, b) => b.tour_count - a.tour_count)
    .slice(0, limit);
}

/** Returns a single destination by ID. */
export async function getDestinationById(id: string): Promise<Destination> {
  const destination = await db.destinations.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      country: true,
      description: true,
      image_url: true,
      tours: { select: { id: true } },
    },
  });

  if (!destination) throw new NotFoundError("Destination", id);

  return {
    id: destination.id,
    name: destination.name,
    country: destination.country,
    description: destination.description,
    image_url: destination.image_url,
    tour_count: destination.tours.length,
  };
}
