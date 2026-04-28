import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Nhập — TravelTour",
  description: "Đăng nhập vào tài khoản TravelTour để quản lý đặt tour và khám phá điểm đến.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
