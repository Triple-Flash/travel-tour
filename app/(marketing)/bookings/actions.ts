"use server";

import { revalidatePath } from "next/cache";
import { createReview, updateReview } from "@/data/mutations/reviews";
import { repayBookingPayment } from "@/data/mutations/payments";
import { AuthError } from "@/lib/auth";
import { ValidationError, NotFoundError, ForbiddenError } from "@/data/errors";
import type { CreateReviewInput, UpdateReviewInput } from "@/data/dto/reviews";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Review actions ───────────────────────────────────────────────────────────

export async function createReviewAction(
  input: CreateReviewInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const result = await createReview(input);
    revalidatePath("/bookings");
    revalidatePath(`/tours/${input.tour_id}`);
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: resolveError(err) };
  }
}

export async function updateReviewAction(
  tourId: string,
  input: UpdateReviewInput
): Promise<ActionResult> {
  try {
    await updateReview(input);
    revalidatePath("/bookings");
    revalidatePath(`/tours/${tourId}`);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: resolveError(err) };
  }
}

// ─── Repay action ─────────────────────────────────────────────────────────────

/**
 * Re-generates a PayOS checkout URL for an existing pending booking.
 * Does NOT create a new booking — updates the existing payment row only.
 */
export async function repayAction(
  bookingId: string
): Promise<ActionResult<{ checkoutUrl: string }>> {
  try {
    const result = await repayBookingPayment(bookingId);
    return { success: true, data: { checkoutUrl: result.checkoutUrl } };
  } catch (err) {
    return { success: false, error: resolveError(err) };
  }
}

// ─── Shared error resolver ────────────────────────────────────────────────────

function resolveError(err: unknown): string {
  if (err instanceof AuthError) return "Please sign in to continue.";
  if (err instanceof ValidationError) return err.message;
  if (err instanceof NotFoundError) return err.message;
  if (err instanceof ForbiddenError) return err.message;
  console.error("[BookingsAction]", err);
  return "An unexpected error occurred.";
}
