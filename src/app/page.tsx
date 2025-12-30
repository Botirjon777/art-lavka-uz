"use client";

import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import LeftSidebar from "@/components/LeftSidebar";
import RightConfigurator from "@/components/RightConfigurator";
import MenuModal from "@/components/MenuModal";
import GalleryModal from "@/components/GalleryModal";
import CartModal from "@/components/CartModal";
import { CartItem, Product, PrintDesign, ConfiguratorState } from "@/types";

// Default product
const defaultProduct: Product = {
  id: "1",
  name: "Футболка овер сайз",
  image: "/t-shirt.png",
  category: "women",
  price: 100000,
};

export default function Home() {
  const [activeModal, setActiveModal] = useState<
    "menu" | "cart" | "gallery" | null
  >(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<Product>(defaultProduct);
  const [selectedPrint, setSelectedPrint] = useState<PrintDesign | null>(null);

  const handleAddToCart = (config: ConfiguratorState) => {
    const newItem: CartItem = {
      id: Date.now().toString(),
      product: selectedProduct,
      print: config.selectedPrint,
      color: config.selectedColor,
      size: config.selectedSize,
      quantity: config.quantity,
      price: selectedProduct.price,
    };

    setCartItems([...cartItems, newItem]);
    alert("Товар добавлен в корзину!");
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCartItems(
      cartItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
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

      {/* Modals */}
      <MenuModal
        isOpen={activeModal === "menu"}
        onClose={() => setActiveModal(null)}
      />

      <GalleryModal
        isOpen={activeModal === "gallery"}
        onClose={() => setActiveModal(null)}
        onSelectProduct={handleSelectProduct}
      />

      <CartModal
        isOpen={activeModal === "cart"}
        onClose={() => setActiveModal(null)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </MainLayout>
  );
}
