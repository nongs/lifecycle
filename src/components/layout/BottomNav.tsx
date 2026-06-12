"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "대시보드" },
  { href: "/items", label: "관리" },
  { href: "/stats", label: "통계" },
  { href: "/settings", label: "설정" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_-8px_rgb(58_54_48/0.08)] backdrop-blur-sm"
      aria-label="주 메뉴"
    >
      <div className="mx-auto flex max-w-lg">
        {links.map(({ href, label }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center py-3 text-xs font-medium transition-colors sm:text-sm ${
                active ? "text-primary" : "text-ink-faint hover:text-ink-muted"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
