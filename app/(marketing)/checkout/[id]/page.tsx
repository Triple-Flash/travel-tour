import { getTourById } from "@/data/queries/tours";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { TourDetail } from "@/data/queries/tours";
import CheckoutForm from "./CheckoutForm";

const fallbackTours: TourDetail[] = [
  {
    id: "halong-cruise",
    title: "Du Thuyền Vịnh Hạ Long 3N2Đ",
    description: "Khám phá kỳ quan thiên nhiên thế giới trên du thuyền 5 sao đẳng cấp.",
    price: 4500000,
    duration: 3,
    max_capacity: 12,
    created_at: new Date(),
    destination: { id: "halong", name: "Vịnh Hạ Long", country: "Quảng Ninh", image_url: "/images/halong.png" },
    images: [{ id: "1", image_url: "/images/halong.png" }],
    avg_rating: 4.9,
    review_count: 324,
    reviews: [],
  },
  {
    id: "sapa-trek",
    title: "Trekking Sa Pa & Bản Làng",
    description: "Chinh phục đỉnh Fansipan - Nóc nhà Đông Dương, và trải nghiệm cuộc sống chân thực.",
    price: 3200000,
    duration: 4,
    max_capacity: 10,
    created_at: new Date(),
    destination: { id: "sapa", name: "Sa Pa", country: "Lào Cai", image_url: "/images/sapa.png" },
    images: [{ id: "1", image_url: "/images/sapa.png" }],
    avg_rating: 4.8,
    review_count: 218,
    reviews: [],
  },
];

async function getTourData(id: string): Promise<TourDetail> {
  try {
    return await getTourById(id);
  } catch (err) {
    const fallback = fallbackTours.find((t) => t.id === id);
    if (fallback) return fallback;

    return {
      ...fallbackTours[0],
      id,
      title: "Hành Trình Khám Phá Kỳ Thú",
      description: "Đang xem trước giao diện thanh toán.",
      images: [],
    };
  }
}

export default async function CheckoutPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ date?: string, guests?: string }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const tour = await getTourData(resolvedParams.id);
  const session = await getSession();

  const image = tour.destination?.image_url || tour.images[0]?.image_url || "/images/halong.png";
  const guests = parseInt(resolvedSearchParams.guests || "1", 10);
  const rawDate = resolvedSearchParams.date || "";
  const dateStr = rawDate ? new Date(rawDate).toLocaleDateString("vi-VN") : "Chưa chọn ngày";
  
  const subtotal = tour.price * guests;
  const tax = subtotal * 0.1; // 10% VAT
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-cyan-500/30">
      <Navbar user={session} />

      <main className="relative pt-32 pb-24">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[150px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-[1200px] px-6">
          <Link 
            href={`/tours/${resolvedParams.id}`} 
            className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Quay lại trang chi tiết
          </Link>

          <h1 className="mb-10 font-heading text-4xl font-bold text-white drop-shadow-md">
            Thanh Toán Đơn Hàng
          </h1>

          <CheckoutForm
            tour={{
              id: tour.id,
              title: tour.title,
              price: tour.price,
              duration: tour.duration,
              destination_name: tour.destination?.name ?? null,
              image_url: image,
            }}
            guests={guests}
            dateStr={dateStr}
            rawDate={rawDate}
            subtotal={subtotal}
            tax={tax}
            total={total}
            userFullName={session?.full_name || ""}
            userEmail={session?.email || ""}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
