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
  };
}
