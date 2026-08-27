"use client";

import Link from "next/link";
import Image from "next/image";
import { useSettings } from "@/features/client/home/hooks/useSettings";

// Intrinsic sizes matter: next/image warns when the declared ratio disagrees
// with the file, and these three logos have very different proportions.
const PAYMENT_LOGOS = [
  { src: "/payment-method/uzcard.webp", alt: "Uzcard", width: 110, height: 64 },
  { src: "/payment-method/humo.webp", alt: "Humo", width: 100, height: 30 },
  { src: "/payment-method/pay-me.webp", alt: "Payme", width: 99, height: 28 },
];

export default function Footer() {
  const { data: settings } = useSettings();
  const menu = settings?.menu;

  return (
    <footer className="bg-[#17171B] pb-10 pt-16">
      <div className="mx-auto flex max-w-[1328px] flex-col gap-11 px-4 desk:px-6">
        <div className="flex flex-col justify-between gap-10 desk:flex-row desk:gap-16">
          <div className="flex max-w-[340px] flex-col gap-4">
            <span className="text-[22px] font-extrabold tracking-[0.06em] text-white">
              ART LAVKA.UZ
            </span>
            <p className="text-[14px] leading-6 text-[#8A8A96]">
              Авторские принты на футболках. Фергана, Узбекистан.
            </p>
          </div>

          <div className="flex flex-wrap gap-10 desk:gap-[72px]">
            <div className="flex flex-col gap-3.5">
              <span className="text-[13px] font-bold tracking-[0.04em] text-white">Магазин</span>
              <Link href="/v2/market" className="text-[14px] text-[#8A8A96] transition-colors hover:text-white">
                Маркет
              </Link>
              <Link href="/v2/cart" className="text-[14px] text-[#8A8A96] transition-colors hover:text-white">
                Корзина
              </Link>
            </div>

            <div className="flex flex-col gap-3.5">
              <span className="text-[13px] font-bold tracking-[0.04em] text-white">Помощь</span>
              <Link href="/support" className="text-[14px] text-[#8A8A96] transition-colors hover:text-white">
                Поддержка
              </Link>
              <Link href="/track-order" className="text-[14px] text-[#8A8A96] transition-colors hover:text-white">
                Отследить заказ
              </Link>
            </div>

            <div className="flex flex-col gap-3.5">
              <span className="text-[13px] font-bold tracking-[0.04em] text-white">Контакты</span>
              {menu?.telegram && (
                <a
                  href={menu.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-[#8A8A96] transition-colors hover:text-white"
                >
                  Telegram
                </a>
              )}
              {menu?.email && (
                <a
                  href={`mailto:${menu.email}`}
                  className="text-[14px] text-[#8A8A96] transition-colors hover:text-white"
                >
                  {menu.email}
                </a>
              )}
              {menu?.instagramStore && (
                <a
                  href={menu.instagramStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-[#8A8A96] transition-colors hover:text-white"
                >
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="h-px bg-[#2A2A32]" />

        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
          <span className="text-[13px] text-[#6E6E7A]">
            © {new Date().getFullYear()} ART LAVKA.UZ
          </span>
          <div className="flex items-center gap-3">
            {PAYMENT_LOGOS.map((logo) => (
              <Image
                key={logo.src}
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className="h-[22px] w-auto opacity-75"
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
