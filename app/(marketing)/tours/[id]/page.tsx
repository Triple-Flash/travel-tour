import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { getTourById } from "@/data/queries/tours";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FavoriteTourButton from "./FavoriteTourButton";
import BookingForm from "./BookingForm";

async function NavbarLoader() {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  return <Navbar user={session} />;
}

async function FavoriteButtonLoader({ tourId }: { tourId: string }) {
  const { getSession } = await import("@/lib/auth");
  const { getMyWishlist } = await import("@/data/queries/wishlist");
  
  const session = await getSession();
  const wishlist = session ? await getMyWishlist().catch(() => []) : [];
  const isFavorite = wishlist.some((item) => item.tour.id === tourId);
  
  return (
    <FavoriteTourButton
      tourId={tourId}
      initialIsFavorite={isFavorite}
      isSignedIn={Boolean(session)}
    />
  );
}

function formatVND(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let tour;
  try {
    tour = await getTourById(id);
  } catch {
    notFound();
  }

  const image =
    tour.destination?.image_url || tour.images[0]?.image_url || "/images/halong.png";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-cyan-500/30">
      <Suspense fallback={<Navbar user={null} />}>
        <NavbarLoader />
      </Suspense>

      <main className="relative pb-24">
        <section className="relative h-[65vh] min-h-[500px] w-full overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={image}
              alt={tour.title}
              fill
              className="origin-bottom object-cover animate-image-zoom"
              priority
              sizes="100vw"
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/40 via-transparent to-transparent" />

          <div className="relative z-10 mx-auto flex h-full max-w-[1200px] flex-col justify-end px-6 pb-12">
            <Link
              href="/#tours"
              className="group mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-1"
              />
              Tất cả tour
            </Link>

            <div className="mb-4 flex flex-wrap items-center gap-3">
              {tour.destination ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[12px] font-bold uppercase tracking-[2px] text-cyan-400 backdrop-blur-sm">
                  <MapPin size={12} />
                  {tour.destination.name}
                </span>
              ) : null}

              <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[12px] font-bold text-amber-400 backdrop-blur-sm">
                <Star size={12} fill="currentColor" />
                {tour.avg_rating?.toFixed(1) || "Mới"}
                {tour.review_count > 0 ? (
                  <span className="ml-1 text-amber-400/70 opacity-80">
                    ({tour.review_count})
                  </span>
                ) : null}
              </div>

              <Suspense fallback={<div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />}>
                <FavoriteButtonLoader tourId={tour.id} />
              </Suspense>
            </div>

            <h1 className="font-heading text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.1] tracking-tight text-white drop-shadow-xl">
              {tour.title}
            </h1>
          </div>
        </section>

        <section className="relative mx-auto -mt-8 max-w-[1200px] px-6">
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="rounded-[2rem] border border-white/5 bg-[#111]/50 p-8 shadow-2xl backdrop-blur-xl">
                <h2 className="mb-6 font-heading text-2xl font-bold text-white">
                  Tổng quan chuyến đi
                </h2>

                <div className="mb-8 flex flex-wrap gap-6 border-b border-white/10 pb-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Thời gian</p>
                      <p className="font-semibold text-white">{tour.duration} ngày</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                      <Users size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Số lượng</p>
                      <p className="font-semibold text-white">
                        Tối đa {tour.max_capacity} người
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-400">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Lịch khởi hành</p>
                      <p className="font-semibold text-white">Hàng tuần</p>
                    </div>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-lg leading-relaxed text-white/80">
                    {tour.description}
                  </p>

                  <h3 className="mb-4 mt-8 font-heading text-xl font-bold text-white">
                    Điểm nổi bật
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Dịch vụ chuẩn 5 sao cao cấp",
                      "Hướng dẫn viên chuyên nghiệp, nhiệt tình",
                      "Bảo hiểm du lịch toàn diện",
                      "Lịch trình linh hoạt, tối ưu thời gian",
                    ].map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3 text-white/70">
                        <CheckCircle2
                          size={20}
                          className="mt-0.5 shrink-0 text-cyan-400"
                        />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {tour.reviews.length > 0 ? (
                  <div className="mt-10 border-t border-white/10 pt-8">
                    <h3 className="mb-6 font-heading text-xl font-bold text-white">
                      Đánh giá ({tour.review_count})
                    </h3>
                    <div className="space-y-6">
                      {tour.reviews.slice(0, 5).map((review) => (
                        <div
                          key={review.id}
                          className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-sm font-bold text-white">
                                {review.user?.full_name?.charAt(0) || "?"}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {review.user?.full_name || "Ẩn danh"}
                                </p>
                                {review.created_at ? (
                                  <p className="text-xs text-white/40">
                                    {new Date(review.created_at).toLocaleDateString(
                                      "vi-VN"
                                    )}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                  key={index}
                                  size={14}
                                  className={
                                    index < (review.rating ?? 0)
                                      ? "text-amber-400"
                                      : "text-white/20"
                                  }
                                  fill={
                                    index < (review.rating ?? 0)
                                      ? "currentColor"
                                      : "none"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment ? (
                            <p className="text-sm leading-relaxed text-white/60">
                              {review.comment}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="relative">
              <div className="sticky top-32 rounded-[2rem] border border-white/10 bg-zinc-900/80 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.8)] backdrop-blur-3xl">
                <div className="pointer-events-none absolute -inset-[1px] rounded-[2rem] bg-gradient-to-b from-white/10 to-transparent" />
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-[100px]" />

                <div className="relative z-10">
                  <span className="mb-2 block text-sm font-medium uppercase tracking-wider text-white/50">
                    Giá tour tiêu chuẩn
                  </span>
                  <div className="mb-6 flex items-end gap-2">
                    <h3 className="font-heading text-4xl font-bold tracking-tight text-white">
                      {formatVND(tour.price)}
                    </h3>
                    <span className="mb-1 text-white/50">/ người</span>
                  </div>

                  <BookingForm
                    tourId={tour.id}
                    maxCapacity={tour.max_capacity}
                    price={tour.price}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
