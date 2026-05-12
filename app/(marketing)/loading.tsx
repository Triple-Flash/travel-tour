import Navbar from "@/components/landing/Navbar";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />
      <main className="pt-32 pb-24 px-6">
        <div className="mx-auto max-w-[1200px]">
          {/* Page title skeleton */}
          <div className="mb-10">
            <div className="h-5 w-40 animate-pulse rounded-full bg-white/5" />
            <div className="mt-3 h-10 w-80 animate-pulse rounded-xl bg-white/5" />
            <div className="mt-4 h-5 w-[500px] max-w-full animate-pulse rounded-lg bg-white/[0.03]" />
          </div>

          {/* Cards skeleton grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[420px] animate-pulse rounded-[2rem] bg-white/[0.03]"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
