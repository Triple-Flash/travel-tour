/**
 * data/dto/promotions.ts
 * Zod schemas and inferred TS types for promotion inputs.
 */
import { z } from "zod";

export const ValidatePromoSchema = z.object({
  code: z
    .string()
    .min(1, "Promotion code is required")
    .max(50, "Promotion code is too long")
    .toUpperCase(),
});

export type ValidatePromoInput = z.infer<typeof ValidatePromoSchema>;
