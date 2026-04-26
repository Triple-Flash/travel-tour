/**
 * data/queries/reviews.ts
 * Pure read functions for the `reviews` domain.
 * Public — no auth required for reading.
 */
import { db } from "@/lib/db";

export interface ReviewSummary {
  id: string;
  name: string;
  loc: string;
  avatar: string;
  rating: number;
  text: string;
  tour: string;
}

/**
 * Returns recent reviews with user and tour details.
 */
export async function getRecentReviews(limit = 3): Promise<ReviewSummary[]> {
  const reviews = await db.reviews.findMany({
    take: limit,
    orderBy: { created_at: "desc" },
    include: {
      users: { select: { full_name: true } },
      tours: { select: { title: true } },
    },
    // Only get reviews that have comments and rating
    where: {
      comment: { not: null },
      rating: { not: null },
    },
  });

  return reviews.map((r) => {
    const fullName = r.users?.full_name || "Khách ẩn danh";
    const initials = fullName
      .split(" ")
      .map((n) => n[0])
      .slice(-2)
      .join("")
      .toUpperCase();

    return {
      id: r.id,
      name: fullName,
      loc: "Việt Nam", // Mock location since DB doesn't have it
      avatar: initials || "U",
      rating: r.rating || 5,
      text: r.comment || "",
      tour: r.tours?.title || "Tour du lịch",
    };
  });
}
