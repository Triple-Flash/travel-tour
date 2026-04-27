/**
 * data/queries/reviews.ts
 * Pure read functions for the `reviews` domain.
 * Public - no auth required for reading.
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
    where: {
      comment: { not: null },
      rating: { not: null },
    },
  });

  return reviews.map((review) => {
    const fullName = review.users?.full_name || "Khách ẩn danh";
    const initials = fullName
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(-2)
      .join("")
      .toUpperCase();

    return {
      id: review.id,
      name: fullName,
      loc: "",
      avatar: initials || "U",
      rating: review.rating || 5,
      text: review.comment || "",
      tour: review.tours?.title || "Tour du lịch",
    };
  });
}
