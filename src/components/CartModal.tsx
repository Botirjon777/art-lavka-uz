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
      <div className="w-[1500px] flex flex-col max-h-[800px]">
        <h2 className="text-[24px] font-bold text-[#333333] mb-6">
          Корзина - {items.length}
        </h2>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6">
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
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex gap-4">
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
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {item.size} {item.color}
                    </p>
                    {item.print && (
                      <p className="text-xs text-gray-500">
                        Принт: {item.print.name}
                      </p>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            item.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
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
                      <span className="font-semibold text-gray-800 w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
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
                  </div>

                  {/* Price and Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
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
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        {(item.price * item.quantity).toLocaleString()} сум
                      </p>
                      <p className="text-xs text-gray-500 line-through">
                        {(item.price * item.quantity * 1.2).toLocaleString()}{" "}
                        сум
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Section */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-4 rounded-lg">
            {/* Total */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">
                  Товары: {items.length} шт.
                </span>
                <span className="text-gray-500 line-through">
                  {(total * 1.2).toLocaleString()} сум
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Итого:</span>
                <span className="text-2xl font-bold text-purple-600">
                  {total.toLocaleString()} сум
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button className="w-full py-3 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl">
              Заказать
            </button>

            {/* Payment Info */}
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">Публичная оферта</p>
              <p>Оплата и доставка товара</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
