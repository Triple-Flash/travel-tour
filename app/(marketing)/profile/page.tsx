import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { User, Heart, Settings, MapPin, Calendar, Clock, CreditCard, Star, Wallet, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-cyan-500/30">
      <Navbar user={session} />

      <main className="relative pt-32 pb-24">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-[1200px] px-6">
          <Tabs defaultValue="trips" orientation="vertical" className="flex flex-col lg:flex-row gap-10">
            
            {/* Left Sidebar: Profile Card & Navigation */}
            <aside className="w-full lg:w-[350px] shrink-0">
              <div className="sticky top-24 rounded-[2rem] border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Decoration */}
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-cyan-500/20 blur-[50px] pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Google-like Gradient Avatar */}
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full p-[3px] shadow-[0_0_30px_rgba(6,182,212,0.3)] mb-4">
                    <div 
                      className="absolute inset-0 rounded-full animate-spin-slow" 
                      style={{ background: 'conic-gradient(from 0deg, #EA4335 0deg 90deg, #4285F4 90deg 180deg, #34A853 180deg 270deg, #FBBC05 270deg 360deg)' }} 
                    />
                    {session.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={session.avatar_url} alt={session.full_name} className="relative z-10 h-full w-full rounded-full border-4 border-[#0A0A0A] object-cover bg-[#111]" />
                    ) : (
                      <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full border-4 border-[#0A0A0A] bg-zinc-800 text-3xl font-bold text-white">
                        {session.full_name.split(" ").map((n) => n[0]).slice(-2).join("").toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  
                  <h1 className="font-heading text-2xl font-bold text-white tracking-tight">{session.full_name}</h1>
                  <p className="text-sm text-white/50 mb-2">{session.email}</p>
                  <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">
                    {session.role === "admin" ? "Quản Trị Viên" : "Thành Viên Hạng Bạc"}
                  </span>
                </div>

                <TabsList variant="line" className="mt-10 flex h-auto w-full flex-col gap-2 border-t border-white/10 pt-6 bg-transparent p-0">
                  <TabsTrigger 
                    value="trips" 
                    className="group flex w-full justify-start items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white shadow-none focus-visible:ring-0 after:hidden border-none"
                  >
                    <MapPin size={18} className="text-cyan-400 transition-transform group-hover:scale-110" />
                    Chuyến đi của tôi
                  </TabsTrigger>
                  <TabsTrigger 
                    value="wishlist" 
                    className="group flex w-full justify-start items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white shadow-none focus-visible:ring-0 after:hidden border-none"
                  >
                    <Heart size={18} className="text-pink-400 transition-transform group-hover:scale-110" />
                    Đã lưu & Yêu thích
                  </TabsTrigger>

                  <TabsTrigger 
                    value="settings" 
                    className="group flex w-full justify-start items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/60 transition-all hover:bg-white/5 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white shadow-none focus-visible:ring-0 after:hidden border-none"
                  >
                    <Settings size={18} className="text-white/40 transition-transform group-hover:scale-110 group-hover:rotate-45" />
                    Cài đặt tài khoản
                  </TabsTrigger>
                </TabsList>
              </div>
            </aside>

            {/* Right Main Content */}
            <div className="flex-1 min-w-0">
              
              {/* TRIPS TAB */}
              <TabsContent value="trips" className="space-y-10 mt-0 outline-none">
                <section>
                  <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                    <h2 className="font-heading text-2xl font-bold text-white">Chuyến Đi Sắp Tới</h2>
                    <Link href="/search" className="text-sm font-medium text-cyan-400 hover:text-cyan-300">Khám phá tour mới</Link>
                  </div>
                  
                  {/* Mockup Active Booking */}
                  <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row">
                      <div className="relative h-48 w-full md:h-auto md:w-[280px] shrink-0 overflow-hidden">
                        <Image src="/images/halong.png" alt="Vịnh Hạ Long" fill className="object-cover transition-transform duration-[2s] group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="absolute top-4 left-4 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-md uppercase tracking-wider">
                          Đã Xác Nhận
                        </span>
                      </div>
                      
                      <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
                        <div>
                          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-cyan-400">
                            <MapPin size={16} /> Vịnh Hạ Long, Việt Nam
                          </div>
                          <h3 className="mb-4 font-heading text-2xl font-bold text-white">Du Thuyền Vịnh Hạ Long 3N2Đ</h3>
                          
                          <div className="flex flex-wrap items-center gap-6 text-sm text-white/70">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-violet-400" />
                              <span>15 Tháng 5, 2026</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={16} className="text-cyan-400" />
                              <span>3 Ngày 2 Đêm</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-pink-400" />
                              <span>4 Khách</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                          <div>
                            <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Mã Đặt Chỗ</p>
                            <p className="font-mono font-bold text-white tracking-widest">HL-9381A</p>
                          </div>
                          <button className="rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                            Xem Chi Tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="mb-6 font-heading text-xl font-bold text-white border-b border-white/10 pb-4">Ví & Điểm Thưởng</h2>
                  <div className="grid gap-6 md:grid-cols-1">
                    <div className="rounded-[2rem] border border-white/5 bg-gradient-to-br from-[#111] to-[#0A0A0A] p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-amber-500/10 blur-[30px]" />
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
                          <Star size={24} fill="currentColor" />
                        </div>
                        <div>
                          <p className="text-sm text-white/50">Điểm TravelTour</p>
                          <p className="font-heading text-2xl font-bold text-white">12,450</p>
                        </div>
                      </div>
                      <p className="text-xs text-white/40">Tương đương 1.245.000₫ khi thanh toán tour tiếp theo.</p>
                    </div>
                  </div>
                </section>
              </TabsContent>

              {/* WISHLIST TAB */}
              <TabsContent value="wishlist" className="space-y-10 mt-0 outline-none">
                <section>
                  <h2 className="mb-6 font-heading text-2xl font-bold text-white border-b border-white/10 pb-4">Đã Lưu & Yêu Thích</h2>
                  <div className="rounded-[2rem] border border-white/10 bg-zinc-900/50 p-16 text-center backdrop-blur-xl shadow-xl">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-pink-500/10 border border-pink-500/20">
                      <Heart size={40} className="text-pink-400/80" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-white mb-3">Chưa có mục yêu thích nào</h3>
                    <p className="text-white/60 max-w-md mx-auto mb-8">
                      Bạn chưa lưu tour nào. Hãy lướt xem các điểm đến tuyệt đẹp và nhấn vào biểu tượng trái tim để lưu lại những lựa chọn tốt nhất.
                    </p>
                    <Link 
                      href="/search" 
                      className="inline-flex rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(236,72,153,0.5)]"
                    >
                      Khám Phá Tour Ngay
                    </Link>
                  </div>
                </section>
              </TabsContent>



              {/* SETTINGS TAB */}
              <TabsContent value="settings" className="space-y-10 mt-0 outline-none">
                <section>
                  <h2 className="mb-6 font-heading text-2xl font-bold text-white border-b border-white/10 pb-4">Cài Đặt Tài Khoản</h2>
                  
                  <div className="rounded-[2rem] border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-xl shadow-xl">
                    <form className="space-y-8" action="#">
                      <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-white/70">Họ và tên</label>
                            <input 
                              type="text" 
                              defaultValue={session.full_name} 
                              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-white/70">Email đăng nhập</label>
                            <input 
                              type="email" 
                              disabled 
                              defaultValue={session.email} 
                              className="w-full rounded-xl border border-white/5 bg-black/30 px-4 py-3 text-white/40 outline-none cursor-not-allowed"
                            />
                            <p className="mt-1.5 text-xs text-white/40">Email không thể thay đổi đối với tài khoản liên kết Google.</p>
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-white/70">Số điện thoại liên hệ</label>
                          <input 
                            type="tel" 
                            placeholder="Chưa cập nhật" 
                            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-white/70">Tùy chọn thông báo</label>
                          <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-white/20 bg-black accent-cyan-500" />
                              <span className="text-sm text-white/80">Nhận thông báo về các ưu đãi tour mới nhất</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-white/20 bg-black accent-cyan-500" />
                              <span className="text-sm text-white/80">Cập nhật lịch trình và trạng thái thanh toán qua SMS</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end border-t border-white/10 pt-6">
                        <button 
                          type="button" 
                          className="rounded-xl bg-cyan-500/10 px-8 py-3 text-sm font-bold text-cyan-400 transition-all hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                        >
                          Lưu Thay Đổi
                        </button>
                      </div>
                    </form>
                  </div>
                </section>
              </TabsContent>

            </div>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
