import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { MapPin, Calendar, Clock, User, ArrowRight, CreditCard, CheckCircle2, XCircle, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getMyBookings } from "@/data/queries/bookings";
import BookingReviewForm from "./BookingReviewForm";
import RepayButton from "./RepayButton";

function StatusBadge({ status }: { status: string | null }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 uppercase tracking-widest backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.2)]">
        <CheckCircle2 size={14} /> Đã Xác Nhận
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs font-bold text-rose-400 uppercase tracking-widest backdrop-blur-md">
        <XCircle size={14} /> Đã Hủy
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 uppercase tracking-widest backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">
      <Clock size={14} /> Chờ Xử Lý
    </span>
  );
}

export default async function BookingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const bookings = await getMyBookings();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-cyan-500/30 font-sans">
      <Navbar user={session} />

      <main className="relative pt-32 pb-24 min-h-[80vh]">
        {/* Ambient Glows */}
        <div className="fixed top-0 right-0 h-[600px] w-[600px] -translate-y-1/4 translate-x-1/4 rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />
        <div className="fixed bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-[1200px] px-6">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
                Chuyến Đi Của Tôi
              </h1>
              <p className="text-white/60 text-lg max-w-2xl">
                Quản lý tất cả các tour bạn đã đặt. Xem chi tiết lịch trình, thanh toán và chuẩn bị cho những hành trình tuyệt vời sắp tới.
              </p>
            </div>
            <Link 
              href="/search"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-6 py-3 font-medium text-white transition-all hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <Search size={18} /> Khám phá thêm
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-[2rem] border border-white/10 bg-zinc-900/40 p-16 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-cyan-500/5 blur-[80px]" />
              <div className="relative z-10">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/5 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
                  <Calendar size={40} className="text-cyan-400" />
                </div>
                <h3 className="font-heading text-3xl font-bold text-white mb-4">Bạn chưa có chuyến đi nào</h3>
                <p className="text-white/60 max-w-md mx-auto mb-10 text-lg">
                  Hãy bắt đầu hành trình của bạn bằng cách khám phá những điểm đến tuyệt đẹp mà chúng tôi đang có.
                </p>
                <Link 
                  href="/search" 
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-8 py-4 font-bold text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)]"
                >
                  Tìm Tour Ngay
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div key={booking.id} className="group relative">
                  {/* Aurora glow border — expands on hover */}
                  <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-br from-sky-500/40 via-violet-500/20 to-orange-500/30 opacity-0 blur-lg transition-all duration-700 group-hover:opacity-100 pointer-events-none" />

                  <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0C0C0C]/90 backdrop-blur-xl transition-all duration-500 group-hover:border-white/[0.16] group-hover:shadow-[0_24px_80px_rgba(0,0,0,0.6)]">

                    {/* Aurora mesh blobs */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-sky-500/8 blur-[70px] transition-all duration-[6000ms] group-hover:bg-sky-500/14" />
                      <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-violet-500/8 blur-[60px] transition-all duration-[6000ms] group-hover:bg-violet-500/14" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-orange-500/5 blur-[50px] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                      {/* Subtle grid texture */}
                      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
                    </div>

                    <div className="flex flex-col lg:flex-row">
                      {/* ── Image Section ── */}
                      <div className="relative h-72 lg:h-auto lg:w-[400px] shrink-0 overflow-hidden">
                        {booking.tour?.images?.[0]?.image_url ? (
                          <Image
                            src={booking.tour.images[0].image_url}
                            alt={booking.tour.title || "Tour Image"}
                            fill
                            className="object-cover transition-transform duration-[3s] ease-out group-hover:scale-[1.06]"
                          />
                        ) : (
                          <Image src="/images/halong.png" alt="Fallback" fill className="object-cover opacity-40" />
                        )}
                        {/* Rich gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-[#0C0C0C]/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#0C0C0C]" />

                        {/* Top row: status + booking ID */}
                        <div className="absolute top-5 left-5 right-5 z-10 flex items-start justify-between">
                          <StatusBadge status={booking.status} />
                          <span className="rounded-full bg-black/50 border border-white/10 px-3 py-1 font-mono text-[10px] text-white/40 backdrop-blur-md">
                            #{booking.id.split('-')[0].toUpperCase()}
                          </span>
                        </div>

                        {/* Destination floating chip at bottom */}
                        <div className="absolute bottom-5 left-5 z-10">
                          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md">
                            <MapPin size={11} className="text-[#0EA5E9]" />
                            <span className="text-xs font-semibold text-white/85">
                              {booking.tour?.destination?.name}, {booking.tour?.destination?.country}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ── Content Section ── */}
                      <div className="flex flex-1 flex-col justify-between p-7 md:p-9 relative z-10">
                        <div>
                          {/* Tour title */}
                          <h2 className="mb-6 font-heading text-2xl md:text-3xl font-bold leading-tight text-white transition-colors duration-300 group-hover:text-sky-50">
                            {booking.tour?.title || "Tour Đã Bị Xóa"}
                          </h2>

                          {/* Stat chips */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
                            <div className="flex flex-col gap-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition-colors duration-200 hover:bg-white/[0.06]">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                                <Calendar size={11} /> Ngày Đặt
                              </div>
                              <div className="text-sm font-semibold text-white/80">
                                {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('vi-VN') : 'N/A'}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition-colors duration-200 hover:bg-white/[0.06]">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                                <Clock size={11} /> Thời Gian
                              </div>
                              <div className="text-sm font-semibold text-white/80">
                                {booking.tour?.duration || 0} Ngày
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 transition-colors duration-200 hover:bg-white/[0.06]">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                                <User size={11} /> Số Khách
                              </div>
                              <div className="text-sm font-semibold text-white/80">
                                {booking.number_of_people} Người
                              </div>
                            </div>

                            {/* Price — orange accent per CTA color token */}
                            <div className="flex flex-col gap-1.5 rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/10 to-amber-500/5 p-4">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-orange-400/60">
                                <CreditCard size={11} /> Tổng Tiền
                              </div>
                              <div className="text-sm font-bold text-orange-400">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(booking.total_price))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-t border-white/[0.06] pt-6">
                          {/* Payment status with pulsing dot */}
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
                              <span className={`h-2 w-2 rounded-full ${booking.payment?.payment_status === 'completed' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'}`} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/25">Thanh Toán</p>
                              <p className="text-sm font-semibold text-white/70">
                                {booking.payment?.payment_status === 'completed' ? 'Thành Công' :
                                  booking.payment?.payment_status === 'pending' ? 'Chờ Thanh Toán' :
                                  booking.payment?.payment_status || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            {booking.status === 'pending' && booking.payment?.payment_status === 'pending' && (
                              <RepayButton bookingId={booking.id} />
                            )}
                            {booking.status === 'confirmed' && booking.payment?.payment_status === 'completed' && booking.tour_id && (
                              booking.can_rate ? (
                                <BookingReviewForm
                                  tourId={booking.tour_id}
                                  existingReview={booking.user_review}
                                />
                              ) : booking.user_review ? (
                                /* Has a review, show it */
                                <BookingReviewForm
                                  tourId={booking.tour_id}
                                  existingReview={booking.user_review}
                                />
                              ) : (
                                /* Tour not yet complete — show message instead of button */
                                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-white/40">
                                  Bạn có thể đánh giá sau khi tour kết thúc
                                </div>
                              )
                            )}
                            <Link
                              href={`/tours/${booking.tour_id}`}
                              className="cursor-pointer flex-1 sm:flex-none text-center rounded-xl border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-[#0C4A6E] hover:border-transparent hover:shadow-[0_0_24px_rgba(255,255,255,0.15)] hover:-translate-y-px"
                            >
                              Chi Tiết Tour
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
