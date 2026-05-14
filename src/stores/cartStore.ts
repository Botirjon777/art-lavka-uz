import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartStore {
  cartItems: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      addItem: (newItem) => {
        const { cartItems } = get();
        const existingItemIndex = cartItems.findIndex(
          (item) =>
            (item.product.id === newItem.product.id ||
              item.product._id === newItem.product._id) &&
            ((!item.print && !newItem.print) ||
              (item.print &&
                newItem.print &&
                (item.print.id === newItem.print.id ||
                  item.print._id === newItem.print._id))) &&
            item.color === newItem.color &&
            item.size === newItem.size
        );

        if (existingItemIndex > -1) {
          const updatedItems = [...cartItems];
          updatedItems[existingItemIndex].quantity += newItem.quantity;
          set({ cartItems: updatedItems });
        } else {
          set({ cartItems: [...cartItems, newItem] });
        }
      },
      removeItem: (id) =>
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        })),
      clearCart: () => set({ cartItems: [] }),
      totalAmount: () => {
        return get().cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "art-lavka-cart",
    }
  )
);
