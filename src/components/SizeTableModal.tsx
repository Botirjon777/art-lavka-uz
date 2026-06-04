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

// Static fallback images that live in /public/sizes/.
// Used only when a row has no image of its own.
const defaultSizeImages: Record<string, string> = {
  S:   "/sizes/s.webp",
  M:   "/sizes/m.webp",
  L:   "/sizes/l.webp",
  XL:  "/sizes/xl.webp",
  XXL: "/sizes/xxl.webp",
};

function getSizeImage(item: SizeTableEntry): string | null {
  return item.image || defaultSizeImages[item.size.toUpperCase()] || null;
}

export default function SizeTableModal({
  isOpen,
  onClose,
  data,
}: SizeTableModalProps) {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const [openSize, setOpenSize] = useState<string | null>(null);

  // Use only the product-specific data from the DB — no hardcoded fallback.
  const rows = data ?? [];
  const hasData = rows.length > 0;

  const renderContent = (compact: boolean) => (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

      {/* Header */}
      <div
        className={`grid border-b border-gray-100 bg-gray-50/70 font-semibold uppercase tracking-wider text-gray-500 ${
          compact ? "grid-cols-[1fr_1fr_1fr_auto] px-4 py-3 text-xs"
                  : "grid-cols-[1fr_1fr_1fr_auto] px-6 py-4 text-[14px]"
        }`}
      >
        <span>{t.size}</span>
        <span>{t.width}</span>
        <span>{t.height}</span>
        <span className="sr-only">{t.sizeDetails}</span>
      </div>

      {hasData ? (
        <div className="divide-y divide-gray-100">
          {rows.map((item) => {
            const isExpanded = openSize === item.size;
            const image = getSizeImage(item);

            return (
              <div key={item.size} className="bg-white">
                {/* Row button */}
                <button
                  type="button"
                  onClick={() => setOpenSize(isExpanded ? null : item.size)}
                  aria-expanded={isExpanded}
                  className={`grid w-full items-center text-left transition-colors hover:bg-purple-50/40 ${
                    isExpanded ? "bg-purple-50/30" : ""
                  } ${
                    compact
                      ? "grid-cols-[1fr_1fr_1fr_auto] px-4 py-3"
                      : "grid-cols-[1fr_1fr_1fr_auto] px-6 py-4"
                  }`}
                >
                  <span className={`font-bold text-[#333333] ${compact ? "text-sm" : "text-[16px]"}`}>
                    {item.size}
                  </span>
                  <span className={`text-gray-600 ${compact ? "text-sm" : "text-[16px]"}`}>
                    {item.width} cm
                  </span>
                  <span className={`text-gray-600 ${compact ? "text-sm" : "text-[16px]"}`}>
                    {item.height} cm
                  </span>

                  {image && (
                    <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#8814B1]">
                      {t.sizeDetails}
                      <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="flex"
                      >
                        <FiChevronDown className="h-4 w-4" />
                      </motion.span>
                    </span>
                  )}
                </button>

                {/* Expandable image */}
                <AnimatePresence initial={false}>
                  {isExpanded && image && (
                    <motion.div
                      key={`${item.size}-expand`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        height: { duration: 0.32, ease: [0.4, 0, 0.2, 1] },
                        opacity: { duration: 0.22, ease: "easeOut" },
                      }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        initial={{ y: -6, scale: 0.99 }}
                        animate={{ y: 0, scale: 1 }}
                        exit={{ y: -6, scale: 0.99 }}
                        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                        className={compact ? "px-4 pb-4" : "px-6 pb-6"}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-inner">
                          <Image
                            src={image}
                            alt={`${item.size} size details`}
                            fill
                            sizes={compact ? "100vw" : "720px"}
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
      ) : (
        // Empty state — shown when the product has no size table configured.
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center text-gray-400">
          <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">{t.noSizeData}</p>
        </div>
      )}
    </div>
  );

  const measureTip = (
    <div className={`rounded-2xl border border-purple-100 bg-purple-50 ${isMobile ? "p-4" : "p-6"}`}>
      <p className={`text-purple-800 ${isMobile ? "text-sm" : "text-[14px]/[20px]"}`}>
        <span className="mb-1 mr-1 block font-bold">{t.howToMeasure}:</span>
        <span className="opacity-80">{t.howToMeasureDesc}</span>
      </p>
    </div>
  );

  if (isMobile) {
    return (
      <MobileModal isOpen={isOpen} onClose={onClose} title={t.sizeChart}>
        <div className="px-4 py-4 space-y-4">
          {renderContent(true)}
          {measureTip}
        </div>
      </MobileModal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="min-h-[500px] w-[900px] max-w-full">
        <h2 className="mb-7 text-[30px]/[37px] font-bold text-[#333333]">
          {t.sizeChart}
        </h2>
        {renderContent(false)}
        <div className="mt-8">{measureTip}</div>
      </div>
    </Modal>
  );
}
