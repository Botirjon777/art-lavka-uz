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
    id: "uzqr",
    label: "UzQR",
    image: "/qr/uzqr.png",
    color: "#0055FF",
  },
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
    confirm: string;
    back: string;
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

  // Which provider's QR is shown. Defaults to the first provider (UzQR).
  const [selectedId, setSelectedId] = useState(QR_PROVIDERS[0].id);
  const selected =
    QR_PROVIDERS.find((p) => p.id === selectedId) ?? QR_PROVIDERS[0];

  // Two-step confirm: clicking "I paid" reveals a confirmation before we place
  // the order. Reset whenever the modal is closed.
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (!isOpen) setConfirming(false);
  }, [isOpen]);

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

  const totalEl = (
    <div className="flex items-baseline gap-2">
      <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">
        {t.total}
      </span>
      <span className="text-2xl font-black text-[#8814B1]">
        {amount.toLocaleString()} {currency}
      </span>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-stretch sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isSubmitting ? undefined : onClose}
      />
      <div className="relative z-10 flex flex-col w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[92vh] bg-white sm:rounded-[28px] shadow-2xl overflow-hidden">
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

        {/* Content — compact, non-scrolling */}
        <div className="flex-1 min-h-0 overflow-hidden p-6 flex flex-col gap-4">
          {confirming ? (
            /* Confirmation shown after tapping "I paid". */
            <>
              <div className="flex justify-center">{totalEl}</div>
              <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center gap-4 px-2">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                  <FiCheckCircle size={34} className="text-[#059669]" />
                </div>
                <p className="text-[14px] text-gray-600 leading-relaxed max-w-md">
                  {t.paymentQrHint} {t.qrPaidNote}
                </p>
              </div>
            </>
          ) : (
          <>
            {/* Top bar: provider toggles on the left, total on the right (desktop). */}
            <div className="shrink-0 flex flex-col sm:flex-row-reverse sm:items-center sm:justify-between gap-3">
              {totalEl}
              <div className="flex flex-row justify-center gap-2">
              {QR_PROVIDERS.map((provider) => {
                const active = provider.id === selectedId;
                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setSelectedId(provider.id)}
                    aria-pressed={active}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-[14px] transition-all ${
                      active
                        ? "text-white shadow-sm"
                        : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"
                    }`}
                    style={
                      active
                        ? {
                            backgroundColor: provider.color,
                            borderColor: provider.color,
                          }
                        : undefined
                    }
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        active ? "border-white" : "border-gray-300"
                      }`}
                    >
                      {active && (
                        <span className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </span>
                    {provider.label}
                  </button>
                );
              })}
              </div>
            </div>

            {/* Selected provider's QR, shown below. */}
            <div className="flex-1 min-h-0 flex flex-col items-center gap-3">
              <img
                src={selected.image}
                alt={`${selected.label} QR`}
                className="flex-1 min-h-0 w-auto max-w-full object-contain"
              />
              {selected.appLink && (
                <a
                  href={selected.appLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-white text-[12px] transition-all active:scale-[0.98]"
                  style={{ backgroundColor: selected.color }}
                >
                  <FiExternalLink size={13} />
                  {t.openInApp}
                </a>
              )}
            </div>
          </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={confirming ? () => setConfirming(false) : onClose}
            disabled={isSubmitting}
            className="flex-1 py-3.5 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            {confirming ? t.back : t.cancel}
          </button>
          <button
            type="button"
            onClick={confirming ? onPaid : () => setConfirming(true)}
            disabled={isSubmitting}
            className="flex-1 py-3.5 bg-[#059669] hover:bg-[#047857] text-white rounded-xl font-bold shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <FiCheckCircle size={19} />
            {isSubmitting ? t.submitting : confirming ? t.confirm : t.iPaid}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
