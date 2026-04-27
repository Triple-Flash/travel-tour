"use server";

import { revalidatePath } from "next/cache";
import { addToWishlist, removeFromWishlist } from "@/data/mutations/wishlist";
import { AuthError } from "@/lib/auth";
import { ValidationError, NotFoundError } from "@/data/errors";
import type { WishlistItemInput } from "@/data/dto/wishlist";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function addToWishlistAction(
  input: WishlistItemInput
): Promise<ActionResult> {
  try {
    await addToWishlist(input);
    revalidatePath(`/tours/${input.tour_id}`);
    revalidatePath("/profile");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: resolveError(err) };
  }
}

export async function removeFromWishlistAction(
  input: WishlistItemInput
): Promise<ActionResult> {
  try {
    await removeFromWishlist(input);
    revalidatePath(`/tours/${input.tour_id}`);
    revalidatePath("/profile");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: resolveError(err) };
  }
}

function resolveError(err: unknown): string {
  if (err instanceof AuthError) return "Please sign in to continue.";
  if (err instanceof ValidationError) return err.message;
  if (err instanceof NotFoundError) return err.message;
  console.error("[TourWishlistAction]", err);
  return "An unexpected error occurred. Please try again.";
}
