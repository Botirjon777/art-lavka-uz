"use client";

import { useState } from "react";
import { PrintDesign, ConfiguratorState, Product, ProductColor } from "@/types";
import TShirtScene from "../shared/TShirtScene";
import SizeTableModal from "@/components/SizeTableModal";
import { MobileFooter } from "./MobileFooter";

interface MobileConfiguratorProps {
  selectedProduct: Product;
  selectedPrint: PrintDesign | null;
  onAddToCart: (config: ConfiguratorState) => void;
  onProductClick?: () => void;
  onPrintClick?: () => void;
}

export default function MobileConfigurator({
  selectedProduct,
  selectedPrint,
  onAddToCart,
  onProductClick,
  onPrintClick,
}: MobileConfiguratorProps) {
  const productColors: ProductColor[] = selectedProduct.colors || [
    { name: "Белый", hex: "#FFFFFF" },
  ];
  const productSizes = selectedProduct.sizes || ["XS", "S", "M", "L", "XL"];

  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    productColors[0],
  );
  const [selectedSize, setSelectedSize] = useState(productSizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

  // Get size-specific stock
  const inventory = selectedProduct.inventory || {
    XS: 0,
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0,
  };

  const getInventoryStock = (sizeToFind: string) => {
    if (!sizeToFind) return 0;
    const s = sizeToFind.trim().toUpperCase();

    // 1. Try exact match
    if (inventory[s as keyof typeof inventory] !== undefined) {
      return Number(inventory[s as keyof typeof inventory]);
    }

    // 2. Try prefix match for sizes like "XS (48)"
    const sizeKeys = ["XXL", "XL", "XS", "S", "M", "L"];
    for (const key of sizeKeys) {
      if (s.startsWith(key)) {
        return Number(inventory[key as keyof typeof inventory]);
      }
    }
    return 0;
  };

  const sizeStock = getInventoryStock(selectedSize);
  const isOutOfStock = sizeStock === 0;
  const price = selectedProduct.price;

  const handleAddToCart = () => {
    onAddToCart({
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
            {productColors.map((color) => (
              <button
                key={color.hex}
                onClick={() => setSelectedColor(color)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  selectedColor.hex === color.hex
                    ? "border-[#00C6F1] ring-2 ring-[#00C6F1]/30 scale-110"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
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
            {productSizes.map((size) => {
              const stock = getInventoryStock(size);
              if (stock === 0) return null;

              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-[5px] text-[13px]/[16px] rounded-[5px] shadow-sm transition-all ${
                    selectedSize === size
                      ? "bg-[#00C6F1] text-white"
                      : "bg-white text-[#333333]"
                  }`}
                >
                  {size}
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
          {!isOutOfStock && sizeStock < 5 && (
            <p className="text-orange-600 text-xs mt-5">
              Осталось всего {sizeStock} шт.
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
              <span className="text-sm text-[#666666] ml-2">
                в наличии {sizeStock}
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <div>
          <p className="text-[13px]/[16px] text-[#666666] mb-1">
            Цена{" "}
            <span className="line-through text-[#9F9F9F]">
              {(price * 1.2).toLocaleString()} сум
            </span>
          </p>
          <p className="text-[20px]/[24px] text-[#333333]">
            {price.toLocaleString()} сум
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2.5">
          <button
            onClick={handleAddToCart}
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
      />
    </div>
  );
}
