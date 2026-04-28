import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Sparkles } from "lucide-react";

interface LandingEmptyStateProps {
  badge: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  highlights?: string[];
  icon: LucideIcon;
}

export default function LandingEmptyState({
  badge,
  title,
  description,
  primaryHref = "",
  primaryLabel,
  secondaryHref="",
  secondaryLabel,
  highlights = [],
  icon: Icon,
}: LandingEmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#050816]/90 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-3xl md:p-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-12 top-8 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
            <Sparkles size={14} />
            {badge}
          </div>

          <h3 className="mt-5 text-3xl font-bold text-white md:text-4xl">
            {title}
          </h3>

          <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/65 md:text-base">
            {description}
          </p>

          {highlights.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70"
                >
                  {highlight}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-start gap-4 lg:items-end">
          <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 text-cyan-300 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
            <Icon size={34} />
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(139,92,246,0.25)] transition-transform duration-300 hover:scale-[1.02]"
            >
              {primaryLabel}
              <ArrowRight size={16} />
            </Link>

            {secondaryHref && secondaryLabel ? (
              <Link
                href={secondaryHref}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition-colors duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
