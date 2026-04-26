import { Compass, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const links = {
  "Công Ty": ["Về Chúng Tôi", "Tuyển Dụng", "Báo Chí", "Blog"],
  "Hỗ Trợ": ["Trung Tâm Trợ Giúp", "Thông Tin An Toàn", "Chính Sách Hủy", "Liên Hệ"],
  "Điểm Đến": ["Vịnh Hạ Long", "Hội An", "Sa Pa", "Đà Lạt", "Phú Quốc", "Mũi Né"],
};

const socials = [
  { label: "Facebook", svg: <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg> },
  { label: "Instagram", svg: <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
  { label: "Twitter", svg: <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { label: "YouTube", svg: <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
];

export default function Footer() {
  return (
    <footer className="relative px-6 pt-16 pb-8 border-t border-white/5">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <Compass size={24} className="text-cyan-400" strokeWidth={2.2} />
              <span className="font-heading text-xl font-bold text-white">
                Travel<span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Tour</span>
              </span>
            </div>
            <p className="mt-4 max-w-[300px] text-[14px] leading-relaxed text-white/40">
              Tour du lịch Việt Nam chất lượng cao. Hướng dẫn viên chuyên nghiệp,
              lịch trình thiết kế riêng, kỷ niệm đáng nhớ.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 text-[13px] text-white/35">
              <a href="mailto:xin.chao@traveltour.vn" className="flex items-center gap-2 cursor-pointer hover:text-cyan-400 transition-colors no-underline"><Mail size={13}/> xin.chao@traveltour.vn</a>
              <a href="tel:+84901234567" className="flex items-center gap-2 cursor-pointer hover:text-cyan-400 transition-colors no-underline"><Phone size={13}/> +84 90 123 4567</a>
              <span className="flex items-center gap-2"><MapPin size={13}/> Quận 1, TP. Hồ Chí Minh</span>
            </div>
            <div className="mt-5 flex gap-2.5">
              {socials.map((s) => (
                <a key={s.label} href="#" aria-label={s.label} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white/30 border border-white/5 cursor-pointer transition-all duration-200 hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/30">
                  {s.svg}
                </a>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-white/50">{title}</h4>
              <ul className="mt-4 flex flex-col gap-2.5 list-none p-0">
                {items.map((item) => (
                  <li key={item}><a href="#" className="text-[13px] text-white/30 no-underline cursor-pointer transition-colors hover:text-white/70">{item}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-8 bg-white/5" />
        <div className="flex flex-col items-center justify-between gap-4 text-[12px] text-white/25 md:flex-row">
          <span>&copy; {new Date().getFullYear()} TravelTour. Bảo lưu mọi quyền.</span>
          <div className="flex gap-5">
            {["Chính Sách Bảo Mật", "Điều Khoản Dịch Vụ", "Chính Sách Cookie"].map((t) => (
              <a key={t} href="#" className="cursor-pointer hover:text-white/50 transition-colors no-underline">{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
