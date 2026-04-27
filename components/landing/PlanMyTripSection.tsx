"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Calendar as CalendarIcon, MapPin, Users } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

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

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function PlanMyTripSection() {
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState(2);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!calendarRef.current?.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsCalendarOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const dateValue = date ? formatDateValue(date) : "";
  const dateLabel = date
    ? date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Chọn ngày khởi hành";

  return (
    <section id="plan" className="relative z-10 overflow-visible px-6 pt-32 pb-48">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora-bg absolute inset-0" />
        <div className="absolute inset-0 bg-[#06060A]/90" />

        <div
          className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-float rounded-full opacity-30 mix-blend-screen"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.4), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute right-1/4 bottom-0 h-[600px] w-[600px] translate-x-1/4 translate-y-1/4 animate-float rounded-full opacity-20 mix-blend-screen"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.35), transparent 70%)",
            filter: "blur(90px)",
            animationDelay: "2.5s",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1000px] text-center">
        <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-[13px] font-semibold uppercase tracking-[4px] text-transparent drop-shadow-sm">
          Bắt Đầu Lên Kế Hoạch
        </span>
        <h2 className="mt-5 text-[clamp(2.5rem,5vw,4rem)] font-bold leading-tight text-white drop-shadow-md">
          Chuyến Đi Mơ Ước, <br className="hidden md:block" />
          Thiết Kế Riêng Cho Bạn
        </h2>
        <p className="mx-auto mt-6 max-w-[500px] text-[17px] leading-relaxed text-white/50">
          Hãy cho chúng tôi biết bạn muốn đi đâu, và chúng tôi sẽ tạo ra một lịch trình hoàn hảo đến từng chi tiết.
        </p>

        <div className="relative z-20 mx-auto mt-16 flex w-full flex-col items-center justify-between gap-4 rounded-[2.5rem] border border-white/10 bg-[#0A0A0A]/70 p-3 shadow-[0_30px_100px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-3xl transition-all duration-500 hover:border-white/20 hover:bg-[#0A0A0A]/80 md:flex-row">
          <div className="flex w-full flex-1 flex-col rounded-2xl px-4 py-2 text-left transition-colors duration-300 hover:bg-white/[0.03]">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-widest text-white/40">
              Điểm Đến
            </label>
            <div className="relative mt-1">
              <MapPin
                size={16}
                className="pointer-events-none absolute left-1 top-1/2 z-10 -translate-y-1/2 text-cyan-400"
              />
              <Select
                value={destination || null}
                onValueChange={(value) => setDestination(value ?? "")}
              >
                <SelectTrigger className="h-9 w-full border-0 bg-transparent pl-8 pr-1 text-[15px] font-semibold text-white/90 shadow-none ring-0 focus-visible:border-0 focus-visible:ring-0 data-placeholder:text-white/45">
                  <SelectValue placeholder="Tìm kiếm điểm đến..." />
                </SelectTrigger>
                <SelectContent
                  sideOffset={12}
                  align="start"
                  className="max-h-72 rounded-2xl border border-white/10 bg-[#0B1120]/95 p-2 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-0 backdrop-blur-2xl"
                >
                  {provinces.map((province) => (
                    <SelectItem
                      key={province}
                      value={province}
                      className="rounded-xl px-3 py-2.5 text-sm text-white/70 focus:bg-white/5 focus:text-white"
                    >
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="hidden h-12 w-[1px] bg-white/10 md:block" />

          <div className="flex w-full flex-1 flex-col rounded-2xl px-4 py-2 text-left transition-colors duration-300 hover:bg-white/[0.03]">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-widest text-white/40">
              Khởi Hành
            </label>
            <div ref={calendarRef} className="relative mt-1">
              <CalendarIcon
                size={16}
                className="pointer-events-none absolute left-1 top-1/2 z-10 -translate-y-1/2 text-violet-400"
              />
              <button
                type="button"
                onClick={() => setIsCalendarOpen((open) => !open)}
                className="flex h-9 w-full items-center bg-transparent pl-8 pr-4 text-left text-[15px] font-semibold text-white/90 outline-none"
              >
                <span className={date ? "text-white/90" : "text-white/45"}>{dateLabel}</span>
              </button>
              {isCalendarOpen ? (
                <div className="absolute left-0 top-[calc(100%+12px)] z-50">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate);
                      setIsCalendarOpen(false);
                    }}
                    className="rounded-2xl border border-white/10 bg-[#0B1120]/95 p-3 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-0 backdrop-blur-2xl"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="hidden h-12 w-[1px] bg-white/10 md:block" />

          <div className="flex w-full flex-1 flex-col rounded-2xl px-4 py-2 text-left transition-colors duration-300 hover:bg-white/[0.03]">
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
                  onClick={() => setGuests((current) => Math.max(1, current - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/5 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setGuests((current) => Math.min(20, current + 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/5 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <Link
            href={`/search?destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(dateValue)}&guests=${guests}`}
            id="cta-plan-btn"
            className="group mt-4 flex h-[68px] w-full shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-[15px] font-bold text-white no-underline shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] md:mt-0 md:w-[180px]"
          >
            Tìm Tour
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
