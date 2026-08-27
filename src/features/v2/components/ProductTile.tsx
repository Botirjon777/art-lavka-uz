"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Product } from "@/types";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";
import { firstAvailableColor, fromPrice } from "../lib/catalog";
import { SHOT_ASPECT, cld } from "../lib/images";
import type { CatalogEntry } from "../hooks/useCatalog";
import { STAGE_3D, money } from "../tokens";
import PrintOnShirt, { isDarkColor } from "./PrintOnShirt";

// The 3D scene is heavy (three.js + a .glb + an HDR). It is only ever pulled in
// when a viewer actually opts into 3D for one specific tile.
const TShirtScene = dynamic(
  () => import("@/features/client/home/components/shared/TShirtScene"),
  { ssr: false }
);

interface ProductTileProps {
  entry: CatalogEntry;
  product: Product | undefined;
  /** Whether the whole grid is in 3D mode. */
  is3d?: boolean;
  /** Whether *this* tile is the one currently rendering a live canvas. */
  isLive?: boolean;
  onGoLive?: () => void;
  priority?: boolean;
}

export default function ProductTile({
  entry,
  product,
  is3d = false,
  isLive = false,
  onGoLive,
  priority = false,
}: ProductTileProps) {
  const { lang } = useLanguageStore();

  const color = firstAvailableColor(product);
  const { price, oldPrice } = fromPrice(product);
  const discount =
    oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;

  const printName = getTranslated(entry.print, lang) || entry.name;
  const productName = product ? getTranslated(product, lang) : "";
  const href = `/v2/product/${entry.id}`;
  const has3d = Boolean(product?.model);

  return (
    <article className="group flex flex-col gap-4">
      <div
        className="relative w-full overflow-hidden rounded-[14px] transition-colors"
        style={{
          aspectRatio: SHOT_ASPECT,
          background: is3d && has3d ? STAGE_3D : "#F4F4F6",
        }}
      >
        {isLive && product?.model ? (
          <div className="absolute inset-0">
            <TShirtScene
              selectedProduct={product.model}
              productName={productName}
              selectedPrint={entry.print}
              selectedColor={color?.hex || "#FFFFFF"}
              showUI={false}
              modelScale={1.25}
              modelPosition={[0, -1, 0]}
            />
          </div>
        ) : (
          <Link href={href} className="absolute inset-0">
            {entry.photo ? (
              // The real photographed shot from the gallery.
              <Image
                src={cld(entry.photo, 700)}
                alt={`${printName} — ${productName || "футболка"}`}
                fill
                sizes="(max-width: 1023px) 50vw, 420px"
                priority={priority}
                // Next skips fetchPriority for unoptimized images, so the
                // browser flags the LCP tile as un-prioritised. Set it here.
                fetchPriority={priority ? "high" : undefined}
                unoptimized
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              // Fallback for the few prints with no photographed shot: compose
              // the artwork onto a garment cut-out.
              <span className="flex h-full w-full items-center justify-center">
                <PrintOnShirt
                  base={
                    color && isDarkColor(color.hex)
                      ? "/black-t-shirt.webp"
                      : "/white-t-shirt.webp"
                  }
                  print={entry.print}
                  alt={`${printName} — ${productName || "футболка"}`}
                  className="h-[86%]"
                  priority={priority}
                />
              </span>
            )}
          </Link>
        )}

        {has3d && (
          <span className="pointer-events-none absolute left-3 top-3 flex h-7 items-center gap-1.5 rounded-full bg-white px-[11px] text-[11px] font-bold text-[#0F2031] shadow-[0_1px_3px_rgba(16,16,24,0.12)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00C6F1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 4 7.2v9.6L12 21l8-4.2V7.2Z" />
              <path d="m4 7.2 8 4.3 8-4.3" />
              <path d="M12 11.5V21" />
            </svg>
            3D
          </span>
        )}

        {discount > 0 && (
          <span className="pointer-events-none absolute right-3 top-3 flex h-7 items-center rounded-full bg-[#8814B1] px-[11px] text-[11px] font-bold text-white">
            −{discount}%
          </span>
        )}

        {is3d && !isLive && has3d && (
          <button
            type="button"
            onClick={onGoLive}
            className="absolute bottom-3.5 left-1/2 flex h-[34px] -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full bg-white/95 px-3.5 shadow-[0_2px_8px_rgba(16,16,24,0.14)] transition-transform active:scale-95"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0F2031" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 9 9" />
              <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-9-9" />
              <path d="m18 3 3 3-3 3M6 21l-3-3 3-3" />
            </svg>
            <span className="text-[12px] font-semibold text-[#0F2031]">Покрутить</span>
          </button>
        )}
      </div>

      <Link href={href} className="flex flex-col gap-1.5">
        <span className="text-[13px] leading-4 text-[#9F9F9F] desk:text-[14px] desk:leading-[17px]">
          {productName || "Футболка"}
        </span>
        <span className="text-[14px] font-semibold text-[#1A1A1A] desk:text-[16px] desk:leading-5">
          {printName}
        </span>
        <div className="flex items-baseline gap-2.5">
          <span className="text-[17px] font-bold text-[#1A1A1A] desk:text-[20px] desk:leading-6">
            {money(price)}
            <span className="text-[11px] font-semibold text-[#9F9F9F] desk:text-[12px]"> сум</span>
          </span>
          {discount > 0 && oldPrice && (
            <span className="text-[13px] font-medium text-[#9F9F9F] line-through desk:text-[14px]">
              {money(oldPrice)}
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
