/**
 * data/queries/bookings.ts
 * Pure read functions for the `bookings` domain.
 * Always user-scoped — requireAuth() is called at the top.
 */
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { NotFoundError, ForbiddenError } from "@/data/errors";

// ─── Plain TS types ───────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  user_id: string | null;
  tour_id: string | null;
  booking_date: Date | null;
  number_of_people: number;
  total_price: number;
  status: string | null;
  tour: {
    id: string;
    title: string;
    price: number;
    duration: number;
    images: { image_url: string }[];
    destination: { name: string; country: string } | null;
  } | null;
  payment: {
    id: string;
    payment_method: string;
    amount: number;
    payment_status: string | null;
    payment_date: Date | null;
  } | null;
  user_review: {
    id: string;
    rating: number | null;
    comment: string | null;
  } | null;
  /** Whether the current user is eligible to rate this tour. */
  can_rate: boolean;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Returns all bookings for the current authenticated user. */
export async function getMyBookings(): Promise<Booking[]> {
  const user = await requireAuth();

  const bookings = await db.bookings.findMany({
    where: { user_id: user.id },
    orderBy: { booking_date: "desc" },
    select: {
      id: true,
      user_id: true,
      tour_id: true,
      booking_date: true,
      number_of_people: true,
      total_price: true,
      status: true,
      tours: {
        select: {
          id: true,
          title: true,
          price: true,
          duration: true,
          tour_images: { select: { image_url: true }, take: 1 },
          destinations: { select: { name: true, country: true } },
          reviews: {
            where: { user_id: user.id },
            take: 1,
            select: {
              id: true,
              rating: true,
              comment: true,
            },
          },
        },
      },
      payments: {
        select: {
          id: true,
          payment_method: true,
          amount: true,
          payment_status: true,
          payment_date: true,
        },
      },
    },
  });

  return bookings.map(mapBooking);
}

/** Returns a single booking by ID, ensuring it belongs to the current user. */
export async function getBookingById(id: string): Promise<Booking> {
  const user = await requireAuth();

  const booking = await db.bookings.findUnique({
    where: { id },
    select: {
      id: true,
      user_id: true,
      tour_id: true,
      booking_date: true,
      number_of_people: true,
      total_price: true,
      status: true,
      tours: {
        select: {
          id: true,
          title: true,
          price: true,
          duration: true,
          tour_images: { select: { image_url: true }, take: 1 },
          destinations: { select: { name: true, country: true } },
          reviews: {
            where: { user_id: user.id },
            take: 1,
            select: {
              id: true,
              rating: true,
              comment: true,
            },
          },
        },
      },
      payments: {
        select: {
          id: true,
          payment_method: true,
          amount: true,
          payment_status: true,
          payment_date: true,
        },
      },
    },
  });

  if (!booking) throw new NotFoundError("Booking", id);
  if (booking.user_id !== user.id && user.role !== "admin") {
    throw new ForbiddenError();
  }

  return mapBooking(booking);
}

/** Returns the newest successfully paid booking for the current user. */
export async function getLatestPaidBooking(): Promise<Booking | null> {
  const user = await requireAuth();

  const payment = await db.payments.findFirst({
    where: {
      payment_status: "completed",
      bookings: {
        user_id: user.id,
      },
    },
    orderBy: { payment_date: "desc" },
    select: {
      bookings: {
        select: {
          id: true,
          user_id: true,
          tour_id: true,
          booking_date: true,
          number_of_people: true,
          total_price: true,
          status: true,
          tours: {
            select: {
              id: true,
              title: true,
              price: true,
              duration: true,
              tour_images: { select: { image_url: true }, take: 1 },
              destinations: { select: { name: true, country: true } },
              reviews: {
                where: { user_id: user.id },
                take: 1,
                select: {
                  id: true,
                  rating: true,
                  comment: true,
                },
              },
            },
          },
          payments: {
            select: {
              id: true,
              payment_method: true,
              amount: true,
              payment_status: true,
              payment_date: true,
            },
          },
        },
      },
    },
  });

  if (!payment?.bookings) return null;

  return mapBooking(payment.bookings);
}

// ─── Success-page summary ─────────────────────────────────────────────────────

export interface BookingSummaryByOrder {
  tourTitle: string;
  destinationName: string | null;
  bookingDate: Date | null;
  numberOfPeople: number;
  totalPrice: number;
  paymentMethod: string;
}

/**
 * Returns lightweight booking info for the checkout success page.
 * Looks up by PayOS order code stored on the payment record.
 * Public — no auth required (the orderCode itself acts as the access key).
 */
export async function getBookingSummaryByOrderCode(
  orderCode: number
): Promise<BookingSummaryByOrder | null> {
  const payment = await db.payments.findUnique({
    where: { payos_order_code: orderCode },
    select: {
      payment_method: true,
      bookings: {
        select: {
          booking_date: true,
          number_of_people: true,
          total_price: true,
          tours: {
            select: {
              title: true,
              destinations: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!payment?.bookings) return null;

  return {
    tourTitle: payment.bookings.tours?.title ?? "Tour",
    destinationName: payment.bookings.tours?.destinations?.name ?? null,
    bookingDate: payment.bookings.booking_date,
    numberOfPeople: payment.bookings.number_of_people,
    totalPrice: Number(payment.bookings.total_price),
    paymentMethod: payment.payment_method,
  };
}

// ─── Private mapper ───────────────────────────────────────────────────────────

// Decimal lives inside the Prisma namespace in the generated output.
import type { Prisma } from "@/lib/generated/prisma";
type Decimal = Prisma.Decimal;

type RawBooking = {
  id: string;
  user_id: string | null;
  tour_id: string | null;
  booking_date: Date | null;
  number_of_people: number;
  total_price: Decimal;
  status: string | null;
  tours: {
    id: string;
    title: string;
    price: Decimal;
    duration: number;
    tour_images: { image_url: string }[];
    destinations: { name: string; country: string } | null;
    reviews: {
      id: string;
      rating: number | null;
      comment: string | null;
    }[];
  } | null;
  payments: {
    id: string;
    payment_method: string;
    amount: Decimal;
    payment_status: string | null;
    payment_date: Date | null;
  } | null;
};

function mapBooking(b: RawBooking): Booking {
  // Compute whether the user can rate this tour:
  // - Must be confirmed with completed payment
  // - Must not already have a review
  // - Tour must have ended (booking_date + duration <= today)
  const confirmed = b.status === "confirmed";
  const paid = b.payments?.payment_status === "completed";
  const notReviewed = !b.tours?.reviews?.[0];
  let tourEnded = false;
  if (b.booking_date && b.tours?.duration) {
    const completionDate = new Date(b.booking_date);
    completionDate.setDate(completionDate.getDate() + b.tours.duration);
    tourEnded = new Date() >= completionDate;
  }

  return {
    id: b.id,
    user_id: b.user_id,
    tour_id: b.tour_id,
    booking_date: b.booking_date,
    number_of_people: b.number_of_people,
    total_price: Number(b.total_price),
    status: b.status,
    tour: b.tours
      ? {
          id: b.tours.id,
          title: b.tours.title,
          price: Number(b.tours.price),
          duration: b.tours.duration,
          images: b.tours.tour_images,
          destination: b.tours.destinations ?? null,
        }
      : null,
    payment: b.payments
      ? {
          id: b.payments.id,
          payment_method: b.payments.payment_method,
          amount: Number(b.payments.amount),
          payment_status: b.payments.payment_status,
          payment_date: b.payments.payment_date,
        }
      : null,
    user_review: b.tours?.reviews[0]
      ? {
          id: b.tours.reviews[0].id,
          rating: b.tours.reviews[0].rating,
          comment: b.tours.reviews[0].comment,
        }
      : null,
    can_rate: confirmed && paid && notReviewed && tourEnded,
  };
}

// ─── Admin Revenue Types ───────────────────────────────────────────────────────

export interface RevenueStats {
  totalRevenue: number;
  totalBookings: number;
  avgBookingValue: number;
  pendingRevenue: number;
  confirmedCount: number;
  pendingCount: number;
  cancelledCount: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
}

export interface TourRevenue {
  tourId: string;
  tourTitle: string;
  revenue: number;
  bookingCount: number;
}

export interface RecentTransaction {
  bookingId: string;
  tourTitle: string;
  customerName: string;
  amount: number;
  status: string;
  date: Date | null;
}

// ─── Admin Revenue Queries ─────────────────────────────────────────────────────

async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin") throw new ForbiddenError();
  return user;
}

/** Admin-only: platform-wide revenue statistics. */
export async function getRevenueStats(): Promise<RevenueStats> {
  await requireAdmin();

  const [completedAgg, pendingAgg, statusCounts, totalBookings] =
    await Promise.all([
      db.payments.aggregate({
        _sum: { amount: true },
        where: { payment_status: "completed" },
      }),
      db.payments.aggregate({
        _sum: { amount: true },
        where: { payment_status: "pending" },
      }),
      db.bookings.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      db.bookings.count(),
    ]);

  const totalRevenue = Number(completedAgg._sum.amount ?? 0);
  const pendingRevenue = Number(pendingAgg._sum.amount ?? 0);

  const completedPaymentsCount = await db.payments.count({
    where: { payment_status: "completed" },
  });

  const confirmedCount =
    statusCounts.find((s) => s.status === "confirmed")?._count._all ?? 0;
  const pendingCount =
    statusCounts.find((s) => s.status === "pending")?._count._all ?? 0;
  const cancelledCount =
    statusCounts.find((s) => s.status === "cancelled")?._count._all ?? 0;

  return {
    totalRevenue,
    totalBookings,
    avgBookingValue:
      completedPaymentsCount > 0 ? totalRevenue / completedPaymentsCount : 0,
    pendingRevenue,
    confirmedCount,
    pendingCount,
    cancelledCount,
  };
}

/** Admin-only: monthly revenue for last N months. */
export async function getMonthlyRevenue(months = 6): Promise<MonthlyRevenue[]> {
  await requireAdmin();

  const since = new Date();
  since.setMonth(since.getMonth() - months + 1);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const payments = await db.payments.findMany({
    where: {
      payment_status: "completed",
      payment_date: { gte: since },
    },
    select: { amount: true, payment_date: true },
  });

  // Build a map month-key → { revenue, bookings }
  const map = new Map<string, { revenue: number; bookings: number }>();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, { revenue: 0, bookings: 0 });
  }

  for (const p of payments) {
    if (!p.payment_date) continue;
    const key = `${p.payment_date.getFullYear()}-${String(p.payment_date.getMonth() + 1).padStart(2, "0")}`;
    const entry = map.get(key);
    if (entry) {
      entry.revenue += Number(p.amount);
      entry.bookings += 1;
    }
  }

  const shortMonths = ["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"];

  return Array.from(map.entries()).map(([key, val]) => ({
    month: shortMonths[parseInt(key.split("-")[1], 10) - 1],
    revenue: val.revenue,
    bookings: val.bookings,
  }));
}

/** Admin-only: top N tours by revenue. */
export async function getTopToursByRevenue(limit = 5): Promise<TourRevenue[]> {
  await requireAdmin();

  const bookings = await db.bookings.findMany({
    where: { payments: { payment_status: "completed" } },
    select: {
      tour_id: true,
      total_price: true,
      tours: { select: { title: true } },
    },
  });

  const tourMap = new Map<string, { title: string; revenue: number; count: number }>();
  for (const b of bookings) {
    if (!b.tour_id || !b.tours) continue;
    const existing = tourMap.get(b.tour_id);
    if (existing) {
      existing.revenue += Number(b.total_price);
      existing.count += 1;
    } else {
      tourMap.set(b.tour_id, {
        title: b.tours.title,
        revenue: Number(b.total_price),
        count: 1,
      });
    }
  }

  return Array.from(tourMap.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, limit)
    .map(([tourId, val]) => ({
      tourId,
      tourTitle: val.title,
      revenue: val.revenue,
      bookingCount: val.count,
    }));
}

/** Admin-only: most recent N transactions. */
export async function getRecentTransactions(limit = 10): Promise<RecentTransaction[]> {
  await requireAdmin();

  const payments = await db.payments.findMany({
    orderBy: { payment_date: "desc" },
    take: limit,
    select: {
      amount: true,
      payment_status: true,
      payment_date: true,
      bookings: {
        select: {
          id: true,
          tours: { select: { title: true } },
          users: { select: { full_name: true, email: true } },
        },
      },
    },
  });

  return payments.map((p) => ({
    bookingId: p.bookings?.id ?? "—",
    tourTitle: p.bookings?.tours?.title ?? "—",
    customerName: p.bookings?.users?.full_name ?? p.bookings?.users?.email ?? "—",
    amount: Number(p.amount),
    status: p.payment_status ?? "unknown",
    date: p.payment_date,
  }));
}
