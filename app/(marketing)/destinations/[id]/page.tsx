import Image from "next/image";
import { notFound } from "next/navigation";
import { getDestinationById } from "@/data/queries/destinations";
import { getTours } from "@/data/queries/tours";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { MapPin, ArrowLeft, Sun, Compass, Users } from "lucide-react";
import Link from "next/link";
import ToursSection from "@/components/landing/ToursSection";

export default async function DestinationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let destination;
  try {
    destination = await getDestinationById(id);
  } catch {
    notFound();
  }

  const session = await getSession();

  // Fetch tours for this destination
  let destinationTours;
  try {
    destinationTours = await getTours(destination.id);
  } catch {
    destinationTours = undefined;
  }

  const image = destination.image_url || "/images/halong.png";
  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white selection:bg-cyan-500/30">
      <Navbar user={session} />

      <main>
        {/* Massive Hero Section */}
        <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={image}
              alt={destination.name}
              fill
              className="object-cover animate-image-zoom origin-center"
              priority
              sizes="100vw"
            />
          </div>

          {/* Ethereal Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/60 via-transparent to-transparent" />
          
          <div className="relative z-10 mx-auto flex h-full max-w-[1200px] flex-col justify-end px-6 pb-20">
            {/* Back button */}
            <Link 
              href="/#destinations" 
              className="group mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              Trở về
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[2px] text-cyan-400 backdrop-blur-sm">
                <MapPin size={12} />
                {destination.country}
              </span>
            </div>
            
            <h1 className="font-heading text-[clamp(3rem,8vw,6rem)] font-bold leading-[1.1] tracking-tight text-white drop-shadow-2xl">
              {destination.name}
            </h1>
            
            <p className="mt-6 max-w-[600px] text-lg leading-relaxed text-white/70">
              {destination.description || "Khám phá vẻ đẹp tuyệt vời, văn hóa phong phú và những trải nghiệm khó quên tại điểm đến hấp dẫn này."}
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="relative px-6 py-20">
          {/* Ambient Glow */}
          <div className="absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-[1200px]">
            {/* Bento Info Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-white/5 to-transparent p-[1px] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(6,182,212,0.15)]">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-400 to-blue-500 opacity-0 transition-opacity duration-500 group-hover:opacity-10" />
                <div className="flex h-full flex-col justify-center rounded-[2rem] bg-[#0A0A0A]/90 p-8 backdrop-blur-3xl">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10">
                    <Compass size={24} className="text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{destination.tour_count} Tour</h3>
                  <p className="text-sm text-white/50">Đa dạng lịch trình và trải nghiệm được thiết kế dành riêng cho bạn tại {destination.name}.</p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-white/5 to-transparent p-[1px] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(245,158,11,0.15)]">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-amber-400 to-orange-500 opacity-0 transition-opacity duration-500 group-hover:opacity-10" />
                <div className="flex h-full flex-col justify-center rounded-[2rem] bg-[#0A0A0A]/90 p-8 backdrop-blur-3xl">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10">
                    <Sun size={24} className="text-amber-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Mùa Đẹp Nhất</h3>
                  <p className="text-sm text-white/50">Thời tiết lý tưởng nhất để trải nghiệm trọn vẹn cảnh sắc nơi đây là từ tháng 9 đến tháng 4.</p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-white/5 to-transparent p-[1px] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(236,72,153,0.15)]">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-pink-400 to-rose-500 opacity-0 transition-opacity duration-500 group-hover:opacity-10" />
                <div className="flex h-full flex-col justify-center rounded-[2rem] bg-[#0A0A0A]/90 p-8 backdrop-blur-3xl">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10">
                    <Users size={24} className="text-pink-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Thân Thiện</h3>
                  <p className="text-sm text-white/50">Phù hợp cho cả gia đình, cặp đôi hoặc những người đam mê xê dịch một mình.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tours for this destination */}
        <ToursSection tours={destinationTours} />
      </main>
      
      <Footer />
    </div>
  );
}
