"use client";

import { useState } from "react";
import Image from "next/image";
import Modal from "./Modal";
import MobileModal from "@/features/client/home/modals/mobile/MobileModal";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTranslation } from "@/hooks/useTranslation";
import { SizeTableEntry } from "@/types";

interface SizeTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: SizeTableEntry[];
}

const sizeData: SizeTableEntry[] = [
  { size: "XS", width: "48", height: "68" },
  { size: "S", width: "51", height: "70", image: "/sizes/s.webp" },
  { size: "M", width: "54", height: "72", image: "/sizes/m.webp" },
  { size: "L", width: "57", height: "74", image: "/sizes/l.webp" },
  { size: "XL", width: "60", height: "76", image: "/sizes/xl.webp" },
  { size: "XXL", width: "63", height: "78", image: "/sizes/xxl.webp" },
];

const defaultSizeImages: Record<string, string> = {
  S: "/sizes/s.webp",
  M: "/sizes/m.webp",
  L: "/sizes/l.webp",
  XL: "/sizes/xl.webp",
  XXL: "/sizes/xxl.webp",
};

function getSizeImage(item: SizeTableEntry) {
  return item.image || defaultSizeImages[item.size.toUpperCase()];
}

export default function SizeTableModal({
  isOpen,
  onClose,
  data,
}: SizeTableModalProps) {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const [openSize, setOpenSize] = useState<string | null>(null);

  const displayData = data && data.length > 0 ? data : sizeData;

  const renderRows = (isCompact: boolean) => (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div
        className={`grid grid-cols-[1fr_1fr_1fr_auto] border-b border-gray-100 bg-gray-50/70 font-semibold uppercase tracking-wider text-gray-500 ${
          isCompact ? "px-4 py-3 text-xs" : "px-6 py-4 text-[14px]"
        }`}
      >
        <span>{t.size}</span>
        <span>{t.width}</span>
        <span>{t.height}</span>
        <span className="sr-only">More</span>
      </div>

      <div className="divide-y divide-gray-100">
        {displayData.map((item) => {
          const isOpen = openSize === item.size;
          const image = getSizeImage(item);

          return (
            <div key={item.size} className="bg-white">
              <button
                type="button"
                onClick={() => setOpenSize(isOpen ? null : item.size)}
                aria-expanded={isOpen}
                className={`grid w-full grid-cols-[1fr_1fr_1fr_auto] items-center text-left transition-colors hover:bg-purple-50/30 ${
                  isCompact ? "px-4 py-3" : "px-6 py-4"
                }`}
              >
                <span
                  className={`font-bold text-[#333333] ${
                    isCompact ? "text-sm" : "text-[16px]"
                  }`}
                >
                  {item.size}
                </span>
                <span
                  className={`text-gray-600 ${
                    isCompact ? "text-sm" : "text-[16px]"
                  }`}
                >
                  {item.width} cm
                </span>
                <span
                  className={`text-gray-600 ${
                    isCompact ? "text-sm" : "text-[16px]"
                  }`}
                >
                  {item.height} cm
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#8814B1]">
                  Больше
                  <FiChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && image && (
                  <motion.div
                    key={`${item.size}-details`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      initial={{ y: -8 }}
                      animate={{ y: 0 }}
                      exit={{ y: -8 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                      className={isCompact ? "px-4 pb-4" : "px-6 pb-6"}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                        <Image
                          src={image}
                          alt={`${item.size} size details`}
                          fill
                          sizes={isCompact ? "100vw" : "720px"}
                          className="object-contain"
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileModal isOpen={isOpen} onClose={onClose} title={t.sizeChart}>
        <div className="px-4 py-4">
          <div className="mb-6">{renderRows(true)}</div>

          <div className="rounded-lg border border-purple-100 bg-purple-50 p-4">
            <p className="text-sm text-purple-800">
              <span className="mb-2 block font-bold">{t.howToMeasure}:</span>
              <span className="opacity-80">{t.howToMeasureDesc}</span>
            </p>
          </div>
        </div>
      </MobileModal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="min-h-[500px] w-[900px] max-w-full">
        <h2 className="mb-7.5 text-[30px]/[37px] font-bold text-[#333333]">
          {t.sizeChart}
        </h2>

        {renderRows(false)}

        <div className="mt-8 rounded-2xl border border-purple-100 bg-purple-50 p-6">
          <p className="text-[14px]/[20px] text-purple-800">
            <span className="mb-1 mr-1 block font-bold">
              {t.howToMeasure}:
            </span>
            <span className="opacity-80">{t.howToMeasureDesc}</span>
          </p>
        </div>
      </div>
    </Modal>
  );
}
