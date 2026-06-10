/**
 * data/mutations/payments.ts
 * Write operations for the `payments` domain.
 * Creates bookings + PayOS payment links in a single transaction.
 */
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { payos } from "@/lib/payos";
import { getPublicSiteUrl } from "@/lib/site-url";
import { ValidationError, NotFoundError, ForbiddenError } from "@/data/errors";
import { randomInt } from "crypto";
import {
  CreatePayosPaymentSchema,
  type CreatePayosPaymentInput,
} from "@/data/dto/payments";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PayosPaymentResult {
  bookingId: string;
  paymentId: string;
  checkoutUrl: string;
  orderCode: number;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Creates a booking + payment record, then creates a PayOS payment link.
 *
 * CONCURRENCY: Atomically decrements tour max_capacity inside a transaction.
 * If the lock fails (not enough capacity), the caller is rejected BEFORE
 * any payment link is created — no charge, no refund needed.
 *
 * The lock is held by the "pending" booking. If the user abandons checkout,
 * stale locks are cleaned up by cancelExpiredPayments() (5-min TTL).
 */
export async function createPayosPayment(
  input: CreatePayosPaymentInput
): Promise<PayosPaymentResult> {
  const user = await requireAuth();

  const parsed = CreatePayosPaymentSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues.map((i) => i.message).join(", ")
    );
  }

  const {
    tour_id,
    number_of_people,
    total_price,
    booking_date,
    buyer_name,
    buyer_email,
    buyer_phone,
  } = parsed.data;

  // Generate a cryptographically unique order code (PayOS requires a positive integer).
  // randomInt avoids same-millisecond collisions that Date.now() would have.
  const orderCode = randomInt(1, 2_147_483_647);

  // ── Step 1: Atomically lock the slot ──────────────────────────────────────
  // Uses an atomic conditional UPDATE — the WHERE max_capacity >= N clause
  // and the SET decrement happen in a single statement. Postgres serializes
  // writes, so only ONE concurrent transaction sees result.count === 1.
  // If the lock fails (not enough capacity), the caller is rejected BEFORE
  // any payment link is created — no charge, no refund needed.
  const result = await db.$transaction(async (tx) => {
    // Atomic lock: "give me N seats IF at least N remain"
    const locked = await tx.tours.updateMany({
      where: { id: tour_id, max_capacity: { gte: number_of_people } },
      data: { max_capacity: { decrement: number_of_people } },
    });

    if (locked.count === 0) {
      // Could be not found OR not enough capacity — distinguish with a read
      const tour = await tx.tours.findUnique({
        where: { id: tour_id },
        select: { id: true, title: true, max_capacity: true },
      });
      if (!tour) throw new NotFoundError("Tour", tour_id);

      throw new ValidationError(
        "Rất tiếc, tour này vừa được người khác đặt trước. " +
          "Bạn chưa bị trừ tiền. Bạn có muốn khám phá các tour " +
          "hoặc ngày khởi hành khác không?"
      );
    }

    // Lock acquired — get tour title for the PayOS description
    const tour = await tx.tours.findUnique({
      where: { id: tour_id },
      select: { title: true },
    });
    if (!tour) throw new NotFoundError("Tour", tour_id);

    // Create pending booking (holds the lock)
    const booking = await tx.bookings.create({
      data: {
        user_id: user.id,
        tour_id,
        booking_date: new Date(booking_date),
        number_of_people,
        total_price,
        status: "pending",
      },
      select: { id: true },
    });

    // Create pending payment record
    const payment = await tx.payments.create({
      data: {
        booking_id: booking.id,
        payment_method: "payos",
        amount: total_price,
        payment_status: "pending",
        payos_order_code: orderCode,
      },
      select: { id: true },
    });

    return { bookingId: booking.id, paymentId: payment.id, tourTitle: tour.title };
  });

  // ── Step 2: Create PayOS payment link (only for the lock holder) ────────
  const siteUrl = getPublicSiteUrl();
  const paymentLinkResponse = await payos.paymentRequests.create({
    orderCode,
    amount: Math.round(total_price),
    description: `Tour: ${result.tourTitle}`.slice(0, 25),
    buyerName: buyer_name,
    buyerEmail: buyer_email,
    buyerPhone: buyer_phone,
    returnUrl: `${siteUrl}/checkout/success?orderCode=${orderCode}`,
    cancelUrl: `${siteUrl}/checkout/cancel?orderCode=${orderCode}`,
    items: [
      {
        name: result.tourTitle.slice(0, 256),
        quantity: number_of_people,
        price: Math.round(total_price / number_of_people),
      },
    ],
  });

  return {
    bookingId: result.bookingId,
    paymentId: result.paymentId,
    checkoutUrl: paymentLinkResponse.checkoutUrl,
    orderCode,
  };
}

/**
 * Confirms a PayOS payment after webhook callback.
 * The capacity lock was already acquired in createPayosPayment,
 * so we only need to mark the booking as confirmed.
 */
export async function confirmPayosPayment(
  orderCode: number,
  transactionRef?: string
): Promise<void> {
  await db.$transaction(async (tx) => {
    const payment = await tx.payments.findUnique({
      where: { payos_order_code: orderCode },
      select: { id: true, booking_id: true, payment_status: true },
    });

    if (!payment) throw new NotFoundError("Payment", `orderCode:${orderCode}`);

    // Idempotent: if already completed, skip (don't double-update)
    if (payment.payment_status === "completed") return;

    await tx.payments.update({
      where: { id: payment.id },
      data: {
        payment_status: "completed",
        payos_transaction_id: transactionRef ?? null,
        payment_date: new Date(),
      },
    });

    if (payment.booking_id) {
      // Only confirm if the booking is still pending (lock hasn't expired)
      // updateMany is atomic — two concurrent webhooks cannot double-confirm
      await tx.bookings.updateMany({
        where: {
          id: payment.booking_id,
          status: "pending",
        },
        data: { status: "confirmed" },
      });
    }
  });
}

/**
 * Cancels a PayOS payment after webhook callback or user cancel.
 */
export async function cancelPayosPayment(orderCode: number): Promise<void> {
  await db.$transaction(async (tx) => {
    const payment = await tx.payments.findUnique({
      where: { payos_order_code: orderCode },
      select: { id: true, booking_id: true, payment_status: true },
    });

    if (!payment) throw new NotFoundError("Payment", `orderCode:${orderCode}`);

    // Idempotent: if already cancelled, skip
    if (payment.payment_status === "cancelled") return;

    // Mark payment cancelled
    await tx.payments.update({
      where: { id: payment.id },
      data: { payment_status: "cancelled" },
    });

    if (payment.booking_id) {
      // Atomically cancel the booking ONLY if it's still pending or confirmed
      // (those are the two states that hold capacity). If it's already
      // cancelled, updateMany touches 0 rows and we skip the capacity restore.
      const result = await tx.bookings.updateMany({
        where: {
          id: payment.booking_id,
          status: { in: ["pending", "confirmed"] },
        },
        data: { status: "cancelled" },
      });

      if (result.count > 0) {
        // Only restore capacity if WE were the ones who cancelled it
        const booking = await tx.bookings.findUnique({
          where: { id: payment.booking_id },
          select: { tour_id: true, number_of_people: true },
        });

        if (booking?.tour_id && booking.number_of_people > 0) {
          await tx.tours.update({
            where: { id: booking.tour_id },
            data: { max_capacity: { increment: booking.number_of_people } },
          });
        }
      }
    }
  });
}

// ─── Repay existing booking ───────────────────────────────────────────────────

export interface RepayResult {
  checkoutUrl: string;
  orderCode: number;
}

/**
 * Re-generates a PayOS payment link for an existing pending booking.
 * Does NOT create a new booking or payment record.
 * Assigns a fresh orderCode (new PayOS order), updates the existing payment row.
 */
export async function repayBookingPayment(bookingId: string): Promise<RepayResult> {
  const user = await requireAuth();

  // Fetch booking + payment in one query, verify ownership
  const booking = await db.bookings.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      user_id: true,
      number_of_people: true,
      total_price: true,
      booking_date: true,
      status: true,
      tours: { select: { title: true } },
      payments: {
        select: {
          id: true,
          payment_status: true,
          amount: true,
        },
      },
    },
  });

  if (!booking) throw new NotFoundError("Booking", bookingId);
  if (booking.user_id !== user.id) throw new ForbiddenError();
  if (booking.status !== "pending") {
    throw new ValidationError("Booking is not in a repayable state.");
  }
  if (!booking.payments) {
    throw new NotFoundError("Payment record for booking", bookingId);
  }
  if (booking.payments.payment_status !== "pending") {
    throw new ValidationError("Payment is not in a pending state.");
  }

  // New order code for PayOS (each PayOS request must be unique)
  const newOrderCode = randomInt(1, 2_147_483_647);
  const totalPrice = Number(booking.payments.amount);
  const tourTitle = booking.tours?.title ?? "Tour";
  const siteUrl = getPublicSiteUrl();

  // Create a fresh PayOS payment link (no new DB booking/payment record)
  const paymentLinkResponse = await payos.paymentRequests.create({
    orderCode: newOrderCode,
    amount: Math.round(totalPrice),
    description: `Tour: ${tourTitle}`.slice(0, 25),
    returnUrl: `${siteUrl}/checkout/success?orderCode=${newOrderCode}`,
    cancelUrl: `${siteUrl}/checkout/cancel?orderCode=${newOrderCode}`,
    items: [
      {
        name: tourTitle.slice(0, 256),
        quantity: booking.number_of_people,
        price: Math.round(totalPrice / booking.number_of_people),
      },
    ],
  });

  // Update the existing payment record with the new order code
  await db.payments.update({
    where: { id: booking.payments.id },
    data: { payos_order_code: newOrderCode },
  });

  return {
    checkoutUrl: paymentLinkResponse.checkoutUrl,
    orderCode: newOrderCode,
  };
}

// ─── Stale lock cleanup ──────────────────────────────────────────────────────

/**
 * Releases capacity held by abandoned pending bookings older than `ttlMinutes`.
 *
 * Call this:
 *   - from the checkout page before creating a new payos link (pre-clean)
 *   - from a cron / scheduled task for thorough cleanup
 */
export async function cancelExpiredPayments(ttlMinutes = 5): Promise<number> {
  const cutoff = new Date(Date.now() - ttlMinutes * 60 * 1000);

  // First, find the IDs of expired pending bookings so we know exactly
  // which ones we're about to cancel (avoids double-restore with
  // cancelPayosPayment for bookings cancelled via other paths).
  const expired = await db.bookings.findMany({
    where: {
      status: "pending",
      created_at: { lt: cutoff },
      payments: { payment_status: "pending" },
      tour_id: { not: null },
      number_of_people: { gt: 0 },
    },
    select: { id: true, tour_id: true, number_of_people: true },
  });

  if (expired.length === 0) return 0;

  const expiredIds = expired.map((b) => b.id);

  // Atomically mark ALL expired bookings as cancelled in one statement.
  // If a concurrent run already flipped some, those rows are excluded.
  await db.bookings.updateMany({
    where: { id: { in: expiredIds }, status: "pending" },
    data: { status: "cancelled" },
  });

  // Cancel associated payment records
  await db.payments.updateMany({
    where: { booking_id: { in: expiredIds }, payment_status: "pending" },
    data: { payment_status: "cancelled" },
  });

  // Restore capacity for each expired booking we claimed.
  // Using the pre-collected IDs avoids touching bookings cancelled
  // via cancelPayosPayment (which already restored capacity).
  for (const booking of expired) {
    if (!booking.tour_id) continue;
    await db.tours.updateMany({
      where: { id: booking.tour_id },
      data: { max_capacity: { increment: booking.number_of_people } },
    });
  }

  return expired.length;
}

