import { Star, Quote } from "lucide-react";
import type { ReviewSummary } from "@/data/queries/reviews";

const FALLBACK_REVIEWS: ReviewSummary[] = [
  { id: "1", name: "Nguyễn Minh Anh", loc: "Hà Nội", avatar: "MA", rating: 5, text: "Chuyến du thuyền Hạ Long vượt ngoài mọi tưởng tượng. Hang động bí ẩn, bình minh trên vịnh — hoàn toàn khó quên!", tour: "Du Thuyền Vịnh Hạ Long 3 Ngày 2 Đêm" },
  { id: "2", name: "Trần Quốc Bảo", loc: "TP. Hồ Chí Minh", avatar: "QB", rating: 5, text: "Tour Sa Pa thật tuyệt vời. Trekking qua ruộng bậc thang, homestay với người dân tộc — xứng đáng từng phút giây!", tour: "Trekking Fansipan & Trải Nghiệm Văn Hóa Bản Địa Sa Pa" },
  { id: "3", name: "Lê Thu Hương", loc: "Đà Nẵng", avatar: "TH", rating: 5, text: "Phố cổ Hội An lúc hoàng hôn thật diệu kỳ. Thả đèn hoa đăng, thưởng thức ẩm thực — đáng từng đồng!", tour: "Khám Phá Phố Cổ Hội An và Thánh Địa Mỹ Sơn" },
];

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className={i < n ? "text-amber-400" : "text-white/10"} fill={i < n ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

export default function ReviewsSection({ reviews = FALLBACK_REVIEWS }: { reviews?: ReviewSummary[] }) {
  const displayReviews = reviews && reviews.length > 0 ? reviews : FALLBACK_REVIEWS;

  return (
    <section id="reviews" className="relative px-6 py-24 overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-500/10 blur-[120px] pointer-events-none rounded-[100%]" />

      <div className="relative z-10 mx-auto max-w-[1200px]">
        <div className="mb-20 text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[3px] bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            Câu Chuyện Du Khách
          </span>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-bold text-white drop-shadow-sm">
            Du Khách Nói Gì
          </h2>
          <p className="mx-auto mt-4 max-w-[500px] text-base leading-relaxed text-white/50">
            Hàng ngàn trải nghiệm thật, kỷ niệm đẹp được sẻ chia từ những người đam mê xê dịch.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {displayReviews.map((r) => (
            <div
              key={r.id}
              className="group relative rounded-[2rem] bg-gradient-to-b from-white/10 to-white/0 p-[1px] transition-all duration-700 hover:from-cyan-500/50 hover:to-violet-500/50 hover:shadow-[0_20px_80px_rgba(139,92,246,0.15)]"
            >
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] bg-[#0A0A0A]/90 p-8 backdrop-blur-3xl transition-colors duration-700 group-hover:bg-[#0A0A0A]/60">
                
                {/* Large watermark quote */}
                <Quote
                  size={140}
                  className="absolute -right-8 -top-8 text-white/[0.02] transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110"
                />

                <div className="relative z-10">
                  <div className="mb-6">
                    <Stars n={r.rating} />
                  </div>
                  <p className="mb-8 text-[15px] italic leading-relaxed text-white/60 transition-colors duration-500 group-hover:text-white/90">
                    &ldquo;{r.text}&rdquo;
                  </p>
                </div>

                <div className="relative z-10">
                  {/* Subtle divider */}
                  <div className="mb-6 h-[1px] w-full bg-gradient-to-r from-white/10 to-transparent" />
                  
                  <div className="flex items-center gap-4">
                    {/* Glowing ring avatar */}
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-shadow duration-500 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                      <div className="absolute inset-[2px] flex items-center justify-center rounded-full bg-[#0A0A0A]">
                        <span className="bg-gradient-to-br from-cyan-400 to-violet-500 bg-clip-text text-[14px] font-bold tracking-wider text-transparent">
                          {r.avatar}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[15px] font-bold text-white shadow-sm">{r.name}</div>
                      <div className="text-[12px] text-white/40">{r.loc}</div>
                    </div>
                  </div>

                  <div className="mt-5 inline-block rounded-full border border-white/5 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold tracking-wide text-white/50 transition-colors duration-500 group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white/90">
                    {r.tour}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
