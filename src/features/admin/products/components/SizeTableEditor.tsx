"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { SizeTableEntry } from "../types";
import { Button } from "@/components/ui";
import toast from "react-hot-toast";

interface SizeTableEditorProps {
  data: SizeTableEntry[];
  onChange: (data: SizeTableEntry[]) => void;
}

const defaultSizeData: SizeTableEntry[] = [
  { size: "XS", width: "48", height: "68" },
  { size: "S", width: "51", height: "70" },
  { size: "M", width: "54", height: "72" },
  { size: "L", width: "57", height: "74" },
  { size: "XL", width: "60", height: "76" },
  { size: "XXL", width: "63", height: "78" },
];

export default function SizeTableEditor({ data, onChange }: SizeTableEditorProps) {
  const [localData, setLocalData] = useState<SizeTableEntry[]>(
    data.length > 0 ? data : []
  );

  useEffect(() => {
    if (data && data.length > 0) {
      setLocalData(data);
    }
  }, [data]);

  const handleUpdateRow = (index: number, field: keyof SizeTableEntry, value: string) => {
    const updated = [...localData];
    updated[index] = { ...updated[index], [field]: value };
    setLocalData(updated);
    onChange(updated);
  };

  const handleAddRow = () => {
    const newRow = { size: "", width: "", height: "" };
    const updated = [...localData, newRow];
    setLocalData(updated);
    onChange(updated);
  };

  const handleRemoveRow = (index: number) => {
    const updated = localData.filter((_, i) => i !== index);
    setLocalData(updated);
    onChange(updated);
  };

  const handleSetDefault = () => {
    setLocalData(defaultSizeData);
    onChange(defaultSizeData);
    toast.success("Стандартные размеры загружены");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold text-gray-700">Параметры размеров (см)</h4>
        <button
          type="button"
          onClick={handleSetDefault}
          className="text-xs text-[#8814B1] hover:underline font-medium"
        >
          Загрузить стандартные значения
        </button>
      </div>

      <div className="overflow-hidden border border-gray-100 rounded-xl bg-gray-50/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Размер</th>
              <th className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ширина</th>
              <th className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Высота</th>
              <th className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {localData.map((row, index) => (
              <tr key={index} className="bg-white hover:bg-purple-50/10 transition-colors">
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.size}
                    onChange={(e) => handleUpdateRow(index, "size", e.target.value)}
                    placeholder="S"
                    className="w-full bg-transparent outline-none text-sm font-bold text-[#333333]"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.width}
                    onChange={(e) => handleUpdateRow(index, "width", e.target.value)}
                    placeholder="51"
                    className="w-full bg-transparent outline-none text-sm text-gray-600"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.height}
                    onChange={(e) => handleUpdateRow(index, "height", e.target.value)}
                    placeholder="70"
                    className="w-full bg-transparent outline-none text-sm text-gray-600"
                  />
                </td>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {localData.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400 italic">
                  Таблица пуста. Добавьте размеры или используйте стандартные значения.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddRow}
        className="w-full border-dashed border-2 hover:border-[#8814B1] hover:text-[#8814B1] h-10 group"
      >
        <FiPlus className="w-4 h-4 mr-2 group-hover:scale-125 transition-transform" />
        Добавить новую строку
      </Button>
    </div>
  );
}
