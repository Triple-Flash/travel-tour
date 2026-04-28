/**
 * data/queries/promotions.ts
 * Pure read functions for the `promotions` domain.
 * Public — no auth required (promotions are validated at checkout).
 */
import { db } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/data/errors";
import { ValidatePromoSchema } from "@/data/dto/promotions";

// ─── Plain TS types ───────────────────────────────────────────────────────────

export interface Promotion {
  id: string;
  code: string;
  discount_percentage: number | null;
  expiration_date: Date | null;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Looks up a promotion code, validates it is not expired, and returns it.
 * Throws ValidationError if expired, NotFoundError if code doesn't exist.
 */
export async function getPromotionByCode(code: string): Promise<Promotion> {
  const parsed = ValidatePromoSchema.safeParse({ code });
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues.map((i) => i.message).join(", ")
    );
  }

  const promo = await db.promotions.findUnique({
    where: { code: parsed.data.code },
    select: {
      id: true,
      code: true,
      discount_percentage: true,
      expiration_date: true,
    },
  });

  if (!promo) throw new NotFoundError("Promotion", parsed.data.code);

  if (promo.expiration_date && promo.expiration_date < new Date()) {
    throw new ValidationError(
      `Mã khuyến mãi "${parsed.data.code}" đã hết hạn sử dụng.`
    );
  }

  return {
    id: promo.id,
    code: promo.code,
    discount_percentage: promo.discount_percentage,
    expiration_date: promo.expiration_date,
  };
}
