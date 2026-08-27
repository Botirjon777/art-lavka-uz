"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/stores/cartStore";
import { useIsClient } from "../hooks/useIsClient";

export default function MobileTabBar() {
  const pathname = usePathname();
  const cartItems = useCartStore((s) => s.cartItems);
  const isClient = useIsClient();

  const count = isClient ? cartItems.length : 0;

  const isActive = (href: string) =>
    href === "/v2" ? pathname === "/v2" : pathname.startsWith(href);

  const tint = (href: string) => (isActive(href) ? "#8814B1" : "#9F9F9F");

  return (
    <nav
      aria-label="Основная навигация"
      className="fixed inset-x-0 bottom-0 z-30 flex h-[68px] items-stretch border-t border-[#ECECEF] bg-white desk:hidden"
    >
      <Link
        href="/v2"
        className="flex flex-1 flex-col items-center justify-center gap-1"
        aria-current={isActive("/v2") ? "page" : undefined}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tint("/v2")} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 11 12 4l8 7v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19Z" />
        </svg>
        <span className="text-[11px]" style={{ color: tint("/v2"), fontWeight: isActive("/v2") ? 700 : 500 }}>
          Главная
        </span>
      </Link>

      <Link
        href="/v2/market"
        className="flex flex-1 flex-col items-center justify-center gap-1"
        aria-current={isActive("/v2/market") ? "page" : undefined}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tint("/v2/market")} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
        <span className="text-[11px]" style={{ color: tint("/v2/market"), fontWeight: isActive("/v2/market") ? 700 : 500 }}>
          Маркет
        </span>
      </Link>

      <Link
        href="/track-order"
        className="flex flex-1 flex-col items-center justify-center gap-1"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9F9F9F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="17" cy="18" r="2" />
        </svg>
        <span className="text-[11px] font-medium text-[#9F9F9F]">Заказ</span>
      </Link>

      <Link
        href="/v2/cart"
        className="relative flex flex-1 flex-col items-center justify-center gap-1"
        aria-current={isActive("/v2/cart") ? "page" : undefined}
      >
        <span className="relative">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tint("/v2/cart")} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 7h12l-1.2 11.1a2 2 0 0 1-2 1.9H9.2a2 2 0 0 1-2-1.9Z" />
            <path d="M9 9V6.5a3 3 0 0 1 6 0V9" />
          </svg>
          {count > 0 && (
            <span className="absolute -right-2.5 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#8814B1] px-[4px] text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </span>
        <span className="text-[11px]" style={{ color: tint("/v2/cart"), fontWeight: isActive("/v2/cart") ? 700 : 500 }}>
          Корзина
        </span>
      </Link>
    </nav>
  );
}
