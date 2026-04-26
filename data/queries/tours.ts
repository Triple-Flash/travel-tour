/**
 * data/queries/tours.ts
 * Pure read functions for the `tours` domain.
 * Public reads (no auth required); user-scoped reads call requireAuth().
 */
import { db } from "@/lib/db";
import { NotFoundError } from "@/data/errors";

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
export async function getTours(destinationId?: string): Promise<TourSummary[]> {
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
}

/** Returns the newest N tours for featured tours section on homepage. */
export async function getFeaturedTours(limit = 3): Promise<TourSummary[]> {
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
}

/** Returns full tour detail including reviews. */
export async function getTourById(id: string): Promise<TourDetail> {
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
}
