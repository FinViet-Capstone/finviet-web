import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gói đăng ký | FinViet", description: "Chọn gói FinViet và thanh toán bằng VNPay QR." };

export default function SubscriptionLayout({ children }: { children: React.ReactNode }) {
  return <div lang="vi">{children}</div>;
}
