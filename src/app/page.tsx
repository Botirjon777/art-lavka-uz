"use client";

import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import LeftSidebar from "@/components/LeftSidebar";
import RightConfigurator from "@/components/RightConfigurator";
import {
  CartItem,
  Product,
  ConfiguratorState,
  ModalType,
  PrintDesign,
} from "@/types";

// Default product
const defaultProduct: Product = {
  id: "1",
  name: "Футболка овер сайз",
  image: "/t-shirt.png",
  category: "women",
  price: 100000,
};

export default function Home() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<Product>(defaultProduct);
  const [selectedPrint, setSelectedPrint] = useState<PrintDesign | null>(null);

  const handleAddToCart = (config: ConfiguratorState) => {
    const newItem: CartItem = {
      id: `${Date.now()}-${Math.random()}`,
      product: selectedProduct,
      print: config.selectedPrint,
      color: config.selectedColor,
      size: config.selectedSize,
      quantity: config.quantity,
      price: selectedProduct.price,
    };

    setCartItems([...cartItems, newItem]);

    // Show success notification
    alert("Товар добавлен в корзину!");
  };

  return (
    <MainLayout
      onMenuClick={() => setActiveModal("menu")}
      onCartClick={() => setActiveModal("cart")}
      cartItemCount={cartItems.length}
    >
      <div className="flex flex-col justify-center md:flex-row gap-[78px]">
        <LeftSidebar
          onGalleryClick={() => setActiveModal("gallery")}
          selectedPrint={selectedPrint}
          onPrintSelect={setSelectedPrint}
        />

        <RightConfigurator
          selectedPrint={selectedPrint}
          onAddToCart={handleAddToCart}
        />
      </div>
    </MainLayout>
  );
}
