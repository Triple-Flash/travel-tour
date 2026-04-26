/**
 * data/dto/bookings.ts
 * Zod schemas and inferred TS types for booking mutation inputs.
 */
import { z } from "zod";

export const CreateBookingSchema = z.object({
  tour_id: z.string().uuid("Invalid tour ID"),
  number_of_people: z.number().int().positive("Must book at least 1 person"),
  total_price: z
    .number()
    .positive("Total price must be greater than 0")
    .multipleOf(0.01, "Price can have at most 2 decimal places"),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

export const UpdateBookingStatusSchema = z.object({
  id: z.string().uuid("Invalid booking ID"),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
});

export type UpdateBookingStatusInput = z.infer<typeof UpdateBookingStatusSchema>;
