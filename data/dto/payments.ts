/**
 * data/dto/payments.ts
 * Zod schemas and inferred TS types for payment mutation inputs.
 */
import { z } from "zod";

export const CreatePayosPaymentSchema = z.object({
  tour_id: z.string().length(36, "Invalid tour ID"),
  number_of_people: z.number().int().positive("Must book at least 1 person"),
  total_price: z
    .number()
    .positive("Total price must be greater than 0")
    .multipleOf(0.01, "Price can have at most 2 decimal places"),
  booking_date: z.string().min(1, "Booking date is required"),
  buyer_name: z.string().min(1, "Buyer name is required"),
  buyer_email: z.string().email("Invalid email"),
  buyer_phone: z.string().min(1, "Phone number is required"),
});

export type CreatePayosPaymentInput = z.infer<typeof CreatePayosPaymentSchema>;
