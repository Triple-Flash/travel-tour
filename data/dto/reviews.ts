/**
 * data/dto/reviews.ts
 * Zod schemas and inferred TS types for review mutation inputs.
 */
import { z } from "zod";

export const CreateReviewSchema = z.object({
  tour_id: z.string().trim().min(1, "Invalid tour ID"),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z.string().max(2000, "Comment must be under 2000 characters").optional(),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

export const UpdateReviewSchema = CreateReviewSchema.partial().extend({
  id: z.string().trim().min(1, "Invalid review ID"),
});

export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;
