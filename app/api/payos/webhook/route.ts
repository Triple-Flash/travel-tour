/**
 * app/api/payos/webhook/route.ts
 * PayOS webhook handler.
 * Receives payment confirmations from PayOS and updates booking/payment status.
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { payos } from "@/lib/payos";
import { confirmPayosPayment, cancelPayosPayment, cancelExpiredPayments } from "@/data/mutations/payments";
import type { Webhook } from "@payos/node/lib/resources/webhooks/webhook";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Webhook;

    // Verify webhook data with PayOS checksum
    let webhookData;
    try {
      webhookData = await payos.webhooks.verify(body);
    } catch (err) {
      console.error("[PayOS Webhook] Invalid signature:", err);
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const { orderCode, code, desc, reference } = webhookData;

    console.log(`[PayOS Webhook] orderCode=${orderCode}, code=${code}, desc=${desc}`);

    // code "00" means success in PayOS
    if (code === "00") {
      await confirmPayosPayment(orderCode, reference ?? undefined);
      // Clean up stale locks now that capacity has just been consumed for real.
      // This releases abandoned pending bookings from other users on the same tour.
      const released = await cancelExpiredPayments(5);
      if (released > 0) {
        console.log(`[PayOS Webhook] Released ${released} expired lock(s)`);
      }
      revalidatePath("/", "layout");
      console.log(`[PayOS Webhook] Payment confirmed for orderCode=${orderCode}`);
    } else {
      await cancelPayosPayment(orderCode);
      revalidatePath("/", "layout");
      console.log(`[PayOS Webhook] Payment cancelled for orderCode=${orderCode}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PayOS Webhook] Error:", err);
    // Always return 200 to PayOS to acknowledge receipt
    return NextResponse.json({ success: true });
  }
}
