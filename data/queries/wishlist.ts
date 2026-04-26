/**
 * data/queries/wishlist.ts
 * Pure read functions for the `wishlist` domain.
 * Always user-scoped — requireAuth() is called at the top.
 */
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// ─── Plain TS types ───────────────────────────────────────────────────────────

export interface WishlistItem {
  tour: {
    id: string;
    title: string;
    price: number;
    duration: number;
    images: { image_url: string }[];
    destination: { name: string; country: string; image_url: string | null } | null;
  };
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Returns the current user's wishlist. */
export async function getMyWishlist(): Promise<WishlistItem[]> {
  const user = await requireAuth();

  const items = await db.wishlist.findMany({
    where: { user_id: user.id },
    select: {
      tours: {
        select: {
          id: true,
          title: true,
          price: true,
          duration: true,
          tour_images: { select: { image_url: true }, take: 1 },
          destinations: {
            select: { name: true, country: true, image_url: true },
          },
        },
      },
    },
  });

  return items.map((item) => ({
    tour: {
      id: item.tours.id,
      title: item.tours.title,
      price: Number(item.tours.price),
      duration: item.tours.duration,
      images: item.tours.tour_images,
      destination: item.tours.destinations ?? null,
    },
  }));
}
