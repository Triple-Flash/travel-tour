"use server";

import { revalidatePath } from "next/cache";
import { createReview, updateReview } from "@/data/mutations/reviews";
import { AuthError } from "@/lib/auth";
import { ValidationError, NotFoundError, ForbiddenError } from "@/data/errors";
import type { CreateReviewInput, UpdateReviewInput } from "@/data/dto/reviews";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

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

function resolveError(err: unknown): string {
  if (err instanceof AuthError) return "Please sign in to continue.";
  if (err instanceof ValidationError) return err.message;
  if (err instanceof NotFoundError) return err.message;
  if (err instanceof ForbiddenError) return err.message;
  console.error("[MarketingBookingReviewAction]", err);
  return "An unexpected error occurred.";
}
