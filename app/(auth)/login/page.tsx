import Image from "next/image";
import Link from "next/link";
import { Compass, Shield, KeyRound } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* ── Left panel — immersive Vietnam landscape ──────────── */}
      <div className="relative hidden lg:flex lg:w-[55%] items-center justify-center">
        <Image
          src="/images/halong.png"
          alt="Vịnh Hạ Long, Quảng Ninh — Di sản thiên nhiên thế giới UNESCO"
          fill
          priority
          className="object-cover"
          sizes="55vw"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/40 via-[#0B1120]/30 to-[#0B1120]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/90 via-transparent to-[#030712]/50" />

        {/* Floating stats card */}
        <div className="absolute bottom-12 left-12 right-12 z-10 animate-fade-in-up delay-500">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
            <div className="flex items-center gap-8">
              <div>
                <div className="text-3xl font-bold text-white">50K+</div>
                <div className="mt-0.5 text-[13px] text-white/50">Du Khách Hài Lòng</div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <div className="text-3xl font-bold text-white">4.9</div>
                <div className="mt-0.5 text-[13px] text-white/50">Đánh Giá Trung Bình</div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <div className="text-3xl font-bold text-white">63+</div>
                <div className="mt-0.5 text-[13px] text-white/50">Tỉnh Thành</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline on image */}
        <div className="absolute top-12 left-12 z-10 animate-fade-in-up delay-200">
          <div className="text-[13px] font-semibold uppercase tracking-[3px] text-white/50">
            Khám Phá Việt Nam
          </div>
          <h2 className="mt-2 max-w-[400px] text-3xl font-bold leading-tight text-white">
            Hành trình tuyệt vời đang chờ đón bạn
          </h2>
        </div>
      </div>

      {/* ── Right panel — login card ─────────────────────────── */}
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[45%]">
        {/* Background */}
        <div className="absolute inset-0 bg-[#0B1120]" />

        {/* Animated gradient orbs */}
        <div
          className="absolute -top-[200px] -right-[200px] h-[500px] w-[500px] rounded-full opacity-30 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.4), transparent 70%)",
            filter: "blur(80px)",
            animation: "float 10s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-[150px] -left-[150px] h-[400px] w-[400px] rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.4), transparent 70%)",
            filter: "blur(60px)",
            animation: "float 8s ease-in-out infinite 3s",
          }}
        />
        <div
          className="absolute top-[30%] left-[20%] h-[250px] w-[250px] rounded-full opacity-15 pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(236,72,153,0.3), transparent 70%)",
            filter: "blur(50px)",
            animation: "float 12s ease-in-out infinite 1.5s",
          }}
        />

        {/* Card */}
        <main
          id="login-card"
          className="relative z-10 w-full max-w-[420px] animate-fade-in-up"
        >
          {/* Logo */}
          <Link href="/" className="mb-10 flex items-center justify-center gap-2.5 no-underline cursor-pointer">
            <Compass size={28} className="text-cyan-400" strokeWidth={2.2} />
            <span className="font-heading text-2xl font-bold text-white">
              Travel<span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Tour</span>
            </span>
          </Link>

          {/* Heading */}
          <h1 className="animate-fade-in-up delay-100 text-center text-3xl font-bold text-white">
            Chào Mừng Trở Lại
          </h1>
          <p className="animate-fade-in-up delay-200 mx-auto mt-3 max-w-[320px] text-center text-[14px] leading-relaxed text-white/50">
            Đăng nhập để quản lý đặt tour, danh sách yêu thích và nhận gợi ý cá nhân.
          </p>

          {/* Google sign-in */}
          <div className="animate-fade-in-up delay-300 mt-8">
            <GoogleSignInButton />
          </div>

          {/* Error message */}
          <ErrorBanner searchParams={searchParams} />

          {/* Divider */}
          <div className="animate-fade-in-up delay-400 mt-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-[11px] uppercase tracking-wider text-white/25 whitespace-nowrap">
              đăng nhập bảo mật
            </span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          {/* Trust badges */}
          <div className="animate-fade-in-up delay-500 mt-5 flex justify-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/40">
              <Shield size={12} className="text-emerald-400" />
              Mã hóa SSL
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/40">
              <KeyRound size={12} className="text-violet-400" />
              Không lưu mật khẩu
            </span>
          </div>

          {/* Terms */}
          <p className="animate-fade-in-up delay-600 mt-6 text-center text-[12px] leading-relaxed text-white/30">
            Bằng việc tiếp tục, bạn đồng ý với{" "}
            <a href="/terms" className="text-cyan-400/80 no-underline hover:text-cyan-400 transition-colors">
              Điều Khoản Dịch Vụ
            </a>{" "}
            và{" "}
            <a href="/privacy" className="text-cyan-400/80 no-underline hover:text-cyan-400 transition-colors">
              Chính Sách Bảo Mật
            </a>
            .
          </p>
        </main>
      </div>
    </div>
  );
}

/* ── Async error banner ──────────────────────────────────────── */
async function ErrorBanner({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  if (!error) return null;

  const messages: Record<string, string> = {
    auth_callback_error: "Xác thực thất bại. Vui lòng thử lại.",
    oauth_error: "Không thể kết nối với Google. Vui lòng thử lại.",
  };

  return (
    <div
      className="animate-fade-in-up mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-300"
      role="alert"
      aria-live="polite"
    >
      {messages[error] ?? "Đã xảy ra lỗi không mong muốn."}
    </div>
  );
}
