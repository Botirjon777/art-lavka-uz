/**
 * Compresses public/ static images to WebP and reports savings.
 *
 * Skips:
 *  - art-lavka-square.png  → used as OG meta image; social crawlers need PNG/JPG
 *  - art-lavka.png         → 8 KB, not worth the format switch
 *  - Anything already .webp
 *  - public/uploads/       → generated at runtime by the upload pipeline
 *
 * Outputs compressed .webp files next to their originals.
 * Originals are kept (the build still references them as fallbacks).
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";

const PUBLIC_DIR = path.join(process.cwd(), "public");

// [source, outputBasename, quality, maxWidthPx]
const TARGETS: [string, string, number, number | null][] = [
  // ── Root backgrounds ────────────────────────────────────────────────────────
  ["configurator-bg.png",   "configurator-bg.webp",   80, null],
  ["conf-bg.png",           "conf-bg.webp",            80, null],
  ["t-shirt.png",           "t-shirt.webp",            85, 800],
  ["cart-item.png",         "cart-item.webp",          85, 400],

  // ── Payment icons (small) ────────────────────────────────────────────────────
  ["payment-method/uzcard.png",  "payment-method/uzcard.webp",  90, 200],
  ["payment-method/humo.png",    "payment-method/humo.webp",    90, 200],
  ["payment-method/pay-me.png",  "payment-method/pay-me.webp",  90, 200],
];

// ── Prints & products: all PNGs in these dirs ─────────────────────────────────
const AUTO_DIRS: [string, number, number | null][] = [
  ["prints",   85, null],
  ["products", 85, 800],
];

async function compressFile(
  src: string,
  dest: string,
  quality: number,
  maxWidth: number | null
): Promise<{ originalKB: number; outputKB: number }> {
  const img = sharp(src);
  if (maxWidth) {
    img.resize({ width: maxWidth, withoutEnlargement: true });
  }
  await img.webp({ quality, effort: 6 }).toFile(dest);
  const originalKB = fs.statSync(src).size / 1024;
  const outputKB = fs.statSync(dest).size / 1024;
  return { originalKB, outputKB };
}

async function main() {
  console.log("🗜️  Compressing public/ static assets to WebP…\n");

  let totalOrigKB = 0;
  let totalOutKB  = 0;
  let count = 0;

  const process_ = async (srcRel: string, destRel: string, quality: number, maxWidth: number | null) => {
    const src  = path.join(PUBLIC_DIR, srcRel);
    const dest = path.join(PUBLIC_DIR, destRel);

    if (!fs.existsSync(src)) {
      console.warn(`  ⚠️  Not found, skipping: ${srcRel}`);
      return;
    }

    // Don't re-compress if WebP already up to date
    if (
      fs.existsSync(dest) &&
      fs.statSync(dest).mtimeMs >= fs.statSync(src).mtimeMs
    ) {
      console.log(`  ✓  Already up to date: ${destRel}`);
      return;
    }

    const { originalKB, outputKB } = await compressFile(src, dest, quality, maxWidth);
    const saving = (((originalKB - outputKB) / originalKB) * 100).toFixed(1);

    console.log(`  ✅  ${srcRel}`);
    console.log(`      ${originalKB.toFixed(0)} KB → ${outputKB.toFixed(0)} KB  (${saving}% saved)`);

    totalOrigKB += originalKB;
    totalOutKB  += outputKB;
    count++;
  };

  // Explicit targets
  for (const [src, dest, q, w] of TARGETS) {
    await process_(src, dest, q, w);
  }

  // Auto-scan dirs
  for (const [dir, q, w] of AUTO_DIRS) {
    const dirPath = path.join(PUBLIC_DIR, dir);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter(
      (f) =>
        /\.(png|jpg|jpeg)$/i.test(f) &&
        fs.statSync(path.join(dirPath, f)).isFile()
    );

    for (const file of files) {
      const base = path.parse(file).name;
      await process_(`${dir}/${file}`, `${dir}/${base}.webp`, q, w);
    }
  }

  const saved = totalOrigKB - totalOutKB;
  console.log("\n─────────────────────────────────────────");
  console.log(`🏁 Done: ${count} files compressed`);
  console.log(`   Total saved: ${(saved / 1024).toFixed(2)} MB  (${(( saved / totalOrigKB) * 100).toFixed(1)}%)`);
  console.log("─────────────────────────────────────────");
  console.log("\nNext steps:");
  console.log("  • globals.css bg-image already updated to use configurator-bg.webp");
  console.log("  • payment-method icons: update MenuModal to use .webp with <picture> or direct .webp src");
  console.log("  • t-shirt.webp / cart-item.webp: swap any <Image src> in components");
}

main().catch((err) => {
  console.error("💥 Fatal:", err);
  process.exit(1);
});
