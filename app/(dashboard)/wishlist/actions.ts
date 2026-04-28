"use server";

/**
 * app/(dashboard)/wishlist/actions.ts
 * Server Actions for wishlist management.
 */
import { revalidatePath } from "next/cache";
import { addToWishlist, removeFromWishlist } from "@/data/mutations/wishlist";
import { AuthError } from "@/lib/auth";
import { ValidationError, NotFoundError } from "@/data/errors";
import type { WishlistItemInput } from "@/data/dto/wishlist";
import type { ActionResult } from "@/app/(dashboard)/bookings/actions";

export async function addToWishlistAction(
  input: WishlistItemInput
): Promise<ActionResult> {
  try {
    await addToWishlist(input);
    revalidatePath("/dashboard/wishlist");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AuthError) return { success: false, error: "Please sign in." };
    if (err instanceof ValidationError) return { success: false, error: err.message };
    if (err instanceof NotFoundError) return { success: false, error: err.message };
    console.error("[WishlistAction]", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function removeFromWishlistAction(
  input: WishlistItemInput
): Promise<ActionResult> {
  try {
    await removeFromWishlist(input);
    revalidatePath("/dashboard/wishlist");
    return { success: true, data: undefined };
  } catch (err) {
    if (err instanceof AuthError) return { success: false, error: "Please sign in." };
    if (err instanceof ValidationError) return { success: false, error: err.message };
    console.error("[WishlistAction]", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
