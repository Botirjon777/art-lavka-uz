"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";
import { usePrintCategories } from "@/features/client/home/hooks/usePrintCategories";
import { useProducts } from "@/features/client/home/hooks/useProducts";
import ProductTile from "../components/ProductTile";
import PrintOnShirt from "../components/PrintOnShirt";
import { useCatalog, type CatalogEntry } from "../hooks/useCatalog";
import { pickPreviewProduct } from "../lib/catalog";
import { COLLECTION_GRADIENTS, GRAIN_URL, HERO_BLOBS } from "../tokens";

export default function HomeView() {
  const { lang } = useLanguageStore();

  const { data: catalog = [], isLoading } = useCatalog();
  const { data: categories = [] } = usePrintCategories();
  const { data: products = [] } = useProducts();

  const previewProduct = pickPreviewProduct(products);

  // Newest first, by the shop's own design numbering.
  const byNewest = useMemo(
    () => [...catalog].sort((a, b) => (b.code || "").localeCompare(a.code || "")),
    [catalog]
  );

  // Only entries that actually have a photographed shot can carry the hero and
  // the how-it-works art; the composed fallback is for grid tiles.
  const shot = useMemo(() => byNewest.filter((e) => e.photo), [byNewest]);

  const featured = byNewest.slice(0, 4);
  // The shop picks which designs front the page; anything missing falls back
  // to the newest entries so the layout is never short.
  const pickNamed = useMemo(() => {
    return (names: string[], count: number) => {
      const chosen = names
        .map((n) => shot.find((e) => e.name.toLowerCase().includes(n)))
        .filter((e): e is CatalogEntry => Boolean(e));
      const filler = shot.filter((e) => !chosen.includes(e));
      return [...chosen, ...filler].slice(0, count);
    };
  }, [shot]);

  const heroShots = useMemo(() => pickNamed(["scooter", "lola", "bike"], 3), [pickNamed]);
  const stepShots = useMemo(
    () => pickNamed(["scooter", "lola", "bike", "ajdar"], 4),
    [pickNamed]
  );

  const totalPrints = catalog.length;

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="mx-auto flex max-w-[1328px] flex-col items-center gap-12 px-4 pb-16 pt-12 desk:flex-row desk:gap-14 desk:px-6 desk:pb-24 desk:pt-[76px]">
        <div className="flex w-full flex-col items-start gap-6 desk:w-[620px]">
          <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#8814B1]">
            Авторские принты · Узбекистан
          </span>

          <h1 className="text-balance text-[38px] font-extrabold leading-[44px] tracking-[-0.022em] text-[#1A1A1A] desk:text-[58px] desk:leading-[64px]">
            Носи то, что нарисовано здесь
          </h1>

          <p className="max-w-[512px] text-pretty text-[16px] leading-7 text-[#6B6B75] desk:text-[18px] desk:leading-[30px]">
            Принты узбекистанских художников на футболках, которые ты собираешь сам — цвет, размер,
            принт. И смотришь в 3D перед покупкой.
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:gap-3.5">
            <Link
              href="/v2/market"
              className="flex h-14 items-center justify-center rounded-full bg-[#8814B1] px-9 text-[16px] font-bold text-white transition-colors hover:bg-[#6E1090]"
            >
              Перейти в маркет
            </Link>
            <Link
              href="/v2/market"
              className="flex h-14 items-center justify-center gap-2.5 rounded-full border-[1.5px] border-[#E2E2E8] bg-white px-7 text-[16px] font-semibold text-[#1A1A1A] transition-colors hover:border-[#B9B9C4]"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#00C6F1" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3 4 7.2v9.6L12 21l8-4.2V7.2Z" />
                <path d="m4 7.2 8 4.3 8-4.3" />
                <path d="M12 11.5V21" />
              </svg>
              Собрать в 3D
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3">
            {totalPrints > 0 && (
              <>
                <span className="text-[14px] font-medium text-[#9F9F9F]">
                  {totalPrints} принтов в каталоге
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-[#D8D8DE] sm:block" />
              </>
            )}
            <span className="text-[14px] font-medium text-[#9F9F9F]">
              Доставка BTS по всему Узбекистану
            </span>
          </div>
        </div>

        <HeroCarousel shots={heroShots} />
      </section>

      {/* ============================ COLLECTIONS ============================ */}
      {categories.length > 0 && (
        <section className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 pb-16 desk:px-6 desk:pb-24">
          {/* Fixed-size tiles in a wrapping row rather than a column grid: the
              number of collections is whatever the admin has created, and a
              fixed column count turns 3 categories into three huge squares. */}
          <div className="flex flex-wrap justify-center gap-3 desk:gap-4">
            {categories.slice(0, 8).map((cat, i) => (
              <Link
                key={cat._id}
                href="/v2/market"
                className="group relative flex h-50 w-50 items-center justify-center overflow-hidden rounded-[18px] p-5 transition-transform duration-300 hover:-translate-y-0.5 desk:h-54 desk:w-54"
              >
                {/* Oversized + blurred so the wash reads as diffuse light
                    rather than a hard CSS gradient; the tile clips the edges. */}
                <span
                  aria-hidden="true"
                  className="absolute -inset-10 blur-2xl"
                  style={{ backgroundImage: COLLECTION_GRADIENTS[i % COLLECTION_GRADIENTS.length] }}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-overlay"
                  style={{ backgroundImage: GRAIN_URL }}
                />
                <span className="relative text-center text-[16px] font-bold leading-[22px] text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]">
                  {getTranslated(cat, lang) || cat.name}
                </span>
                {cat.printCount > 0 && (
                  <span className="absolute bottom-3 right-4 text-[12px] font-semibold text-white/60">
                    {cat.printCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="flex justify-center">
            <Link
              href="/v2/market"
              className="flex h-14 min-w-[280px] items-center justify-center rounded-[10px] bg-[#1A1A1A] px-10 text-[15px] font-bold text-white transition-colors hover:bg-black desk:min-w-[360px]"
            >
              Все коллекции
            </Link>
          </div>
        </section>
      )}

      {/* ============================ NEW IN MARKET ============================ */}
      <section className="mx-auto flex max-w-[1328px] flex-col gap-10 px-4 pb-16 desk:gap-11 desk:px-6 desk:pb-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-[30px] font-extrabold leading-9 tracking-[-0.02em] text-[#1A1A1A] desk:text-[44px] desk:leading-[52px]">
            Новинки маркета
          </h2>
          <p className="max-w-[620px] text-pretty text-[16px] leading-7 text-[#6B6B75] desk:text-[17px] desk:leading-7">
            Готовые сочетания принта и футболки — бери как есть или пересобери под себя
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 desk:grid-cols-4 desk:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="aspect-square animate-pulse rounded-[14px] bg-[#F4F4F6]" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-[#F4F4F6]" />
                <div className="h-5 w-1/2 animate-pulse rounded bg-[#F4F4F6]" />
              </div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 desk:grid-cols-4 desk:gap-6">
            {featured.map((entry, i) => (
              <ProductTile
                key={entry.id}
                entry={entry}
                product={previewProduct}
                priority={i < 2}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-[15px] text-[#9F9F9F]">
            Принты пока не добавлены — они появятся здесь автоматически.
          </p>
        )}

        <div className="flex justify-center pt-1">
          <Link
            href="/v2/market"
            className="flex h-14 min-w-[280px] items-center justify-center rounded-[10px] bg-[#1A1A1A] px-10 text-[15px] font-bold text-white transition-colors hover:bg-black desk:min-w-[360px]"
          >
            Перейти в маркет
          </Link>
        </div>
      </section>

      {/* ============================ HOW IT WORKS ============================ */}
      <section className="bg-[#FAFAFB] py-16 desk:py-24">
        <div className="mx-auto flex max-w-[1328px] flex-col gap-11 px-4 desk:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-[30px] font-extrabold leading-9 tracking-[-0.02em] text-[#1A1A1A] desk:text-[44px] desk:leading-[52px]">
              Как это работает
            </h2>
            <p className="text-[16px] leading-7 text-[#6B6B75] desk:text-[17px]">
              Три шага от идеи до посылки
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Step
              index="01"
              bg="#8814B1"
              numberColor="rgba(255,255,255,0.22)"
              title="Выбери принт"
              body="Работы художников со всей страны — по коллекциям"
            >
              <div className="grid grid-cols-2 gap-3.5">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="flex h-[92px] w-[92px] items-center justify-center overflow-hidden rounded-xl p-1.5"
                    style={{ background: i === 1 ? "#ffffff" : "rgba(255,255,255,0.18)" }}
                  >
                    {stepShots[i]?.print?.frontImage && (
                      // eslint-disable-next-line @next/next/no-img-element -- decorative thumbnail
                      <img
                        src={stepShots[i].print.frontImage}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-contain"
                      />
                    )}
                  </span>
                ))}
              </div>
            </Step>

            <Step
              index="02"
              bg="#D2F4FD"
              numberColor="rgba(14,79,97,0.16)"
              title="Собери футболку"
              body="Цвет, размер, принт — и поворот в 3D, чтобы увидеть результат"
            >
              <div className="flex flex-col items-center gap-5">
                <PrintOnShirt
                  base="/white-t-shirt.webp"
                  print={stepShots[0]?.print ?? null}
                  alt=""
                  className="h-[168px]"
                  printScale={0.62}
                />
                <div className="flex items-center gap-2.5">
                  {["#FFFFFF", "#1A1A1A", "#8814B1", "#C9AE8C"].map((hex, i) => (
                    <span
                      key={hex}
                      className="h-[30px] w-[30px] rounded-full"
                      style={{
                        background: hex,
                        border: i === 0 ? "1.5px solid #C7E7F1" : "none",
                        boxShadow: i === 1 ? "0 0 0 3px #ffffff, 0 0 0 5px #00C6F1" : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
            </Step>

            <Step
              index="03"
              bg="#ECECEF"
              numberColor="rgba(26,26,26,0.12)"
              title="Получи доставку"
              body="BTS до двери или до пункта выдачи. Наличными или по QR"
            >
              <div className="flex flex-col items-center gap-4">
                <svg width="116" height="116" viewBox="0 0 100 100" fill="none" stroke="#1A1A1A" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 36 50 20l36 16v34L50 86 14 70Z" />
                  <path d="m14 36 36 16 36-16M50 52v34" />
                </svg>
                <span className="flex h-[34px] items-center gap-2 rounded-full bg-white px-4">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8814B1" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 5 5L19 7" />
                  </svg>
                  <span className="text-[13px] font-semibold text-[#1A1A1A]">
                    3–5 дней по Узбекистану
                  </span>
                </span>
              </div>
            </Step>
          </div>
        </div>
      </section>
    </>
  );
}

/** A gradient backdrop wash in the hero collage. Blurred rather than a hard
    disc, so the garments sit in diffuse light instead of on flat circles. */
function Blob({ gradient, className }: { gradient: string; className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute rounded-full blur-2xl ${className}`}
      style={{ backgroundImage: gradient }}
    />
  );
}

/**
 * The three hero slots. Each garment advances one slot on every tick, so all
 * three take a turn in the centre — the centre one is the largest and sits on
 * top, the outer two step back.
 */
const HERO_SLOTS = [
  { left: "5%", top: "28%", width: "34%", z: 10, opacity: 0.94 },
  { left: "32%", top: "0%", width: "40%", z: 20, opacity: 1 },
  { left: "62%", top: "32%", width: "32%", z: 10, opacity: 0.94 },
];

const ROTATE_MS = 3800;

function HeroCarousel({ shots }: { shots: CatalogEntry[] }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (shots.length < 2) return;
    // Anyone who has asked for less motion gets the static composition.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const id = window.setInterval(() => setTick((t) => t + 1), ROTATE_MS);
    return () => window.clearInterval(id);
  }, [shots.length]);

  return (
    <div className="relative h-[340px] w-full max-w-[604px] desk:h-[452px]">
      <Blob gradient={HERO_BLOBS[0]} className="left-[4%] top-[29%] h-[50%] w-[38%]" />
      <Blob gradient={HERO_BLOBS[1]} className="left-[30%] top-[1%] h-[59%] w-[44%]" />
      <Blob gradient={HERO_BLOBS[2]} className="left-[61%] top-[33%] h-[47%] w-[35%]" />

      {shots.map((entry, i) => {
        // +1 so the first named design (Scooter) opens in the centre slot.
        const slot = HERO_SLOTS[(i + 1 + tick) % HERO_SLOTS.length];
        return (
          <span
            key={entry.id}
            className="absolute flex justify-center transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
            style={{
              left: slot.left,
              top: slot.top,
              width: slot.width,
              zIndex: slot.z,
              opacity: slot.opacity,
            }}
          >
            <PrintOnShirt
              base="/white-t-shirt.webp"
              print={entry.print}
              alt=""
              className="w-full"
              printScale={0.62}
              priority={i === 0}
            />
          </span>
        );
      })}
    </div>
  );
}

function Step({
  index,
  bg,
  numberColor,
  title,
  body,
  children,
}: {
  index: string;
  bg: string;
  numberColor: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div
        className="relative flex h-[300px] items-center justify-center overflow-hidden rounded-[20px]"
        style={{ background: bg }}
      >
        <span
          className="absolute left-6 top-5 text-[68px] font-extrabold leading-[68px]"
          style={{ color: numberColor }}
        >
          {index}
        </span>
        {children}
      </div>
      <div className="flex flex-col gap-2.5 px-3 text-center">
        <h3 className="text-[21px] font-bold leading-[27px] text-[#1A1A1A]">{title}</h3>
        <p className="text-pretty text-[15px] leading-6 text-[#6B6B75]">{body}</p>
      </div>
    </div>
  );
}
