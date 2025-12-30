"use client";

import Modal from "./Modal";
import { CartItem } from "@/types";
import Image from "next/image";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export default function CartModal({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartModalProps) {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[1500px] flex gap-6">
        {/* Left Side - Cart Items */}
        <div className="flex-1">
          <h2 className="text-[24px] font-bold text-[#333333] mb-6">
            Корзина - {items.length}
          </h2>

          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
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
                <p className="text-lg">Корзина пуста</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-[20px] p-4 shadow-sm flex items-center gap-4"
                >
                  {/* Product Image */}
                  <div className="relative w-20 h-20 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-[16px] text-gray-800">
                      {item.product.name}
                    </h4>
                    <p className="text-[14px] text-gray-600">
                      {item.size} {item.color}
                    </p>
                    {item.print && (
                      <p className="text-[12px] text-[#00C6F1]">
                        Принт: {item.print.name}
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        onUpdateQuantity(
                          item.id,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                      className="w-10 h-10 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/90 text-white rounded-full transition-colors"
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
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <span className="font-semibold text-[18px] text-gray-800 w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className="w-10 h-10 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/90 text-white rounded-full transition-colors"
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right min-w-[120px]">
                    <p className="font-bold text-[18px] text-gray-800">
                      {(item.price * item.quantity).toLocaleString()} сум
                    </p>
                    <p className="text-[12px] text-gray-400 line-through">
                      {(item.price * item.quantity * 1.2).toLocaleString()} сум
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                    aria-label="Remove item"
                  >
                    <svg
                      className="w-6 h-6"
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
              ))
            )}
          </div>
        </div>

        {/* Right Side - Payment Summary */}
        {items.length > 0 && (
          <div className="w-[320px] shrink-0">
            <div className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-200 sticky top-0">
              <h3 className="text-[20px] font-bold text-[#333333] mb-4">
                Оплата
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[14px]">
                  <span className="text-gray-600">
                    Товары: {items.length} шт.
                  </span>
                  <span className="text-gray-400 line-through">
                    {(total * 1.2).toLocaleString()} сум
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-[16px] font-semibold text-gray-800">
                    Итого:
                  </span>
                  <span className="text-[24px] font-bold text-[#8814B1]">
                    {total.toLocaleString()} сум
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button className="w-full py-3 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl mb-4">
                Заказать
              </button>

              {/* Payment Info */}
              <div className="text-center text-[12px] text-gray-500 space-y-1">
                <p>Согласен с условиями Публичной</p>
                <p>оферты и правилами возврата</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
