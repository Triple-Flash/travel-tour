import Image from "next/image";
import { Star, Clock, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TourSummary } from "@/data/queries/tours";

/* ── Vietnamese fallback tours (used when DB is empty) ─────────────────────── */
const fallbackTours: (TourSummary & { tag: string; tagGradient: string; accent: string })[] = [
  {
    id: "halong-cruise",
    title: "Du Thuyền Vịnh Hạ Long 3N2Đ",
    description: "Khám phá kỳ quan thiên nhiên thế giới trên du thuyền 5 sao",
    price: 4500000,
    duration: 3,
    max_capacity: 12,
    created_at: new Date(),
    destination: { id: "halong", name: "Vịnh Hạ Long", country: "Quảng Ninh", image_url: "/images/halong.png" },
    images: [],
    avg_rating: 4.9,
    review_count: 324,
    tag: "Bán Chạy Nhất",
    tagGradient: "from-orange-500 to-pink-500",
    accent: "#F97316",
  },
  {
    id: "sapa-trek",
    title: "Trekking Sa Pa & Bản Làng",
    description: "Chinh phục đỉnh Fansipan và trải nghiệm homestay",
    price: 3200000,
    duration: 4,
    max_capacity: 10,
    created_at: new Date(),
    destination: { id: "sapa", name: "Sa Pa", country: "Lào Cai", image_url: "/images/sapa.png" },
    images: [],
    avg_rating: 4.8,
    review_count: 218,
    tag: "Phổ Biến",
    tagGradient: "from-blue-500 to-violet-500",
    accent: "#8B5CF6",
  },
  {
    id: "hoian-heritage",
    title: "Phố Cổ Hội An & Thánh Địa Mỹ Sơn",
    description: "Hành trình di sản văn hóa miền Trung Việt Nam",
    price: 5800000,
    duration: 5,
    max_capacity: 8,
    created_at: new Date(),
    destination: { id: "hoian", name: "Phố Cổ Hội An", country: "Quảng Nam", image_url: "/images/hoian.png" },
    images: [],
    avg_rating: 4.9,
    review_count: 189,
    tag: "Cao Cấp",
    tagGradient: "from-cyan-500 to-emerald-500",
    accent: "#06B6D4",
  },
];

/* ── Tag + style metadata for DB tours ─────────────────────────────────────── */
const tourTags = [
  { tag: "Bán Chạy Nhất", tagGradient: "from-orange-500 to-pink-500", accent: "#F97316" },
  { tag: "Phổ Biến", tagGradient: "from-blue-500 to-violet-500", accent: "#8B5CF6" },
  { tag: "Cao Cấp", tagGradient: "from-cyan-500 to-emerald-500", accent: "#06B6D4" },
];

/* ── Format VND price ──────────────────────────────────────────────────────── */
function formatVND(price: number): string {
  return price.toLocaleString("vi-VN") + "₫";
}

interface ToursSectionProps {
  tours?: TourSummary[];
}

export default function ToursSection({ tours }: ToursSectionProps) {
  const hasTours = tours && tours.length > 0;

  return (
    <section id="tours" className="relative px-6 py-24">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[3px] bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
            Tour Nổi Bật
          </span>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-bold text-white">
            Trải Nghiệm Được Chọn Lọc
          </h2>
          <p className="mx-auto mt-4 max-w-[500px] text-base leading-relaxed text-white/50">
            Mỗi tour được thiết kế bởi chuyên gia địa phương với kiến thức sâu rộng
            về những viên ngọc ẩn giấu và văn hóa đích thực.
          </p>
        </div>

        {/* Tour cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(hasTours ? tours : fallbackTours).map((tour, i) => {
            const meta = tourTags[i % tourTags.length];
            const isFallback = !hasTours;
            const tourData = isFallback
              ? (tour as (typeof fallbackTours)[number])
              : tour;
            const tag = isFallback ? (tourData as (typeof fallbackTours)[number]).tag : meta.tag;
            const tagGradient = isFallback ? (tourData as (typeof fallbackTours)[number]).tagGradient : meta.tagGradient;
            const accent = isFallback ? (tourData as (typeof fallbackTours)[number]).accent : meta.accent;
            const image = tour.destination?.image_url || tour.images[0]?.image_url || "/images/halong.png";

            return (
              <a
                href={`/tours/${tour.id}`}
                key={tour.id}
                className="group relative h-[460px] w-full cursor-pointer overflow-hidden rounded-[2rem] bg-zinc-900 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)] block"
              >
                {/* Background Image */}
                <Image
                  src={image}
                  alt={tour.title}
                  fill
                  className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/90 transition-opacity duration-500 group-hover:to-black/80" />

                {/* Top Badge */}
                <Badge
                  className={`absolute left-5 top-5 rounded-full border border-white/20 bg-gradient-to-r ${tagGradient} px-3 py-1 text-[11px] font-bold tracking-wide text-white shadow-lg backdrop-blur-md`}
                >
                  {tag}
                </Badge>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end p-6 transition-transform duration-500 ease-out group-hover:-translate-y-2">
                  <div className="mb-2 flex items-center gap-2">
                    <Star size={14} className="text-amber-400" fill="currentColor" />
                    <span className="text-sm font-bold text-white shadow-sm">
                      {tour.avg_rating?.toFixed(1) ?? "Mới"}
                    </span>
                    {tour.review_count > 0 && (
                      <span className="text-[12px] font-medium text-white/70">
                        ({tour.review_count} đánh giá)
                      </span>
                    )}
                  </div>

                  <h3 className="mb-1 font-heading text-2xl font-bold leading-tight text-white drop-shadow-md">
                    {tour.title}
                  </h3>
                  
                  {tour.description && (
                    <p className="mb-4 text-[13px] text-white/60 line-clamp-2 transition-all duration-500 group-hover:text-white/80">
                      {tour.description}
                    </p>
                  )}

                  {/* Micro-animation details row */}
                  <div className="mb-5 flex items-center gap-4 text-[13px] font-medium text-white/80 opacity-80 transition-all duration-500 group-hover:opacity-100">
                    <span className="flex items-center gap-1.5">
                      <Clock size={15} className="text-cyan-400" /> {tour.duration} Ngày
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={15} className="text-violet-400" /> Tối đa {tour.max_capacity}
                    </span>
                  </div>

                  {/* Footer (Price & CTA) */}
                  <div className="flex items-center justify-between border-t border-white/20 pt-4 transition-colors duration-500 group-hover:border-white/40">
                    <div>
                      <span className="block text-[11px] uppercase tracking-widest text-white/60">
                        Chỉ từ
                      </span>
                      <div className="font-heading text-[22px] font-bold tracking-tight text-white">
                        {formatVND(tour.price)}
                      </div>
                    </div>

                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-black group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                      style={{
                        boxShadow: `0 4px 20px ${accent}40`,
                      }}
                    >
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
