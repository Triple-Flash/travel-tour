/**
 * data/dto/wishlist.ts
 * Zod schemas and inferred TS types for wishlist mutation inputs.
 */
import { z } from "zod";

export const WishlistItemSchema = z.object({
  tour_id: z.string().uuid("Invalid tour ID"),
});

export type WishlistItemInput = z.infer<typeof WishlistItemSchema>;
