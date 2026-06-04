"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { PrintDesign, ConfiguratorState, Product, ProductColor } from "@/types";
import { MobileFooter } from "./MobileFooter";

const TShirtScene = dynamic(() => import("../shared/TShirtScene"), { ssr: false });

function isDarkColor(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";

interface MobileConfiguratorProps {
  selectedProduct: Product;
  selectedPrint: PrintDesign | null;
  onAddToCart: (config: ConfiguratorState) => void;
  onBuyOneClick: (config: ConfiguratorState) => void;
  onProductClick?: () => void;
  onPrintClick?: () => void;
  onGalleryClick?: () => void;
  onSizeClick?: () => void;
}

export default function MobileConfigurator({
  selectedProduct,
  selectedPrint,
  onAddToCart,
  onBuyOneClick,
  onProductClick,
  onPrintClick,
  onGalleryClick,
  onSizeClick,
}: MobileConfiguratorProps) {
  const { t } = useTranslation();
  const { lang } = useLanguageStore();
  const productColors = selectedProduct.colors || [];
  const firstAvailableColor = productColors.find((c: ProductColor) =>
    c.variants?.some((v) => v.stock > 0),
  );
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    firstAvailableColor ||
      productColors[0] || { name: t.colorWhite || "White", hex: "#FFFFFF", variants: [] },
  );

  const availableVariants = selectedColor.variants || [];
  const productSizes = availableVariants.map((v) => v.size);
  const firstInStockSize = availableVariants.find((v) => v.stock > 0)?.size;

  const [selectedSize, setSelectedSize] = useState(
    firstInStockSize || productSizes[0] || "",
  );
  const [quantity, setQuantity] = useState(1);
  const [modelLoaded, setModelLoaded] = useState(false);

  const show3D = selectedPrint !== null;

  const staticImage = isDarkColor(selectedColor.hex)
    ? "/black-t-shirt.webp"
    : "/white-t-shirt.webp";

  useEffect(() => {
    setModelLoaded(false);
  }, [selectedProduct?.id]);

  useEffect(() => {
    if (selectedPrint && selectedProduct?.model) {
      import("@react-three/drei")
        .then(({ useGLTF }) => useGLTF.preload(selectedProduct.model))
        .catch(() => {});
    }
  }, [selectedPrint?._id ?? selectedPrint?.id, selectedProduct?.model]);

  // Reset selection when product changes
  useEffect(() => {
    if (selectedProduct) {
      const colors = selectedProduct.colors || [];
      const firstAvailable = colors.find((c: ProductColor) =>
        c.variants?.some((v) => v.stock > 0),
      );
      const initialColor = firstAvailable ||
        colors[0] || { name: t.colorWhite || "White", hex: "#FFFFFF", variants: [] };
      setSelectedColor(initialColor);

      const firstInStock = initialColor.variants?.find((v) => v.stock > 0);
      if (firstInStock) {
        setSelectedSize(firstInStock.size);
      } else if (initialColor.variants && initialColor.variants.length > 0) {
        setSelectedSize(initialColor.variants[0].size);
      } else {
        setSelectedSize("");
      }
      setQuantity(1);
    }
  }, [selectedProduct]);

  // Reset model loaded state when product changes
  useEffect(() => {
    setModelLoaded(false);
  }, [selectedProduct?.id]);

  const handleColorChange = (color: ProductColor) => {
    setSelectedColor(color);
    const firstInStock = color.variants?.find((v) => v.stock > 0);
    if (firstInStock) {
      setSelectedSize(firstInStock.size);
    } else if (color.variants && color.variants.length > 0) {
      setSelectedSize(color.variants[0].size);
    } else {
      setSelectedSize("");
    }
    setQuantity(1);
  };

  const selectedVariant = selectedColor.variants.find(
    (v) => v.size === selectedSize,
  );
  const sizeStock = selectedVariant?.stock || 0;
  const isOutOfStock = sizeStock === 0;

  const price =
    selectedVariant?.price && selectedVariant.price > 0
      ? selectedVariant.price
      : selectedProduct.promoPrice || selectedProduct.price || 0;

  const oldPrice =
    selectedVariant?.oldPrice && selectedVariant.oldPrice > price
      ? selectedVariant.oldPrice
      : selectedProduct.oldPrice ||
        (selectedProduct.promoPrice ? selectedProduct.price : 0);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    onAddToCart({
      selectedPrint,
      selectedColor: getTranslated(selectedColor, lang),
      selectedSize,
      quantity,
      price,
      oldPrice,
    });
  };

  const handleBuyOneClick = () => {
    if (!selectedSize) return;
    onBuyOneClick({
      selectedPrint,
      selectedColor: getTranslated(selectedColor, lang),
      selectedSize,
      quantity,
      price,
      oldPrice,
    });
  };

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Preview — static placeholder → 3D once a print is chosen */}
      <div className="relative bg-image min-h-[480px]">

        {/* Static t-shirt image: visible until 3D is ready */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
            show3D && modelLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <Image
            src={staticImage}
            alt={getTranslated(selectedProduct, lang)}
            width={200}
            height={260}
            priority
            className="object-contain drop-shadow-lg"
          />

          {/* Spinner while 3D loads */}
          {show3D && !modelLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/50 backdrop-blur-[2px]">
              <div className="w-12 h-12 rounded-full border-4 border-[#8814B1]/20 border-t-[#8814B1] animate-spin" />
              <p className="text-xs font-semibold text-[#8814B1]/70 uppercase tracking-widest">
                {t.loadingShowcase}...
              </p>
            </div>
          )}
        </div>

        {/* 3D scene — mounted when print selected, fades in after load */}
        {show3D && (
          <div
            className={`absolute inset-0 h-[480px] transition-opacity duration-500 ${
              modelLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <TShirtScene
              key={selectedProduct.id}
              selectedProduct={selectedProduct.model}
              productName={getTranslated(selectedProduct, lang)}
              productDescription={getTranslated(selectedProduct, lang, "description")}
              selectedPrint={selectedPrint}
              selectedColor={selectedColor.hex}
              onProductClick={onProductClick}
              onPrintClick={onPrintClick}
              onGalleryClick={onGalleryClick}
              modelScale={1.2}
              modelPosition={[0, -0.4, 0]}
              onModelLoaded={() => setModelLoaded(true)}
            />
          </div>
        )}

        {/* Spacer so the section keeps its height when absolute children are used */}
        <div className="h-[480px]" />
      </div>

      {/* Configurator Options */}
      <div className="p-5 space-y-5">
        {/* Color Selection */}
        <div>
          <h3 className="text-[13px]/[16px] text-[#333333] mb-3">
            {t.color}: {getTranslated(selectedColor, lang)}
          </h3>
          <div className="flex gap-3">
            {productColors.map((color) => {
              const hasStock = color.variants?.some((v) => v.stock > 0);
              return (
                <button
                  key={color.hex}
                  onClick={() => handleColorChange(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all relative ${
                    selectedColor.hex === color.hex
                      ? "border-[#00C6F1] ring-2 ring-[#00C6F1]/30 scale-110"
                      : "border-gray-300"
                  } ${
                    !hasStock ? "cursor-pointer scale-90" : "active:scale-95"
                  }`}
                  style={{
                    backgroundColor: color.hex,
                    backgroundImage: !hasStock
                      ? "linear-gradient(45deg, transparent 48%, #9F9F9F 48%, #9F9F9F 52%, transparent 52%)"
                      : "none",
                  }}
                  title={
                    hasStock
                      ? getTranslated(color, lang)
                      : `${getTranslated(color, lang)} (${t.noStockTooltip})`
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Size Selection */}
        <div>
          <div className="flex justify-between items-center mb-[15px]">
            <p className="text-[13px]/[16px] text-[#333333]">
              {t.size}: {selectedSize} {!isOutOfStock && (
                <span className="text-green-600 font-medium ml-1">
                  ({selectedVariant?.hideExactStock ? t.inStock : `${sizeStock} ${t.pcs}`})
                </span>
              )}
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {availableVariants.map((v) => {
              const price = v.price || v.promoPrice || v.oldPrice || 0;
              const isHidden = price === 0 && v.stock === 0;
              if (isHidden) return null;
              const isOutOfStock = v.stock === 0;
              const isActive = selectedSize === v.size;
              return (
                <button
                  key={v.size}
                  onClick={() => {
                    setSelectedSize(v.size);
                    setQuantity(1);
                  }}
                  disabled={false}
                  style={
                    isOutOfStock
                      ? {
                          backgroundImage:
                            "linear-gradient(45deg, transparent 48%, #9F9F9F 48%, #9F9F9F 52%, transparent 52%)",
                        }
                      : {}
                  }
                  className={`py-[5px] text-[13px]/[16px] rounded-[5px] shadow-sm transition-all relative border min-h-[32px] flex items-center justify-center ${
                    isActive && !isOutOfStock
                      ? "bg-[#00C6F1] text-white border-[#00C6F1]"
                      : isOutOfStock
                        ? `bg-gray-100 text-[#9F9F9F] opacity-60 ${isActive ? "border-[#00C6F1] border-2" : "border-gray-100"}`
                        : "bg-white text-[#333333] border-transparent active:scale-95"
                  }`}
                >
                  {v.size}
                </button>
              );
            })}
          </div>

          <button
            onClick={onSizeClick}
            className="text-[13px]/[16px] text-[#333333] underline mt-[15px]"
          >
            {t.sizeChart}
          </button>
        </div>

        {/* Quantity & Price Row */}
        <div className="flex items-start justify-between gap-4 pt-2">
          {/* Quantity */}
          <div className="flex-1">
            <p className="text-[13px]/[16px] text-[#333333] mb-3 font-medium">
              {t.quantity}: {quantity} {t.pcs}
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 disabled:bg-gray-300 text-white rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>

              <span className="text-[16px]/[20px] text-[#333333] w-8 text-center font-bold">
                {quantity}
              </span>

              <button
                onClick={() => setQuantity(Math.min(sizeStock, quantity + 1))}
                disabled={quantity >= sizeStock}
                className="w-10 h-10 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 disabled:bg-gray-300 text-white rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-[13px]/[16px] text-[#666666] mb-1">
              {t.price}{" "}
              {oldPrice && oldPrice > price && (
                <span className="line-through text-[#9F9F9F] ml-1">
                  {(oldPrice * quantity).toLocaleString()} {t.currency}
                </span>
              )}
            </p>
            <p className="text-[20px]/[24px] text-[#333333] font-bold">
              {(price * quantity).toLocaleString()} {t.currency}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2.5">
          <button
            onClick={handleBuyOneClick}
            disabled={isOutOfStock}
            className={`w-full py-[15px] rounded-xl text-[13px]/[16px] transition-colors ${
              isOutOfStock
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#00C6F1] hover:bg-[#00C6F1]/90 text-white active:scale-95"
            }`}
          >
            {isOutOfStock ? t.outOfStock : t.buyOneClick}
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-[15px] rounded-xl text-[13px]/[16px] transition-colors ${
              isOutOfStock
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#8814B1] hover:bg-[#8814B1]/90 text-white active:scale-95"
            }`}
          >
            {isOutOfStock ? t.outOfStock : t.addToCart}
          </button>
        </div>
      </div>

      {/* Footer */}
      <MobileFooter />
    </div>
  );
}
