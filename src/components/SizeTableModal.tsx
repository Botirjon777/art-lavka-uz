"use client";

import Modal from "./Modal";
import { FiX } from "react-icons/fi";

interface SizeTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sizeData = [
  { size: "XS", width: "48", height: "68" },
  { size: "S", width: "51", height: "70" },
  { size: "M", width: "54", height: "72" },
  { size: "L", width: "57", height: "74" },
  { size: "XL", width: "60", height: "76" },
  { size: "XXL", width: "63", height: "78" },
];

export default function SizeTableModal({
  isOpen,
  onClose,
}: SizeTableModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[600px] max-w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[30px]/[37px] text-[#333333] font-bold">
            Таблица размеров
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[14px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  Размер
                </th>
                <th className="px-6 py-4 text-[14px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  Ширина (см)
                </th>
                <th className="px-6 py-4 text-[14px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  Высота (см)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sizeData.map((item) => (
                <tr
                  key={item.size}
                  className="hover:bg-purple-50/30 transition-colors group"
                >
                  <td className="px-6 py-4 text-[16px] font-bold text-[#333333] group-hover:text-[#8814B1]">
                    {item.size}
                  </td>
                  <td className="px-6 py-4 text-[16px] text-gray-600">
                    {item.width}
                  </td>
                  <td className="px-6 py-4 text-[16px] text-gray-600">
                    {item.height}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-6 bg-purple-50 rounded-2xl border border-purple-100">
          <p className="text-[14px]/[20px] text-purple-800">
            <span className="font-bold mr-1 block mb-1">Как измерить:</span>
            <span className="opacity-80">
              Ширина измеряется под рукавами, высота — от высшей точки плеча до
              низа изделия. Допуск по размерам ±2 см.
            </span>
          </p>
        </div>
      </div>
    </Modal>
  );
}
