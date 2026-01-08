"use client";

import { useState } from "react";
import { PrintDesign, ConfiguratorState, Product } from "@/types";
import TShirtScene from "./TShirtScene";
import SizeTableModal from "../SizeTableModal";

interface RightConfiguratorProps {
  selectedProduct: Product;
  selectedPrint: PrintDesign | null;
  onAddToCart: (config: ConfiguratorState) => void;
  onProductClick?: () => void;
}

const COLOR_MAP: Record<string, string> = {
  white: "#FFFFFF",
  black: "#000000",
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#10B981",
  yellow: "#FBBF24",
  gray: "#9CA3AF",
  "off-white": "#FAF9F6",
};

const COLOR_NAMES: Record<string, string> = {
  white: "Белый",
  black: "Черный",
  red: "Красный",
  blue: "Синий",
  green: "Зеленый",
  yellow: "Желтый",
  gray: "Серый",
  "off-white": "Молочный",
};

export default function RightConfigurator({
  selectedProduct,
  selectedPrint,
  onAddToCart,
  onProductClick,
}: RightConfiguratorProps) {
  const productColors = selectedProduct.colors || ["white"];
  const productSizes = selectedProduct.sizes || ["XS", "S", "M", "L", "XL"];

  const [selectedColor, setSelectedColor] = useState(productColors[0]);
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
  const maxStock = Math.min(sizeStock, 10); // Limit to 10 or available stock
  const price = selectedProduct.price;

  const handleAddToCart = () => {
    onAddToCart({
      selectedPrint,
      selectedColor,
      selectedSize,
      quantity,
    });
  };

  return (
    <div className="flex items-center justify-center">
      <div className="bg-image h-[calc(100vh-160px)] max-h-[886px] overflow-y-auto max-w-[964px] rounded-[30px] flex flex-col items-center justify-center p-12 relative before:content-[''] before:absolute before:inset-0 before:bg-black/10 before:rounded-[30px] before:pointer-events-none">
        <div className="w-full relative z-10">
          {/* Content Grid */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left - T-shirt 3D Preview */}
            <div className="flex flex-col items-center justify-center">
              <TShirtScene
                key={selectedProduct.id}
                selectedProduct={selectedProduct.model}
                productName={selectedProduct.name}
                selectedPrint={selectedPrint}
                selectedColor={selectedColor}
                onProductClick={onProductClick}
              />
            </div>

            {/* Right - Configuration Options */}
            <div className="space-y-[15px]">
              {/* Color Selection */}
              <div>
                <h3 className="text-[16px]/[22px] text-[#333333] mb-[15px]">
                  Цвет: {COLOR_NAMES[selectedColor] || selectedColor}
                </h3>
                <div className="flex gap-[15px]">
                  {productColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full cursor-pointer border transition-all ${
                        selectedColor === color
                          ? "border-white ring ring-[#00C6F1] scale-110"
                          : "border-white"
                      }`}
                      style={{ backgroundColor: COLOR_MAP[color] || color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[16px]/[22px] text-[#333333]">
                    Размер: {selectedSize}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {productSizes.map((size) => {
                    const stock = getInventoryStock(size);
                    if (stock === 0) return null;

                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2.5 px-3 text-[14px]/[17px] rounded-xl transition-all ${
                          selectedSize === size
                            ? "bg-[#00C6F1] text-white"
                            : "bg-white text-[#333333] cursor-pointer"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {/* Stock Info */}
                {!isOutOfStock && sizeStock < 5 && (
                  <p className="text-orange-600 text-xs mt-2">
                    Осталось всего {sizeStock} шт. размера {selectedSize}
                  </p>
                )}

                <button
                  onClick={() => setIsSizeModalOpen(true)}
                  className="text-[16px]/[22px] text-[#333333] hover:text-[#333333]/80 underline mt-[15px] cursor-pointer"
                >
                  Таблица размеров
                </button>
              </div>

              {/* Quantity */}
              <div>
                <p className="text-[16px]/[22px] text-[#333333] mb-[15px]">
                  Количество: {quantity}шт{" "}
                  {!isOutOfStock && `(доступно: ${sizeStock})`}
                </p>
                <div className="flex items-center gap-[15px]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 cursor-pointer flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 text-white rounded-full transition-colors shadow-md"
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
                  <span className="text-[20px]/[24px] text-[#333333] w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(maxStock, quantity + 1))
                    }
                    className="w-10 h-10 cursor-pointer flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 text-white rounded-full transition-colors shadow-md"
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
                  <p className="text-[14px]/[17px] text-[#333333]">
                    в наличии {maxStock}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-[15px]">
                <p className="text-[16px]/[22px] text-[#333333]">
                  Цена{" "}
                  <span className="line-through text-[18px]/[22px] text-[#9F9F9F]">
                    {(price * 1.2).toLocaleString()} сум
                  </span>
                </p>
                <p className="text-[25px]/[30px] text-[#333333]">
                  {price.toLocaleString()} сум
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-[15px] flex flex-col">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`max-w-[240px] px-[35px] py-3.5 rounded-xl transition-colors shadow-md text-[16px]/5 ${
                    isOutOfStock
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#00C6F1] hover:bg-[#00C6F1]/80 text-white cursor-pointer"
                  }`}
                >
                  {isOutOfStock ? "Нет в наличии" : "Купить в 1 клик"}
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`max-w-[240px] px-[35px] py-3.5 rounded-xl transition-all shadow-md text-[16px]/5 ${
                    isOutOfStock
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#8814B1] hover:bg-[#8814B1]/80 text-white cursor-pointer"
                  }`}
                >
                  {isOutOfStock ? "Нет в наличии" : "Добавить в корзину"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SizeTableModal
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
      />
    </div>
  );
}
