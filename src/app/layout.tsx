import type { Metadata, Viewport } from "next";
import { Bai_Jamjuree } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

const baiJamjuree = Bai_Jamjuree({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-bai-jamjuree",
});

export const metadata: Metadata = {
  title: "สิทธิไปต่อ — ตั้งแต่ตรวจเหตุเร่งด่วนถึงติดตามผล",
  description:
    "ต้นแบบผู้ช่วยให้ประชาชนตรวจเหตุเร่งด่วน เข้าใจสิทธิและทางเลือก ประเมินความเสี่ยง สร้างหนังสือร้องเรียน และติดตามผล",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#102c3d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${baiJamjuree.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full" suppressHydrationWarning>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
