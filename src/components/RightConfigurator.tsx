"use client";

import { useState } from "react";
import { PrintDesign, ConfiguratorState, Product } from "@/types";
import TShirtScene from "./TShirtScene";

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

  const maxStock = selectedProduct.stock;
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
      <div className="bg-image max-h-[886px] max-w-[964px] rounded-[30px] flex flex-col items-center justify-center p-12 relative before:content-[''] before:absolute before:inset-0 before:bg-black/10 before:rounded-[30px] before:pointer-events-none">
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
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? "border-purple-600 ring-2 ring-purple-300 scale-110"
                          : "border-gray-300"
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
                  {productSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2.5 px-3 text-[14px]/[17px] rounded-xl transition-all ${
                        selectedSize === size
                          ? "bg-[#00C6F1] text-white"
                          : "bg-white text-[#333333]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <button className="text-[16px]/[22px] text-[#333333] hover:text-[#333333]/80 underline">
                  Таблица размеров
                </button>
              </div>

              {/* Quantity */}
              <div>
                <p className="text-[16px]/[22px] text-[#333333] mb-[15px]">
                  Количество: {quantity}шт
                </p>
                <div className="flex items-center gap-[15px]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 text-white rounded-full transition-colors shadow-md"
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
                    className="w-10 h-10 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 text-white rounded-full transition-colors shadow-md"
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
              <div className="space-y-[15px]">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 bg-[#00C6F1] hover:bg-[#00C6F1]/80 text-white rounded-xl transition-colors shadow-md text-[16px]/5"
                >
                  Купить в 1 клик
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 bg-[#8814B1] hover:bg-[#8814B1]/80 text-white rounded-xl transition-all shadow-md text-[16px]/5"
                >
                  Добавить в корзину
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
