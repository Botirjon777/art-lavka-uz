"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useLanguageStore } from "@/stores/languageStore";
import type { Lang } from "@/lib/i18n";
import { useIsClient } from "../hooks/useIsClient";

const NAV: { href: string; label: string }[] = [
  { href: "/v2/market", label: "Маркет" },
  { href: "/support", label: "Поддержка" },
  { href: "/track-order", label: "Отследить заказ" },
];

const LANGS: { code: Lang; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "uz", label: "UZ" },
  { code: "en", label: "EN" },
];

export default function Header() {
  const pathname = usePathname();
  const cartItems = useCartStore((s) => s.cartItems);
  const isClient = useIsClient();
  const { lang, setLang } = useLanguageStore();
  const [langOpen, setLangOpen] = useState(false);

  // The cart is persisted to localStorage, so its count is only correct after
  // hydration. Rendering 0 on the server and the real count after mount would
  // be a mismatch, so the badge simply waits.

  const count = isClient ? cartItems.length : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-[#ECECEF] bg-white">
      <div className="mx-auto flex h-[68px] max-w-[1328px] items-center justify-between gap-6 px-4 desk:h-20 desk:gap-10 desk:px-6">
        <Link href="/v2" aria-label="ART LAVKA.UZ — на главную" className="shrink-0">
          <Image
            src="/art-lavka.png"
            alt="ART LAVKA.UZ"
            width={262}
            height={99}
            priority
            className="h-9 w-auto desk:h-10"
          />
        </Link>

        <div className="flex items-center gap-5 desk:gap-8">
          <nav className="hidden items-center gap-7 desk:flex">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-[15px] transition-colors hover:text-[#8814B1] ${
                    active ? "font-semibold text-[#8814B1]" : "font-medium text-[#333333]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/v2/market"
            className="hidden h-11 items-center gap-2 rounded-full bg-[#8814B1] px-[22px] text-[15px] font-semibold text-white transition-colors hover:bg-[#6E1090] desk:flex"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 4 7.2v9.6L12 21l8-4.2V7.2Z" />
              <path d="m4 7.2 8 4.3 8-4.3" />
              <path d="M12 11.5V21" />
            </svg>
            Собрать свою
          </Link>

          <div className="flex items-center gap-4 desk:gap-5">
            <Link
              href="/v2/cart"
              aria-label={`Корзина${count ? `, товаров: ${count}` : ""}`}
              className="relative flex h-11 w-11 items-center justify-center desk:h-auto desk:w-auto"
            >
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 7h12l-1.2 11.1a2 2 0 0 1-2 1.9H9.2a2 2 0 0 1-2-1.9Z" />
                <path d="M9 9V6.5a3 3 0 0 1 6 0V9" />
              </svg>
              {count > 0 && (
                <span className="absolute right-0 top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#8814B1] px-[5px] text-[11px] font-bold text-white desk:-right-2 desk:-top-2">
                  {count}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                aria-expanded={langOpen}
                aria-haspopup="listbox"
                className="flex h-11 cursor-pointer items-center gap-[5px] text-[14px] font-semibold text-[#1A1A1A]"
              >
                {lang.toUpperCase()}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9F9F9F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {langOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setLangOpen(false)}
                    aria-hidden="true"
                  />
                  <ul
                    role="listbox"
                    className="absolute right-0 top-full z-20 mt-1 w-[104px] overflow-hidden rounded-[10px] border border-[#ECECEF] bg-white py-1 shadow-lg"
                  >
                    {LANGS.map((l) => (
                      <li key={l.code}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={lang === l.code}
                          onClick={() => {
                            setLang(l.code);
                            setLangOpen(false);
                          }}
                          className={`w-full cursor-pointer px-4 py-2.5 text-left text-[14px] transition-colors hover:bg-[#F7F2FA] ${
                            lang === l.code ? "font-bold text-[#8814B1]" : "font-medium text-[#333333]"
                          }`}
                        >
                          {l.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
