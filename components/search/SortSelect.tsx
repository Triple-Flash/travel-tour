"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sortBy") || "newest";

  function handleSort(sortBy: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (sortBy === "newest") {
      params.delete("sortBy");
    } else {
      params.set("sortBy", sortBy);
    }
    router.push(`/search?${params.toString()}`);
  }

  return (
    <select
      value={currentSort}
      onChange={(e) => handleSort(e.target.value)}
      className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white outline-none focus:border-cyan-500"
    >
      <option value="newest">Sắp xếp: Mới nhất</option>
      <option value="price_asc">Giá: Thấp đến Cao</option>
      <option value="price_desc">Giá: Cao đến Thấp</option>
      <option value="rating">Đánh giá cao nhất</option>
    </select>
  );
}
