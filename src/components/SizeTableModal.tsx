"use client";

import Modal from "./Modal";
import MobileModal from "@/features/client/home/modals/mobile/MobileModal";
import { FiX } from "react-icons/fi";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "@/hooks/useTranslation";

import { SizeTableEntry } from "@/types";

interface SizeTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: SizeTableEntry[];
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
  data,
}: SizeTableModalProps) {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  
  const displayData = data && data.length > 0 ? data : sizeData;

  // Mobile version
  if (isMobile) {
    return (
      <MobileModal isOpen={isOpen} onClose={onClose}>
        <div className="px-4 py-4">
          <h2 className="text-xl font-semibold text-[#333333] mb-6">
            {t.sizeChart}
          </h2>

          {/* Size Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                    {t.size}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                    {t.width}
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase">
                    {t.height}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayData.map((item) => (
                  <tr key={item.size} className="hover:bg-purple-50/30">
                    <td className="px-4 py-3 text-sm font-bold text-[#333333]">
                      {item.size}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.width} {t.pcs ? (t.pcs === "шт" || t.pcs === "dona" ? "см" : "cm") : "cm"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.height} {t.pcs ? (t.pcs === "шт" || t.pcs === "dona" ? "см" : "cm") : "cm"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-sm text-purple-800">
              <span className="font-bold block mb-2">{t.howToMeasure}:</span>
              <span className="opacity-80">
                {t.howToMeasureDesc}
              </span>
            </p>
          </div>
        </div>
      </MobileModal>
    );
  }

  // Desktop version
  return (
    <Modal isOpen={isOpen} onClose={onClose} showBackgroundImage={false}>
      <div className="w-[600px] max-w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[30px]/[37px] text-[#333333] font-bold">
            {t.sizeChart}
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
                  {t.size}
                </th>
                <th className="px-6 py-4 text-[14px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  {t.width} (см)
                </th>
                <th className="px-6 py-4 text-[14px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  {t.height} (см)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayData.map((item) => (
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
            <span className="font-bold mr-1 block mb-1">{t.howToMeasure}:</span>
            <span className="opacity-80">
              {t.howToMeasureDesc}
            </span>
          </p>
        </div>
      </div>
    </Modal>
  );
}
