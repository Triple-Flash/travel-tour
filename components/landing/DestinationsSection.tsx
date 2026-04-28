import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import type { Destination } from "@/data/queries/destinations";
import LandingEmptyState from "@/components/landing/LandingEmptyState";

const cardStyles = [
  { gradient: "from-emerald-500/80 to-cyan-500/80", accent: "#10B981" },
  { gradient: "from-amber-500/80 to-orange-500/80", accent: "#F59E0B" },
  { gradient: "from-cyan-500/80 to-blue-500/80", accent: "#06B6D4" },
  { gradient: "from-pink-500/80 to-violet-500/80", accent: "#EC4899" },
  { gradient: "from-blue-500/80 to-violet-500/80", accent: "#3B82F6" },
  { gradient: "from-orange-500/80 to-red-500/80", accent: "#F97316" },
];

interface DestinationsSectionProps {
  destinations?: Destination[];
}

export default function DestinationsSection({
  destinations,
}: DestinationsSectionProps) {
  const data = destinations ?? [];
  const hasDestinations = data.length > 0;

  return (
    <section id="destinations" className="relative px-6 py-24">
      <div className="aurora-glow pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-[1200px]">
        <div className="mb-16 text-center">
          <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-[13px] font-semibold uppercase tracking-[3px] text-transparent">
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

        {hasDestinations ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:auto-rows-[280px]">
            {data.slice(0, 6).map((destination, index) => {
              const style = cardStyles[index % cardStyles.length];
              const bentoClass =
                index === 0
                  ? "md:col-span-2 md:row-span-2 h-[450px] md:h-auto"
                  : "col-span-1 row-span-1 h-[350px] md:h-auto";

              return (
                <Link
                  key={destination.id}
                  href={`/destinations/${destination.id}`}
                  className={`group relative block overflow-hidden rounded-[2rem] bg-zinc-900 transition-all duration-700 hover:shadow-[0_20px_80px_rgba(0,0,0,0.6)] ${bentoClass}`}
                >
                  {destination.image_url ? (
                    <Image
                      src={destination.image_url}
                      alt={`${destination.name}, ${destination.country}`}
                      fill
                      className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                      sizes={
                        index === 0
                          ? "(max-width: 768px) 100vw, 66vw"
                          : "(max-width: 768px) 100vw, 33vw"
                      }
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-80`}
                    />
                  )}

                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${style.gradient} opacity-0 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-60`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-80" />

                  <div className="absolute right-5 top-5 rounded-full border border-white/20 bg-black/40 px-4 py-1.5 shadow-lg backdrop-blur-md transition-transform duration-500 group-hover:scale-105">
                    <span className="text-[12px] font-bold tracking-wide text-white">
                      {destination.tour_count} tour
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-8 transition-transform duration-500 ease-out group-hover:-translate-y-2">
                    <div className="mb-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[2px] text-white/70 backdrop-blur-sm">
                      {destination.country}
                    </div>

                    <h3
                      className={`font-heading font-bold text-white drop-shadow-md ${index === 0 ? "mt-2 text-4xl md:text-5xl" : "mt-1 text-2xl"}`}
                    >
                      {destination.name}
                    </h3>

                    <p
                      className={`leading-relaxed text-white/60 transition-all duration-500 group-hover:text-white/90 ${index === 0 ? "mt-4 max-w-[80%] text-[16px]" : "mt-2 text-[14px]"}`}
                    >
                      {destination.description ||
                        "Điểm đến này đang chờ phần mô tả chi tiết từ đội ngũ biên tập TravelTour."}
                    </p>

                    <div className="mt-6 flex items-center overflow-hidden">
                      <span
                        className="inline-flex items-center gap-2 text-[14px] font-bold transition-all duration-300 group-hover:gap-3"
                        style={{ color: style.accent }}
                      >
                        Khám phá <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <LandingEmptyState
            icon={Compass}
            badge="Bộ sưu tập điểm đến đang được làm mới"
            title="Chưa có điểm đến nào sẵn sàng để hiển thị"
            description="TravelTour đang chuẩn bị những hành trình đầu tiên dành riêng cho du khách Việt. Ngay khi dữ liệu được cập nhật, khu vực này sẽ trở thành bản đồ cảm hứng cho chuyến đi tiếp theo của bạn."
            primaryHref="#plan"
            primaryLabel="Lên kế hoạch ngay"
            secondaryHref="/search"
            secondaryLabel="Mở trang tìm kiếm"
            highlights={[
              "Gửi nhu cầu theo ngân sách",
              "Chọn ngày khởi hành linh hoạt",
              "Nhận gợi ý phù hợp trong vài phút",
            ]}
          />
        )}
      </div>
    </section>
  );
}
