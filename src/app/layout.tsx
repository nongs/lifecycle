import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { DataProvider } from "@/contexts/DataContext";
import { BottomNav } from "@/components/layout/BottomNav";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LifeCycle",
  description: "일상 사이클 관리",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      <body>
        <DataProvider>
          <main className="mx-auto min-h-dvh max-w-lg pb-24">{children}</main>
          <BottomNav />
        </DataProvider>
      </body>
    </html>
  );
}
