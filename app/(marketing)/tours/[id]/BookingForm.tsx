"use client";

import { useState, useRef } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

interface BookingFormProps {
  tourId: string;
  maxCapacity: number;
  price: number;
}

function formatVND(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

export default function BookingForm({ tourId, maxCapacity, price }: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState("1");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const guestCount = parseInt(guests, 10) || 1;
  const estimatedTotal = price * guestCount;

  const guestOptions = Array.from(
    { length: Math.min(maxCapacity, 10) },
    (_, i) => i + 1
  );

  // Build URL query params for the checkout page
  function buildCheckoutUrl(): string {
    const params = new URLSearchParams();
    if (selectedDate) {
      params.set("date", format(selectedDate, "yyyy-MM-dd"));
    }
    params.set("guests", guests);
    return `/checkout/${tourId}?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      {/* ── Date picker ───────────────────────────────────────────────── */}
      <div>
        <label className="mb-2 block text-sm font-medium text-white/70">
          Ngày khởi hành dự kiến
        </label>

        <div className="relative">
          <button
            type="button"
            id="booking-date-trigger"
            onClick={() => setCalendarOpen((prev) => !prev)}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-left text-white outline-none transition-all hover:border-white/20 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
          >
            <CalendarIcon size={16} className="shrink-0 text-cyan-400" />
            <span className={selectedDate ? "text-white" : "text-white/30"}>
              {selectedDate
                ? format(selectedDate, "dd/MM/yyyy", { locale: vi })
                : "Chọn ngày khởi hành"}
            </span>
          </button>

          {/* Floating calendar popover */}
          {calendarOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setCalendarOpen(false)}
              />
              <div
                ref={calendarRef}
                className="absolute left-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl"
              >
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="[--cell-size:--spacing(9)] p-4"
                  classNames={{
                    day: "group/day relative aspect-square h-full w-full rounded-lg p-0 text-center select-none text-white/70 hover:text-white",
                    today: "rounded-lg bg-white/10 text-white font-semibold data-[selected=true]:rounded-none",
                    outside: "text-white/20 aria-selected:text-white/20",
                    disabled: "text-white/20 opacity-40 cursor-not-allowed",
                    nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
                    caption_label: "font-medium text-white text-sm select-none",
                    weekday: "flex-1 rounded-lg text-[0.75rem] font-normal text-white/30 select-none",
                    week: "mt-2 flex w-full",
                    months: "flex flex-col gap-4",
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Guest count Select ────────────────────────────────────────── */}
      <div>
        <label className="mb-2 block text-sm font-medium text-white/70">
          Số lượng khách
        </label>

        <Select
          value={guests}
          onValueChange={(val) => {
            if (val) setGuests(val);
          }}
        >
          <SelectTrigger
            id="booking-guests-trigger"
            className="h-12 w-full rounded-xl border border-white/10 bg-black/50 px-4 text-white outline-none transition-all hover:border-white/20 focus-visible:border-cyan-500/50 focus-visible:ring-1 focus-visible:ring-cyan-500/50 [&_svg]:text-white/50"
          >
            <SelectValue placeholder="Chọn số khách" />
          </SelectTrigger>
          <SelectContent
            className="z-50 rounded-2xl border border-white/10 bg-[#111] text-white shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            sideOffset={6}
          >
            {guestOptions.map((count) => (
              <SelectItem
                key={count}
                value={String(count)}
                className="cursor-pointer rounded-xl px-4 py-2.5 text-sm text-white/80 transition-colors focus:bg-white/10 focus:text-white"
              >
                {count} người
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Estimated price preview ───────────────────────────────────── */}
      {selectedDate && (
        <div className="flex items-center justify-between rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-4 py-3">
          <span className="text-sm text-white/60">Tổng ước tính ({guestCount} khách)</span>
          <span className="font-heading text-lg font-bold text-cyan-400">
            {formatVND(estimatedTotal)}
          </span>
        </div>
      )}

      {/* ── Submit ────────────────────────────────────────────────────── */}
      <div className="pt-2">
        <a
          href={buildCheckoutUrl()}
          id="booking-submit-btn"
          className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-4 font-bold text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="relative z-10">Đặt tour ngay</span>
        </a>
      </div>

      <p className="text-center text-xs text-white/40">
        Không thu phí khi hủy trước 7 ngày.
      </p>
    </div>
  );
}
