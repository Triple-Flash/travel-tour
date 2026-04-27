"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Compass, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/app/(auth)/login/actions";

const navLinks = [
  { label: "Điểm Đến", href: "#destinations" },
  { label: "Tour", href: "#tours" },
  { label: "Về Chúng Tôi", href: "#why-us" },
  { label: "Đánh Giá", href: "#reviews" },
  { label: "Lên Kế Hoạch", href: "#plan" },
];

export default function Navbar({
  user,
}: {
  user?: { email: string; full_name: string; avatar_url?: string } | null;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id="navbar"
      className="fixed z-50 left-1/2 -translate-x-1/2 transition-all duration-700 ease-out"
      style={{
        top: scrolled ? 16 : 24,
        width: "calc(100% - 32px)",
        maxWidth: scrolled ? "1000px" : "1200px",
        borderRadius: 100,
        background: scrolled
          ? "rgba(10, 10, 10, 0.85)"
          : "rgba(10, 10, 10, 0.3)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: `1px solid ${scrolled ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)"}`,
        boxShadow: scrolled ? "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)" : "none",
      }}
    >
      <nav className="mx-auto flex w-full items-center justify-between px-6 py-3">
        <Link href="/" id="logo" className="group flex items-center gap-2.5 no-underline cursor-pointer">
          <Compass size={26} className="text-cyan-400 transition-transform duration-500 group-hover:rotate-12" strokeWidth={2.2} />
          <span className="font-heading text-xl font-bold tracking-tight text-white transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            Travel<span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Tour</span>
          </span>
        </Link>

        <ul className="hidden lg:flex items-center gap-2 list-none m-0 p-0">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-full px-4 py-2 text-[14px] font-medium text-white/60 no-underline cursor-pointer transition-all duration-300 hover:bg-white/[0.04] hover:text-white hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none cursor-pointer transition-transform duration-300 hover:scale-105">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full p-[2px] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    {/* Google-like conic gradient border */}
                    <div 
                      className="absolute inset-0 rounded-full" 
                      style={{ background: 'conic-gradient(from 0deg, #EA4335 0deg 90deg, #4285F4 90deg 180deg, #34A853 180deg 270deg, #FBBC05 270deg 360deg)' }} 
                    />
                    {user.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar_url} alt={user.full_name} className="relative z-10 h-full w-full rounded-full border-[2px] border-[#0A0A0A] object-cover" />
                    ) : (
                      <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full border-[2px] border-[#0A0A0A] bg-[#111] text-xs font-bold text-white">
                        {user.full_name.split(" ").map((n) => n[0]).slice(-2).join("").toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border border-white/10 bg-[#0A0A0A]/95 p-2 text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-3xl">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="truncate text-sm font-semibold">{user.full_name}</p>
                    <p className="truncate text-xs text-white/50">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="my-1 bg-white/10" />
                  <DropdownMenuItem className="cursor-pointer rounded-lg p-0 focus:bg-white/10">
                    <Link href="/profile" className="block w-full px-3 py-2 text-[14px] font-medium text-white transition-colors">
                      Hồ Sơ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer rounded-lg p-0 focus:bg-white/10">
                    <a href="#plan" className="block w-full px-3 py-2 text-[14px] font-medium text-white transition-colors">
                      Lên Kế Hoạch
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="mt-1 cursor-pointer rounded-lg p-0 focus:bg-red-500/10 focus:text-red-400">
                    <form action={signOut} className="w-full">
                      <button type="submit" className="w-full px-3 py-2 text-left text-[14px] font-medium text-red-400 transition-colors">
                        Đăng Xuất
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                id="nav-login-btn"
                className="inline-flex h-9 items-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-medium text-white/80 cursor-pointer transition-all duration-300 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] no-underline"
              >
                Đăng Nhập
              </Link>
              <div className="h-6 w-[1px] bg-white/10 mx-1" />
              <a
                href="#plan"
                id="nav-cta-btn"
                className="inline-flex h-9 items-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-5 text-sm font-bold text-white cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] no-underline"
              >
                Lên Kế Hoạch
              </a>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger
            className="lg:hidden cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/70 border border-white/10 outline-none"
            aria-label="Mở menu điều hướng"
            id="mobile-menu-btn"
          >
            <Menu size={20} />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-[var(--tt-bg)] border-white/10">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-white">
                <Compass size={20} className="text-cyan-400" />
                <span className="font-heading font-bold">
                  Travel<span className="text-cyan-400">Tour</span>
                </span>
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-3 text-sm font-medium text-white/70 no-underline rounded-lg cursor-pointer transition-colors duration-200 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              {user ? (
                <div className="mt-2 px-3 pt-4 border-t border-white/10">
                  <div className="mb-4 flex items-center gap-3">
                    {user.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar_url} alt={user.full_name} className="h-10 w-10 rounded-full border border-white/20 object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-sm font-bold text-white border border-white/20">
                        {user.full_name.split(" ").map((n) => n[0]).slice(-2).join("").toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold text-white truncate">{user.full_name}</span>
                      <span className="text-[12px] text-white/50 truncate">{user.email}</span>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="mb-2 flex h-10 w-full items-center justify-center rounded-xl bg-white/5 text-sm font-semibold text-white cursor-pointer transition-colors duration-200 hover:bg-white/10"
                  >
                    Hồ Sơ
                  </Link>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="flex h-10 w-full items-center justify-center rounded-xl bg-red-500/10 text-sm font-semibold text-red-400 cursor-pointer transition-colors duration-200 hover:bg-red-500/20"
                    >
                      Đăng Xuất
                    </button>
                  </form>
                </div>
              ) : (
                <div className="mt-2 px-3 pt-4 border-t border-white/10">
                  <Link
                    href="/login"
                    className="flex h-10 w-full items-center justify-center rounded-xl bg-white/5 text-sm font-semibold text-white cursor-pointer transition-colors duration-200 hover:bg-white/10"
                  >
                    Đăng Nhập
                  </Link>
                </div>
              )}
              <div className="mt-4 px-3">
                <a
                  href="#plan"
                  className="flex h-10 w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 text-sm font-semibold text-white cursor-pointer no-underline"
                >
                  Lên Kế Hoạch
                </a>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
