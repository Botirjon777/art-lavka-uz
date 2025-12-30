"use client";

import { useState } from "react";
import { PrintDesign, ConfiguratorState } from "@/types";
import TShirtScene from "./TShirtScene";

interface RightConfiguratorProps {
  selectedPrint: PrintDesign | null;
  onAddToCart: (config: ConfiguratorState) => void;
}

const colors = [
  { id: "red", name: "Красный", hex: "#EF4444" },
  { id: "black", name: "Черный", hex: "#000000" },
];

const sizes = ["XS (44)", "S (50)", "L (54)", "M (56)", "M (62)"];

export default function RightConfigurator({
  selectedPrint,
  onAddToCart,
}: RightConfiguratorProps) {
  const [selectedColor, setSelectedColor] = useState(colors[0].id);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);

  const maxStock = 10;
  const price = 100000;

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
                selectedPrint={selectedPrint}
                selectedColor={selectedColor}
              />
            </div>

            {/* Right - Configuration Options */}
            <div className="space-y-[15px]">
              {/* Color Selection */}
              <div>
                <h3 className="text-[16px]/[22px] text-[#333333] mb-[15px]">
                  Цвет: Белый
                </h3>
                <div className="flex gap-[15px]">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color.id
                          ? "border-purple-600 ring-2 ring-purple-300 scale-110"
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
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[16px]/[22px] text-[#333333]">
                    Размер: {selectedSize}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((size) => (
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
