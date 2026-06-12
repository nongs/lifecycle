import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { PwaRegister } from "@/components/shell/PwaRegister";
import { PostLoginHandler } from "@/components/auth/PostLoginHandler";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { BottomNav } from "@/components/layout/BottomNav";
import { VariantGate } from "@/components/layout/VariantGate";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const isWebAppShell =
  process.env.NEXT_PUBLIC_SHELL_VARIANT === "webapp";

export const metadata: Metadata = {
  title: "LifeCycle",
  description: "일상 사이클 관리",
  ...(isWebAppShell && {
    appleWebApp: {
      capable: true,
      title: "LifeCycle",
      statusBarStyle: "default",
    },
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      <body>
        <PwaRegister />
        <VariantGate>
          <AuthProvider>
            <DataProvider>
              <PostLoginHandler />
              <main className="mx-auto min-h-dvh max-w-lg pb-24">{children}</main>
              <BottomNav />
            </DataProvider>
          </AuthProvider>
        </VariantGate>
      </body>
    </html>
  );
}
