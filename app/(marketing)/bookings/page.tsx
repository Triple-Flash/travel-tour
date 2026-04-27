import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { MapPin, Calendar, Clock, User, ArrowRight, CreditCard, CheckCircle2, XCircle, Search, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getMyBookings } from "@/data/queries/bookings";

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
            <div className="space-y-8">
              {bookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/60 backdrop-blur-md transition-all duration-500 hover:border-white/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                >
                  {/* Hover Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
                  
                  <div className="flex flex-col lg:flex-row">
                    {/* Image Section */}
                    <div className="relative h-64 lg:h-auto lg:w-[360px] shrink-0 overflow-hidden">
                      {booking.tour?.images?.[0]?.image_url ? (
                        <Image 
                          src={booking.tour.images[0].image_url} 
                          alt={booking.tour.title || "Tour Image"} 
                          fill 
                          className="object-cover transition-transform duration-[2s] group-hover:scale-105" 
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-white/20">
                          <Image src="/images/halong.png" alt="Fallback" fill className="object-cover opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent lg:bg-gradient-to-r" />
                      
                      {/* Status Tag */}
                      <div className="absolute top-5 left-5 z-10">
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex flex-1 flex-col justify-between p-6 md:p-8 relative z-10">
                      <div>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-cyan-400">
                            <MapPin size={16} /> 
                            {booking.tour?.destination?.name}, {booking.tour?.destination?.country}
                          </div>
                          <div className="text-sm font-mono text-white/40">
                            ID: {booking.id.split('-')[0].toUpperCase()}
                          </div>
                        </div>
                        
                        <h2 className="mb-5 font-heading text-2xl md:text-3xl font-bold text-white group-hover:text-cyan-50 transition-colors">
                          {booking.tour?.title || "Tour Đã Bị Xóa"}
                        </h2>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                          <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                            <div className="text-white/40 text-xs uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Calendar size={14}/> Ngày Đặt</div>
                            <div className="font-medium text-white/90">
                              {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('vi-VN') : 'N/A'}
                            </div>
                          </div>
                          <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                            <div className="text-white/40 text-xs uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Clock size={14}/> Thời Gian</div>
                            <div className="font-medium text-white/90">
                              {booking.tour?.duration || 0} Ngày
                            </div>
                          </div>
                          <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                            <div className="text-white/40 text-xs uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><User size={14}/> Số Khách</div>
                            <div className="font-medium text-white/90">
                              {booking.number_of_people} Người
                            </div>
                          </div>
                          <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                            <div className="text-white/40 text-xs uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><CreditCard size={14}/> Tổng Tiền</div>
                            <div className="font-bold text-cyan-400">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(booking.total_price))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/60">
                            <Info size={18} />
                          </div>
                          <div>
                            <p className="text-white/40 text-xs">Trạng Thái Thanh Toán</p>
                            <p className="font-medium text-white/90 capitalize">
                              {booking.payment?.payment_status === 'completed' ? 'Thành Công' : 
                               booking.payment?.payment_status === 'pending' ? 'Chờ Thanh Toán' : 
                               booking.payment?.payment_status || 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex w-full sm:w-auto gap-3">
                          {booking.status === 'pending' && booking.payment?.payment_status === 'pending' && (
                            <Link
                              href={`/checkout/${booking.tour_id}`}
                              className="flex-1 sm:flex-none text-center rounded-xl bg-cyan-500/10 px-6 py-3 font-bold text-cyan-400 transition-all hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                            >
                              Thanh Toán Lại
                            </Link>
                          )}
                          <Link
                            href={`/tours/${booking.tour_id}`}
                            className="flex-1 sm:flex-none text-center rounded-xl bg-white/10 px-6 py-3 font-bold text-white backdrop-blur-md transition-all hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                          >
                            Chi Tiết Tour
                          </Link>
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
