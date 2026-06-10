/**
 * data/mutations/reviews.ts
 * Write operations for the `reviews` domain.
 */
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { ValidationError, NotFoundError, ForbiddenError } from "@/data/errors";
import {
  CreateReviewSchema,
  UpdateReviewSchema,
  type CreateReviewInput,
  type UpdateReviewInput,
} from "@/data/dto/reviews";

// ─── Mutations ────────────────────────────────────────────────────────────────

/** Creates a review for a tour the authenticated user has booked. */
export async function createReview(
  input: CreateReviewInput
): Promise<{ id: string }> {
  const user = await requireAuth();

  const parsed = CreateReviewSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { tour_id, rating, comment } = parsed.data;

  // Verify the tour exists and fetch its duration for eligibility check
  const tour = await db.tours.findUnique({
    where: { id: tour_id },
    select: { id: true, duration: true },
  });
  if (!tour) throw new NotFoundError("Tour", tour_id);

  const successfulBooking = await db.bookings.findFirst({
    where: {
      user_id: user.id,
      tour_id,
      status: "confirmed",
      payments: {
        payment_status: "completed",
      },
    },
    select: { id: true, booking_date: true },
  });
  if (!successfulBooking) {
    throw new ForbiddenError("You can only review tours you have paid for successfully.");
  }

  // Check that the tour has been completed before allowing a rating
  if (successfulBooking.booking_date) {
    const completionDate = new Date(successfulBooking.booking_date);
    completionDate.setDate(completionDate.getDate() + tour.duration);
    const now = new Date();

    if (now < completionDate) {
      throw new ForbiddenError(
        "Bạn có thể đánh giá tour này từ ngày " +
          completionDate.toLocaleDateString("vi-VN") +
          ". Hãy quay lại sau khi hoàn thành chuyến đi nhé!"
      );
    }
  }

  // Prevent duplicate reviews
  const existing = await db.reviews.findFirst({
    where: { user_id: user.id, tour_id },
    select: { id: true },
  });
  if (existing) {
    throw new ValidationError("You have already reviewed this tour.");
  }

  const review = await db.reviews.create({
    data: { user_id: user.id, tour_id, rating, comment },
    select: { id: true },
  });

  return { id: review.id };
}

/** Updates the authenticated user's own review. */
export async function updateReview(input: UpdateReviewInput): Promise<void> {
  const user = await requireAuth();

  const parsed = UpdateReviewSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const { id, rating, comment } = parsed.data;

  const review = await db.reviews.findUnique({
    where: { id },
    select: { id: true, user_id: true },
  });
  if (!review) throw new NotFoundError("Review", id);
  if (review.user_id !== user.id) throw new ForbiddenError();

  await db.reviews.update({
    where: { id },
    data: {
      ...(rating !== undefined && { rating }),
      ...(comment !== undefined && { comment }),
    },
  });
}

/** Deletes the authenticated user's own review. */
export async function deleteReview(id: string): Promise<void> {
  const user = await requireAuth();

  const review = await db.reviews.findUnique({
    where: { id },
    select: { id: true, user_id: true },
  });
  if (!review) throw new NotFoundError("Review", id);
  if (review.user_id !== user.id && user.role !== "admin") throw new ForbiddenError();

  await db.reviews.delete({ where: { id } });
}
