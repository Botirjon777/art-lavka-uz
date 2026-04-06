"use client";

import { useState } from "react";
import { FiPlus, FiX, FiTrash2 } from "react-icons/fi";
import { ProductVariant } from "@/types";

export interface Color {
  name: string;
  hex: string;
  variants: ProductVariant[];
}

interface ColorPickerProps {
  colors: Color[];
  onChange: (colors: Color[]) => void;
  previewColor?: string;
  onPreview?: (hex: string) => void;
}

export default function ColorPicker({
  colors,
  onChange,
  previewColor,
  onPreview,
}: ColorPickerProps) {
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");

  // Variant Modal State
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);

  const commonSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  // Sync internal hex to parent for live preview
  const handleHexChange = (hex: string) => {
    setColorHex(hex);
    if (onPreview) onPreview(hex);
  };

  const addColor = () => {
    if (!colorName.trim()) {
      alert("Пожалуйста, введите название цвета");
      return;
    }

    const newColor: Color = {
      name: colorName.trim(),
      hex: colorHex,
      variants: [],
    };

    onChange([...colors, newColor]);
    setColorName("");
    setColorHex("#000000");
  };

  const handleVariantChange = (size: string, field: 'price' | 'stock', value: string) => {
    if (selectedColorIndex === null) return;

    const updatedColors = [...colors];
    const currentColor = updatedColors[selectedColorIndex];

    if (!currentColor.variants) {
      currentColor.variants = [];
    }

    let variant = currentColor.variants.find(v => v.size === size);

    if (!variant) {
      variant = { size, price: 0, stock: 0 };
      currentColor.variants.push(variant);
    }

    if (field === 'price') {
      variant.price = Number(value);
    } else {
      variant.stock = Number(value);
    }

    onChange(updatedColors);
  };

  const removeVariant = (colorIndex: number, variantIndex: number) => {
    const updatedColors = [...colors];
    updatedColors[colorIndex].variants = updatedColors[colorIndex].variants.filter(
      (_, i) => i !== variantIndex
    );
    onChange(updatedColors);
  };

  const removeColor = (index: number) => {
    onChange(colors.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Add Color Section */}
      <div className="border-2 border-gray-200 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-gray-700">Добавить цвет</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Color Name Input */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Название цвета
            </label>
            <input
              type="text"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              placeholder="Например: Белый, Черный"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none"
            />
          </div>

          {/* Hex Color Input with Picker */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Цвет (HEX)
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={colorHex}
                onChange={(e) => handleHexChange(e.target.value)}
                className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={colorHex}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="#000000"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Add Button */}
        <button
          type="button"
          onClick={addColor}
          className="flex items-center gap-2 px-4 py-2 bg-[#8814B1] text-white rounded-lg hover:bg-[#8814B1]/90 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Добавить цвет
        </button>
      </div>

      {/* Colors List */}
      {colors.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Добавленные цвета</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {colors.map((color, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 border rounded-lg transition-all ${
                  previewColor?.toLowerCase() === color.hex.toLowerCase()
                    ? "border-[#8814B1] bg-[#8814B1]/5 ring-2 ring-[#8814B1]/20"
                    : "border-gray-200"
                }`}
              >
                {/* Color Preview Box */}
                <button
                  type="button"
                  onClick={() => onPreview && onPreview(color.hex)}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:scale-105 transition-transform shrink-0"
                  style={{ backgroundColor: color.hex }}
                  title="Предпросмотр этого цвета"
                />

                {/* Color Info */}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => setSelectedColorIndex(index)}
                >
                  <p className="font-medium text-gray-800">{color.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 font-mono uppercase">
                      {color.hex}
                    </p>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {color.variants?.length || 0} вар.
                    </span>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variants Modal */}
      {selectedColorIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedColorIndex(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full border border-gray-200"
                  style={{ backgroundColor: colors[selectedColorIndex].hex }}
                />
                <h3 className="font-bold text-gray-800">
                  Варианты для "{colors[selectedColorIndex].name}"
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedColorIndex(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                {commonSizes.map((size) => {
                  const variant = colors[selectedColorIndex].variants?.find(v => v.size === size) || { size, price: 0, stock: 0 };
                  
                  return (
                    <div
                      key={size}
                      className="flex items-center gap-4 p-4 border rounded-xl bg-gray-50 border-gray-100 hover:border-[#8814B1]/30 transition-colors"
                    >
                      {/* Size Badge */}
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center font-bold text-[#8814B1] border border-gray-100 shrink-0">
                        {size}
                      </div>

                      {/* Inputs Grid */}
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                            Цена (сум)
                          </label>
                          <input
                            type="number"
                            value={variant.price || ""}
                            onChange={(e) => handleVariantChange(size, 'price', e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8814B1] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                            Количество
                          </label>
                          <input
                            type="number"
                            value={variant.stock || ""}
                            onChange={(e) => handleVariantChange(size, 'stock', e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8814B1] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedColorIndex(null)}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg text-sm font-bold hover:bg-gray-700 transition-colors"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
