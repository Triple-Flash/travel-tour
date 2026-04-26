import Image from "next/image";
import { MapPin, Star, ArrowRight, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/halong.png"
          alt="Vịnh Hạ Long — Di sản thiên nhiên thế giới UNESCO với hàng nghìn đảo đá vôi huyền bí"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-[#0B1120]/60 to-[#0B1120]" />
        {/* Aurora overlay */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 20% 20%, rgba(6,182,212,0.3), transparent 60%), radial-gradient(ellipse 50% 50% at 80% 30%, rgba(139,92,246,0.25), transparent 50%), radial-gradient(ellipse 40% 30% at 50% 80%, rgba(249,115,22,0.2), transparent 50%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 pt-32 pb-20">
        <div className="max-w-[680px]">
          {/* Badge */}
          <Badge
            className="animate-fade-in-up mb-6 gap-2 rounded-full border-white/10 bg-white/5 px-4 py-2 text-white/90 backdrop-blur-xl"
            variant="outline"
          >
            <Plane size={13} className="text-cyan-400" />
            <span className="text-[13px] font-medium tracking-wide">
              Hơn 50.000 Du Khách Tin Tưởng
            </span>
          </Badge>

          {/* Heading */}
          <h1 className="animate-fade-in-up delay-100 text-[clamp(2.8rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-tight text-white">
            Khám Phá{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Việt Nam
            </span>{" "}
            Tuyệt Đẹp
          </h1>

          {/* Sub */}
          <p className="animate-fade-in-up delay-200 mt-6 max-w-[520px] text-lg leading-relaxed text-white/60">
            Trải nghiệm những điểm đến tuyệt vời nhất Việt Nam. Tour được thiết kế riêng,
            hướng dẫn viên chuyên nghiệp, và kỷ niệm đáng nhớ dành cho bạn.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up delay-300 mt-10 flex flex-wrap gap-4">
            <a
              id="hero-explore-btn"
              href="#destinations"
              className="group inline-flex h-13 items-center gap-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-8 text-base font-semibold text-white cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] no-underline"
            >
              Khám Phá Điểm Đến
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
            </a>
            <a
              id="hero-plan-btn"
              href="#plan"
              className="inline-flex h-13 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 text-base font-medium text-white/80 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/25 hover:text-white no-underline"
            >
              Lên Kế Hoạch Chuyến Đi
            </a>
          </div>

          {/* Stats */}
          <div className="animate-fade-in-up delay-500 mt-14 flex flex-wrap gap-10">
            {[
              { value: "63+", label: "Tỉnh Thành", icon: MapPin },
              { value: "4.9", label: "Đánh Giá TB", icon: Star },
              { value: "50K+", label: "Du Khách Hài Lòng", icon: Plane },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  <Icon size={16} className="text-cyan-400" />
                </div>
                <div>
                  <div className="font-heading text-xl font-bold text-white leading-none">{value}</div>
                  <div className="text-[13px] text-white/40 mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
