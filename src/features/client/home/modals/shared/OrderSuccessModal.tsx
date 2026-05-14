"use client";

import Link from "next/link";
import { RiTelegram2Fill } from "react-icons/ri";
import { TbSitemap } from "react-icons/tb";
import { useTranslation } from "@/hooks/useTranslation";
import { useIsMobile } from "@/hooks/useIsMobile";
import Modal from "@/components/Modal";
import MobileModal from "../mobile/MobileModal";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
}

export default function OrderSuccessModal({
  isOpen,
  onClose,
  orderNumber,
}: OrderSuccessModalProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const content = (
    <>
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C6F1]/5 rounded-bl-full -z-10" />

      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Success Message */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-[#333333] mb-3 tracking-tight">
          {t.orderSuccess}
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6 px-4">
          {t.orderSuccessDesc}
        </p>

        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col items-center justify-center">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">
            {t.orderNumber}
          </p>
          <p className="text-2xl font-black text-[#00C6F1]">{orderNumber}</p>
        </div>
      </div>

      {/* Tracking Options */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px bg-gray-100 flex-1" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {t.tracking}
          </p>
          <div className="h-px bg-gray-100 flex-1" />
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Link
            href="/track-order"
            className="group flex items-center justify-between px-5 py-4 bg-white border border-gray-100 rounded-xl hover:border-[#00C6F1] transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <TbSitemap size={18} />
              <span className="text-sm font-bold text-gray-700">
                {t.trackOnSite}
              </span>
            </div>
            <svg
              className="w-4 h-4 text-gray-300 group-hover:text-[#00C6F1] transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>

          <a
            href="https://t.me/artlavkauzbot"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between px-5 py-4 bg-[#0088cc]/5 border border-transparent rounded-xl hover:bg-[#0088cc]/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <RiTelegram2Fill size={18} className="text-[#0088cc]" />

              <span className="text-sm font-bold text-[#0088cc]">
                {t.trackViaTelegram}
              </span>
            </div>
            <svg
              className="w-4 h-4 text-[#0088cc]/30 group-hover:text-[#0088cc] transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onClose}
        className="w-full cursor-pointer px-6 py-4 bg-[#00C6F1] text-white rounded-2xl hover:bg-[#00C6F1]/90 transition-all font-black text-sm uppercase tracking-widest shadow-lg shadow-[#00C6F1]/30 active:scale-[0.98]"
      >
        {t.continueShopping}
      </button>
    </>
  );

  if (isMobile) {
    return (
      <MobileModal isOpen={isOpen} onClose={onClose} title={t.orderSuccess}>
        <div className="p-8 relative">{content}</div>
      </MobileModal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} showBackgroundImage={false}>
      <div className="w-full max-w-md relative">
        {content}
      </div>
    </Modal>
  );
}
