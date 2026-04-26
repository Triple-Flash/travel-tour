"use client";

import { useState } from "react";
import { MapPin, Calendar, Users, ArrowRight, ChevronDown } from "lucide-react";

const provinces = [
  "Vịnh Hạ Long — Quảng Ninh",
  "Phố Cổ Hội An — Quảng Nam",
  "Sa Pa — Lào Cai",
  "Đà Lạt — Lâm Đồng",
  "Phú Quốc — Kiên Giang",
  "Mũi Né — Bình Thuận",
  "Đà Nẵng",
  "Huế — Thừa Thiên Huế",
  "Ninh Bình",
  "Nha Trang — Khánh Hòa",
  "Côn Đảo — Bà Rịa Vũng Tàu",
  "Hà Giang",
  "Quy Nhơn — Bình Định",
  "Cần Thơ",
  "Phong Nha — Quảng Bình",
];

export default function PlanMyTripSection() {
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);

  return (
    <section id="plan" className="relative px-6 py-32 overflow-hidden">
      {/* Aurora background */}
      <div className="aurora-bg absolute inset-0" />
      <div className="absolute inset-0 bg-[#06060A]/90" />

      {/* Floating gradient orbs */}
      <div
        className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 mix-blend-screen animate-float pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.4), transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute right-1/4 bottom-0 h-[600px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full opacity-20 mix-blend-screen animate-float pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.35), transparent 70%)",
          filter: "blur(90px)",
          animationDelay: "2.5s",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1000px] text-center">
        <span className="text-[13px] font-semibold uppercase tracking-[4px] bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm">
          Bắt Đầu Lên Kế Hoạch
        </span>
        <h2 className="mt-5 text-[clamp(2.5rem,5vw,4rem)] font-bold text-white leading-tight drop-shadow-md">
          Chuyến Đi Mơ Ước, <br className="hidden md:block" />Thiết Kế Riêng Cho Bạn
        </h2>
        <p className="mx-auto mt-6 max-w-[500px] text-[17px] text-white/50 leading-relaxed">
          Hãy cho chúng tôi biết bạn muốn đi đâu, và chúng tôi sẽ tạo ra một lịch trình hoàn hảo đến từng chi tiết.
        </p>

        {/* Floating Command Bar */}
        <div className="mx-auto mt-16 flex w-full flex-col md:flex-row items-center justify-between gap-4 rounded-[2.5rem] bg-[#0A0A0A]/70 p-3 backdrop-blur-3xl border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-500 hover:border-white/20 hover:bg-[#0A0A0A]/80">
          
          {/* Destination */}
          <div className="flex w-full flex-1 flex-col px-4 py-2 text-left transition-colors duration-300 hover:bg-white/[0.03] rounded-2xl">
            <label htmlFor="plan-destination" className="ml-1 text-[11px] font-bold uppercase tracking-widest text-white/40">
              Điểm Đến
            </label>
            <div className="relative mt-1">
              <MapPin size={16} className="absolute left-1 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
              <select
                id="plan-destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="h-9 w-full appearance-none bg-transparent pl-8 pr-8 text-[15px] font-semibold text-white/90 outline-none cursor-pointer"
              >
                <option value="" className="bg-[#111827]">Tìm kiếm điểm đến...</option>
                {provinces.map((p) => (
                  <option key={p} value={p} className="bg-[#111827]">{p}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>
          </div>

          <div className="hidden md:block h-12 w-[1px] bg-white/10" />

          {/* Date */}
          <div className="flex w-full flex-1 flex-col px-4 py-2 text-left transition-colors duration-300 hover:bg-white/[0.03] rounded-2xl">
            <label htmlFor="plan-date" className="ml-1 text-[11px] font-bold uppercase tracking-widest text-white/40">
              Khởi Hành
            </label>
            <div className="relative mt-1">
              <Calendar size={16} className="absolute left-1 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none" />
              <input
                id="plan-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 w-full bg-transparent pl-8 pr-4 text-[15px] font-semibold text-white/90 outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="hidden md:block h-12 w-[1px] bg-white/10" />

          {/* Guests */}
          <div className="flex w-full flex-1 flex-col px-4 py-2 text-left transition-colors duration-300 hover:bg-white/[0.03] rounded-2xl">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-widest text-white/40">
              Số Người
            </label>
            <div className="relative mt-1 flex items-center justify-between">
              <div className="flex items-center gap-2 pl-1">
                <Users size={16} className="text-pink-400" />
                <span className="text-[15px] font-semibold text-white/90">{guests} khách</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors border border-white/5"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.min(20, g + 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors border border-white/5"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <a
            href="#"
            id="cta-plan-btn"
            className="group mt-4 md:mt-0 flex h-[68px] w-full md:w-[180px] shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-[15px] font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] hover:scale-[1.02] no-underline"
          >
            Tìm Tour
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
