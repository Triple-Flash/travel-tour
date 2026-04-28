"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal, Star } from "lucide-react";

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Current active filters from URL
  const activeMinPrice = searchParams.get("minPrice");
  const activeMaxPrice = searchParams.get("maxPrice");
  const activeMinDuration = searchParams.get("minDuration");
  const activeMaxDuration = searchParams.get("maxDuration");
  const activeMinRating = searchParams.get("minRating");

  function handlePriceFilter(minPrice: string | null, maxPrice: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    // Toggle: if same filter is already active, remove it
    if (
      params.get("minPrice") === (minPrice ?? "") &&
      params.get("maxPrice") === (maxPrice ?? "")
    ) {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else {
      if (minPrice) params.set("minPrice", minPrice);
      else params.delete("minPrice");
      if (maxPrice) params.set("maxPrice", maxPrice);
      else params.delete("maxPrice");
    }
    router.push(`/search?${params.toString()}`);
  }

  function handleDurationFilter(min: string | null, max: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (
      params.get("minDuration") === (min ?? "") &&
      params.get("maxDuration") === (max ?? "")
    ) {
      params.delete("minDuration");
      params.delete("maxDuration");
    } else {
      if (min) params.set("minDuration", min);
      else params.delete("minDuration");
      if (max) params.set("maxDuration", max);
      else params.delete("maxDuration");
    }
    router.push(`/search?${params.toString()}`);
  }

  function handleRatingFilter(rating: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("minRating") === rating) {
      params.delete("minRating");
    } else {
      params.set("minRating", rating);
    }
    router.push(`/search?${params.toString()}`);
  }

  function isPriceActive(min: string | null, max: string | null): boolean {
    return (
      (activeMinPrice ?? "") === (min ?? "") &&
      (activeMaxPrice ?? "") === (max ?? "")
    );
  }

  function isDurationActive(min: string | null, max: string | null): boolean {
    return (
      (activeMinDuration ?? "") === (min ?? "") &&
      (activeMaxDuration ?? "") === (max ?? "")
    );
  }

  const priceRanges: { label: string; min: string | null; max: string | null }[] = [
    { label: "Dưới 2.000.000₫", min: null, max: "2000000" },
    { label: "2.000.000₫ - 5.000.000₫", min: "2000000", max: "5000000" },
    { label: "Trên 5.000.000₫", min: "5000000", max: null },
  ];

  const durationRanges: { label: string; min: string | null; max: string | null }[] = [
    { label: "1-2 Ngày", min: "1", max: "2" },
    { label: "3-4 Ngày", min: "3", max: "4" },
    { label: "5+ Ngày", min: "5", max: null },
  ];

  return (
    <aside className="w-full lg:w-[320px] shrink-0">
      <div className="sticky top-24 rounded-[2rem] border border-white/10 bg-zinc-900/50 p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
          <SlidersHorizontal size={20} className="text-cyan-400" />
          <h2 className="font-heading text-xl font-bold text-white">Bộ Lọc</h2>
        </div>

        <div className="space-y-8">
          {/* Price Range */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white/80">Khoảng Giá</h3>
            <div className="space-y-3">
              {priceRanges.map((range, i) => (
                <label
                  key={i}
                  className="flex cursor-pointer items-center gap-3 group"
                  onClick={() => handlePriceFilter(range.min, range.max)}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                      isPriceActive(range.min, range.max)
                        ? "border-cyan-400 bg-cyan-500/30"
                        : "border-white/20 bg-black/50 group-hover:border-cyan-400"
                    }`}
                  >
                    {isPriceActive(range.min, range.max) && (
                      <div className="h-2.5 w-2.5 rounded-sm bg-cyan-400" />
                    )}
                  </div>
                  <span className="text-sm text-white/60 transition-colors group-hover:text-white">
                    {range.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white/80">Thời Gian</h3>
            <div className="flex flex-wrap gap-2">
              {durationRanges.map((dur, i) => (
                <button
                  key={i}
                  onClick={() => handleDurationFilter(dur.min, dur.max)}
                  className={`rounded-xl border px-4 py-2 text-sm transition-all ${
                    isDurationActive(dur.min, dur.max)
                      ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-cyan-500/50 hover:text-white"
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white/80">Đánh Giá</h3>
            <div className="space-y-3">
              {[5, 4, 3].map((rating) => (
                <label
                  key={rating}
                  className="flex cursor-pointer items-center gap-3 group"
                  onClick={() => handleRatingFilter(rating.toString())}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                      activeMinRating === rating.toString()
                        ? "border-amber-400 bg-amber-500/30"
                        : "border-white/20 bg-black/50 group-hover:border-amber-400"
                    }`}
                  >
                    {activeMinRating === rating.toString() && (
                      <div className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < rating ? "text-amber-400" : "text-white/20"}
                        fill={i < rating ? "currentColor" : "none"}
                      />
                    ))}
                    <span className="ml-1 text-xs text-white/40">trở lên</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Clear All Filters */}
          {(activeMinPrice || activeMaxPrice || activeMinDuration || activeMaxDuration || activeMinRating) && (
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                // Keep destination, date, guests — remove filter params
                params.delete("minPrice");
                params.delete("maxPrice");
                params.delete("minDuration");
                params.delete("maxDuration");
                params.delete("minRating");
                router.push(`/search?${params.toString()}`);
              }}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
