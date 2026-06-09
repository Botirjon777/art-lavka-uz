"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiExternalLink, FiX, FiCheckCircle } from "react-icons/fi";

// QR payment providers. The image lives in /public. appLink is the deep link
// encoded in that QR (opens the provider app on mobile) — optional: when a
// provider only has a QR image, omit it and we just show the image to scan.
export const QR_PROVIDERS: {
  id: string;
  label: string;
  image: string;
  appLink?: string;
  color: string;
}[] = [
  {
    id: "payme",
    label: "Payme",
    image: "/qr/payme.png",
    appLink: "https://transfer.paycom.uz/6a22b65d904cbc6ca8a2d3a4",
    color: "#00AAFF",
  },
  {
    id: "paynet",
    label: "Paynet",
    image: "/qr/paynet.png",
    color: "#1A9D49",
  },
];

interface QrPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaid: () => void;
  isSubmitting: boolean;
  amount: number;
  currency: string;
  t: {
    paymentQr: string;
    paymentQrHint: string;
    openInApp: string;
    iPaid: string;
    qrPaidNote: string;
    cancel: string;
    total: string;
    submitting: string;
  };
}

export default function QrPaymentModal({
  isOpen,
  onClose,
  onPaid,
  isSubmitting,
  amount,
  currency,
  t,
}: QrPaymentModalProps) {
  // Portal target only exists in the browser — mount-gate to avoid SSR errors.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Lock background scroll while the full-screen modal is open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-stretch sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isSubmitting ? undefined : onClose}
      />
      <div className="relative z-10 flex flex-col w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[92vh] bg-white sm:rounded-[28px] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="shrink-0 px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-lg font-black text-gray-800">{t.paymentQr}</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-40"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">
              {t.total}
            </span>
            <span className="text-2xl font-black text-[#8814B1]">
              {amount.toLocaleString()} {currency}
            </span>
          </div>

          <p className="text-[13px] text-gray-500 text-center max-w-md mx-auto">
            {t.paymentQrHint}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {QR_PROVIDERS.map((provider) => (
              <div
                key={provider.id}
                className="flex flex-col items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 bg-gray-50"
              >
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                  {provider.label}
                </span>
                <img
                  src={provider.image}
                  alt={`${provider.label} QR`}
                  className="w-full aspect-square object-contain rounded-xl bg-white p-3 border border-gray-100"
                />
                {provider.appLink && (
                  <a
                    href={provider.appLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-[15px] transition-all active:scale-[0.98]"
                    style={{ backgroundColor: provider.color }}
                  >
                    <FiExternalLink size={17} />
                    {t.openInApp}
                  </a>
                )}
              </div>
            ))}
          </div>

          <p className="text-[12px] text-gray-400 text-center leading-relaxed max-w-md mx-auto">
            {t.qrPaidNote}
          </p>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3.5 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={onPaid}
            disabled={isSubmitting}
            className="flex-1 py-3.5 bg-[#059669] hover:bg-[#047857] text-white rounded-xl font-bold shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <FiCheckCircle size={19} />
            {isSubmitting ? t.submitting : t.iPaid}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
