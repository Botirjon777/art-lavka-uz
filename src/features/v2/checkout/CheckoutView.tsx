"use client";

import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useCartStore } from "@/stores/cartStore";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";
import { applyPhoneMask } from "@/lib/phoneUtils";
import PrintOnShirt, { isDarkColor } from "../components/PrintOnShirt";
import { money } from "../tokens";
import { useV2Checkout, type Step } from "./useV2Checkout";
import { useIsClient } from "../hooks/useIsClient";
import { useCatalog, photoForPrint } from "../hooks/useCatalog";
import { cld } from "../lib/images";
import Image from "next/image";

const QrPaymentModal = dynamic(
  () => import("@/features/client/home/modals/shared/QrPaymentModal"),
  { ssr: false }
);

const STEP_LABELS: Record<Step, string> = {
  1: "Данные",
  2: "Доставка",
  3: "Оплата",
};

export default function CheckoutView() {
  const { lang } = useLanguageStore();
  const { cartItems, clearCart } = useCartStore();
  const isClient = useIsClient();
  const { data: catalog = [] } = useCatalog();
  const [placedOrder, setPlacedOrder] = useState<string | null>(null);


  const c = useV2Checkout(cartItems, (orderNumber) => {
    setPlacedOrder(orderNumber);
    clearCart();
  });

  if (!isClient) {
    return (
      <div className="mx-auto max-w-[1328px] px-4 py-12 desk:px-6">
        <div className="h-9 w-64 animate-pulse rounded bg-[#F0F0F3]" />
      </div>
    );
  }

  // ---------------- success ----------------
  if (placedOrder) {
    return (
      <div className="bg-[#FAFAFB]">
        <div className="mx-auto flex max-w-[640px] flex-col items-center gap-5 px-4 py-24 text-center desk:px-6">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E9F8F0]">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#1E9E5A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 5 5L19 7" />
            </svg>
          </span>
          <h1 className="text-[28px] font-extrabold leading-[34px] text-[#1A1A1A]">Заказ оформлен</h1>
          <p className="text-[16px] leading-6 text-[#6B6B75]">
            Номер заказа{" "}
            <span className="font-bold text-[#1A1A1A]">{placedOrder}</span>. Мы позвоним, чтобы
            подтвердить доставку.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/track-order/${placedOrder}`}
              className="flex h-14 items-center justify-center rounded-xl bg-[#8814B1] px-8 text-[16px] font-bold text-white transition-colors hover:bg-[#6E1090]"
            >
              Отследить заказ
            </Link>
            <Link
              href="/v2/market"
              className="flex h-14 items-center justify-center rounded-xl border-[1.5px] border-[#E2E2E8] bg-white px-8 text-[16px] font-semibold text-[#333333] transition-colors hover:border-[#C9C9D2]"
            >
              В маркет
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- empty ----------------
  if (cartItems.length === 0) {
    return (
      <div className="bg-[#FAFAFB]">
        <div className="mx-auto flex max-w-[640px] flex-col items-center gap-4 px-4 py-24 text-center desk:px-6">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#D8D8DE" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 7h12l-1.2 11.1a2 2 0 0 1-2 1.9H9.2a2 2 0 0 1-2-1.9Z" />
            <path d="M9 9V6.5a3 3 0 0 1 6 0V9" />
          </svg>
          <span className="text-[18px] font-bold text-[#1A1A1A]">Оформлять нечего</span>
          <span className="text-[15px] text-[#9F9F9F]">Сначала добавьте что-нибудь в корзину</span>
          <Link
            href="/v2/market"
            className="mt-1 flex h-12 items-center rounded-[10px] bg-[#8814B1] px-7 text-[15px] font-semibold text-white transition-colors hover:bg-[#6E1090]"
          >
            Перейти в маркет
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFB]">
      {/* ---------------- Step bar ---------------- */}
      <div className="border-b border-[#ECECEF] bg-white">
        <div className="mx-auto flex h-auto max-w-[1328px] flex-col gap-3 px-4 py-4 desk:h-[76px] desk:flex-row desk:items-center desk:gap-8 desk:px-6 desk:py-0">
          <Link
            href="/v2/cart"
            className="flex shrink-0 items-center gap-2 text-[15px] font-semibold text-[#333333] transition-colors hover:text-[#8814B1]"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m14 6-6 6 6 6" />
            </svg>
            В корзину
          </Link>

          <div className="flex flex-1 items-center justify-center gap-1 desk:gap-2">
            {([1, 2, 3] as Step[]).map((n, i) => {
              const active = c.step === n;
              const done = c.step > n;
              return (
                <div key={n} className="flex flex-1 items-center gap-1 desk:flex-none desk:gap-2">
                  <button
                    type="button"
                    onClick={() => c.goToStep(n)}
                    className={`flex h-12 flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-[10px] px-2 transition-colors desk:flex-none desk:px-[18px] ${
                      active ? "bg-[#F7F2FA]" : ""
                    }`}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{ background: active || done ? "#8814B1" : "#EEE3F4" }}
                    >
                      {done ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12 5 5L19 7" />
                        </svg>
                      ) : (
                        <span
                          className="text-[13px] font-bold"
                          style={{ color: active ? "#fff" : "#B98BCF" }}
                        >
                          {n}
                        </span>
                      )}
                    </span>
                    <span
                      className={`hidden text-[15px] sm:inline ${
                        active ? "font-bold text-[#1A1A1A]" : done ? "font-medium text-[#333333]" : "font-medium text-[#9F9F9F]"
                      }`}
                    >
                      {STEP_LABELS[n]}
                    </span>
                  </button>
                  {i < 2 && <span className="h-[1.5px] w-4 shrink-0 bg-[#E2E2E8] desk:w-9" />}
                </div>
              );
            })}
          </div>

          <span className="hidden w-[92px] shrink-0 desk:block" />
        </div>
      </div>

      {/* ---------------- Body ---------------- */}
      <div className="mx-auto flex max-w-[1328px] flex-col items-start gap-6 px-4 pb-24 pt-8 desk:flex-row desk:gap-8 desk:px-6 desk:pb-20 desk:pt-10">
        <div className="w-full flex-1 rounded-[14px] border border-[#ECECEF] bg-white p-5 desk:p-9">
          {/* ---- Step 1 ---- */}
          {c.step === 1 && (
            <div className="flex flex-col gap-6">
              <Heading title="Как с вами связаться" hint="Курьер позвонит по этому номеру перед доставкой" />

              <Field label="Имя и фамилия" required error={c.errors.customerName}>
                <input
                  type="text"
                  value={c.customerName}
                  onChange={(e) => c.setCustomerName(e.target.value)}
                  placeholder="Например, Азиза Каримова"
                  className={inputCls(c.errors.customerName)}
                />
              </Field>

              <Field label="Номер телефона" required error={c.errors.customerPhone}>
                <div
                  className={`flex h-[54px] items-center overflow-hidden rounded-[10px] border-[1.5px] bg-white ${
                    c.errors.customerPhone ? "border-[#E5484D]" : "border-[#E2E2E8]"
                  }`}
                >
                  <span className="flex h-full items-center border-r-[1.5px] border-[#E2E2E8] bg-[#FAFAFB] px-4 text-[16px] font-semibold text-[#6B6B75]">
                    +998
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={c.customerPhone}
                    onChange={(e) => c.setCustomerPhone(applyPhoneMask(e.target.value))}
                    placeholder="XX XXX XX XX"
                    className="h-full min-w-0 flex-1 px-4 text-[16px] text-[#1A1A1A] outline-none placeholder:text-[#9F9F9F]"
                  />
                </div>
              </Field>

              <Field label="Комментарий к заказу">
                <input
                  type="text"
                  value={c.notes}
                  onChange={(e) => c.setNotes(e.target.value)}
                  placeholder="Не обязательно"
                  className={inputCls()}
                />
              </Field>
            </div>
          )}

          {/* ---- Step 2 ---- */}
          {c.step === 2 && (
            <div className="flex flex-col gap-6">
              <Heading title="Куда доставить" hint="Стоимость доставки появится после выбора адреса" />

              <div className="flex flex-col gap-3">
                <span className="text-[14px] font-semibold text-[#333333]">
                  Служба доставки <span className="text-[#E5484D]">*</span>
                </span>

                <RadioCard
                  selected={c.carrier === "bts"}
                  onClick={() => c.setCarrier("bts")}
                  title="BTS — по Узбекистану"
                  subtitle="До двери или до пункта выдачи"
                />
                <RadioCard
                  selected={c.carrier === "btsFergana"}
                  onClick={() => c.setCarrier("btsFergana")}
                  title="Курьер по Фергане"
                  subtitle="Быстрая доставка внутри города"
                />
              </div>

              {c.isFergana ? (
                <Field label="Адрес в Фергане" required error={c.errors.ferganaAddress}>
                  <input
                    type="text"
                    value={c.ferganaAddress}
                    onChange={(e) => c.setFerganaAddress(e.target.value)}
                    placeholder="Улица, дом, ориентир"
                    className={inputCls(c.errors.ferganaAddress)}
                  />
                </Field>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex h-[52px] items-center gap-1 rounded-[10px] bg-[#F4F4F6] p-1">
                    {(["door", "pickup"] as const).map((m) => {
                      const on = c.deliveryMethod === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => c.setDeliveryMethod(m)}
                          className={`h-11 flex-1 cursor-pointer rounded-lg text-[14px] font-semibold transition-colors ${
                            on ? "bg-white text-[#1A1A1A] shadow-[0_1px_3px_rgba(16,16,24,0.14)]" : "text-[#6B6B75]"
                          }`}
                        >
                          {m === "door" ? "До двери" : "До пункта выдачи"}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Область" required error={c.errors.region}>
                      <Select
                        value={c.region}
                        error={Boolean(c.errors.region)}
                        placeholder="Выберите область"
                        options={c.regionOptions}
                        onChange={(v) => {
                          c.setRegion(v);
                          c.setVillage("");
                          c.setBranchId("");
                        }}
                      />
                    </Field>

                    <Field label="Район / город" required error={c.errors.village}>
                      <Select
                        value={c.village}
                        error={Boolean(c.errors.village)}
                        placeholder={c.region ? "Выберите район" : "Сначала область"}
                        disabled={!c.region}
                        options={c.districtOptions}
                        onChange={(v) => {
                          c.setVillage(v);
                          c.setBranchId("");
                        }}
                      />
                    </Field>
                  </div>

                  {c.deliveryMethod === "door" ? (
                    <Field label="Улица, дом, квартира" required error={c.errors.streetAddress}>
                      <input
                        type="text"
                        value={c.streetAddress}
                        onChange={(e) => c.setStreetAddress(e.target.value)}
                        placeholder="Например, улица Себзар, 14, кв. 22"
                        className={inputCls(c.errors.streetAddress)}
                      />
                    </Field>
                  ) : (
                    <Field label="Пункт выдачи BTS" required error={c.errors.branch}>
                      <Select
                        value={c.branchId}
                        error={Boolean(c.errors.branch)}
                        placeholder={
                          c.branches.length ? "Выберите пункт выдачи" : "Нет пунктов в этом районе"
                        }
                        disabled={!c.branches.length}
                        options={c.branches.map((b) => ({ value: b.id, label: b.name }))}
                        onChange={c.setBranchId}
                      />
                      {c.selectedBranch && (
                        <div className="mt-3 flex items-start gap-2.5 rounded-[10px] bg-[#F7F2FA] px-4 py-3.5">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8814B1" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                            <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
                            <circle cx="12" cy="10" r="2.6" />
                          </svg>
                          <span className="text-[13px] leading-[21px] text-[#6B6B75]">
                            {c.selectedBranch.address}
                          </span>
                        </div>
                      )}
                    </Field>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ---- Step 3 ---- */}
          {c.step === 3 && (
            <div className="flex flex-col gap-6">
              <Heading title="Как будете платить" hint="Оплата по QR подтверждается вручную после перевода" />

              <div className="flex flex-col gap-3">
                <RadioCard
                  selected={c.paymentMethod === "cash"}
                  onClick={() => c.setPaymentMethod("cash")}
                  title="Наличными при получении"
                  subtitle="Платите курьеру или в пункте выдачи"
                  icon="cash"
                />
                <RadioCard
                  selected={c.paymentMethod === "qr"}
                  onClick={() => c.setPaymentMethod("qr")}
                  title="Перевод по QR-коду"
                  subtitle="UzQR, Payme или Paynet — код откроется после оформления"
                  icon="qr"
                />
                <RadioCard
                  selected={c.paymentMethod === "payme"}
                  onClick={() => c.setPaymentMethod("payme")}
                  title="Payme"
                  subtitle="Оплата картой на странице Payme"
                  icon="card"
                />
              </div>
            </div>
          )}

          {/* ---- Nav ---- */}
          <div className="flex items-center gap-3 pt-8">
            {c.step > 1 && (
              <button
                type="button"
                onClick={c.back}
                className="h-14 cursor-pointer rounded-xl border-[1.5px] border-[#E2E2E8] bg-white px-7 text-[16px] font-semibold text-[#333333] transition-colors hover:border-[#C9C9D2]"
              >
                Назад
              </button>
            )}
            <button
              type="button"
              onClick={c.next}
              disabled={c.isSubmitting}
              className="h-14 flex-1 cursor-pointer rounded-xl bg-[#8814B1] text-[16px] font-bold text-white transition-colors hover:bg-[#6E1090] disabled:opacity-60"
            >
              {c.isSubmitting
                ? "Оформляем…"
                : c.step === 1
                  ? "Продолжить"
                  : c.step === 2
                    ? "Перейти к оплате"
                    : "Оформить заказ"}
            </button>
          </div>
        </div>

        {/* ---------------- Summary ---------------- */}
        <aside className="flex w-full shrink-0 flex-col gap-4 desk:sticky desk:top-24 desk:w-[400px]">
          <div className="rounded-[14px] border border-[#ECECEF] bg-white p-6 desk:p-7">
            <h2 className="mb-5 text-[19px] font-bold leading-[25px] text-[#1A1A1A]">Ваш заказ</h2>

            <div className="flex flex-col gap-4">
              {cartItems.map((item) => {
                const color = item.product.colors?.find((cc) => cc.name === item.color);
                const base = color
                  ? isDarkColor(color.hex)
                    ? "/black-t-shirt.webp"
                    : "/white-t-shirt.webp"
                  : item.product.image || "/white-t-shirt.webp";
                const photo = photoForPrint(catalog, item.print);

                return (
                  <div key={item.id} className="flex items-center gap-3.5">
                    <div className="relative flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F4F4F6]">
                      {photo ? (
                        <Image
                          src={cld(photo, 150)}
                          alt=""
                          fill
                          sizes="48px"
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <PrintOnShirt base={base} print={item.print} alt="" className="h-[52px]" />
                      )}
                      <span className="absolute -right-1.5 -top-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white bg-[#8814B1] text-[11px] font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="truncate text-[14px] font-semibold text-[#1A1A1A]">
                        {item.print ? getTranslated(item.print, lang) || item.print.name : getTranslated(item.product, lang)}
                      </span>
                      <span className="text-[12px] text-[#9F9F9F]">
                        {color ? getTranslated(color, lang) || color.name : ""} · {item.size}
                      </span>
                    </div>
                    <span className="shrink-0 text-[14px] font-semibold text-[#1A1A1A]">
                      {money(item.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="my-5 h-px bg-[#ECECEF]" />

            <div className="flex flex-col gap-3.5">
              <SummaryRow label={`Товары (${cartItems.length})`} value={`${money(c.subtotal)} сум`} />
              {c.productsDiscount > 0 && (
                <SummaryRow
                  label="Скидка"
                  value={`−${money(c.productsDiscount)} сум`}
                  valueClass="text-[#1E9E5A]"
                />
              )}
              <SummaryRow
                label="Доставка"
                value={
                  !c.deliveryReady
                    ? "после выбора адреса"
                    : c.currentDeliveryPrice === 0
                      ? "бесплатно"
                      : `${money(c.currentDeliveryPrice)} сум`
                }
                valueClass={
                  !c.deliveryReady
                    ? "text-[13px] font-normal text-[#9F9F9F]"
                    : c.currentDeliveryPrice === 0
                      ? "text-[#1E9E5A]"
                      : ""
                }
              />
            </div>

            <div className="my-5 h-px bg-[#ECECEF]" />

            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[16px] font-semibold text-[#1A1A1A]">К оплате</span>
              <span className="text-[27px] font-extrabold leading-[33px] text-[#1A1A1A]">
                {money(c.finalTotal)}
                <span className="text-[14px] font-semibold text-[#9F9F9F]"> сум</span>
              </span>
            </div>
          </div>
        </aside>
      </div>

      <QrPaymentModal
        isOpen={c.qrOpen}
        onClose={() => c.setQrOpen(false)}
        onPaid={c.placeOrder}
        isSubmitting={c.isSubmitting}
        amount={c.finalTotal}
        currency={c.t.currency}
        t={c.t}
      />
    </div>
  );
}

/* ------------------------------- primitives ------------------------------ */

function inputCls(error?: string) {
  return `h-[54px] w-full rounded-[10px] border-[1.5px] px-4 text-[16px] text-[#1A1A1A] outline-none transition-colors placeholder:text-[#9F9F9F] focus:border-[#8814B1] ${
    error ? "border-[#E5484D]" : "border-[#E2E2E8]"
  }`;
}

function Heading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-[22px] font-extrabold leading-7 tracking-[-0.015em] text-[#1A1A1A] desk:text-[26px] desk:leading-8">
        {title}
      </h1>
      <p className="text-[15px] leading-6 text-[#9F9F9F]">{hint}</p>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="text-[14px] font-semibold text-[#333333]">
        {label} {required && <span className="text-[#E5484D]">*</span>}
      </span>
      {children}
      {error && <span className="text-[13px] font-medium text-[#E5484D]">{error}</span>}
    </label>
  );
}

function SummaryRow({
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

function RadioCard({
  selected,
  onClick,
  title,
  subtitle,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  icon?: "cash" | "qr" | "card";
}) {
  const icons: Record<string, React.ReactNode> = {
    cash: (
      <>
        <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
        <circle cx="12" cy="12" r="2.8" />
      </>
    ),
    qr: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.4" />
        <rect x="14" y="3" width="7" height="7" rx="1.4" />
        <rect x="3" y="14" width="7" height="7" rx="1.4" />
        <path d="M14 14h3v3h-3zM20 14v3M14 20h3" />
      </>
    ),
    card: (
      <>
        <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
        <path d="M2.5 10h19" />
      </>
    ),
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex cursor-pointer items-center gap-4 rounded-xl border-[1.5px] p-4 text-left transition-colors desk:px-5 ${
        selected ? "border-[#8814B1] bg-[#FCF9FD]" : "border-[#E2E2E8] bg-white hover:border-[#C9C9D2]"
      }`}
    >
      <span
        className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-2 bg-white"
        style={{ borderColor: selected ? "#8814B1" : "#D8D8DE" }}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-[#8814B1]" />}
      </span>

      {icon && (
        <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[#F4F4F6] sm:flex">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {icons[icon]}
          </svg>
        </span>
      )}

      <span className="flex flex-1 flex-col gap-1">
        <span className="text-[15px] font-bold text-[#1A1A1A] desk:text-[16px]">{title}</span>
        <span className="text-[13px] leading-5 text-[#9F9F9F] desk:text-[14px]">{subtitle}</span>
      </span>
    </button>
  );
}

function Select({
  value,
  options,
  placeholder,
  onChange,
  disabled,
  error,
}: {
  value: string;
  options: { value: string; label: string }[];
  placeholder: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`h-[54px] w-full cursor-pointer appearance-none rounded-[10px] border-[1.5px] bg-white px-4 pr-11 text-[16px] outline-none transition-colors focus:border-[#8814B1] disabled:cursor-not-allowed disabled:bg-[#FAFAFB] disabled:text-[#9F9F9F] ${
          error ? "border-[#E5484D]" : "border-[#E2E2E8]"
        } ${value ? "text-[#1A1A1A]" : "text-[#9F9F9F]"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-[#1A1A1A]">
            {o.label}
          </option>
        ))}
      </select>
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9F9F9F"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
