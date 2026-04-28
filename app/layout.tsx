import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const dmSans = DM_Sans({
  variable: "--font-heading-var",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSansBody = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TravelTour — Discover the World's Most Beautiful Destinations",
  description:
    "Plan your dream vacation with TravelTour. Explore curated tours to Bali, Santorini, the Swiss Alps, Kyoto, and more. Trusted by 50,000+ happy travelers worldwide.",
  keywords:
    "travel, tours, vacation, destinations, adventure, Bali, Santorini, Swiss Alps, Kyoto",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(dmSans.variable, dmSansBody.variable)}
      suppressHydrationWarning
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
