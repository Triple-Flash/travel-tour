import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CreditCard,
  Heart,
  MapPin,
  Settings,
  User,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getSession } from "@/lib/auth";
import { getLatestPaidBooking } from "@/data/queries/bookings";
import { getMyWishlist } from "@/data/queries/wishlist";
import { getMyProfile } from "@/data/queries/users";
import ProfileSettingsForm from "./ProfileSettingsForm";

function formatVND(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const [latestPaidBooking, wishlist, profile] = await Promise.all([
    getLatestPaidBooking().catch(() => null),
    getMyWishlist().catch(() => []),
    getMyProfile().catch(() => ({
      id: session.id,
      full_name: session.full_name,
      email: session.email,
      role: session.role,
      phone_number: null,
      created_at: null,
    })),
  ]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-cyan-500/30">
      <Navbar user={session} />

      <main className="relative pt-32 pb-24">
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-[1200px] px-6">
          <Tabs
            defaultValue="trips"
            orientation="vertical"
            className="flex flex-col gap-10 lg:flex-row"
          >
            <aside className="w-full shrink-0 lg:w-[350px]">
              <div className="sticky top-24 overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl">
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-cyan-500/20 blur-[50px] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="relative mb-4 flex h-28 w-28 items-center justify-center rounded-full p-[3px] shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                    <div
                      className="absolute inset-0 rounded-full animate-spin-slow"
                      style={{
                        background:
                          "conic-gradient(from 0deg, #EA4335 0deg 90deg, #4285F4 90deg 180deg, #34A853 180deg 270deg, #FBBC05 270deg 360deg)",
                      }}
                    />
                    {session.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.avatar_url}
                        alt={session.full_name}
                        className="relative z-10 h-full w-full rounded-full border-4 border-[#0A0A0A] bg-[#111] object-cover"
                      />
                    ) : (
                      <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full border-4 border-[#0A0A0A] bg-zinc-800 text-3xl font-bold text-white">
                        {session.full_name
                          .split(" ")
                          .map((name) => name[0])
                          .slice(-2)
                          .join("")
                          .toUpperCase() || "U"}
                      </div>
                    )}
                  </div>

                  <h1 className="font-heading text-2xl font-bold tracking-tight text-white">
                    {profile.full_name}
                  </h1>
                  <p className="mb-2 text-sm text-white/50">{profile.email}</p>
                  <span className="inline-block rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-400">
                    {session.role === "admin" ? "Quan tri vien" : "Khach hang"}
                  </span>
                </div>

                <TabsList
                  variant="line"
                  className="mt-10 flex h-auto w-full flex-col gap-2 border-t border-white/10 bg-transparent p-0 pt-6"
                >
                  <TabsTrigger
                    value="trips"
                    className="group flex w-full items-center justify-start gap-3 rounded-xl border-none px-4 py-3 text-sm font-medium text-white/60 shadow-none transition-all hover:bg-white/5 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white focus-visible:ring-0 after:hidden"
                  >
                    <MapPin
                      size={18}
                      className="text-cyan-400 transition-transform group-hover:scale-110"
                    />
                    Chuyen di cua toi
                  </TabsTrigger>
                  <TabsTrigger
                    value="wishlist"
                    className="group flex w-full items-center justify-start gap-3 rounded-xl border-none px-4 py-3 text-sm font-medium text-white/60 shadow-none transition-all hover:bg-white/5 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white focus-visible:ring-0 after:hidden"
                  >
                    <Heart
                      size={18}
                      className="text-pink-400 transition-transform group-hover:scale-110"
                    />
                    Da luu va yeu thich
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="group flex w-full items-center justify-start gap-3 rounded-xl border-none px-4 py-3 text-sm font-medium text-white/60 shadow-none transition-all hover:bg-white/5 hover:text-white data-[state=active]:bg-white/10 data-[state=active]:text-white focus-visible:ring-0 after:hidden"
                  >
                    <Settings
                      size={18}
                      className="text-white/40 transition-transform group-hover:scale-110 group-hover:rotate-45"
                    />
                    Cai dat tai khoan
                  </TabsTrigger>
                </TabsList>
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              <TabsContent value="trips" className="mt-0 space-y-10 outline-none">
                <section>
                  <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                    <h2 className="font-heading text-2xl font-bold text-white">
                      Chuyen di moi nhat da thanh toan
                    </h2>
                    <Link
                      href="/search"
                      className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                    >
                      Kham pha tour moi
                    </Link>
                  </div>

                  {latestPaidBooking?.tour ? (
                    <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      <div className="flex flex-col md:flex-row">
                        <div className="relative h-48 w-full shrink-0 overflow-hidden md:h-auto md:w-[280px]">
                          <Image
                            src={
                              latestPaidBooking.tour.images[0]?.image_url ||
                              "/images/halong.png"
                            }
                            alt={latestPaidBooking.tour.title}
                            fill
                            className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <span className="absolute top-4 left-4 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-md">
                            Da thanh toan
                          </span>
                        </div>

                        <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
                          <div>
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-cyan-400">
                              <MapPin size={16} />
                              {latestPaidBooking.tour.destination?.name},{" "}
                              {latestPaidBooking.tour.destination?.country}
                            </div>
                            <h3 className="mb-4 font-heading text-2xl font-bold text-white">
                              {latestPaidBooking.tour.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-white/70">
                              <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-violet-400" />
                                <span>
                                  {latestPaidBooking.booking_date
                                    ? new Date(
                                        latestPaidBooking.booking_date
                                      ).toLocaleDateString("vi-VN")
                                    : "Chua co ngay khoi hanh"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={16} className="text-cyan-400" />
                                <span>{latestPaidBooking.tour.duration} ngay</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User size={16} className="text-pink-400" />
                                <span>
                                  {latestPaidBooking.number_of_people} khach
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CreditCard
                                  size={16}
                                  className="text-emerald-400"
                                />
                                <span>
                                  {latestPaidBooking.payment?.payment_date
                                    ? `Thanh toan ${new Date(
                                        latestPaidBooking.payment.payment_date
                                      ).toLocaleDateString("vi-VN")}`
                                    : "Thanh toan thanh cong"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                            <div>
                              <p className="mb-1 text-xs uppercase tracking-widest text-white/50">
                                Tong thanh toan
                              </p>
                              <p className="font-mono font-bold text-cyan-400">
                                {formatVND(latestPaidBooking.total_price)}
                              </p>
                            </div>
                            <Link
                              href={`/tours/${latestPaidBooking.tour_id}`}
                              className="rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                            >
                              Xem chi tiet
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[2rem] border border-white/10 bg-zinc-900/50 p-16 text-center shadow-xl backdrop-blur-xl">
                      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10">
                        <Calendar size={40} className="text-cyan-400/80" />
                      </div>
                      <h3 className="mb-3 font-heading text-2xl font-bold text-white">
                        Chua co tour nao da thanh toan
                      </h3>
                      <p className="mx-auto mb-8 max-w-md text-white/60">
                        Khi ban hoan tat thanh toan, chuyen di moi nhat se hien o
                        day de ban theo doi nhanh.
                      </p>
                      <Link
                        href="/search"
                        className="inline-flex rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]"
                      >
                        Tim tour ngay
                      </Link>
                    </div>
                  )}
                </section>
              </TabsContent>

              <TabsContent value="wishlist" className="mt-0 space-y-10 outline-none">
                <section>
                  <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
                    <h2 className="font-heading text-2xl font-bold text-white">
                      Da luu va yeu thich
                    </h2>
                    <span className="text-sm text-white/50">{wishlist.length} tour</span>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="rounded-[2rem] border border-white/10 bg-zinc-900/50 p-16 text-center shadow-xl backdrop-blur-xl">
                      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-pink-500/20 bg-pink-500/10">
                        <Heart size={40} className="text-pink-400/80" />
                      </div>
                      <h3 className="mb-3 font-heading text-2xl font-bold text-white">
                        Chua co muc yeu thich nao
                      </h3>
                      <p className="mx-auto mb-8 max-w-md text-white/60">
                        Ban chua luu tour nao. Hay luot xem cac diem den tuyet dep
                        va nhan vao bieu tuong trai tim de luu lai nhung lua chon
                        tot nhat.
                      </p>
                      <Link
                        href="/search"
                        className="inline-flex rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(236,72,153,0.5)]"
                      >
                        Kham pha tour ngay
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {wishlist.map((item) => {
                        const image =
                          item.tour.images[0]?.image_url ||
                          item.tour.destination?.image_url ||
                          "/images/halong.png";

                        return (
                          <Link
                            key={item.tour.id}
                            href={`/tours/${item.tour.id}`}
                            className="group overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/60 backdrop-blur-md transition-all duration-500 hover:border-white/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                          >
                            <div className="relative h-56 overflow-hidden">
                              <Image
                                src={image}
                                alt={item.tour.title}
                                fill
                                className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                              <div className="absolute left-5 top-5 rounded-full border border-pink-500/30 bg-pink-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-pink-300 backdrop-blur-md">
                                Yeu thich
                              </div>
                            </div>

                            <div className="space-y-4 p-6">
                              <div>
                                <p className="mb-2 flex items-center gap-2 text-sm text-cyan-400">
                                  <MapPin size={15} />
                                  {item.tour.destination?.name},{" "}
                                  {item.tour.destination?.country}
                                </p>
                                <h3 className="font-heading text-2xl font-bold text-white">
                                  {item.tour.title}
                                </h3>
                              </div>

                              <div className="flex items-center gap-5 text-sm text-white/65">
                                <span className="flex items-center gap-2">
                                  <Clock size={15} className="text-violet-400" />
                                  {item.tour.duration} ngay
                                </span>
                                <span className="flex items-center gap-2">
                                  <CreditCard
                                    size={15}
                                    className="text-emerald-400"
                                  />
                                  {formatVND(item.tour.price)}
                                </span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </section>
              </TabsContent>

              <TabsContent value="settings" className="mt-0 space-y-10 outline-none">
                <section>
                  <h2 className="mb-6 border-b border-white/10 pb-4 font-heading text-2xl font-bold text-white">
                    Cai dat tai khoan
                  </h2>

                  <div className="rounded-[2rem] border border-white/10 bg-zinc-900/50 p-8 shadow-xl backdrop-blur-xl">
                    <ProfileSettingsForm
                      fullName={profile.full_name}
                      email={profile.email}
                      phoneNumber={profile.phone_number}
                    />
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
