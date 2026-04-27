"use server";

/**
 * app/(marketing)/checkout/[id]/actions.ts
 * Server Actions for the PayOS checkout flow.
 * Calls data/mutations/payments — no direct DB access.
 */
import { createPayosPayment } from "@/data/mutations/payments";
import { AuthError } from "@/lib/auth";
import { ValidationError, NotFoundError, ForbiddenError } from "@/data/errors";
import type { CreatePayosPaymentInput } from "@/data/dto/payments";

// ─── Action result type ───────────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function createPayosCheckoutAction(
  input: CreatePayosPaymentInput
): Promise<ActionResult<{ checkoutUrl: string }>> {
  try {
    const result = await createPayosPayment(input);
    return { success: true, data: { checkoutUrl: result.checkoutUrl } };
  } catch (err) {
    return { success: false, error: resolveError(err) };
  }
}

// ─── Shared error resolver ────────────────────────────────────────────────────

function resolveError(err: unknown): string {
  if (err instanceof AuthError) return "Vui lòng đăng nhập để tiếp tục.";
  if (err instanceof ValidationError) return err.message;
  if (err instanceof NotFoundError) return err.message;
  if (err instanceof ForbiddenError) return err.message;
  console.error("[CheckoutAction]", err);
  return "Đã xảy ra lỗi. Vui lòng thử lại.";
}
