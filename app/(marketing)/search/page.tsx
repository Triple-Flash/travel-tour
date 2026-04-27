import Image from "next/image";
import Link from "next/link";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Star,
  Clock,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import LandingEmptyState from "@/components/landing/LandingEmptyState";
import SearchFilters from "@/components/search/SearchFilters";
import SortSelect from "@/components/search/SortSelect";
import { Badge } from "@/components/ui/badge";
import { searchTours, getTours } from "@/data/queries/tours";
import type { TourSummary, SearchToursFilters } from "@/data/queries/tours";
import { getSession } from "@/lib/auth";

const tourTags = [
  {
    tag: "Phù Hợp Nhất",
    tagGradient: "from-cyan-500 to-emerald-500",
    accent: "#06B6D4",
  },
  {
    tag: "Đề Xuất",
    tagGradient: "from-violet-500 to-fuchsia-500",
    accent: "#8B5CF6",
  },
  {
    tag: "Nổi Bật",
    tagGradient: "from-orange-500 to-pink-500",
    accent: "#F97316",
  },
];

function parseDestinationQuery(raw: string): string {
  if (raw.includes("—")) {
    return raw.split("—")[0].trim();
  }

  return raw.trim();
}

async function getSearchResults(
  filters: SearchToursFilters,
  hasSearchIntent: boolean
): Promise<TourSummary[]> {
  try {
    if (hasSearchIntent) {
      return await searchTours(filters);
    }

    return await getTours();
  } catch {
    return [];
  }
}

function formatVND(price: number): string {
  return price.toLocaleString("vi-VN") + "₫";
}

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{
    destination?: string;
    date?: string;
    guests?: string;
    minPrice?: string;
    maxPrice?: string;
    minDuration?: string;
    maxDuration?: string;
    minRating?: string;
    sortBy?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const session = await getSession();

  const rawDestination = resolvedSearchParams.destination
    ? decodeURIComponent(resolvedSearchParams.destination)
    : "";
  const destinationQuery = rawDestination
    ? parseDestinationQuery(rawDestination)
    : undefined;
  const guests = resolvedSearchParams.guests
    ? parseInt(resolvedSearchParams.guests, 10)
    : undefined;

  const filters: SearchToursFilters = {
    destination: destinationQuery,
    minPrice: resolvedSearchParams.minPrice
      ? parseFloat(resolvedSearchParams.minPrice)
      : undefined,
    maxPrice: resolvedSearchParams.maxPrice
      ? parseFloat(resolvedSearchParams.maxPrice)
      : undefined,
    minDuration: resolvedSearchParams.minDuration
      ? parseInt(resolvedSearchParams.minDuration, 10)
      : undefined,
    maxDuration: resolvedSearchParams.maxDuration
      ? parseInt(resolvedSearchParams.maxDuration, 10)
      : undefined,
    minRating: resolvedSearchParams.minRating
      ? parseInt(resolvedSearchParams.minRating, 10)
      : undefined,
    guests,
    sortBy:
      (resolvedSearchParams.sortBy as SearchToursFilters["sortBy"]) || undefined,
  };

  const hasSearchIntent = Boolean(
    destinationQuery ||
      resolvedSearchParams.guests ||
      resolvedSearchParams.minPrice ||
      resolvedSearchParams.maxPrice ||
      resolvedSearchParams.minDuration ||
      resolvedSearchParams.maxDuration ||
      resolvedSearchParams.minRating ||
      resolvedSearchParams.sortBy
  );

  const tours = await getSearchResults(filters, hasSearchIntent);

  const queryDestination = rawDestination || "Mọi nơi";
  const queryDate = resolvedSearchParams.date || "Thời gian bất kỳ";
  const queryGuests = resolvedSearchParams.guests
    ? `${resolvedSearchParams.guests} khách`
    : "1 khách";

  const hasActiveFilters = Boolean(
    resolvedSearchParams.minPrice ||
      resolvedSearchParams.maxPrice ||
      resolvedSearchParams.minDuration ||
      resolvedSearchParams.maxDuration ||
      resolvedSearchParams.minRating
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-cyan-500/30">
      <Navbar user={session} />

      <main className="relative pb-24 pt-32">
        <div className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-violet-500/10 blur-[150px]" />
        <div className="pointer-events-none absolute left-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-[1400px] px-6">
          <div className="mb-12 rounded-[2.5rem] border border-white/10 bg-[#111]/80 p-6 shadow-2xl backdrop-blur-2xl md:p-8">
            <h1 className="mb-6 font-heading text-3xl font-bold text-white md:text-4xl">
              Kết Quả Tìm Kiếm
            </h1>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-medium text-cyan-400">
                <MapPin size={18} />
                {queryDestination}
              </div>
              <div className="flex items-center gap-3 rounded-full border border-violet-500/30 bg-violet-500/10 px-5 py-2.5 text-sm font-medium text-violet-400">
                <Calendar size={18} />
                {queryDate}
              </div>
              <div className="flex items-center gap-3 rounded-full border border-pink-500/30 bg-pink-500/10 px-5 py-2.5 text-sm font-medium text-pink-400">
                <Users size={18} />
                {queryGuests}
              </div>

              <Link
                href="/#plan"
                className="ml-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
              >
                <Search size={16} />
                Tìm kiếm mới
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-10 lg:flex-row">
            <SearchFilters />

            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-white/60">
                  Tìm thấy <strong className="text-white">{tours.length}</strong> tour phù hợp
                  {hasActiveFilters ? (
                    <span className="ml-2 text-cyan-400/60">(đang lọc)</span>
                  ) : null}
                </p>
                <SortSelect />
              </div>

              {tours.length === 0 ? (
                <LandingEmptyState
                  icon={Search}
                  badge="Không còn nội dung mẫu trong kết quả"
                  title="Chưa tìm thấy tour phù hợp với lựa chọn của bạn"
                  description="TravelTour không tự chèn tour giả khi dữ liệu rỗng. Bạn có thể nới bộ lọc, đổi điểm đến hoặc để lại nhu cầu ở phần lập kế hoạch để chúng tôi gợi ý hành trình sát hơn."
                  primaryHref="/#plan"
                  primaryLabel="Điều chỉnh kế hoạch"
                  secondaryHref="/search"
                  secondaryLabel="Xóa bộ lọc"
                  highlights={[
                    "Thử khoảng giá rộng hơn",
                    "Giảm số điều kiện lọc",
                    "Tìm theo khu vực lân cận",
                  ]}
                />
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {tours.map((tour, index) => {
                    const meta = tourTags[index % tourTags.length];
                    const image = tour.destination?.image_url || tour.images[0]?.image_url;

                    return (
                      <Link
                        href={`/tours/${tour.id}`}
                        key={tour.id}
                        className="group relative h-[420px] w-full overflow-hidden rounded-[2rem] bg-zinc-900 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                      >
                        {image ? (
                          <Image
                            src={image}
                            alt={tour.title}
                            fill
                            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${meta.tagGradient} opacity-80`}
                          />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/90 transition-opacity duration-500 group-hover:to-black/80" />

                        <Badge
                          className={`absolute left-5 top-5 rounded-full border border-white/20 bg-gradient-to-r ${meta.tagGradient} px-3 py-1 text-[11px] font-bold tracking-wide text-white shadow-lg backdrop-blur-md`}
                        >
                          {meta.tag}
                        </Badge>

                        <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end p-6 transition-transform duration-500 ease-out group-hover:-translate-y-2">
                          <div className="mb-2 flex items-center gap-2">
                            <Star size={14} className="text-amber-400" fill="currentColor" />
                            <span className="text-sm font-bold text-white">
                              {tour.avg_rating?.toFixed(1) ?? "Mới"}
                            </span>
                            {tour.review_count > 0 ? (
                              <span className="text-[12px] text-white/70">
                                ({tour.review_count})
                              </span>
                            ) : null}
                          </div>

                          <h3 className="mb-2 font-heading text-xl font-bold leading-tight text-white drop-shadow-md">
                            {tour.title}
                          </h3>

                          <div className="mb-5 flex items-center gap-4 text-[12px] font-medium text-white/80 opacity-80 transition-opacity duration-500 group-hover:opacity-100">
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} className="text-cyan-400" /> {tour.duration} ngày
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users size={14} className="text-violet-400" /> Tối đa {tour.max_capacity}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-t border-white/20 pt-4 transition-colors duration-500 group-hover:border-white/40">
                            <div>
                              <span className="block text-[10px] uppercase tracking-widest text-white/60">
                                Chỉ từ
                              </span>
                              <div className="font-heading text-xl font-bold tracking-tight text-white">
                                {formatVND(tour.price)}
                              </div>
                            </div>
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-black"
                              style={{ boxShadow: `0 4px 20px ${meta.accent}40` }}
                            >
                              <ArrowRight size={16} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
