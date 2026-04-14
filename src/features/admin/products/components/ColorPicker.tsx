"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiX } from "react-icons/fi";
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
  error?: string;
}

export default function ColorPicker({
  colors,
  onChange,
  previewColor,
  onPreview,
  error,
}: ColorPickerProps) {
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");

  // Variant Modal State
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(
    null,
  );
  const [localVariants, setLocalVariants] = useState<ProductVariant[]>([]);

  const commonSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  // Sync local variants when modal opens
  useEffect(() => {
    if (selectedColorIndex !== null) {
      setLocalVariants(colors[selectedColorIndex].variants || []);
    }
  }, [selectedColorIndex, colors]);

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

  const handleLocalVariantChange = (
    size: string,
    field: "price" | "oldPrice" | "promoPrice" | "stock" | "hideExactStock",
    value: string | boolean,
  ) => {
    setLocalVariants((prev) => {
      const existingIndex = prev.findIndex((v) => v.size === size);
      
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          [field]: field === "hideExactStock" ? value : Number(value),
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            size,
            price: field === "price" ? Number(value) : Number(value) || 0,
            oldPrice: field === "oldPrice" ? Number(value) : 0,
            promoPrice: field === "promoPrice" ? Number(value) : 0,
            stock: field === "stock" ? Number(value) : 0,
            hideExactStock: field === "hideExactStock" ? (value as boolean) : false,
          },
        ];
      }
    });
  };

  const handleSaveVariants = () => {
    if (selectedColorIndex === null) return;

    // Filter out empty variants (where price is 0 or not set)
    const validVariants = localVariants
      .filter((v) => (v.oldPrice || 0) > 0 || (v.promoPrice || 0) > 0)
      .map((v) => ({
        ...v,
        // Active price is promoPrice if exists, otherwise oldPrice
        price: v.promoPrice && v.promoPrice > 0 ? v.promoPrice : (v.oldPrice || 0),
      }));

    const updatedColors = [...colors];
    updatedColors[selectedColorIndex].variants = validVariants;
    onChange(updatedColors);
    setSelectedColorIndex(null);
  };

  const removeVariant = (colorIndex: number, variantIndex: number) => {
    const updatedColors = [...colors];
    updatedColors[colorIndex].variants = updatedColors[
      colorIndex
    ].variants.filter((_, i) => i !== variantIndex);
    onChange(updatedColors);
  };

  const removeColor = (index: number) => {
    onChange(colors.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        className={`space-y-5 rounded-xl border-2 transition-colors ${error ? "border-red-500 bg-red-50/10" : "border-transparent"}`}
      >
        {/* Add Color Section */}
        <div className="border-2 border-gray-200 rounded-xl p-4 space-y-3 bg-white">
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
                    const variant = localVariants.find(
                      (v) => v.size === size,
                    ) || { size, price: 0, oldPrice: 0, promoPrice: 0, stock: 0 };

                    return (
                      <div
                        key={size}
                        className="flex items-center gap-4 p-4 border rounded-xl bg-gray-50 border-gray-100 hover:border-[#8814B1]/30 transition-colors"
                      >
                        {/* Size Badge */}
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold border shrink-0 transition-colors ${
                          variant.price > 0 
                            ? "bg-white text-[#8814B1] border-purple-100" 
                            : "bg-gray-100 text-gray-300 border-gray-200"
                        }`}>
                          {size}
                        </div>

                        {/* Inputs Grid */}
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                              Ориг. цена
                            </label>
                            <input
                              type="number"
                              value={variant.oldPrice || ""}
                              onChange={(e) =>
                                handleLocalVariantChange(
                                  size,
                                  "oldPrice",
                                  e.target.value,
                                )
                              }
                              placeholder="0"
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8814B1] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">
                              Промо цена
                            </label>
                            <input
                              type="number"
                              value={variant.promoPrice || ""}
                              onChange={(e) =>
                                handleLocalVariantChange(
                                  size,
                                  "promoPrice",
                                  e.target.value,
                                )
                              }
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
                              onChange={(e) =>
                                handleLocalVariantChange(
                                  size,
                                  "stock",
                                  e.target.value,
                                )
                              }
                              placeholder="0"
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8814B1] outline-none"
                            />
                          </div>
                        </div>

                        {/* Hide Stock Toggle */}
                        <div className="shrink-0 flex items-center gap-2 h-full pt-4">
                          <input
                            type="checkbox"
                            id={`hide-stock-${size}`}
                            checked={variant.hideExactStock || false}
                            onChange={(e) =>
                              handleLocalVariantChange(
                                size,
                                "hideExactStock",
                                e.target.checked,
                              )
                            }
                            className="w-5 h-5 rounded text-[#8814B1] focus:ring-[#8814B1] cursor-pointer"
                          />
                          <label
                            htmlFor={`hide-stock-${size}`}
                            className="text-[10px] uppercase tracking-wider font-bold text-gray-400 cursor-pointer"
                          >
                            Скрыть кол-во
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedColorIndex(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleSaveVariants}
                  className="px-6 py-2 bg-[#8814B1] text-white rounded-lg text-sm font-bold hover:bg-[#8814B1]/90 transition-colors"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
