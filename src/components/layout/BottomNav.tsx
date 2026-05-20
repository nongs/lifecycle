"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "대시보드" },
  { href: "/items", label: "항목 관리" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]"
      aria-label="주요 메뉴"
    >
      <div className="mx-auto flex max-w-lg">
        {links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center py-3 text-sm font-medium ${
                active ? "text-slate-900" : "text-slate-500"
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
