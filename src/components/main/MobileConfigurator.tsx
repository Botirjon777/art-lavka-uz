"use client";

import { useState } from "react";
import { PrintDesign, ConfiguratorState, Product, ProductColor } from "@/types";
import TShirtScene from "./TShirtScene";
import SizeTableModal from "../SizeTableModal";

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
    productColors[0]
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
    <div className="flex flex-col bg-white min-h-screen pb-20">
      {/* T-Shirt Scene */}
      <div className="relative bg-gray-50 flex items-center justify-center py-8">
        <div className="w-full max-w-md">
          <TShirtScene
            key={selectedProduct.id}
            selectedProduct={selectedProduct.model}
            productName={selectedProduct.name}
            productDescription={selectedProduct.description}
            selectedPrint={selectedPrint}
            selectedColor={selectedColor.hex}
            onProductClick={onProductClick}
          />
        </div>
      </div>

      {/* Product Name */}
      <div className="px-4 py-4 border-b border-gray-200">
        <h1 className="text-lg font-medium text-[#333333] text-center">
          {selectedProduct.name}
        </h1>
      </div>

      {/* Select Buttons */}
      <div className="px-4 py-4 grid grid-cols-2 gap-3 border-b border-gray-200">
        <button
          onClick={onPrintClick}
          className="py-3 px-4 bg-white border border-gray-300 rounded-lg text-sm font-medium text-[#333333] hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          Выбрать принт
        </button>
        <button
          onClick={onProductClick}
          className="py-3 px-4 bg-white border border-gray-300 rounded-lg text-sm font-medium text-[#333333] hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          Выбрать продукт
        </button>
      </div>

      {/* Configurator Options */}
      <div className="px-4 py-6 space-y-6">
        {/* Color Selection */}
        <div>
          <h3 className="text-sm font-medium text-[#333333] mb-3">
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
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-[#333333]">
              Размер: {selectedSize}
            </p>
            <button
              onClick={() => setIsSizeModalOpen(true)}
              className="text-xs text-[#8814B1] underline"
            >
              Таблица размеров
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {productSizes.map((size) => {
              const stock = getInventoryStock(size);
              if (stock === 0) return null;

              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2.5 text-sm font-medium rounded-lg transition-all ${
                    selectedSize === size
                      ? "bg-[#00C6F1] text-white"
                      : "bg-gray-100 text-[#333333]"
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
              Осталось всего {sizeStock} шт.
            </p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <p className="text-sm font-medium text-[#333333] mb-3">
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

            <span className="text-lg font-semibold text-[#333333] min-w-[3ch] text-center">
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
          <p className="text-sm text-[#666666] mb-1">
            Цена{" "}
            <span className="line-through text-[#9F9F9F]">
              {(price * 1.2).toLocaleString()} сум
            </span>
          </p>
          <p className="text-2xl font-bold text-[#333333]">
            {price.toLocaleString()} сум
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-3.5 rounded-xl font-medium text-base transition-colors ${
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
            className={`w-full py-3.5 rounded-xl font-medium text-base transition-colors ${
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
      <div className="text-center py-6 text-sm text-gray-500 border-t border-gray-200">
        © 2023 - 2025
      </div>

      <SizeTableModal
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
      />
    </div>
  );
}
