/**
 * data/mutations/wishlist.ts
 * Write operations for the `wishlist` domain.
 */
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { ValidationError, NotFoundError } from "@/data/errors";
import { WishlistItemSchema, type WishlistItemInput } from "@/data/dto/wishlist";

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Adds a tour to the authenticated user's wishlist. */
export async function addToWishlist(input: WishlistItemInput): Promise<void> {
  const user = await requireAuth();

  const parsed = WishlistItemSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { tour_id } = parsed.data;

  const tour = await db.tours.findUnique({
    where: { id: tour_id },
    select: { id: true },
  });
  if (!tour) throw new NotFoundError("Tour", tour_id);

  // Upsert: idempotent — no error if already in wishlist
  await db.wishlist.upsert({
    where: { user_id_tour_id: { user_id: user.id, tour_id } },
    update: {},
    create: { user_id: user.id, tour_id },
  });
}

/** Removes a tour from the authenticated user's wishlist. */
export async function removeFromWishlist(input: WishlistItemInput): Promise<void> {
  const user = await requireAuth();

  const parsed = WishlistItemSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { tour_id } = parsed.data;

  // deleteMany is safe even if the record doesn't exist
  await db.wishlist.deleteMany({
    where: { user_id: user.id, tour_id },
  });
}
