import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Destination } from "@/data/queries/destinations";

/* ── Vietnamese fallback destinations (used when DB is empty) ──────────────── */
const fallbackDestinations: Destination[] = [
  {
    id: "halong",
    name: "Vịnh Hạ Long",
    country: "Quảng Ninhssss",
    image_url: "/images/halong.png",
    description: "Di sản UNESCO · nghìn đảo đá vôi huyền bí",
    tour_count: 42,
  },
  {
    id: "hoian",
    name: "Phố Cổ Hội An",
    country: "Quảng Nam",
    image_url: "/images/hoian.png",
    description: "Đèn lồng rực rỡ · kiến trúc cổ kính",
    tour_count: 35,
  },
  {
    id: "sapa",
    name: "Sa Pa",
    country: "Lào Cai",
    image_url: "/images/sapa.png",
    description: "Ruộng bậc thang · núi rừng hùng vĩ",
    tour_count: 28,
  },
  {
    id: "dalat",
    name: "Đà Lạt",
    country: "Lâm Đồng",
    image_url: "/images/dalat.png",
    description: "Thành phố ngàn hoa · khí hậu mát mẻ",
    tour_count: 31,
  },
  {
    id: "phuquoc",
    name: "Phú Quốc",
    country: "Kiên Giang",
    image_url: "/images/phuquoc.png",
    description: "Bãi biển trong xanh · thiên đường nghỉ dưỡng",
    tour_count: 24,
  },
  {
    id: "muine",
    name: "Mũi Né",
    country: "Bình Thuận",
    image_url: "/images/muine.png",
    description: "Đồi cát vàng · resort ven biển",
    tour_count: 18,
  },
];

/* ── Color mapping per card index ──────────────────────────────────────────── */
const cardStyles = [
  { gradient: "from-emerald-500/80 to-cyan-500/80", accent: "#10B981" },
  { gradient: "from-amber-500/80 to-orange-500/80", accent: "#F59E0B" },
  { gradient: "from-cyan-500/80 to-blue-500/80", accent: "#06B6D4" },
  { gradient: "from-pink-500/80 to-violet-500/80", accent: "#EC4899" },
  { gradient: "from-blue-500/80 to-violet-500/80", accent: "#3B82F6" },
  { gradient: "from-orange-500/80 to-red-500/80", accent: "#F97316" },
];

/* ── Fallback images per destination name ──────────────────────────────────── */
const fallbackImages: Record<string, string> = {
  "Vịnh Hạ Long": "/images/halong.png",
  "Phố Cổ Hội An": "/images/hoian.png",
  "Sa Pa": "/images/sapa.png",
  "Đà Lạt": "/images/dalat.png",
  "Phú Quốc": "/images/phuquoc.png",
  "Mũi Né": "/images/muine.png",
};

interface DestinationsSectionProps {
  destinations?: Destination[];
}

export default function DestinationsSection({ destinations }: DestinationsSectionProps) {
  const data = destinations && destinations.length > 0 ? destinations : fallbackDestinations;

  return (
    <section id="destinations" className="relative px-6 py-24">
      {/* Aurora glow */}
      <div className="aurora-glow absolute inset-0 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[3px] bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Điểm Đến Nổi Bật
          </span>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-bold text-white">
            Bạn Muốn Đi Đâu Tiếp?
          </h2>
          <p className="mx-auto mt-4 max-w-[500px] text-base leading-relaxed text-white/50">
            Những điểm đến được chọn lọc với văn hóa đa dạng, cảnh quan tuyệt đẹp
            và trải nghiệm khó quên.
          </p>
        </div>

        {/* Destination Bento Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:auto-rows-[280px]">
          {data.slice(0, 6).map((d, i) => {
            const style = cardStyles[i % cardStyles.length];
            const image = d.image_url || fallbackImages[d.name] || "/images/halong.png";

            // Bento grid layout: The first item is massive (2x2), the rest are standard (1x1).
            const bentoClass = i === 0 
              ? "md:col-span-2 md:row-span-2 h-[450px] md:h-auto" 
              : "col-span-1 row-span-1 h-[350px] md:h-auto";

            return (
              <a
                key={d.id}
                id={`dest-${d.id}`}
                href="#"
                className={`group relative block cursor-pointer overflow-hidden rounded-[2rem] bg-zinc-900 transition-all duration-700 hover:shadow-[0_20px_80px_rgba(0,0,0,0.6)] ${bentoClass}`}
              >
                <Image
                  src={image}
                  alt={`${d.name}, ${d.country}`}
                  fill
                  className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                  sizes={i === 0 ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                />
                
                {/* Dynamic Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${style.gradient} opacity-0 transition-opacity duration-700 mix-blend-multiply group-hover:opacity-60`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-80" />

                {/* Tour count pill */}
                <div className="absolute right-5 top-5 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 backdrop-blur-md shadow-lg transition-transform duration-500 group-hover:scale-105">
                  <span className="text-[12px] font-bold tracking-wide text-white">{d.tour_count} tours</span>
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 transition-transform duration-500 ease-out group-hover:-translate-y-2">
                  <div className="mb-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-sm text-[11px] font-bold uppercase tracking-[2px] text-white/70">
                    {d.country}
                  </div>
                  
                  <h3 className={`font-heading font-bold text-white drop-shadow-md ${i === 0 ? "text-4xl md:text-5xl mt-2" : "text-2xl mt-1"}`}>
                    {d.name}
                  </h3>
                  
                  <p className={`text-white/60 leading-relaxed transition-all duration-500 group-hover:text-white/90 ${i === 0 ? "mt-4 text-[16px] max-w-[80%]" : "mt-2 text-[14px]"}`}>
                    {d.description}
                  </p>

                  <div className="mt-6 flex items-center overflow-hidden">
                    <span
                      className="inline-flex items-center gap-2 text-[14px] font-bold transition-all duration-300 group-hover:gap-3"
                      style={{ color: style.accent }}
                    >
                      Khám Phá <ArrowRight size={16} />
                    </span>
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
