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
        <div className="flex-1 overflow-y-auto px-5">
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
            <div className="space-y-2.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-2.5 shadow-lg relative"
                >
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Info and Controls */}
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Product Name and Details */}
                      <div>
                        <h4 className="text-[14px]/[17px] text-[#333333] mb-1">
                          {item.product.name}
                        </h4>
                        <p className="text-[13px]/[16px] text-[#666666]">
                          {item.size} ({item.color})
                        </p>
                        {item.print && (
                          <p className="text-[13px]/[16px]">
                            Принт:{" "}
                            <span className="text-[#00C6F1]">
                              {item.print.name}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
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
                        <span className="text-[14px]/[17px] text-[#333333] w-4 text-center">
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

                      <div className="mt-2 text-left">
                        <p className="text-[16px]/[20px] text-[#333333]">
                          {(item.price * item.quantity).toLocaleString()} сум
                        </p>
                        {item.oldPrice && item.oldPrice > item.price && (
                          <p className="text-[13px]/[16px] text-[#9F9F9F] line-through">
                            {(item.oldPrice * item.quantity).toLocaleString()} сум
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Remove Button - Top Right */}
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="absolute top-3 right-3 text-[#999999] hover:text-[#8814B1] transition-colors"
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Section - Sticky Bottom */}
        {items.length > 0 && (
          <div className="bg-white shadow-2xl m-5 p-5 rounded-xl space-y-2.5">
            {/* Payment Summary Card */}
            <div className="space-y-2.5 text-[#333333]">
              <h3 className="text-[22px]/[27px]">Оплата</h3>
              <div className="flex gap-2.5 text-[13px]/[22px]">
                <span>Товары: {items.length} шт.</span>
                {items.some(item => item.oldPrice && item.oldPrice > item.price) && (
                  <span className="text-[#9F9F9F] line-through">
                    {items.reduce((sum, item) => sum + (item.oldPrice || item.price) * item.quantity, 0).toLocaleString()} сум
                  </span>
                )}
              </div>
              <div className="flex gap-2.5 items-center">
                <span className="text-[13px]/[22px]">Итого:</span>
                <span className="text-[16px]/[20px]">
                  {total.toLocaleString()} сум
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={onCheckout}
              className="w-full py-[15px] bg-[#8814B1] hover:bg-[#8814B1]/90 text-white rounded-xl transition-all shadow-lg active:scale-95 text-[13px]/[16px]"
            >
              Заказать
            </button>

            {/* Terms */}
            <p className="text-[12px]/[18px] text-left text-[#666666]">
              <span className="text-[#9F9F9F]">Соглашаюсь с условиями</span>{" "}
              Публичной оферты и правилами возврата
            </p>
          </div>
        )}
      </div>
    </MobileModal>
  );
}
