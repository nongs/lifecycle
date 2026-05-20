import type { Metadata } from "next";
import { DataProvider } from "@/contexts/DataContext";
import { BottomNav } from "@/components/layout/BottomNav";
import "./globals.css";

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
    <html lang="ko">
      <body className="antialiased">
        <DataProvider>
          <main className="mx-auto min-h-dvh max-w-lg pb-20">{children}</main>
          <BottomNav />
        </DataProvider>
      </body>
    </html>
  );
}
