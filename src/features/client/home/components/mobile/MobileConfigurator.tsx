"use client";

import { useState, useEffect } from "react";
import { PrintDesign, ConfiguratorState, Product, ProductColor } from "@/types";
import TShirtScene from "../shared/TShirtScene";
import SizeTableModal from "@/components/SizeTableModal";
import { MobileFooter } from "./MobileFooter";

interface MobileConfiguratorProps {
  selectedProduct: Product;
  selectedPrint: PrintDesign | null;
  onAddToCart: (config: ConfiguratorState) => void;
  onBuyOneClick: (config: ConfiguratorState) => void;
  onProductClick?: () => void;
  onPrintClick?: () => void;
}

export default function MobileConfigurator({
  selectedProduct,
  selectedPrint,
  onAddToCart,
  onBuyOneClick,
  onProductClick,
  onPrintClick,
}: MobileConfiguratorProps) {
  const productColors = selectedProduct.colors || [];
  const firstAvailableColor = productColors.find((c: ProductColor) =>
    c.variants?.some((v) => v.stock > 0),
  );
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    firstAvailableColor ||
      productColors[0] || { name: "Белый", hex: "#FFFFFF", variants: [] }
  );

  // Get sizes available FOR THE SELECTED COLOR
  const availableVariants = selectedColor.variants || [];
  const productSizes = availableVariants.map(v => v.size);
  const firstInStockSize = availableVariants.find(v => v.stock > 0)?.size;

  const [selectedSize, setSelectedSize] = useState(
    firstInStockSize || productSizes[0] || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

  // Reset selected size when color changes
  useEffect(() => {
    const firstInStock = selectedColor.variants.find(v => v.stock > 0);
    if (firstInStock) {
      setSelectedSize(firstInStock.size);
    } else if (selectedColor.variants.length > 0) {
      setSelectedSize(selectedColor.variants[0].size);
    } else {
      setSelectedSize("");
    }
  }, [selectedColor]);

  const selectedVariant = selectedColor.variants.find(v => v.size === selectedSize);
  const sizeStock = selectedVariant?.stock || 0;
  const isOutOfStock = sizeStock === 0;
  const price = selectedVariant?.price || selectedProduct.price;
  const oldPrice = selectedVariant?.oldPrice || selectedProduct.oldPrice;

  const handleAddToCart = () => {
    if (!selectedSize) return;
    onAddToCart({
      selectedPrint,
      selectedColor: selectedColor.name,
      selectedSize,
      quantity,
    });
  };

  const handleBuyOneClick = () => {
    if (!selectedSize) return;
    onBuyOneClick({
      selectedPrint,
      selectedColor: selectedColor.name,
      selectedSize,
      quantity,
    });
  };

  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* T-Shirt Scene */}
      <div className="relative bg-image flex items-center justify-center py-8">
        <div className="w-full max-w-md">
          <TShirtScene
            key={selectedProduct.id}
            selectedProduct={selectedProduct.model}
            productName={selectedProduct.name}
            productDescription={selectedProduct.description}
            selectedPrint={selectedPrint}
            selectedColor={selectedColor.hex}
            onProductClick={onProductClick}
            onPrintClick={onPrintClick}
          />
        </div>
      </div>

      {/* Configurator Options */}
      <div className="p-5 space-y-5">
        {/* Color Selection */}
        <div>
          <h3 className="text-[13px]/[16px] text-[#333333] mb-3">
            Цвет: {selectedColor.name}
          </h3>
          <div className="flex gap-3">
            {productColors.map((color) => {
              const hasStock = color.variants?.some((v) => v.stock > 0);
              return (
                <button
                  key={color.hex}
                  onClick={() => hasStock && setSelectedColor(color)}
                  disabled={!hasStock}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    selectedColor.hex === color.hex
                      ? "border-[#00C6F1] ring-2 ring-[#00C6F1]/30 scale-110"
                      : "border-gray-300"
                  } ${
                    !hasStock
                      ? "opacity-20 grayscale cursor-not-allowed scale-90"
                      : "active:scale-95"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={hasStock ? color.name : `${color.name} (нет в наличии)`}
                />
              );
            })}
          </div>
        </div>

        {/* Size Selection */}
        <div>
          <div className="flex justify-between items-center mb-[15px]">
            <p className="text-[13px]/[16px] text-[#333333]">
              Размер: {selectedSize}
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {availableVariants.map((v) => {
              if (v.stock === 0 || !v.price || v.price === 0) return null;

              return (
                <button
                  key={v.size}
                  onClick={() => setSelectedSize(v.size)}
                  className={`py-[5px] text-[13px]/[16px] rounded-[5px] shadow-sm transition-all ${
                    selectedSize === v.size
                      ? "bg-[#00C6F1] text-white"
                      : "bg-white text-[#333333]"
                  }`}
                >
                  {v.size}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsSizeModalOpen(true)}
            className="text-[13px]/[16px] text-[#333333] underline mt-[15px]"
          >
            Таблица размеров
          </button>

          {/* Stock Info */}
          {!isOutOfStock && (
            <p className="text-green-600 text-sm font-medium mt-5 flex items-center gap-1">
              <span className="text-lg">✓</span> В наличии
            </p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <p className="text-[13px]/[16px] text-[#333333] mb-3">
            Количество: {quantity}шт
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 disabled:bg-gray-300 text-white rounded-full transition-colors"
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

            <span className="text-[16px]/[20px] text-[#333333] min-w-[3ch] text-center">
              {quantity}
            </span>

            <button
              onClick={() => setQuantity(Math.min(sizeStock, quantity + 1))}
              disabled={quantity >= sizeStock}
              className="w-10 h-10 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 disabled:bg-gray-300 text-white rounded-full transition-colors"
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

            {!isOutOfStock && (
              <span className="text-sm text-green-600 font-medium ml-2">
                В наличии
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <div>
          <p className="text-[13px]/[16px] text-[#666666] mb-1">
            Цена{" "}
            {oldPrice && oldPrice > price && (
              <span className="line-through text-[#9F9F9F]">
                {oldPrice.toLocaleString()} сум
              </span>
            )}
          </p>
          <p className="text-[20px]/[24px] text-[#333333]">
            {price.toLocaleString()} сум
          </p>
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
            {isOutOfStock ? "Нет в наличии" : "Купить в 1 клик"}
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
            {isOutOfStock ? "Нет в наличии" : "Добавить в корзину"}
          </button>
        </div>
      </div>

      {/* Footer */}
      <MobileFooter />

      <SizeTableModal
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        data={selectedProduct.sizeTable}
      />
    </div>
  );
}
