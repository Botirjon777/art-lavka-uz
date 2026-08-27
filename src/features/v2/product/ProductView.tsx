"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CartItem, Product, ProductColor } from "@/types";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";
import { useCartStore } from "@/stores/cartStore";
import { useProducts } from "@/features/client/home/hooks/useProducts";
import { usePrint } from "../hooks/usePrint";
import { useCatalog, photoForPrint } from "../hooks/useCatalog";
import { SHOT_ASPECT, cld } from "../lib/images";
import PrintOnShirt, { isDarkColor } from "../components/PrintOnShirt";
import ProductTile from "../components/ProductTile";
import {
  firstAvailableColor,
  idOf,
  inStockVariants,
  stockFor,
  variantPrice,
} from "../lib/catalog";
import { STAGE_3D, money } from "../tokens";

const TShirtScene = dynamic(
  () => import("@/features/client/home/components/shared/TShirtScene"),
  { ssr: false }
);

export default function ProductView({ printId }: { printId: string }) {
  const router = useRouter();
  const { lang } = useLanguageStore();
  const addItem = useCartStore((s) => s.addItem);

  const { data: print, isLoading: printLoading, isError } = usePrint(printId);
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: catalog = [] } = useCatalog();

  // Every selection below is stored as a *preference* and resolved against
  // what the current garment actually offers. Deriving during render (rather
  // than re-seeding from an effect) means switching garment can never leave a
  // colour, size or quantity selected that this product does not carry — and
  // there is no intermediate frame showing the stale one.
  const [productId, setProductId] = useState<string>("");
  const [colorPref, setColorPref] = useState<string>("");
  const [sizePref, setSizePref] = useState<string>("");
  const [qtyPref, setQtyPref] = useState(1);
  const [live3d, setLive3d] = useState(false);

  const product: Product | undefined = useMemo(
    () => products.find((p) => idOf(p) === productId) || products[0],
    [products, productId]
  );

  const color: ProductColor | undefined = useMemo(
    () => (product?.colors || []).find((c) => c.name === colorPref) || firstAvailableColor(product),
    [product, colorPref]
  );

  const variants = useMemo(() => color?.variants || [], [color]);

  const size = useMemo(() => {
    if (variants.some((v) => v.size === sizePref && v.stock > 0)) return sizePref;
    return inStockVariants(color)[0]?.size || variants[0]?.size || "";
  }, [variants, sizePref, color]);

  const stock = stockFor(color, size);
  const qty = Math.min(Math.max(1, qtyPref), Math.max(1, stock));
  const { price, oldPrice } = product ? variantPrice(product, color, size) : { price: 0, oldPrice: undefined };
  const discount = oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;

  const printName = print ? getTranslated(print, lang) || print.name : "";
  const productName = product ? getTranslated(product, lang) : "";

  // 2D preview: the real fabric colour only exists on the 3D model, so the flat
  // view uses the light/dark garment stand-in — the same trick v1 uses while
  // its model loads — rather than pretending a photo has recoloured.
  const flatBase = color
    ? isDarkColor(color.hex)
      ? "/black-t-shirt.webp"
      : "/white-t-shirt.webp"
    : product?.image || "/white-t-shirt.webp";

  // Same collection, from the merged catalogue so the cards carry photos too.
  const similar = useMemo(
    () =>
      catalog
        .filter((e) => e.category === print?.category && e.id !== printId)
        .slice(0, 4),
    [catalog, print, printId]
  );

  // The real photographed shot for this print, when the gallery has one.
  const photo = photoForPrint(catalog, print ?? null);

  const canBuy = Boolean(product && color && size && stock > 0);

  const buildItem = (): CartItem | null => {
    if (!product || !color || !size || !print) return null;
    return {
      id: `${idOf(product)}-${idOf(print)}-${color.name}-${size}-${Date.now()}`,
      product,
      print,
      // The base colour name, not the translated one: validateStock() and
      // orderPricing() both match on `colors[].name`.
      color: color.name,
      size,
      quantity: qty,
      price,
      oldPrice: oldPrice && oldPrice > price ? oldPrice : undefined,
    };
  };

  const handleAdd = () => {
    if (qty > stock) {
      toast.error(`В наличии только ${stock} шт.`);
      return;
    }
    const item = buildItem();
    if (!item) return;
    addItem(item);
    toast.success("Добавлено в корзину");
  };

  const handleBuyNow = () => {
    if (qty > stock) {
      toast.error(`В наличии только ${stock} шт.`);
      return;
    }
    const item = buildItem();
    if (!item) return;
    addItem(item);
    router.push("/v2/checkout");
  };

  if (isError) {
    return (
      <div className="mx-auto flex max-w-[1328px] flex-col items-center gap-5 px-4 py-28 text-center desk:px-6">
        <span className="text-[20px] font-bold text-[#1A1A1A]">Принт не найден</span>
        <span className="text-[15px] text-[#9F9F9F]">Возможно, он больше не продаётся</span>
        <Link
          href="/v2/market"
          className="mt-1 flex h-12 items-center rounded-[10px] bg-[#8814B1] px-7 text-[15px] font-semibold text-white transition-colors hover:bg-[#6E1090]"
        >
          Вернуться в маркет
        </Link>
      </div>
    );
  }

  const loading = printLoading || productsLoading;

  return (
    <div className="mx-auto max-w-[1328px] px-4 pb-20 pt-5 desk:px-6 desk:pb-24">
      {/* Breadcrumb */}
      <nav aria-label="Хлебные крошки" className="flex items-center gap-2 text-[13px] text-[#9F9F9F] desk:text-[14px]">
        <Link href="/v2/market" className="transition-colors hover:text-[#8814B1]">Маркет</Link>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9C9D2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m10 6 6 6-6 6" />
        </svg>
        <span className="truncate text-[#333333]">{printName || "…"}</span>
      </nav>

      <div className="mt-6 flex flex-col gap-10 desk:mt-8 desk:flex-row desk:items-start desk:gap-16">
        {/* ---------------- Media ---------------- */}
        <div className="flex w-full shrink-0 gap-4 desk:w-[578px] desk:gap-5">
          {/* Thumb rail — desktop only */}
          <div className="hidden w-[88px] shrink-0 flex-col gap-3 desk:flex">
            <button
              type="button"
              onClick={() => setLive3d(false)}
              aria-pressed={!live3d}
              className={`relative flex h-[100px] w-[88px] cursor-pointer items-center justify-center overflow-hidden rounded-[10px] border-2 bg-[#F4F4F6] transition-colors ${
                live3d ? "border-[#ECECEF] hover:border-[#C9C9D2]" : "border-[#8814B1]"
              }`}
            >
              {photo ? (
                <Image
                  src={cld(photo, 200)}
                  alt="Вид спереди"
                  fill
                  sizes="88px"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <PrintOnShirt base={flatBase} print={print ?? null} alt="Вид спереди" className="h-[78px]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setLive3d(true)}
              aria-pressed={live3d}
              disabled={!product?.model}
              className={`flex h-[100px] w-[88px] cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[10px] border-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                live3d ? "border-[#00C6F1]" : "border-[#ECECEF] hover:border-[#C9C9D2]"
              }`}
              style={{ background: STAGE_3D }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00C6F1" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3 4 7.2v9.6L12 21l8-4.2V7.2Z" />
                <path d="m4 7.2 8 4.3 8-4.3" />
                <path d="M12 11.5V21" />
              </svg>
              <span className="text-[11px] font-bold text-[#0F2031]">3D</span>
            </button>
          </div>

          {/* Stage */}
          <div
            className="relative w-full overflow-hidden rounded-[16px] desk:w-[470px] desk:flex-none"
            style={{ aspectRatio: SHOT_ASPECT, background: live3d ? STAGE_3D : "#F4F4F6" }}
          >
            {loading ? (
              <div className="h-full w-full animate-pulse bg-[#EFEFF2]" />
            ) : live3d && product?.model ? (
              <TShirtScene
                key={`${idOf(product)}-${color?.hex}`}
                selectedProduct={product.model}
                productName={productName}
                productDescription={getTranslated(product, lang, "description")}
                selectedPrint={print ?? null}
                selectedColor={color?.hex || "#FFFFFF"}
                showUI={false}
              />
            ) : (
              // `relative` matters: the photo uses `fill`, which positions
              // against the nearest positioned ancestor.
              <div className="relative flex h-full w-full items-center justify-center">
                {photo ? (
                  <Image
                    src={cld(photo, 900)}
                    alt={`${printName} — ${productName}`}
                    fill
                    sizes="(max-width: 1023px) 100vw, 470px"
                    priority
                    fetchPriority="high"
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <PrintOnShirt
                    base={flatBase}
                    print={print ?? null}
                    alt={`${printName} — ${productName}`}
                    priority
                    className="h-[86%]"
                  />
                )}
              </div>
            )}

            {!live3d && !loading && (
              <span className="pointer-events-none absolute left-5 top-5 flex h-8 items-center rounded-full bg-white px-3.5 text-[12px] font-bold text-[#6B6B75] shadow-[0_1px_3px_rgba(16,16,24,0.12)]">
                Фото · вид спереди
              </span>
            )}

            {live3d && (
              <span className="pointer-events-none absolute left-5 top-5 flex h-8 items-center gap-1.5 rounded-full bg-[#0F2031] px-3.5 text-[12px] font-bold text-white">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00C6F1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3 4 7.2v9.6L12 21l8-4.2V7.2Z" />
                  <path d="m4 7.2 8 4.3 8-4.3" />
                </svg>
                Живой 3D
              </span>
            )}

            {!loading && product?.model && (
              <button
                type="button"
                onClick={() => setLive3d((v) => !v)}
                className={`absolute bottom-5 right-5 flex h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-[14px] font-bold shadow-[0_2px_10px_rgba(16,16,24,0.18)] transition-transform active:scale-95 ${
                  live3d ? "bg-white text-[#0F2031]" : "bg-[#0F2031] text-white"
                }`}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3 4 7.2v9.6L12 21l8-4.2V7.2Z" />
                  <path d="m4 7.2 8 4.3 8-4.3" />
                  <path d="M12 11.5V21" />
                </svg>
                {live3d ? "Вернуться к превью" : "Посмотреть в 3D"}
              </button>
            )}
          </div>
        </div>

        {/* ---------------- Details ---------------- */}
        <div className="flex flex-1 flex-col gap-6 desk:gap-7">
          <div className="flex flex-col gap-2.5">
            <span className="text-[14px] leading-[17px] text-[#9F9F9F]">{productName || "Футболка"}</span>
            <h1 className="text-[28px] font-extrabold leading-[34px] tracking-[-0.018em] text-[#1A1A1A] desk:text-[34px] desk:leading-[41px]">
              {printName || "…"}
            </h1>
          </div>

          <div className="flex items-baseline gap-3.5">
            <span className="text-[28px] font-extrabold leading-[34px] text-[#1A1A1A] desk:text-[34px] desk:leading-[41px]">
              {money(price)}
              <span className="text-[14px] font-semibold text-[#9F9F9F]"> сум</span>
            </span>
            {discount > 0 && oldPrice && (
              <>
                <span className="text-[16px] font-medium text-[#9F9F9F] line-through desk:text-[17px]">
                  {money(oldPrice)}
                </span>
                <span className="flex h-7 items-center rounded-full bg-[#8814B1] px-3 text-[12px] font-bold text-white">
                  −{discount}%
                </span>
              </>
            )}
          </div>

          <div className="h-px bg-[#ECECEF]" />

          {/* Garment picker — only when there is a real choice */}
          {products.length > 1 && (
            <div className="flex flex-col gap-3.5">
              <span className="text-[15px] text-[#333333] desk:text-[16px] desk:leading-[22px]">
                Товар: <span className="font-bold text-[#1A1A1A]">{productName}</span>
              </span>
              <div className="flex flex-wrap gap-2.5">
                {products.map((p) => {
                  const on = idOf(p) === idOf(product);
                  return (
                    <button
                      key={idOf(p)}
                      type="button"
                      onClick={() => setProductId(idOf(p))}
                      aria-pressed={on}
                      className={`h-11 cursor-pointer rounded-[10px] border-[1.5px] px-4 text-[14px] font-semibold transition-colors ${
                        on
                          ? "border-[#8814B1] bg-[#F7F2FA] text-[#8814B1]"
                          : "border-[#E2E2E8] bg-white text-[#333333] hover:border-[#C9C9D2]"
                      }`}
                    >
                      {getTranslated(p, lang)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Colour */}
          {(product?.colors || []).length > 0 && (
            <div className="flex flex-col gap-3.5">
              <span className="text-[15px] text-[#333333] desk:text-[16px] desk:leading-[22px]">
                Цвет:{" "}
                <span className="font-bold text-[#1A1A1A]">
                  {color ? getTranslated(color, lang) || color.name : "—"}
                </span>
              </span>
              <div className="flex flex-wrap items-center gap-3.5">
                {(product?.colors || []).map((c) => {
                  const on = c.name === color?.name;
                  const available = (c.variants || []).some((v) => v.stock > 0);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColorPref(c.name)}
                      aria-label={getTranslated(c, lang) || c.name}
                      aria-pressed={on}
                      title={getTranslated(c, lang) || c.name}
                      className="h-11 w-11 cursor-pointer rounded-full border border-[#E2E2E8] transition-transform active:scale-95 desk:h-10 desk:w-10"
                      style={{
                        background: available
                          ? c.hex
                          : `linear-gradient(45deg, ${c.hex} 46%, #9F9F9F 46%, #9F9F9F 54%, ${c.hex} 54%)`,
                        boxShadow: on ? "0 0 0 3px #ffffff, 0 0 0 5px #00C6F1" : "none",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Size */}
          {variants.length > 0 && (
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[15px] text-[#333333] desk:text-[16px] desk:leading-[22px]">
                  Размер: <span className="font-bold text-[#1A1A1A]">{size || "—"}</span>
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2.5">
                {variants.map((v) => {
                  const on = v.size === size;
                  const out = v.stock <= 0;
                  return (
                    <button
                      key={v.size}
                      type="button"
                      disabled={out}
                      onClick={() => {
                        setSizePref(v.size);
                        setQtyPref(1);
                      }}
                      aria-pressed={on}
                      className={`min-h-[46px] cursor-pointer rounded-[10px] border-[1.5px] text-[14px] font-semibold transition-colors disabled:cursor-not-allowed ${
                        out
                          ? "border-[#ECECEF] bg-[#FAFAFB] text-[#C9C9D2] line-through"
                          : on
                            ? "border-[#00C6F1] bg-[#00C6F1] text-[#0F2031]"
                            : "border-[#E2E2E8] bg-white text-[#333333] hover:border-[#00C6F1]"
                      }`}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={() => setQtyPref((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Уменьшить количество"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#8814B1] text-white transition-colors hover:bg-[#6E1090] disabled:bg-[#D8D8DE] desk:h-10 desk:w-10"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M5 12h14" />
                </svg>
              </button>
              <span className="min-w-[34px] text-center text-[20px] font-semibold text-[#1A1A1A]">{qty}</span>
              <button
                type="button"
                onClick={() => setQtyPref((q) => Math.min(stock || 1, q + 1))}
                disabled={qty >= stock}
                aria-label="Увеличить количество"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#8814B1] text-white transition-colors hover:bg-[#6E1090] disabled:bg-[#D8D8DE] desk:h-10 desk:w-10"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
            <span className="text-[14px] leading-[17px] text-[#333333]">
              {stock > 0 ? (
                <>
                  В наличии: <span className="font-semibold text-[#1E9E5A]">{stock} шт.</span>
                </>
              ) : (
                <span className="font-semibold text-[#E5484D]">Нет в наличии</span>
              )}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-1">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!canBuy}
              className="flex h-14 cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-[#00C6F1] text-[16px] font-bold text-[#0F2031] shadow-[0_2px_8px_rgba(0,198,241,0.28)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#E6E6EB] disabled:text-[#9F9F9F] disabled:shadow-none"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 7h12l-1.2 11.1a2 2 0 0 1-2 1.9H9.2a2 2 0 0 1-2-1.9Z" />
                <path d="M9 9V6.5a3 3 0 0 1 6 0V9" />
              </svg>
              {canBuy ? `В корзину · ${money(price * qty)} сум` : "Нет в наличии"}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!canBuy}
              className="h-14 cursor-pointer rounded-xl bg-[#8814B1] text-[16px] font-bold text-white transition-colors hover:bg-[#6E1090] disabled:cursor-not-allowed disabled:bg-[#E6E6EB] disabled:text-[#9F9F9F]"
            >
              Купить в 1 клик
            </button>
          </div>

          {/* Facts */}
          <div className="flex flex-col rounded-xl bg-[#FAFAFB] px-5 py-4">
            <Fact icon="truck">BTS по всему Узбекистану — 3–5 дней</Fact>
            <Fact icon="card">Оплата наличными при получении или по QR</Fact>
            <Fact icon="swap">Обмен размера в течение 7 дней</Fact>
          </div>
        </div>
      </div>

      {/* ---------------- Similar ---------------- */}
      {similar.length > 0 && (
        <section className="flex flex-col gap-7 pt-16 desk:gap-8 desk:pt-20">
          <h2 className="text-[24px] font-extrabold leading-[30px] tracking-[-0.015em] text-[#1A1A1A] desk:text-[30px] desk:leading-[37px]">
            Похожие принты
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 desk:grid-cols-4 desk:gap-6">
            {similar.map((entry) => (
              <ProductTile key={entry.id} entry={entry} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Fact({ icon, children }: { icon: "truck" | "card" | "swap"; children: React.ReactNode }) {
  const paths: Record<string, React.ReactNode> = {
    truck: (
      <>
        <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </>
    ),
    card: (
      <>
        <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
        <path d="M2.5 10h19" />
      </>
    ),
    swap: (
      <>
        <path d="M3 12a9 9 0 0 1 15.5-6.2M21 12a9 9 0 0 1-15.5 6.2" />
        <path d="M18 3v4h-4M6 21v-4h4" />
      </>
    ),
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#8814B1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        {paths[icon]}
      </svg>
      <span className="text-[14px] leading-5 text-[#333333]">{children}</span>
    </div>
  );
}
