"use client";

import { signInWithGoogle } from "@/app/(auth)/login/actions";
import { Compass } from "lucide-react";

export function GoogleSignInButton() {
  return (
    <form action={signInWithGoogle} style={{ width: "100%" }}>
      <button
        id="google-signin-btn"
        type="submit"
        className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 px-6 py-4 text-[15px] font-semibold text-white cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(6,182,212,0.35)] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(6,182,212,0.9), rgba(139,92,246,0.9))",
        }}
      >
        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s linear infinite",
          }}
        />
        {/* Google "G" logo */}
        <svg
          className="relative z-10 flex-shrink-0"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            background: "#fff",
            borderRadius: "50%",
            padding: "2px",
          }}
        >
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="relative z-10">Đăng nhập với Google</span>
      </button>
    </form>
  );
}
