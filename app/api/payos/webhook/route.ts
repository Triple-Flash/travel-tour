/**
 * app/api/payos/webhook/route.ts
 * PayOS webhook handler.
 * Receives payment confirmations from PayOS and updates booking/payment status.
 */
import { NextRequest, NextResponse } from "next/server";
import { payos } from "@/lib/payos";
import { confirmPayosPayment, cancelPayosPayment } from "@/data/mutations/payments";
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
      console.log(`[PayOS Webhook] Payment confirmed for orderCode=${orderCode}`);
    } else {
      await cancelPayosPayment(orderCode);
      console.log(`[PayOS Webhook] Payment cancelled for orderCode=${orderCode}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PayOS Webhook] Error:", err);
    // Always return 200 to PayOS to acknowledge receipt
    return NextResponse.json({ success: true });
  }
}
