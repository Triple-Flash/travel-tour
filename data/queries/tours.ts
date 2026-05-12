/**
 * data/queries/tours.ts
 * Pure read functions for the `tours` domain.
 * Public reads (no auth required); user-scoped reads call requireAuth().
 */
import { db } from "@/lib/db";
import { NotFoundError } from "@/data/errors";
import { unstable_cache } from "next/cache";

// ─── Plain TS types ───────────────────────────────────────────────────────────

export interface TourSummary {
  id: string;
  title: string;
  description: string | null;
  price: number;
  duration: number;
  max_capacity: number;
  created_at: Date | null;
  destination: {
    id: string;
    name: string;
    country: string;
    image_url: string | null;
  } | null;
  images: { id: string; image_url: string }[];
  avg_rating: number | null;
  review_count: number;
}

export interface TourDetail extends TourSummary {
  reviews: {
    id: string;
    rating: number | null;
    comment: string | null;
    created_at: Date | null;
    user: { id: string; full_name: string } | null;
  }[];
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Lists all tours with basic info, optionally filtered by destination. */
export const getTours = unstable_cache(
  async (destinationId?: string): Promise<TourSummary[]> => {
    const tours = await db.tours.findMany({
      where: destinationId ? { destination_id: destinationId } : undefined,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        duration: true,
        max_capacity: true,
        created_at: true,
        destinations: {
          select: { id: true, name: true, country: true, image_url: true },
        },
        tour_images: { select: { id: true, image_url: true } },
        reviews: { select: { rating: true } },
      },
    });

    return tours.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      price: Number(t.price),
      duration: t.duration,
      max_capacity: t.max_capacity,
      created_at: t.created_at,
      destination: t.destinations ?? null,
      images: t.tour_images,
      avg_rating:
        t.reviews.length > 0
          ? t.reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / t.reviews.length
          : null,
      review_count: t.reviews.length,
    }));
  },
  ["tours-all"],
  { revalidate: 3600, tags: ["tours"] }
);

/** Returns the newest N tours for featured tours section on homepage. */
export const getFeaturedTours = unstable_cache(
  async (limit = 3): Promise<TourSummary[]> => {
    const tours = await db.tours.findMany({
      take: limit,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        duration: true,
        max_capacity: true,
        created_at: true,
        destinations: {
          select: { id: true, name: true, country: true, image_url: true },
        },
        tour_images: { select: { id: true, image_url: true } },
        reviews: { select: { rating: true } },
      },
    });

    return tours.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      price: Number(t.price),
      duration: t.duration,
      max_capacity: t.max_capacity,
      created_at: t.created_at,
      destination: t.destinations ?? null,
      images: t.tour_images,
      avg_rating:
        t.reviews.length > 0
          ? t.reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / t.reviews.length
          : null,
      review_count: t.reviews.length,
    }));
  },
  ["tours-featured"],
  { revalidate: 3600, tags: ["tours"] }
);

/** Returns full tour detail including reviews. */
export const getTourById = unstable_cache(
  async (id: string): Promise<TourDetail> => {
    const tour = await db.tours.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        duration: true,
        max_capacity: true,
        created_at: true,
        destinations: {
          select: { id: true, name: true, country: true, image_url: true },
        },
        tour_images: { select: { id: true, image_url: true } },
        reviews: {
          orderBy: { created_at: "desc" },
          select: {
            id: true,
            rating: true,
            comment: true,
            created_at: true,
            users: { select: { id: true, full_name: true } },
          },
        },
      },
    });

    if (!tour) throw new NotFoundError("Tour", id);

    return {
      id: tour.id,
      title: tour.title,
      description: tour.description,
      price: Number(tour.price),
      duration: tour.duration,
      max_capacity: tour.max_capacity,
      created_at: tour.created_at,
      destination: tour.destinations ?? null,
      images: tour.tour_images,
      avg_rating:
        tour.reviews.length > 0
          ? tour.reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
            tour.reviews.length
          : null,
      review_count: tour.reviews.length,
      reviews: tour.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        user: r.users ?? null,
      })),
    };
  },
  ["tours-detail"],
  { revalidate: 3600, tags: ["tours"] }
);

// ─── Search Filters ──────────────────────────────────────────────────────────

export interface SearchToursFilters {
  destination?: string;      // Destination name or keyword (case-insensitive)
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  minRating?: number;
  guests?: number;           // Filter by max_capacity >= guests
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest";
}

/** Searches tours with multiple filters. Public — no auth required. */
export const searchTours = unstable_cache(
  async (filters: SearchToursFilters): Promise<TourSummary[]> => {
    // Build Prisma where clause
    const where: Record<string, unknown> = {};

    if (filters.destination) {
      where.destinations = {
        OR: [
          { name: { contains: filters.destination, mode: "insensitive" } },
          { country: { contains: filters.destination, mode: "insensitive" } },
        ],
      };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) (where.price as Record<string, unknown>).gte = filters.minPrice;
      if (filters.maxPrice !== undefined) (where.price as Record<string, unknown>).lte = filters.maxPrice;
    }

    if (filters.minDuration !== undefined || filters.maxDuration !== undefined) {
      where.duration = {};
      if (filters.minDuration !== undefined) (where.duration as Record<string, unknown>).gte = filters.minDuration;
      if (filters.maxDuration !== undefined) (where.duration as Record<string, unknown>).lte = filters.maxDuration;
    }

    if (filters.guests !== undefined) {
      where.max_capacity = { gte: filters.guests };
    }

    // Determine sort order
    let orderBy: Record<string, string>;
    switch (filters.sortBy) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "newest":
        orderBy = { created_at: "desc" };
        break;
      default:
        orderBy = { created_at: "desc" };
    }

    const tours = await db.tours.findMany({
      where,
      orderBy,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        duration: true,
        max_capacity: true,
        created_at: true,
        destinations: {
          select: { id: true, name: true, country: true, image_url: true },
        },
        tour_images: { select: { id: true, image_url: true } },
        reviews: { select: { rating: true } },
      },
    });

    let results: TourSummary[] = tours.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      price: Number(t.price),
      duration: t.duration,
      max_capacity: t.max_capacity,
      created_at: t.created_at,
      destination: t.destinations ?? null,
      images: t.tour_images,
      avg_rating:
        t.reviews.length > 0
          ? t.reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / t.reviews.length
          : null,
      review_count: t.reviews.length,
    }));

    // Post-filter by rating (can't do this purely in Prisma since avg is computed)
    if (filters.minRating !== undefined) {
      results = results.filter(
        (t) => t.avg_rating !== null && t.avg_rating >= filters.minRating!
      );
    }

    // Sort by rating if requested (post-filter since rating is computed)
    if (filters.sortBy === "rating") {
      results.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0));
    }

    return results;
  },
  ["tours-search"],
  { revalidate: 3600, tags: ["tours"] }
);

