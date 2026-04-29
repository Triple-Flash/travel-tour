/**
 * lib/chat-context.ts
 * Builds a rich Vietnamese-language system prompt by injecting
 * real-time data from the database: tours, destinations, stats.
 * Called once per chat request — results are used only for AI context.
 */
import { db } from "@/lib/db";

export interface ChatContext {
  tourCount: number;
  destinationCount: number;
  toursText: string;       // formatted tour list for prompt
  destinationsText: string; // formatted destination list
  statsText: string;        // summary stats
}

/** Fetch all necessary context from DB to inject into the AI system prompt. */
export async function buildChatContext(): Promise<ChatContext> {
  const [tours, destinations] = await Promise.all([
    db.tours.findMany({
      select: {
        title: true,
        description: true,
        price: true,
        duration: true,
        max_capacity: true,
        destinations: { select: { name: true, country: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { created_at: "desc" },
    }),
    db.destinations.findMany({
      select: {
        name: true,
        country: true,
        description: true,
        tours: { select: { id: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  // Format tour list
  const toursText = tours
    .map((t, i) => {
      const avgRating =
        t.reviews.length > 0
          ? (t.reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / t.reviews.length).toFixed(1)
          : "Chưa có đánh giá";
      const dest = t.destinations ? `${t.destinations.name}, ${t.destinations.country}` : "Chưa xác định";
      const priceVND = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(t.price));
      return `${i + 1}. **${t.title}**
   - Điểm đến: ${dest}
   - Giá: ${priceVND}/người
   - Thời gian: ${t.duration} ngày
   - Sức chứa tối đa: ${t.max_capacity} người
   - Đánh giá trung bình: ${avgRating}${t.reviews.length > 0 ? ` ⭐ (${t.reviews.length} lượt)` : ""}
   - Mô tả: ${t.description?.slice(0, 120) ?? "Không có mô tả"}...`;
    })
    .join("\n\n");

  // Format destination list
  const destinationsText = destinations
    .map((d) => `- **${d.name}** (${d.country}): ${d.tours.length} tour${d.description ? ` — ${d.description.slice(0, 80)}` : ""}`)
    .join("\n");

  // Stats
  const priceList = tours.map((t) => Number(t.price));
  const minPrice = priceList.length > 0 ? Math.min(...priceList) : 0;
  const maxPrice = priceList.length > 0 ? Math.max(...priceList) : 0;
  const formatVND = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

  const statsText = `- Tổng số tour: ${tours.length}
- Tổng số điểm đến: ${destinations.length}
- Giá tour thấp nhất: ${formatVND(minPrice)}
- Giá tour cao nhất: ${formatVND(maxPrice)}`;

  return {
    tourCount: tours.length,
    destinationCount: destinations.length,
    toursText,
    destinationsText,
    statsText,
  };
}
