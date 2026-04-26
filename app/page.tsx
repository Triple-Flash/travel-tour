import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import DestinationsSection from "@/components/landing/DestinationsSection";
import ToursSection from "@/components/landing/ToursSection";
import WhyUsSection from "@/components/landing/WhyUsSection";
import ReviewsSection from "@/components/landing/ReviewsSection";
import PlanMyTripSection from "@/components/landing/PlanMyTripSection";
import Footer from "@/components/landing/Footer";
import type { Destination } from "@/data/queries/destinations";
import type { TourSummary } from "@/data/queries/tours";
import type { ReviewSummary } from "@/data/queries/reviews";

async function loadHomeData(): Promise<{
  destinations: Destination[] | undefined;
  tours: TourSummary[] | undefined;
  reviews: ReviewSummary[] | undefined;
}> {
  try {
    const { getTopDestinations } = await import("@/data/queries/destinations");
    const { getFeaturedTours } = await import("@/data/queries/tours");
    const { getRecentReviews } = await import("@/data/queries/reviews");
    const [destinations, tours, reviews] = await Promise.all([
      getTopDestinations(6),
      getFeaturedTours(3),
      getRecentReviews(3),
    ]);
    return { destinations, tours, reviews };
  } catch (err) {
    console.warn("[Home] DB unavailable, using fallback data:", (err as Error).message);
    return { destinations: undefined, tours: undefined, reviews: undefined };
  }
}

import { getSession } from "@/lib/auth";

export default async function Home() {
  const { destinations, tours, reviews } = await loadHomeData();
  const session = await getSession();
console.log("session",session)
  return (
    <>
      <Navbar user={session} />
      <main>
        <HeroSection />
        <DestinationsSection destinations={destinations} />
        <ToursSection tours={tours} />
        <WhyUsSection />
        <ReviewsSection reviews={reviews} />
        <PlanMyTripSection />
      </main>
      <Footer />
    </>
  );
}
