import { Product, ProductColor, ProductVariant, PrintDesign } from "@/types";

/**
 * v2 models a catalogue entry as a PRINT previewed on a garment, which is what
 * the data actually is: `Print` carries the artwork, `Product` carries the
 * blank (colours, sizes, stock, price, .glb model). A "listing" is the pair.
 */

/** Normalises the `_id` / `id` duality the API responses carry. */
export function idOf(entity: { id?: string; _id?: string } | null | undefined): string {
  if (!entity) return "";
  return (entity.id || entity._id || "").toString();
}

/** Variants that can actually be bought right now. */
export function inStockVariants(color: ProductColor | undefined): ProductVariant[] {
  return (color?.variants || []).filter((v) => v.stock > 0);
}

/** First colour that has any stock, falling back to the first colour at all. */
export function firstAvailableColor(product: Product | null | undefined): ProductColor | undefined {
  const colors = product?.colors || [];
  return colors.find((c) => (c.variants || []).some((v) => v.stock > 0)) || colors[0];
}

/**
 * Price for a specific colour + size, mirroring how v1's configurator resolves
 * it: the variant wins, the product-level price is only a fallback.
 */
export function variantPrice(
  product: Product,
  color: ProductColor | undefined,
  size: string
): { price: number; oldPrice?: number } {
  const variant = (color?.variants || []).find((v) => v.size === size);
  if (!variant) {
    return { price: product.promoPrice ?? product.price, oldPrice: product.oldPrice };
  }
  const price = variant.promoPrice ?? variant.price;
  const oldPrice = variant.oldPrice ?? (variant.promoPrice ? variant.price : undefined);
  return { price, oldPrice };
}

/** Cheapest buyable price across every colour/size — used on grid tiles. */
export function fromPrice(product: Product | null | undefined): { price: number; oldPrice?: number } {
  if (!product) return { price: 0 };

  let best: { price: number; oldPrice?: number } | null = null;

  for (const color of product.colors || []) {
    for (const variant of color.variants || []) {
      if (variant.stock <= 0) continue;
      const price = variant.promoPrice ?? variant.price;
      const oldPrice = variant.oldPrice ?? (variant.promoPrice ? variant.price : undefined);
      if (!best || price < best.price) best = { price, oldPrice };
    }
  }

  return best ?? { price: product.promoPrice ?? product.price, oldPrice: product.oldPrice };
}

/** Total sellable stock for a colour + size pair. */
export function stockFor(color: ProductColor | undefined, size: string): number {
  return (color?.variants || []).find((v) => v.size === size)?.stock ?? 0;
}

/**
 * Chooses which blank to preview a print on. Honours `isDefault` first, then a
 * requested garment category, then simply the first product available.
 */
export function pickPreviewProduct(
  products: Product[],
  category?: string
): Product | undefined {
  if (!products.length) return undefined;

  if (category && category !== "all") {
    const inCategory = products.filter((p) => p.category === category);
    if (inCategory.length) {
      return inCategory.find((p) => p.isDefault) || inCategory[0];
    }
    return undefined;
  }

  return products.find((p) => p.isDefault) || products[0];
}

/**
 * The image to composite onto a garment.
 *
 * `frontImage` (PNG, transparent) — NOT `frontImagePreview`, which is a JPEG
 * and therefore carries an opaque white box that renders as a sticker on top
 * of the shirt. The preview is only safe on a solid white background.
 */
export function printImage(print: PrintDesign | null | undefined): string | null {
  if (!print) return null;
  return print.frontImage || null;
}

/** Garment categories that the admin has switched on, in a stable order. */
export function activeGarmentCategories(
  products: Product[],
  categoryStatuses?: Record<string, string>
): string[] {
  const order = ["women", "men", "kids"];
  const present = new Set(products.map((p) => p.category));
  return order.filter((cat) => {
    if (!present.has(cat)) return false;
    if (!categoryStatuses) return true;
    return categoryStatuses[cat] !== "hidden" && categoryStatuses[cat] !== "inactive";
  });
}
