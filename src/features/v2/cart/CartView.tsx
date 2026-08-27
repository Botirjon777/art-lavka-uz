"use client";

import Link from "next/link";
import { CartItem } from "@/types";
import { useCartStore } from "@/stores/cartStore";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";
import PrintOnShirt, { isDarkColor } from "../components/PrintOnShirt";
import { money } from "../tokens";
import { idOf } from "../lib/catalog";
import { useIsClient } from "../hooks/useIsClient";
import { useCatalog, photoForPrint } from "../hooks/useCatalog";
import { cld } from "../lib/images";
import Image from "next/image";

/** Stock left for exactly the colour + size a cart line was added with. */
function lineStock(item: CartItem): number {
  const color = item.product.colors?.find((c) => c.name === item.color);
  return color?.variants?.find((v) => v.size === item.size)?.stock ?? 0;
}

export default function CartView() {
  const { lang } = useLanguageStore();
  const { cartItems, updateQuantity, removeItem } = useCartStore();
  const isClient = useIsClient();
  const { data: catalog = [] } = useCatalog();


  if (!isClient) {
    return (
      <div className="mx-auto max-w-[1328px] px-4 py-10 desk:px-6">
        <div className="h-9 w-56 animate-pulse rounded bg-[#F0F0F3]" />
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const fullTotal = cartItems.reduce(
    (sum, i) => sum + (i.oldPrice || i.price) * i.quantity,
    0
  );
  const discount = fullTotal - subtotal;

  return (
    <div className="bg-[#FAFAFB]">
      <div className="mx-auto flex max-w-[1328px] flex-col gap-6 px-4 pb-20 pt-8 desk:px-6 desk:pb-24 desk:pt-10">
        <h1 className="text-[24px] font-extrabold leading-[30px] tracking-[-0.015em] text-[#1A1A1A] desk:text-[30px] desk:leading-[37px]">
          Корзина{" "}
          <span className="font-semibold text-[#9F9F9F]">({cartItems.length})</span>
        </h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-[14px] border border-[#ECECEF] bg-white px-6 py-24 text-center">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#D8D8DE" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 7h12l-1.2 11.1a2 2 0 0 1-2 1.9H9.2a2 2 0 0 1-2-1.9Z" />
              <path d="M9 9V6.5a3 3 0 0 1 6 0V9" />
            </svg>
            <span className="text-[18px] font-bold text-[#1A1A1A]">Корзина пуста</span>
            <span className="text-[15px] text-[#9F9F9F]">Загляните в маркет — там все авторские принты</span>
            <Link
              href="/v2/market"
              className="mt-1 flex h-12 items-center rounded-[10px] bg-[#8814B1] px-7 text-[15px] font-semibold text-white transition-colors hover:bg-[#6E1090]"
            >
              Перейти в маркет
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-6 desk:flex-row desk:gap-6">
            {/* Lines */}
            <div className="w-full flex-1 overflow-hidden rounded-[14px] border border-[#ECECEF] bg-white">
              {cartItems.map((item, index) => {
                const color = item.product.colors?.find((c) => c.name === item.color);
                const stock = lineStock(item);
                const photo = photoForPrint(catalog, item.print);
                const base = color
                  ? isDarkColor(color.hex)
                    ? "/black-t-shirt.webp"
                    : "/white-t-shirt.webp"
                  : item.product.image || "/white-t-shirt.webp";

                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-4 p-4 desk:items-center desk:gap-[22px] desk:px-6 desk:py-[22px] ${
                      index < cartItems.length - 1 ? "border-b border-[#F1F1F4]" : ""
                    }`}
                  >
                    <Link
                      href={item.print ? `/v2/product/${idOf(item.print)}` : "/v2/market"}
                      className="relative flex h-[104px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#F4F4F6] desk:h-[122px] desk:w-[90px]"
                    >
                      {photo ? (
                        <Image
                          src={cld(photo, 200)}
                          alt={getTranslated(item.product, lang)}
                          fill
                          sizes="90px"
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <PrintOnShirt
                          base={base}
                          print={item.print}
                          alt={getTranslated(item.product, lang)}
                          className="h-[92px]"
                        />
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <span className="text-[13px] leading-4 text-[#9F9F9F] desk:text-[14px] desk:leading-[17px]">
                        {getTranslated(item.product, lang)}
                        {color && (
                          <span className="text-[#6B6B75]">
                            {" "}
                            ({getTranslated(color, lang) || color.name})
                          </span>
                        )}
                      </span>
                      <span className="truncate text-[15px] font-bold leading-5 text-[#1A1A1A] desk:text-[17px] desk:leading-[22px]">
                        {item.print ? getTranslated(item.print, lang) || item.print.name : "Без принта"}
                      </span>
                      <span className="text-[13px] leading-4 text-[#9F9F9F] desk:text-[14px] desk:leading-[17px]">
                        Размер: <span className="font-medium text-[#333333]">{item.size}</span>
                      </span>

                      {stock === 0 && (
                        <span className="text-[13px] font-semibold text-[#E5484D]">
                          Этой позиции больше нет в наличии
                        </span>
                      )}

                      {/* Mobile controls */}
                      <div className="flex items-center justify-between gap-3 pt-2 desk:hidden">
                        <Stepper
                          qty={item.quantity}
                          stock={stock}
                          onDec={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          onInc={() => updateQuantity(item.id, Math.min(stock, item.quantity + 1))}
                        />
                        <span className="text-[17px] font-bold text-[#1A1A1A]">
                          {money(item.price * item.quantity)}
                          <span className="text-[11px] font-semibold text-[#9F9F9F]"> сум</span>
                        </span>
                      </div>
                    </div>

                    {/* Desktop controls */}
                    <div className="hidden shrink-0 desk:block">
                      <Stepper
                        qty={item.quantity}
                        stock={stock}
                        onDec={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        onInc={() => updateQuantity(item.id, Math.min(stock, item.quantity + 1))}
                      />
                    </div>

                    <div className="hidden w-[168px] shrink-0 text-right desk:block">
                      <div className="text-[20px] font-bold leading-6 text-[#1A1A1A]">
                        {money(item.price * item.quantity)}
                        <span className="text-[12px] font-semibold text-[#9F9F9F]"> сум</span>
                      </div>
                      {item.oldPrice && item.oldPrice > item.price && (
                        <div className="pt-1 text-[14px] font-medium text-[#9F9F9F] line-through">
                          {money(item.oldPrice * item.quantity)}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label="Удалить из корзины"
                      className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center text-[#C9C9D2] transition-colors hover:text-[#8814B1]"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 7h16M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
                        <path d="M6.5 7 7.6 19a1.5 1.5 0 0 0 1.5 1.4h5.8a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <aside className="flex w-full shrink-0 flex-col gap-4 desk:sticky desk:top-24 desk:w-[380px]">
              <div className="rounded-[14px] border border-[#ECECEF] bg-white p-6 desk:p-7">
                <h2 className="mb-5 text-[19px] font-bold leading-[25px] text-[#1A1A1A] desk:text-[21px] desk:leading-[27px]">
                  Ваш заказ
                </h2>

                <div className="flex flex-col gap-3.5">
                  <Row label={`Товары (${cartItems.length})`} value={`${money(subtotal + discount)} сум`} />
                  {discount > 0 && (
                    <Row label="Скидка" value={`−${money(discount)} сум`} valueClass="text-[#1E9E5A]" />
                  )}
                  <Row label="Доставка" value="рассчитается на след. шаге" valueClass="text-[14px] text-[#9F9F9F] font-normal" />
                </div>

                <div className="my-5 h-px bg-[#ECECEF]" />

                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[16px] font-semibold text-[#1A1A1A]">Итого</span>
                  <span className="text-[25px] font-extrabold leading-[31px] text-[#1A1A1A] desk:text-[27px] desk:leading-[33px]">
                    {money(subtotal)}
                    <span className="text-[14px] font-semibold text-[#9F9F9F]"> сум</span>
                  </span>
                </div>

                <Link
                  href="/v2/checkout"
                  className="mt-5 flex h-14 w-full items-center justify-center rounded-xl bg-[#8814B1] text-[16px] font-bold text-white transition-colors hover:bg-[#6E1090]"
                >
                  Перейти к оформлению
                </Link>

                <p className="mt-4 text-center text-[12px] leading-[19px] text-[#9F9F9F]">
                  Оформляя заказ, вы соглашаетесь с условиями оферты
                </p>
              </div>

              <Link
                href="/v2/market"
                className="flex h-12 items-center justify-center rounded-[14px] border border-[#ECECEF] bg-white text-[15px] font-semibold text-[#333333] transition-colors hover:border-[#C9C9D2]"
              >
                Продолжить покупки
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

function Stepper({
  qty,
  stock,
  onDec,
  onInc,
}: {
  qty: number;
  stock: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onDec}
        disabled={qty <= 1}
        aria-label="Уменьшить количество"
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#8814B1] text-white transition-colors hover:bg-[#6E1090] disabled:bg-[#D8D8DE]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M5 12h14" />
        </svg>
      </button>
      <span className="min-w-[30px] text-center text-[18px] font-semibold text-[#1A1A1A]">{qty}</span>
      <button
        type="button"
        onClick={onInc}
        disabled={qty >= stock}
        aria-label="Увеличить количество"
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#8814B1] text-white transition-colors hover:bg-[#6E1090] disabled:bg-[#D8D8DE]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[15px] text-[#6B6B75]">{label}</span>
      <span className={`text-[15px] font-semibold text-[#1A1A1A] ${valueClass}`}>{value}</span>
    </div>
  );
}
