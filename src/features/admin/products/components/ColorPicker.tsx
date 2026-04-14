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

  // Deletion State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [colorToDeleteIndex, setColorToDeleteIndex] = useState<number | null>(
    null,
  );

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
            hideExactStock:
              field === "hideExactStock" ? (value as boolean) : false,
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
        price:
          v.promoPrice && v.promoPrice > 0 ? v.promoPrice : v.oldPrice || 0,
      }));

    const updatedColors = colors.map((c, i) =>
      i === selectedColorIndex ? { ...c, variants: validVariants } : c
    );
    onChange(updatedColors);
    setSelectedColorIndex(null);
  };

  const removeVariant = (colorIndex: number, variantIndex: number) => {
    const updatedColors = colors.map((c, i) => {
      if (i === colorIndex) {
        return {
          ...c,
          variants: c.variants.filter((_, vi) => vi !== variantIndex),
        };
      }
      return c;
    });
    onChange(updatedColors);
  };

  const removeColor = (index: number) => {
    onChange(colors.filter((_, i) => i !== index));
    setIsDeleteModalOpen(false);
    setColorToDeleteIndex(null);
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
                    <p className="font-black text-gray-900 text-lg mb-3">
                      {color.name}
                    </p>

                    {/* Detailed Variants List */}
                    <div className="grid grid-cols-2 gap-2">
                      {color.variants && color.variants.length > 0 ? (
                        color.variants.map((v) => (
                          <div
                            key={v.size}
                            className="flex items-center justify-between bg-gray-50/80 px-2 py-1.5 rounded-lg border border-gray-100/50"
                          >
                            <span className="text-[9px] font-black text-[#8814B1] w-5">
                              {v.size}
                            </span>
                            <span className="text-[10px] font-bold text-gray-700 flex-1 px-1.5 border-l border-gray-200 ml-1.5 truncate">
                              {v.promoPrice && v.promoPrice > 0
                                ? v.promoPrice
                                : v.oldPrice}
                            </span>
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${v.stock > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
                            >
                              {v.stock}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="col-span-2 text-[10px] text-gray-400 italic bg-gray-50 p-1.5 rounded-lg text-center border border-dashed border-gray-200">
                          Нет вариантов
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setColorToDeleteIndex(index);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
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
            <div className="relative bg-white rounded-[30px] shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in duration-300">
              {/* Modal Header */}
              <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-white shadow-sm"
                    style={{ backgroundColor: colors[selectedColorIndex].hex }}
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Настройка вариантов
                    </h3>
                    <p className="text-sm text-gray-500">
                      Цвет:{" "}
                      <span className="font-semibold text-gray-700">
                        {colors[selectedColorIndex].name}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedColorIndex(null)}
                  className="p-3 hover:bg-gray-200 rounded-xl transition-colors text-gray-400"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
                <div className="space-y-3">
                  {commonSizes.map((size) => {
                    const variant = localVariants.find(
                      (v) => v.size === size,
                    ) || {
                      size,
                      price: 0,
                      oldPrice: 0,
                      promoPrice: 0,
                      stock: 0,
                    };

                    return (
                      <div
                        key={size}
                        className="grid grid-cols-12 items-center gap-6 p-5 border rounded-2xl bg-white border-gray-100 hover:border-[#8814B1] hover:shadow-md transition-all group"
                      >
                        {/* Size Badge (2 cols) */}
                        <div className="col-span-1 flex flex-col items-center">
                          <span className="text-[10px] uppercase tracking-widest font-black text-gray-300 mb-2">
                            РАЗМЕР
                          </span>
                          <div
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black border-2 transition-all ${
                              variant.price > 0
                                ? "bg-purple-50 text-[#8814B1] border-purple-100"
                                : "bg-gray-50 text-gray-300 border-gray-100 group-hover:bg-white"
                            }`}
                          >
                            {size}
                          </div>
                        </div>

                        {/* Inputs (9 cols) */}
                        <div className="col-span-9 grid grid-cols-3 gap-6">
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2 ml-1">
                              ОРИГ. ЦЕНА
                            </label>
                            <div className="relative">
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
                                className="w-full pl-4 pr-10 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none transition-all font-bold text-gray-700"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-xs">
                                UZS
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase tracking-widest font-black text-[#8814B1] mb-2 ml-1">
                              ПРОМО ЦЕНА
                            </label>
                            <div className="relative">
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
                                className="w-full pl-4 pr-10 py-3.5 bg-purple-50/30 border border-purple-100/50 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none transition-all font-bold text-[#8814B1]"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-200 font-bold text-xs">
                                UZS
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2 ml-1">
                              В НАЛИЧИИ (ШТ)
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
                              className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#8814B1] focus:border-transparent outline-none transition-all font-bold text-gray-700"
                            />
                          </div>
                        </div>

                        {/* Toggle (2 cols) */}
                        <div className="col-span-2 flex flex-col items-center justify-center border-l border-gray-50 pl-2">
                          <label className="block text-[10px] uppercase tracking-widest font-black text-gray-300 mb-3 text-center">
                            СКРЫТЬ КОЛ-ВО
                          </label>
                          <div
                            onClick={() =>
                              handleLocalVariantChange(
                                size,
                                "hideExactStock",
                                !variant.hideExactStock,
                              )
                            }
                            className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 ${
                              variant.hideExactStock
                                ? "bg-[#8814B1]"
                                : "bg-gray-200"
                            }`}
                          >
                            <div
                              className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 transform ${
                                variant.hideExactStock
                                  ? "translate-x-6"
                                  : "translate-x-0"
                              }`}
                            />
                          </div>
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && colorToDeleteIndex !== null && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <FiX size={32} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Удалить цвет?
              </h2>
              <p className="text-gray-500 mt-2">
                Вы уверены, что хотите удалить цвет{" "}
                <strong>"{colors[colorToDeleteIndex].name}"</strong> и все его
                варианты?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Отмена
              </button>
              <button
                type="button"
                className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-shadow shadow-lg shadow-red-200"
                onClick={() => removeColor(colorToDeleteIndex)}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
