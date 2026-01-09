"use client";

import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";

export interface Color {
  name: string;
  hex: string;
}

interface ColorPickerProps {
  colors: Color[];
  onChange: (colors: Color[]) => void;
}

export default function ColorPicker({ colors, onChange }: ColorPickerProps) {
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");

  const addColor = () => {
    if (!colorName.trim()) {
      alert("Пожалуйста, введите название цвета");
      return;
    }

    const newColor: Color = {
      name: colorName.trim(),
      hex: colorHex,
    };

    onChange([...colors, newColor]);
    setColorName("");
    setColorHex("#000000");
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
                onChange={(e) => setColorHex(e.target.value)}
                className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
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
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
              >
                {/* Color Preview */}
                <div
                  className="w-10 h-10 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: color.hex }}
                />

                {/* Color Info */}
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{color.name}</p>
                  <p className="text-sm text-gray-500 font-mono">{color.hex}</p>
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
    </div>
  );
}
