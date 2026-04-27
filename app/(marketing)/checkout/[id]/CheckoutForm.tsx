"use client";

import { useState } from "react";
import { CreditCard, Wallet, MapPin, Calendar, Users, ShieldCheck, Loader2 } from "lucide-react";
import Image from "next/image";
import { createPayosCheckoutAction } from "./actions";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const result = await createPayosCheckoutAction({
        tour_id: tour.id,
        number_of_people: guests,
        total_price: total,
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

          {/* Payment Method */}
          <section>
            <h2 className="mb-6 flex items-center gap-2 font-heading text-xl font-bold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-violet-400 text-sm">2</span>
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
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Thuế VAT (10%)</span>
                  <span className="text-white">{formatVND(tax)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-8 flex items-end justify-between">
                <span className="text-lg font-bold text-white">Tổng cộng</span>
                <span className="font-heading text-3xl font-bold text-cyan-400">
                  {formatVND(total)}
                </span>
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
