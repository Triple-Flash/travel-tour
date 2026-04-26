import { Shield, Heart, Headphones, Clock, Wallet, Globe } from "lucide-react";

const features = [
  { icon: Shield, title: "An Toàn & Bảo Mật", desc: "Mọi tour đều được kiểm duyệt. Hỗ trợ 24/7 trên toàn quốc.", color: "#10B981", gradient: "from-emerald-400 to-teal-500", glow: "rgba(16,185,129,0.3)" },
  { icon: Heart, title: "Lịch Trình Tinh Tế", desc: "Chuyên gia địa phương thiết kế với những điểm đến bí ẩn.", color: "#EC4899", gradient: "from-pink-400 to-rose-500", glow: "rgba(236,72,153,0.3)" },
  { icon: Headphones, title: "Hướng Dẫn Viên", desc: "HDV có chứng chỉ, am hiểu văn hóa và lịch sử.", color: "#8B5CF6", gradient: "from-violet-400 to-fuchsia-500", glow: "rgba(139,92,246,0.3)" },
  { icon: Clock, title: "Đặt Tour Linh Hoạt", desc: "Miễn phí hủy tour trước 48 giờ khởi hành.", color: "#06B6D4", gradient: "from-cyan-400 to-blue-500", glow: "rgba(6,182,212,0.3)" },
  { icon: Wallet, title: "Giá Tốt Nhất", desc: "Cam kết hoàn tiền chênh lệch. Không phí ẩn.", color: "#F97316", gradient: "from-orange-400 to-amber-500", glow: "rgba(249,115,22,0.3)" },
  { icon: Globe, title: "63+ Tỉnh Thành", desc: "Từ đảo xa đến thành phố sầm uất, đều có mặt.", color: "#3B82F6", gradient: "from-blue-400 to-indigo-500", glow: "rgba(59,130,246,0.3)" },
];

export default function WhyUsSection() {
  return (
    <section id="why-us" className="relative overflow-hidden px-6 py-24">
      {/* Background ambient light */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[1000px] rounded-[100%] bg-cyan-500/10 blur-[150px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[1200px]">
        <div className="mb-20 text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[3px] bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Tại Sao Chọn TravelTour
          </span>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-bold text-white drop-shadow-sm">
            Du Lịch Với Sự Tin Tưởng
          </h2>
          <p className="mx-auto mt-4 max-w-[500px] text-base leading-relaxed text-white/50">
            Hơn 50.000 du khách đã chọn chúng tôi. Khám phá lý do tại sao chúng tôi là nền tảng đáng tin cậy nhất.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-[2rem] bg-gradient-to-b from-white/10 to-white/0 p-[1px] transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
            >
              {/* Dynamic glowing border that fades in on hover */}
              <div
                className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${f.gradient} opacity-0 transition-opacity duration-700 group-hover:opacity-100`}
              />

              <div className="relative flex h-full min-h-[260px] flex-col justify-between overflow-hidden rounded-[2rem] bg-[#0A0A0A]/90 p-8 backdrop-blur-3xl transition-colors duration-700 group-hover:bg-[#0A0A0A]/70">
                {/* Large watermark icon */}
                <f.icon
                  size={160}
                  className="absolute -bottom-8 -right-8 text-white/[0.02] transition-transform duration-700 group-hover:-rotate-12 group-hover:scale-110"
                />

                <div className="relative z-10">
                  <div
                    className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} shadow-lg transition-transform duration-500 group-hover:scale-110`}
                    style={{ boxShadow: `0 0 20px ${f.glow}` }}
                  >
                    <f.icon size={26} className="text-white" />
                  </div>

                  <h3 className="mb-3 font-heading text-xl font-bold text-white drop-shadow-sm transition-colors duration-500 group-hover:text-white">
                    {f.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-white/50 transition-colors duration-500 group-hover:text-white/80">
                    {f.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
