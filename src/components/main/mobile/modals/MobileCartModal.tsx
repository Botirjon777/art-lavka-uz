"use client";

import MobileModal from "./MobileModal";
import { CartItem } from "@/types";
import Image from "next/image";

interface MobileCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export default function MobileCartModal({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: MobileCartModalProps) {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <MobileModal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
      <div className="flex flex-col h-full">
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <svg
                className="w-16 h-16 mb-4 text-gray-300"
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
              <p className="text-lg text-gray-500">Корзина пуста</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  {/* Product Header */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Product Image */}
                    <div className="relative w-16 h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-[#333333] mb-1 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-[#666666]">
                        {item.size} {item.color}
                      </p>
                      {item.print && (
                        <p className="text-xs text-[#666666]">
                          Принт:{" "}
                          <span className="text-[#00C6F1]">
                            {item.print.name}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-[#999999] hover:text-[#8814B1] transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/90 text-white rounded-full transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <span className="text-sm font-medium text-[#333333] w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/90 text-white rounded-full transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-base font-semibold text-[#333333]">
                        {(item.price * item.quantity).toLocaleString()} сум
                      </p>
                      <p className="text-xs text-[#9F9F9F] line-through">
                        {(item.price * item.quantity * 1.2).toLocaleString()}{" "}
                        сум
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Section - Sticky Bottom */}
        {items.length > 0 && (
          <div className="bg-white border-t border-gray-200 px-4 py-4 space-y-4">
            {/* Payment Summary */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[#333333]">Оплата</h3>
              <div className="flex justify-between text-sm">
                <span className="text-[#666666]">
                  Товары: {items.length} шт.
                </span>
                <span className="text-[#9F9F9F] line-through">
                  {(total * 1.2).toLocaleString()} сум
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-[#333333]">
                  Итого:
                </span>
                <span className="text-xl font-bold text-[#333333]">
                  {total.toLocaleString()} сум
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={onCheckout}
              className="w-full py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-medium rounded-xl transition-all shadow-lg active:scale-95"
            >
              Заказать
            </button>

            {/* Terms */}
            <p className="text-xs text-center text-[#666666]">
              <span className="text-[#9F9F9F]">Соглашаюсь с условиями</span>{" "}
              Публичной оферты и правилами возврата
            </p>
          </div>
        )}
      </div>
    </MobileModal>
  );
}
