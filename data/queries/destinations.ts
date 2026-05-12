/**
 * data/queries/destinations.ts
 * Pure read functions for the `destinations` domain.
 * Public — no auth required.
 */
import { db } from "@/lib/db";
import { NotFoundError } from "@/data/errors";
import { unstable_cache } from "next/cache";

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
export const getDestinations = unstable_cache(
  async (): Promise<Destination[]> => {
    const destinations = await db.destinations.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        country: true,
        description: true,
        image_url: true,
        _count: { select: { tours: true } },
      },
    });

    return destinations.map((d) => ({
      id: d.id,
      name: d.name,
      country: d.country,
      description: d.description,
      image_url: d.image_url,
      tour_count: d._count.tours,
    }));
  },
  ["destinations-all"],
  { revalidate: 3600, tags: ["destinations"] }
);

/** Returns top N destinations ordered by tour count (descending) for homepage. */
export const getTopDestinations = unstable_cache(
  async (limit = 6): Promise<Destination[]> => {
    const destinations = await db.destinations.findMany({
      orderBy: { tours: { _count: "desc" } },
      take: limit,
      select: {
        id: true,
        name: true,
        country: true,
        description: true,
        image_url: true,
        _count: { select: { tours: true } },
      },
    });

    return destinations.map((d) => ({
      id: d.id,
      name: d.name,
      country: d.country,
      description: d.description,
      image_url: d.image_url,
      tour_count: d._count.tours,
    }));
  },
  ["destinations-top"],
  { revalidate: 3600, tags: ["destinations"] }
);

/** Returns a single destination by ID. */
export const getDestinationById = unstable_cache(
  async (id: string): Promise<Destination> => {
    const destination = await db.destinations.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        country: true,
        description: true,
        image_url: true,
        _count: { select: { tours: true } },
      },
    });

    if (!destination) throw new NotFoundError("Destination", id);

    return {
      id: destination.id,
      name: destination.name,
      country: destination.country,
      description: destination.description,
      image_url: destination.image_url,
      tour_count: destination._count.tours,
    };
  },
  ["destinations-detail"],
  { revalidate: 3600, tags: ["destinations"] }
);
