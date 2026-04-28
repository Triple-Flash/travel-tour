/**
 * data/mutations/bookings.ts
 * Write operations for the `bookings` domain.
 * Multi-step writes are wrapped in a Prisma transaction.
 */
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { ValidationError, NotFoundError, ForbiddenError } from "@/data/errors";
import {
  CreateBookingSchema,
  UpdateBookingStatusSchema,
  type CreateBookingInput,
  type UpdateBookingStatusInput,
} from "@/data/dto/bookings";
import type { Booking } from "@/data/queries/bookings";

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Creates a new booking for the authenticated user.
 * Validates that the tour exists and has enough capacity.
 */
export async function createBooking(input: CreateBookingInput): Promise<{ id: string }> {
  const user = await requireAuth();

  const parsed = CreateBookingSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { tour_id, number_of_people, total_price } = parsed.data;

  // Use a transaction: check capacity, then create booking
  const result = await db.$transaction(async (tx) => {
    const tour = await tx.tours.findUnique({
      where: { id: tour_id },
      select: { id: true, max_capacity: true },
    });

    if (!tour) throw new NotFoundError("Tour", tour_id);

    // Naive capacity check — for production add confirmed bookings count
    if (number_of_people > tour.max_capacity) {
      throw new ValidationError(
        `This tour only allows up to ${tour.max_capacity} people per booking.`
      );
    }

    const booking = await tx.bookings.create({
      data: {
        user_id: user.id,
        tour_id,
        number_of_people,
        total_price,
        status: "pending",
      },
      select: { id: true },
    });

    return booking;
  });

  return { id: result.id };
}

/**
 * Cancels the current user's booking (sets status to "cancelled").
 * Only the owner or an admin may cancel.
 */
export async function cancelBooking(id: string): Promise<void> {
  const user = await requireAuth();

  const booking = await db.bookings.findUnique({
    where: { id },
    select: { id: true, user_id: true, status: true },
  });

  if (!booking) throw new NotFoundError("Booking", id);
  if (booking.user_id !== user.id && user.role !== "admin") throw new ForbiddenError();
  if (booking.status === "cancelled") {
    throw new ValidationError("Booking is already cancelled.");
  }

  await db.bookings.update({
    where: { id },
    data: { status: "cancelled" },
  });
}

/**
 * Updates the status of any booking (admin-only in production — add RBAC as needed).
 */
export async function updateBookingStatus(
  input: UpdateBookingStatusInput
): Promise<void> {
  await requireAuth();

  const parsed = UpdateBookingStatusSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const booking = await db.bookings.findUnique({
    where: { id: parsed.data.id },
    select: { id: true },
  });
  if (!booking) throw new NotFoundError("Booking", parsed.data.id);

  await db.bookings.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });
}
