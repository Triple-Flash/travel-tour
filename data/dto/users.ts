/**
 * data/dto/users.ts
 * Zod schemas and inferred TS types for user mutation inputs.
 */
import { z } from "zod";

export const UpdateUserSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(255).optional(),
  phone_number: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Invalid phone number")
    .optional()
    .nullable(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
