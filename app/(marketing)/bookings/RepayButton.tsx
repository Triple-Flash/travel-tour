"use client";

import { useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import { repayAction } from "./actions";

interface RepayButtonProps {
  bookingId: string;
}

export default function RepayButton({ bookingId }: RepayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRepay() {
    setError(null);
    setLoading(true);
    try {
      const result = await repayAction(bookingId);
      if (result.success) {
        // Redirect to PayOS checkout — same flow as first-time checkout
        window.location.href = result.data.checkoutUrl;
      } else {
        setError(result.error);
        setLoading(false);
      }
    } catch {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={handleRepay}
        disabled={loading}
        className="cursor-pointer flex-1 sm:flex-none inline-flex items-center justify-center gap-2 text-center rounded-xl bg-gradient-to-r from-[#F97316] to-[#FB923C] px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(249,115,22,0.25)] transition-all duration-200 hover:shadow-[0_0_32px_rgba(249,115,22,0.45)] hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            <RefreshCcw size={14} />
            Thanh Toán Lại
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-rose-400">{error}</p>
      )}
    </div>
  );
}
