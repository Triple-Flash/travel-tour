import { Star, Quote } from "lucide-react";
import type { ReviewSummary } from "@/data/queries/reviews";
import LandingEmptyState from "@/components/landing/LandingEmptyState";

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={13}
          className={index < n ? "text-amber-400" : "text-white/10"}
          fill={index < n ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection({ reviews }: { reviews?: ReviewSummary[] }) {
  const displayReviews = reviews ?? [];
  const hasReviews = displayReviews.length > 0;

  return (
    <section id="reviews" className="relative overflow-hidden px-6 py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-violet-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-[1200px]">
        <div className="mb-20 text-center">
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-[13px] font-semibold uppercase tracking-[3px] text-transparent">
            Câu Chuyện Du Khách
          </span>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-bold text-white drop-shadow-sm">
            Du Khách Nói Gì
          </h2>
          <p className="mx-auto mt-4 max-w-[500px] text-base leading-relaxed text-white/50">
            Hàng ngàn trải nghiệm thật, kỷ niệm đẹp được sẻ chia từ những người
            đam mê xê dịch.
          </p>
        </div>

        {hasReviews ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {displayReviews.map((review) => (
              <div
                key={review.id}
                className="group relative rounded-[2rem] bg-gradient-to-b from-white/10 to-white/0 p-[1px] transition-all duration-700 hover:from-cyan-500/50 hover:to-violet-500/50 hover:shadow-[0_20px_80px_rgba(139,92,246,0.15)]"
              >
                <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[2rem] bg-[#0A0A0A]/90 p-8 backdrop-blur-3xl transition-colors duration-700 group-hover:bg-[#0A0A0A]/60">
                  <Quote
                    size={140}
                    className="absolute -right-8 -top-8 text-white/[0.02] transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110"
                  />

                  <div className="relative z-10">
                    <div className="mb-6">
                      <Stars n={review.rating} />
                    </div>
                    <p className="mb-8 text-[15px] italic leading-relaxed text-white/60 transition-colors duration-500 group-hover:text-white/90">
                      &ldquo;{review.text}&rdquo;
                    </p>
                  </div>

                  <div className="relative z-10">
                    <div className="mb-6 h-[1px] w-full bg-gradient-to-r from-white/10 to-transparent" />

                    <div className="flex items-center gap-4">
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-shadow duration-500 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                        <div className="absolute inset-[2px] flex items-center justify-center rounded-full bg-[#0A0A0A]">
                          <span className="bg-gradient-to-br from-cyan-400 to-violet-500 bg-clip-text text-[14px] font-bold tracking-wider text-transparent">
                            {review.avatar}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[15px] font-bold text-white shadow-sm">
                          {review.name}
                        </div>
                        {review.loc ? (
                          <div className="text-[12px] text-white/40">{review.loc}</div>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-5 inline-block rounded-full border border-white/5 bg-white/[0.03] px-4 py-2 text-[11px] font-semibold tracking-wide text-white/50 transition-colors duration-500 group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white/90">
                      {review.tour}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <LandingEmptyState
            icon={Quote}
            badge="Không dùng lời khen giả lập"
            title="Chưa có đánh giá nào từ du khách"
            description="TravelTour sẽ chỉ hiển thị cảm nhận thật sau khi có hành trình thật. Trong lúc chờ những lời nhận xét đầu tiên, chúng tôi giữ khu vực này tối giản nhưng vẫn đủ ấn tượng để không làm giảm chất lượng landing page."
            primaryHref="#plan"
            primaryLabel="Tạo chuyến đi đầu tiên"
            secondaryHref="/search"
            secondaryLabel="Khám phá tour hiện có"
            highlights={[
              "Đánh giá chỉ xuất hiện sau trải nghiệm thật",
              "Không chèn testimonial mẫu",
              "Giữ niềm tin bằng nội dung xác thực",
            ]}
          />
        )}
      </div>
    </section>
  );
}
