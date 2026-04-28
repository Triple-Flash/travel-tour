"use client";

import { useState } from "react";
import {
  CreditCard,
  Wallet,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Loader2,
  Tag,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { createPayosCheckoutAction, validatePromoAction } from "./actions";

interface CheckoutFormProps {
  tour: {
    id: string;
    title: string;
    price: number;
    duration: number;
    destination_name: string | null;
    image_url: string;
  };
  guests: number;
  dateStr: string;
  rawDate: string;
  subtotal: number;
  tax: number;
  total: number;
  userFullName: string;
  userEmail: string;
}

function formatVND(price: number): string {
  return price.toLocaleString("vi-VN") + "₫";
}

export default function CheckoutForm({
  tour,
  guests,
  dateStr,
  rawDate,
  subtotal,
  tax,
  total,
  userFullName,
  userEmail,
}: CheckoutFormProps) {
  const [name, setName] = useState(userFullName);
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Promo state ───────────────────────────────────────────────────────────
  const [promoCode, setPromoCode] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0); // percentage
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  // Derived prices with promo applied
  const discountAmount = promoDiscount > 0 ? subtotal * (promoDiscount / 100) : 0;
  const discountedSubtotal = subtotal - discountAmount;
  const finalTax = discountedSubtotal * 0.1;
  const finalTotal = discountedSubtotal + finalTax;

  async function handleApplyPromo() {
    const code = promoInput.trim();
    if (!code) return;
    setPromoError(null);
    setPromoLoading(true);
    try {
      const result = await validatePromoAction(code);
      if (result.success) {
        setPromoCode(result.data.code);
        setPromoDiscount(result.data.discount_percentage);
        setPromoInput("");
      } else {
        setPromoError(result.error);
        setPromoCode("");
        setPromoDiscount(0);
      }
    } finally {
      setPromoLoading(false);
    }
  }

  function handleRemovePromo() {
    setPromoCode("");
    setPromoDiscount(0);
    setPromoError(null);
    setPromoInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const result = await createPayosCheckoutAction({
        tour_id: tour.id,
        number_of_people: guests,
        total_price: Math.round(finalTotal),
        booking_date: rawDate || new Date().toISOString().split("T")[0],
        buyer_name: name,
        buyer_email: email,
        buyer_phone: phone,
      });

      if (result.success) {
        window.location.href = result.data.checkoutUrl;
      } else {
        setError(result.error);
        setIsPending(false);
      }
    } catch {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-12 lg:grid-cols-12">
        {/* Left: Form & Payment Methods (7 cols) */}
        <div className="lg:col-span-7 space-y-10">
          {/* Customer Info */}
          <section>
            <h2 className="mb-6 flex items-center gap-2 font-heading text-xl font-bold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-sm">1</span>
              Thông tin liên hệ
            </h2>
            <div className="grid gap-6 rounded-[2rem] border border-white/5 bg-[#111]/50 p-8 backdrop-blur-xl">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">Họ và tên</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">Số điện thoại</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  placeholder="090 123 4567"
                  required
                />
              </div>
            </div>
          </section>

          {/* Promotion Code */}
          <section>
            <h2 className="mb-6 flex items-center gap-2 font-heading text-xl font-bold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm">2</span>
              Mã khuyến mãi
            </h2>
            <div className="rounded-[2rem] border border-white/5 bg-[#111]/50 p-8 backdrop-blur-xl">
              {promoCode ? (
                /* Applied promo badge */
                <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-emerald-300">
                        Mã <span className="font-mono">{promoCode}</span> đã được áp dụng
                      </p>
                      <p className="text-xs text-emerald-400/70">
                        Giảm {promoDiscount}% trên giá tour
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                    aria-label="Xóa mã khuyến mãi"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              ) : (
                /* Promo input row */
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Tag
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                      />
                      <input
                        type="text"
                        id="promo-code-input"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          setPromoError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyPromo();
                          }
                        }}
                        className="w-full rounded-xl border border-white/10 bg-black/50 py-3 pl-10 pr-4 font-mono text-sm uppercase text-white outline-none placeholder:normal-case placeholder:font-sans placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                        placeholder="Nhập mã khuyến mãi"
                        maxLength={50}
                        autoComplete="off"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoInput.trim()}
                      className="flex shrink-0 items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-bold text-emerald-300 transition-all hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {promoLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        "Áp dụng"
                      )}
                    </button>
                  </div>
                  {promoError && (
                    <p className="flex items-center gap-1.5 text-xs text-rose-400">
                      <XCircle size={14} className="shrink-0" />
                      {promoError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Payment Method */}
          <section>
            <h2 className="mb-6 flex items-center gap-2 font-heading text-xl font-bold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-violet-400 text-sm">3</span>
              Phương thức thanh toán
            </h2>
            <div className="space-y-4">
              {/* PayOS Option */}
              <label className="relative flex cursor-pointer items-center gap-4 rounded-[2rem] border border-cyan-500/50 bg-cyan-500/5 p-6 backdrop-blur-md transition-all hover:bg-white/5">
                <div className="flex h-6 items-center">
                  <input type="radio" name="payment" value="payos" className="h-5 w-5 cursor-pointer accent-cyan-500" defaultChecked />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <Wallet className="text-cyan-400" size={24} />
                      <h3 className="font-semibold text-white">Cổng thanh toán PayOS</h3>
                    </div>
                    <p className="mt-1 text-sm text-white/50">Chuyển khoản quét mã QR (Hỗ trợ tất cả ngân hàng nội địa)</p>
                  </div>
                  <div className="rounded-xl bg-white/10 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                    PayOS
                  </div>
                </div>
              </label>
            </div>
          </section>

          {/* Error Display */}
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-6 py-4 text-sm text-rose-400">
              {error}
            </div>
          )}
        </div>

        {/* Right: Order Summary (5 cols) */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-24 overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/80 shadow-[0_20px_80px_rgba(0,0,0,0.8)] backdrop-blur-3xl">
            {/* Decorative glow */}
            <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

            {/* Tour Image Header */}
            <div className="relative h-48 w-full">
              <Image src={tour.image_url} alt={tour.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <h3 className="font-heading text-xl font-bold text-white drop-shadow-lg">{tour.title}</h3>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-cyan-400">
                  <MapPin size={12} /> {tour.destination_name || "Chi tiết tour"}
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Booking Details */}
              <div className="mb-6 grid gap-4 border-b border-white/10 pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/70">
                    <Calendar size={16} /> <span className="text-sm">Ngày khởi hành</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{dateStr}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/70">
                    <Users size={16} /> <span className="text-sm">Số khách</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{guests} người</span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mb-6 space-y-3 border-b border-white/10 pb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Đơn giá ({guests}x)</span>
                  <span className="text-white">{formatVND(subtotal)}</span>
                </div>

                {/* Discount row — only shown when promo is active */}
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Tag size={12} />
                      Giảm giá ({promoDiscount}%)
                    </span>
                    <span className="font-semibold text-emerald-400">
                      -{formatVND(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Thuế VAT (10%)</span>
                  <span className="text-white">{formatVND(finalTax)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-8 flex items-end justify-between">
                <span className="text-lg font-bold text-white">Tổng cộng</span>
                <div className="text-right">
                  {promoDiscount > 0 && (
                    <p className="mb-1 text-sm text-white/30 line-through">
                      {formatVND(total)}
                    </p>
                  )}
                  <span className="font-heading text-3xl font-bold text-cyan-400">
                    {formatVND(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-4 font-bold text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                {isPending ? (
                  <>
                    <Loader2 size={20} className="relative z-10 animate-spin" />
                    <span className="relative z-10">Đang chuyển đến PayOS...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={20} className="relative z-10" />
                    <span className="relative z-10">Xác Nhận & Thanh Toán</span>
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs text-white/40">
                Bằng việc bấm Thanh Toán, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
