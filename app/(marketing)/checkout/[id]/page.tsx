import { getTourById } from "@/data/queries/tours";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { TourDetail } from "@/data/queries/tours";
import CheckoutForm from "./CheckoutForm";

import { notFound } from "next/navigation";

export default async function CheckoutPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ date?: string, guests?: string }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  let tour;
  try {
    tour = await getTourById(resolvedParams.id);
  } catch {
    notFound();
  }
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
