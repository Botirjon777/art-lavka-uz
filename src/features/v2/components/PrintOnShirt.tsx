"use client";

import Image from "next/image";
import { PrintDesign } from "@/types";
import { printImage } from "../lib/catalog";

/** Intrinsic size of the garment cut-outs in /public. */
const SHIRT_W = 416;
const SHIRT_H = 521;

/** Perceived brightness — same test v1 uses to pick a garment placeholder. */
export function isDarkColor(hex: string): boolean {
  const h = (hex || "").replace("#", "");
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

interface PrintOnShirtProps {
  /** Garment image. Pass the real product photo, or a colour placeholder. */
  base: string;
  print: PrintDesign | null;
  alt: string;
  /**
   * Sizing is the CALLER's job — pass a height (`h-[92px]`, `h-[86%]`) or a
   * width (`w-full`). The box always keeps the garment's aspect ratio, so the
   * overlay's percentage offsets land on the same spot at any size, and the
   * box can never force its container wider than the viewport.
   */
  className?: string;
  /** Print width as a share of the garment width. */
  printScale?: number;
  /** Vertical centre of the print, as a share of garment height. */
  printTop?: number;
  priority?: boolean;
}

/**
 * The 2D product preview: a garment photo with the print composited onto the
 * chest. This is what the market grid and the product page show before anyone
 * opts into 3D — one <img> pair instead of a WebGL context per card.
 */
export default function PrintOnShirt({
  base,
  print,
  alt,
  className = "",
  printScale = 0.56,
  printTop = 0.41,
  priority = false,
}: PrintOnShirtProps) {
  const artwork = printImage(print);

  return (
    <span
      className={`relative block max-w-full ${className}`}
      style={{ aspectRatio: `${SHIRT_W} / ${SHIRT_H}` }}
    >
      <Image
        src={base}
        alt={alt}
        width={SHIRT_W}
        height={SHIRT_H}
        priority={priority}
        sizes="(max-width: 1023px) 50vw, 320px"
        className="h-full w-full object-contain"
      />

      {artwork && (
        <span
          className="pointer-events-none absolute"
          style={{
            left: "50%",
            top: `${printTop * 100}%`,
            transform: "translate(-50%, -50%)",
            width: `${printScale * 100}%`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative
              overlay: already a Cloudinary-sized asset, and next/image would add
              a second optimisation hop for a few hundred bytes. */}
          <img
            src={artwork}
            alt=""
            aria-hidden="true"
            className="block h-auto w-full object-contain"
          />
        </span>
      )}
    </span>
  );
}
