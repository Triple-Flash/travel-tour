import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — TravelTour",
  description: "Sign in to your TravelTour account to manage your bookings and explore destinations.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
