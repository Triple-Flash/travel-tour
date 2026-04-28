import Link from "next/link";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import {
  CheckCircle2,
  ArrowRight,
  Home,
  Tag,
  Receipt,
  CalendarCheck,
  Users,
} from "lucide-react";
import { payos } from "@/lib/payos";
import { confirmPayosPayment } from "@/data/mutations/payments";
import { getBookingSummaryByOrderCode } from "@/data/queries/bookings";

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatVND(price: number): string {
  return price.toLocaleString("vi-VN") + "₫";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    orderCode?: string;
    status?: string;
    cancel?: string;
    id?: string;
    promo?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await getSession();
  const orderCode = resolvedSearchParams.orderCode || "N/A";
  const appliedPromo = resolvedSearchParams.promo || null;

  // Double-check status with PayOS (in case webhook was missed/delayed)
  if (
    orderCode !== "N/A" &&
    resolvedSearchParams.status === "PAID" &&
    resolvedSearchParams.cancel === "false"
  ) {
    try {
      const numericOrderCode = Number(orderCode);
      const paymentInfo = await payos.paymentRequests.get(numericOrderCode);
      if (paymentInfo.status === "PAID") {
        await confirmPayosPayment(numericOrderCode, resolvedSearchParams.id);
      }
    } catch (err) {
      console.error("Error verifying PayOS status on success page:", err);
    }
  }

  // Fetch booking summary via DAL (no direct DB access in app/)
  const booking =
    orderCode !== "N/A"
      ? await getBookingSummaryByOrderCode(Number(orderCode)).catch(() => null)
      : null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-cyan-500/30">
      <Navbar user={session} />

      <main className="relative px-6 pt-32 pb-24">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.08] blur-[180px]" />

        <div className="relative z-10 mx-auto max-w-[640px]">
          {/* ── Success icon ───────────────────────────────────────────── */}
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 shadow-[0_0_60px_rgba(16,185,129,0.3)]">
              <CheckCircle2 size={48} className="text-emerald-400" />
            </div>

            <h1 className="mb-3 font-heading text-4xl font-bold text-white">
              Thanh Toán Thành Công!
            </h1>
            <p className="mb-2 text-lg text-white/60">
              Cảm ơn bạn đã đặt tour. Chúng tôi sẽ liên hệ để xác nhận chi
              tiết chuyến đi trong thời gian sớm nhất.
            </p>
            <p className="text-sm text-white/40">
              Mã đơn hàng:{" "}
              <span className="font-mono text-cyan-400">{orderCode}</span>
            </p>
          </div>

          {/* ── Booking summary card ───────────────────────────────────── */}
          {booking && (
            <div className="mb-10 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
              {/* Card header */}
              <div className="border-b border-white/[0.08] px-8 py-5">
                <h2 className="font-heading text-lg font-bold text-white">
                  Chi tiết đặt tour
                </h2>
              </div>

              <div className="space-y-4 px-8 py-6">
                {/* Tour name */}
                <div className="flex items-start justify-between gap-4">
                  <span className="flex items-center gap-2 text-sm text-white/50">
                    <Receipt size={14} className="shrink-0" />
                    Tour
                  </span>
                  <span className="text-right text-sm font-semibold text-white">
                    {booking.tourTitle}
                    {booking.destinationName && (
                      <span className="block text-xs font-normal text-white/40">
                        {booking.destinationName}
                      </span>
                    )}
                  </span>
                </div>

                {/* Date */}
                {booking.bookingDate && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-white/50">
                      <CalendarCheck size={14} className="shrink-0" />
                      Ngày khởi hành
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {booking.bookingDate.toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}

                {/* People */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-white/50">
                    <Users size={14} className="shrink-0" />
                    Số khách
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {booking.numberOfPeople} người
                  </span>
                </div>

                {/* Promo applied */}
                {appliedPromo && (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-3">
                    <span className="flex items-center gap-2 text-sm text-emerald-400">
                      <Tag size={14} className="shrink-0" />
                      Mã khuyến mãi
                    </span>
                    <span className="font-mono text-sm font-bold text-emerald-300">
                      {appliedPromo}
                    </span>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
                  <span className="text-sm font-bold text-white">
                    Tổng thanh toán
                  </span>
                  <span className="font-heading text-2xl font-bold text-cyan-400">
                    {formatVND(booking.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── CTA buttons ────────────────────────────────────────────── */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/bookings"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 font-bold text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]"
            >
              Xem Đơn Đặt Tour
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white"
            >
              <Home size={18} />
              Trang Chủ
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
