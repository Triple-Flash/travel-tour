"use server";

/**
 * app/(dashboard)/bookings/actions.ts
 * Server Actions for the bookings domain.
 * Calls data/mutations/* only — no direct DB or Prisma imports.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createBooking, cancelBooking } from "@/data/mutations/bookings";
import { AuthError } from "@/lib/auth";
import { ValidationError, NotFoundError, ForbiddenError } from "@/data/errors";
import type { CreateBookingInput } from "@/data/dto/bookings";

// ─── Action result type ───────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createBookingAction(
  input: CreateBookingInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const result = await createBooking(input);
    revalidatePath("/dashboard/bookings");
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: resolveError(err) };
  }
}

export async function cancelBookingAction(id: string): Promise<ActionResult> {
  try {
    await cancelBooking(id);
    revalidatePath("/dashboard/bookings");
    return { success: true, data: undefined };
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
  console.error("[BookingAction]", err);
  return "An unexpected error occurred. Please try again.";
}
