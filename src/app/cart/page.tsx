"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";
import { useCartStore } from "@/stores/cartStore";
import CheckoutModal from "@/features/client/home/modals/shared/CheckoutModal";
import OrderSuccessModal from "@/features/client/home/modals/shared/OrderSuccessModal";

export default function CartPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { lang } = useLanguageStore();
  const { cartItems: items, removeItem, updateQuantity, totalAmount, clearCart } = useCartStore();
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const total = totalAmount();

  const handleCheckoutSuccess = (orderNum: string) => {
    setOrderNumber(orderNum);
    setShowCheckout(false);
    setShowOrderSuccess(true);
    clearCart();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-40 md:hidden">
      <div className="bg-white h-14 border-b border-gray-100 sticky top-0 z-20 flex items-center px-4">
        <div className="flex-1 flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-600 active:scale-90 transition-transform"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="absolute inset-x-0 flex justify-center pointer-events-none">
          <h1 className="text-[18px] font-bold text-[#333333] truncate pointer-events-auto">
            {t.cart}
          </h1>
        </div>
        <div className="flex-1 flex items-center justify-end" />
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-5 pt-5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-lg text-gray-500 mb-8">{t.cartEmpty}</p>
            <Link 
              href="/"
              className="px-8 py-3 bg-[#8814B1] text-white rounded-xl font-bold shadow-lg"
            >
              {t.continueShopping}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    <Image 
                      src={item.product.image} 
                      alt={getTranslated(item.product, lang)} 
                      fill 
                      sizes="96px" 
                      className="object-cover" 
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h4 className="text-[15px] font-bold text-[#333333] mb-1 leading-tight">
                        {getTranslated(item.product, lang)}
                      </h4>
                      <p className="text-[13px] text-gray-500">
                        {item.size} • {item.color}
                      </p>
                      {item.print && (
                        <p className="text-[13px] mt-1">
                          <span className="text-gray-400">{t.print}: </span>
                          <span className="text-[#00C6F1] font-medium">{getTranslated(item.print, lang)}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center bg-white text-[#8814B1] rounded-md shadow-sm border border-gray-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="text-[15px] font-bold text-[#333333] w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => {
                            const color = item.product.colors?.find(c => getTranslated(c, lang) === item.color);
                            const variant = color?.variants?.find(v => v.size === item.size);
                            const maxStock = variant?.stock || 0;
                            if (item.quantity < maxStock) {
                              updateQuantity(item.id, item.quantity + 1);
                            }
                          }}
                          className="w-8 h-8 flex items-center justify-center bg-[#8814B1] text-white rounded-md shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-[16px] font-bold text-[#8814B1]">
                          {(item.price * item.quantity).toLocaleString()} {t.currency}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checkout Section - Fixed Bottom */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-5 space-y-4 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] z-30">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-gray-500 text-sm">
              <span>{t.items} ({items.reduce((s, i) => s + i.quantity, 0)} {t.pcs})</span>
              <span>{total.toLocaleString()} {t.currency}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold text-[#333333]">
              <span>{t.total}</span>
              <span className="text-[#8814B1]">{total.toLocaleString()} {t.currency}</span>
            </div>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            className="w-full py-4 bg-[#8814B1] text-white rounded-2xl font-bold shadow-lg shadow-purple-200 active:scale-95 transition-all"
          >
            {t.placeOrder}
          </button>
        </div>
      )}

      {/* Modals */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        items={items}
        totalAmount={total}
        onSuccess={handleCheckoutSuccess}
      />

      <OrderSuccessModal
        isOpen={showOrderSuccess}
        onClose={() => {
          setShowOrderSuccess(false);
          router.push("/");
        }}
        orderNumber={orderNumber}
      />
    </div>
  );
}
