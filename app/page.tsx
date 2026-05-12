import { Suspense } from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import DestinationsSection from "@/components/landing/DestinationsSection";
import ToursSection from "@/components/landing/ToursSection";
import WhyUsSection from "@/components/landing/WhyUsSection";
import ReviewsSection from "@/components/landing/ReviewsSection";
import PlanMyTripSection from "@/components/landing/PlanMyTripSection";
import Footer from "@/components/landing/Footer";
import { getSession } from "@/lib/auth";

// ─── Async data-fetching components (streamed via Suspense) ──────────────────

async function DestinationsLoader() {
  let destinations;
  try {
    const { getTopDestinations } = await import("@/data/queries/destinations");
    destinations = await getTopDestinations(6);
  } catch {
    destinations = undefined;
  }
  return <DestinationsSection destinations={destinations} />;
}

async function ToursLoader() {
  let tours;
  try {
    const { getFeaturedTours } = await import("@/data/queries/tours");
    tours = await getFeaturedTours(3);
  } catch {
    tours = undefined;
  }
  return <ToursSection tours={tours} />;
}

async function ReviewsLoader() {
  let reviews;
  try {
    const { getRecentReviews } = await import("@/data/queries/reviews");
    reviews = await getRecentReviews(3);
  } catch {
    reviews = undefined;
  }
  return <ReviewsSection reviews={reviews} />;
}

// ─── Skeleton placeholders for each section ──────────────────────────────────

function SectionSkeleton({ id }: { id: string }) {
  return (
    <section id={id} className="px-6 py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-16 flex flex-col items-center gap-3">
          <div className="h-4 w-32 animate-pulse rounded-full bg-white/5" />
          <div className="h-10 w-80 animate-pulse rounded-xl bg-white/5" />
          <div className="h-5 w-96 animate-pulse rounded-lg bg-white/5" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[460px] animate-pulse rounded-[2rem] bg-white/[0.03]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function Home() {
  const session = await getSession();

  return (
    <>
      <Navbar user={session} />
      <main>
        <HeroSection />
        <Suspense fallback={<SectionSkeleton id="destinations" />}>
          <DestinationsLoader />
        </Suspense>
        <Suspense fallback={<SectionSkeleton id="tours" />}>
          <ToursLoader />
        </Suspense>
        <WhyUsSection />
        <Suspense fallback={<SectionSkeleton id="reviews" />}>
          <ReviewsLoader />
        </Suspense>
        <PlanMyTripSection />
      </main>
      <Footer />
    </>
  );
}
