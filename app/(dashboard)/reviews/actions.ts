"use server";

/**
 * app/(dashboard)/reviews/actions.ts
 * Server Actions for reviews management.
 */
import { revalidatePath } from "next/cache";
import {
  createReview,
  updateReview,
  deleteReview,
} from "@/data/mutations/reviews";
import { AuthError } from "@/lib/auth";
import { ValidationError, NotFoundError, ForbiddenError } from "@/data/errors";
import type { CreateReviewInput, UpdateReviewInput } from "@/data/dto/reviews";
import type { ActionResult } from "@/app/(dashboard)/bookings/actions";

function resolveError(err: unknown): string {
  if (err instanceof AuthError) return "Please sign in to continue.";
  if (err instanceof ValidationError) return err.message;
  if (err instanceof NotFoundError) return err.message;
  if (err instanceof ForbiddenError) return err.message;
  console.error("[ReviewAction]", err);
  return "An unexpected error occurred.";
}

export async function createReviewAction(
  input: CreateReviewInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const result = await createReview(input);
    revalidatePath("/tours");
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: resolveError(err) };
  }
}

export async function updateReviewAction(
  input: UpdateReviewInput
): Promise<ActionResult> {
  try {
    await updateReview(input);
    revalidatePath("/tours");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: resolveError(err) };
  }
}

export async function deleteReviewAction(id: string): Promise<ActionResult> {
  try {
    await deleteReview(id);
    revalidatePath("/tours");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: resolveError(err) };
  }
}
