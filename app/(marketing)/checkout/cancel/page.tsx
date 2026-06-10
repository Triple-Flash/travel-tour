import Link from "next/link";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { XCircle, ArrowRight, Home } from "lucide-react";
import { cancelPayosPayment } from "@/data/mutations/payments";

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ orderCode?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await getSession();
  const orderCode = resolvedSearchParams.orderCode || "N/A";

  // When a user cancels on PayOS's side, we must release the capacity lock.
  // PayOS may not send a webhook for user-initiated cancellations, so we
  // handle it here on the return-URL page.
  if (orderCode !== "N/A") {
    try {
      await cancelPayosPayment(Number(orderCode));
    } catch (err) {
      console.error("[CancelPage] Failed to cancel payment:", err);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-cyan-500/30">
      <Navbar user={session} />

      <main className="relative flex items-center justify-center px-6 pt-32 pb-24">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/10 blur-[150px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-[600px] text-center">
          {/* Cancel Icon */}
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-rose-500/20 to-orange-500/20 shadow-[0_0_60px_rgba(244,63,94,0.3)]">
            <XCircle size={48} className="text-rose-400" />
          </div>

          <h1 className="mb-4 font-heading text-4xl font-bold text-white">
            Thanh Toán Đã Hủy
          </h1>

          <p className="mb-2 text-lg text-white/60">
            Giao dịch của bạn đã được hủy. Không có khoản phí nào được thu.
          </p>

          <p className="mb-10 text-sm text-white/40">
            Mã đơn hàng: <span className="font-mono text-white/60">{orderCode}</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/#tours"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 font-bold text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]"
            >
              Chọn Tour Khác
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
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
