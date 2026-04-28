"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { createPayosCheckoutAction } from "./actions";

interface CheckoutButtonProps {
  tourId: string;
  numberOfPeople: number;
  totalPrice: number;
  bookingDate: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
}

export default function CheckoutButton({
  tourId,
  numberOfPeople,
  totalPrice,
  bookingDate,
  buyerName,
  buyerEmail,
  buyerPhone,
}: CheckoutButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCheckout() {
    setError(null);
    startTransition(async () => {
      const result = await createPayosCheckoutAction({
        tour_id: tourId,
        number_of_people: numberOfPeople,
        total_price: totalPrice,
        booking_date: bookingDate,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone,
      });

      if (result.success) {
        // Redirect to PayOS checkout page
        window.location.href = result.data.checkoutUrl;
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isPending}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-4 font-bold text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
        {isPending ? (
          <>
            <Loader2 size={20} className="relative z-10 animate-spin" />
            <span className="relative z-10">Đang xử lý...</span>
          </>
        ) : (
          <>
            <ShieldCheck size={20} className="relative z-10" />
            <span className="relative z-10">Xác Nhận & Thanh Toán</span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      )}
    </div>
  );
}
