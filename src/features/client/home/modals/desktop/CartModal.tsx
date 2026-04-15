"use client";

import Modal from "@/components/Modal";
import { CartItem } from "@/types";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export default function CartModal({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartModalProps) {
  const { t } = useTranslation();
  const { lang } = useLanguageStore();
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[1500px] max-w-full min-h-[600px] flex gap-6">
        {/* Left Side - Cart Items */}
        <div className="flex-1">
          <h2 className="text-[30px]/[37px] text-[#333333] mb-5">
            {t.cart} - {items.length}
          </h2>

          <div className="space-y-5 max-h-[700px] overflow-y-auto pr-2">
            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-lg">{t.cartEmpty}</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
                >
                  <div className="relative w-20 h-20 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={item.product.image}
                      alt={getTranslated(item.product, lang)}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2.5">
                    <h4 className="text-[14px]/[17px] text-[#333333]">
                      {getTranslated(item.product, lang)}
                    </h4>
                    <p className="text-[14px]/[17px] text-[#333333]">
                      {item.size} {item.color}
                    </p>
                    {item.print && (
                      <p className="text-[14px]/[17px] text-[#333333]">
                        {t.print}:{" "}
                        <span className="text-[#00C6F1]">
                          {getTranslated(item.print, lang)}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                      }
                      className="w-[35px] h-[35px] flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/90 text-white rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-[16px] text-[#333333] w-9 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-[35px] h-[35px] flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/90 text-white rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  <div className="text-left min-w-[120px]">
                    <p className="text-[22px] text-[#333333]">
                      {(item.price * item.quantity).toLocaleString()} {t.currency}
                    </p>
                    {item.oldPrice && item.oldPrice > item.price && (
                      <p className="text-[16px] text-[#9F9F9F] line-through">
                        {(item.oldPrice * item.quantity).toLocaleString()} {t.currency}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-[#444444] hover:text-[#8814B1] transition-colors ml-2"
                    aria-label="Remove item"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side - Payment Summary */}
        {items.length > 0 && (
          <div className="w-[320px] shrink-0">
            <div className="bg-white rounded-[20px] p-10 shadow-sm sticky top-0 text-[#333333]">
              <h3 className="text-[30px]/[37px] mb-5">{t.payment}</h3>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-[16px]/[22px]">
                  <span>{t.items}: {items.length} {t.pcs}.</span>
                  {items.some(item => item.oldPrice && item.oldPrice > item.price) && (
                    <span className="text-[#9F9F9F] line-through">
                      {items.reduce((sum, item) => sum + (item.oldPrice || item.price) * item.quantity, 0).toLocaleString()} {t.currency}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[16px]/[22px]">{t.total}:</span>
                  <span className="text-[25px]/[30px]">
                    {total.toLocaleString()} {t.currency}
                  </span>
                </div>
              </div>

              <button
                onClick={onCheckout}
                className="w-full py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl mb-4"
              >
                {t.placeOrder}
              </button>

              <div className="text-[10px]/[18px]">
                <span className="text-[#9F9F9F]">{t.agreeTerms}</span>{" "}
                {t.publicOffer}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
