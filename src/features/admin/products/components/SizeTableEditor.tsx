"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import Image from "next/image";
import { FiImage, FiPlus, FiTrash2, FiUpload } from "react-icons/fi";
import { SizeTableEntry } from "../types";
import { Button } from "@/components/ui";
import toast from "react-hot-toast";
import { uploadFileAction } from "../../shared/actions/upload";

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
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

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

  const handleImageUpload = async (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "art-lavka/sizes");

    try {
      const result = await uploadFileAction(formData);
      if (result.success && result.url) {
        handleUpdateRow(index, "image", result.url);
        toast.success("Изображение размера загружено");
        return;
      }

      toast.error(result.error || "Не удалось загрузить изображение размера");
    } catch {
      toast.error("Не удалось загрузить изображение размера");
    } finally {
      setUploadingIndex(null);
      event.target.value = "";
    }
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
        <table className="w-full table-fixed text-left border-collapse">
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[38%]" />
            <col className="w-10" />
          </colgroup>
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Размер</th>
              <th className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ширина</th>
              <th className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Высота</th>
              <th className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Фото</th>
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
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative w-12 h-12 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                      {row.image ? (
                        <Image
                          src={row.image}
                          alt={`Size ${row.size || index + 1}`}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <FiImage className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <label className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-2 text-xs font-bold text-[#8814B1] cursor-pointer transition-colors hover:bg-purple-100">
                      <FiUpload className="w-3.5 h-3.5" />
                      <span className="truncate">
                        {uploadingIndex === index ? "Загрузка..." : "Загрузить"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingIndex !== null}
                        onChange={(event) => handleImageUpload(index, event)}
                      />
                    </label>
                  </div>
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
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400 italic">
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
