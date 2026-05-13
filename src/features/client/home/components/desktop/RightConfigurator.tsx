"use client";

import { useState, useEffect } from "react";
import { PrintDesign, ConfiguratorState, Product, ProductColor } from "@/types";
import TShirtScene from "../shared/TShirtScene";
import SizeTableModal from "@/components/SizeTableModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";

interface RightConfiguratorProps {
  selectedProduct: Product;
  selectedPrint: PrintDesign | null;
  onAddToCart: (config: ConfiguratorState) => void;
  onBuyOneClick: (config: ConfiguratorState) => void;
  onProductClick?: () => void;
}

export default function RightConfigurator({
  selectedProduct,
  selectedPrint,
  onAddToCart,
  onBuyOneClick,
  onProductClick,
}: RightConfiguratorProps) {
  const { t } = useTranslation();
  const { lang } = useLanguageStore();
  const productColors = selectedProduct.colors || [];
  const firstAvailableColor = productColors.find((c: ProductColor) =>
    c.variants?.some((v) => v.stock > 0),
  );
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    firstAvailableColor ||
      productColors[0] || { name: "Белый", hex: "#FFFFFF", variants: [] },
  );

  const availableVariants = selectedColor.variants || [];
  const productSizes = availableVariants.map((v) => v.size);
  const firstInStockSize = availableVariants.find((v) => v.stock > 0)?.size;

  const [selectedSize, setSelectedSize] = useState(
    firstInStockSize || productSizes[0] || "",
  );
  const [quantity, setQuantity] = useState(1);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

  // Reset selection when product changes
  useEffect(() => {
    if (selectedProduct) {
      const colors = selectedProduct.colors || [];
      const firstAvailable = colors.find((c: ProductColor) =>
        c.variants?.some((v) => v.stock > 0),
      );
      const initialColor = firstAvailable || colors[0] || { name: "Белый", hex: "#FFFFFF", variants: [] };
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

  const price = (selectedVariant?.price && selectedVariant.price > 0)
    ? selectedVariant.price
    : (selectedProduct.promoPrice || selectedProduct.price || 0);

  const oldPrice = (selectedVariant?.oldPrice && selectedVariant.oldPrice > price)
    ? selectedVariant.oldPrice
    : (selectedProduct.oldPrice || (selectedProduct.promoPrice ? selectedProduct.price : 0));

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
    <div className="flex items-center justify-center">
      <div className="bg-image h-[calc(100vh-160px)] max-h-[886px] overflow-y-auto min-w-[964px] rounded-[30px] flex flex-col items-center justify-center p-12 relative before:content-[''] before:absolute before:inset-0 before:bg-black/10 before:rounded-[30px] before:pointer-events-none">
        <div className="w-full h-full relative z-10 flex flex-col">
          <div className="flex-1 flex flex-col md:flex-row gap-8">
            {/* Left - T-shirt 3D Preview */}
            <div className="flex-1 flex flex-col items-center justify-center min-w-[300px] md:min-w-[450px] self-stretch">
              <TShirtScene
                key={selectedProduct.id}
                selectedProduct={selectedProduct.model}
                productName={getTranslated(selectedProduct, lang)}
                productDescription={getTranslated(
                  selectedProduct,
                  lang,
                  "description",
                )}
                selectedPrint={selectedPrint}
                selectedColor={selectedColor.hex}
                onProductClick={onProductClick}
              />
            </div>

            {/* Right - Configuration Options */}
            <div className="space-y-[15px] min-w-[362px]">
              {/* Color Selection */}
              <div>
                <h3 className="text-[16px]/[22px] text-[#333333] mb-[15px]">
                  {t.color}: {getTranslated(selectedColor, lang)}
                </h3>
                <div className="flex gap-[15px]">
                  {productColors.map((color) => {
                    const hasStock = color.variants?.some((v) => v.stock > 0);
                    return (
                      <button
                        key={color.hex}
                        onClick={() => handleColorChange(color)}
                        className={`w-10 h-10 rounded-full border transition-all relative ${
                          selectedColor.hex === color.hex
                            ? "border-white ring ring-[#00C6F1] scale-110"
                            : "border-white"
                        } ${
                          !hasStock
                            ? "cursor-pointer scale-90"
                            : "cursor-pointer hover:scale-105"
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
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[16px]/[22px] text-[#333333]">
                    {t.size}: {selectedSize}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
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
                        className={`py-2.5 px-3 text-[14px]/[17px] rounded-xl transition-all relative border min-h-[42px] flex items-center justify-center ${
                          isActive && !isOutOfStock
                            ? "bg-[#00C6F1] text-white border-[#00C6F1]"
                            : isOutOfStock
                              ? `bg-gray-50 text-[#9F9F9F] opacity-60 ${isActive ? "border-[#00C6F1] border-2" : "border-gray-100"}`
                              : "bg-white text-[#333333] cursor-pointer hover:border-[#00C6F1] border-transparent"
                        }`}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setIsSizeModalOpen(true)}
                  className="text-[16px]/[22px] text-[#333333] hover:text-[#333333]/80 underline mt-[15px] cursor-pointer"
                >
                  {t.sizeChart}
                </button>
              </div>

              {/* Quantity */}
              <div>
                <div className="flex items-center gap-[15px]">
                  <div className="flex items-center gap-[15px]">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center cursor-pointer justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 disabled:bg-gray-200 text-white rounded-full transition-colors shadow-md shrink-0"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>

                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (isNaN(val)) {
                          setQuantity(1);
                        } else {
                          setQuantity(Math.min(Math.max(1, val), sizeStock));
                        }
                      }}
                      onBlur={(e) => {
                        if (!e.target.value) setQuantity(1);
                      }}
                      className="w-12 text-center text-[20px] font-medium text-[#333333] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />

                    <button
                      onClick={() =>
                        setQuantity(Math.min(sizeStock, quantity + 1))
                      }
                      disabled={quantity >= sizeStock}
                      className="w-10 h-10 cursor-pointer flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 disabled:bg-gray-200 text-white rounded-full transition-colors shadow-md shrink-0"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>

                  {!isOutOfStock && (
                    <span className="text-[14px]/[17px] text-[#333333] flex items-center gap-1">
                      <span className="inline-block min-w-[85px]">
                        {t.available}:
                      </span>
                      <span className="inline-block min-w-[100px] font-medium text-green-600">
                        {selectedVariant?.hideExactStock
                          ? t.inStock
                          : `${sizeStock} ${t.pcs}`}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-[15px]">
                <p className="text-[16px]/[22px] text-[#333333]">
                  {t.price}{" "}
                  {oldPrice && oldPrice > price && (
                    <span className="line-through text-[18px]/[22px] text-[#9F9F9F]">
                      {(oldPrice * quantity).toLocaleString()} {t.currency}
                    </span>
                  )}
                </p>
                <p className="text-[25px]/[30px] text-[#333333]">
                  {(price * quantity).toLocaleString()} {t.currency}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-[15px] flex flex-col">
                <button
                  onClick={handleBuyOneClick}
                  disabled={isOutOfStock}
                  className={`w-full md:max-w-[260px] min-w-[240px] px-8 py-3.5 rounded-xl transition-colors shadow-md text-[16px]/5 ${
                    isOutOfStock
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#00C6F1] hover:bg-[#00C6F1]/80 text-white cursor-pointer"
                  }`}
                >
                  <span className="whitespace-nowrap">
                    {isOutOfStock ? t.outOfStock : t.buyOneClick}
                  </span>
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full md:max-w-[260px] min-w-[240px] px-8 py-3.5 rounded-xl transition-all shadow-md text-[16px]/5 ${
                    isOutOfStock
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#8814B1] hover:bg-[#8814B1]/80 text-white cursor-pointer"
                  }`}
                >
                  <span className="whitespace-nowrap">
                    {isOutOfStock ? t.outOfStock : t.addToCart}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SizeTableModal
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        data={selectedProduct.sizeTable}
      />
    </div>
  );
}
