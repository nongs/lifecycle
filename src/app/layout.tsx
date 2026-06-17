import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { OfflineBanner } from "@/components/shell/OfflineBanner";
import { PwaLifecycle } from "@/components/shell/PwaLifecycle";
import { ReminderScheduler } from "@/components/shell/ReminderScheduler";
import { PwaRegister } from "@/components/shell/PwaRegister";
import { SessionRecoveryBanner } from "@/components/shell/SessionRecoveryBanner";
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

export const viewport: Viewport = isWebAppShell
  ? { themeColor: "#587662" }
  : {};

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
              <PwaLifecycle />
              <ReminderScheduler />
              <SessionRecoveryBanner />
              <OfflineBanner />
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
