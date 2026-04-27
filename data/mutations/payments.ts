/**
 * data/mutations/payments.ts
 * Write operations for the `payments` domain.
 * Creates bookings + PayOS payment links in a single transaction.
 */
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { payos } from "@/lib/payos";
import { ValidationError, NotFoundError } from "@/data/errors";
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
 * Returns the checkout URL for the client to redirect to.
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

  // Generate a unique order code (PayOS requires a positive integer)
  const orderCode = Date.now() % 2147483647; // Keep within safe int range

  // Create booking + payment in a transaction
  const result = await db.$transaction(async (tx) => {
    // Validate tour exists
    const tour = await tx.tours.findUnique({
      where: { id: tour_id },
      select: { id: true, title: true, max_capacity: true },
    });
    if (!tour) throw new NotFoundError("Tour", tour_id);

    if (number_of_people > tour.max_capacity) {
      throw new ValidationError(
        `Tour này chỉ cho phép tối đa ${tour.max_capacity} người.`
      );
    }

    // Create booking
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

    // Create payment record
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

  // Create PayOS payment link via SDK
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const paymentLinkResponse = await payos.paymentRequests.create({
    orderCode,
    amount: Math.round(total_price), // PayOS requires integer amount in VND
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
 * Updates both payment status and booking status.
 */
export async function confirmPayosPayment(
  orderCode: number,
  transactionRef?: string
): Promise<void> {
  await db.$transaction(async (tx) => {
    const payment = await tx.payments.findUnique({
      where: { payos_order_code: orderCode },
      select: { id: true, booking_id: true },
    });

    if (!payment) throw new NotFoundError("Payment", `orderCode:${orderCode}`);

    await tx.payments.update({
      where: { id: payment.id },
      data: {
        payment_status: "completed",
        payos_transaction_id: transactionRef ?? null,
        payment_date: new Date(),
      },
    });

    if (payment.booking_id) {
      await tx.bookings.update({
        where: { id: payment.booking_id },
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
      select: { id: true, booking_id: true },
    });

    if (!payment) throw new NotFoundError("Payment", `orderCode:${orderCode}`);

    await tx.payments.update({
      where: { id: payment.id },
      data: { payment_status: "cancelled" },
    });

    if (payment.booking_id) {
      await tx.bookings.update({
        where: { id: payment.booking_id },
        data: { status: "cancelled" },
      });
    }
  });
}
