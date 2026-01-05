"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import MainLayout from "@/components/MainLayout";
import LeftSidebar from "@/components/LeftSidebar";
import RightConfigurator from "@/components/RightConfigurator";
import MenuModal from "@/components/MenuModal";
import GalleryModal from "@/components/GalleryModal";
import CartModal from "@/components/CartModal";
import ProductsModal from "@/components/ProductsModal";
import { CartItem, Product, PrintDesign, ConfiguratorState } from "@/types";

export default function Home() {
  const [activeModal, setActiveModal] = useState<
    "menu" | "cart" | "gallery" | "products" | null
  >(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPrint, setSelectedPrint] = useState<PrintDesign | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        // Normalize and set first product as default
        const normalizedProducts = data.data.map((item: any) => ({
          ...item,
          id: item._id,
        }));
        setSelectedProduct(normalizedProducts[0]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (config: ConfiguratorState) => {
    if (!selectedProduct) return;

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
    toast.success("Товар добавлен в корзину!");
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
      onCartClick={() => setActiveModal(activeModal ? null : "cart")}
      cartItemCount={cartItems.length}
      activeModal={activeModal}
    >
      {loading ? (
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8814B1] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      ) : !selectedProduct ? (
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No products available</p>
            <button
              onClick={() => setActiveModal("products")}
              className="px-6 py-3 bg-[#8814B1] text-white rounded-xl hover:bg-[#8814B1]/90"
            >
              Browse Products
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center md:flex-row gap-[78px]">
          <LeftSidebar
            onGalleryClick={() => setActiveModal("gallery")}
            selectedPrint={selectedPrint}
            onPrintSelect={setSelectedPrint}
          />

          <RightConfigurator
            selectedProduct={selectedProduct}
            selectedPrint={selectedPrint}
            onAddToCart={handleAddToCart}
            onProductClick={() => setActiveModal("products")}
          />
        </div>
      )}

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

      <ProductsModal
        isOpen={activeModal === "products"}
        onClose={() => setActiveModal(null)}
        onSelectProduct={handleSelectProduct}
      />
    </MainLayout>
  );
}
