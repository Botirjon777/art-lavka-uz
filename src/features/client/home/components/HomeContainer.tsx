"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// Feature Components (now local to home feature)
import MainLayout from "./shared/MainLayout";
import LeftSidebar from "./desktop/LeftSidebar";
import RightConfigurator from "./desktop/RightConfigurator";
import MobileConfigurator from "./mobile/MobileConfigurator";
import MenuModal from "../modals/desktop/MenuModal";
import MobileMenuModal from "../modals/mobile/MobileMenuModal";
import GalleryModal from "../modals/desktop/GalleryModal";
import MobileGalleryModal from "../modals/mobile/MobileGalleryModal";
import CartModal from "../modals/desktop/CartModal";
import MobileCartModal from "../modals/mobile/MobileCartModal";
import ProductsModal from "../modals/desktop/ProductsModal";
import MobileProductsModal from "../modals/mobile/MobileProductsModal";
import MobilePrintsModal from "../modals/mobile/MobilePrintsModal";
import CheckoutModal from "../modals/shared/CheckoutModal";
import OrderSuccessModal from "../modals/shared/OrderSuccessModal";

// Shared Types
import { CartItem, Product, PrintDesign, ConfiguratorState } from "@/types";

export default function HomeContainer() {
  const [activeModal, setActiveModal] = useState<
    "menu" | "cart" | "gallery" | "products" | "prints" | null
  >(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPrint, setSelectedPrint] = useState<PrintDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Fetch products on mount and set up auto-refresh
  useEffect(() => {
    fetchProducts();

    // Auto-refresh every 60 seconds (1 minute)
    const interval = setInterval(() => {
      fetchProducts();
    }, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products", {
        cache: "no-store", // Don't cache, always fetch fresh data
      });
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        // Normalize and set first product as default
        const normalizedProducts = data.data.map((item: any) => ({
          ...item,
          id: item._id,
        }));

        // If no product selected yet, set the first one
        if (!selectedProduct) {
          setSelectedProduct(normalizedProducts[0]);
        } else {
          // Update the selected product with fresh data if it exists
          const updatedProduct = normalizedProducts.find(
            (p: Product) =>
              p.id === selectedProduct.id || p._id === selectedProduct._id
          );
          if (updatedProduct) {
            setSelectedProduct(updatedProduct);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      // Don't show toast on auto-refresh errors to avoid spam
      if (!selectedProduct) {
        toast.error("Failed to load products");
      }
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

  const handleCheckout = () => {
    setActiveModal(null);
    setShowCheckout(true);
  };

  const handleOrderSuccess = (orderNum: string) => {
    setOrderNumber(orderNum);
    setShowCheckout(false);
    setShowOrderSuccess(true);
    setCartItems([]); // Clear cart
  };

  const handleCloseOrderSuccess = () => {
    setShowOrderSuccess(false);
    setOrderNumber("");
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <MainLayout
      onMenuClick={() => setActiveModal(activeModal === "menu" ? null : "menu")}
      onCartClick={() => setActiveModal(activeModal === "cart" ? null : "cart")}
      cartItemCount={cartItems.length}
      activeModal={activeModal}
    >
      {loading ? (
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8814B1] mx-auto mb-4"></div>
            <p className="text-gray-600 font-bold uppercase tracking-widest text-xs mt-4">Загрузка витрины...</p>
          </div>
        </div>
      ) : !selectedProduct ? (
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Товары временно отсутствуют</p>
            <button
              onClick={() => setActiveModal("products")}
              className="px-6 py-3 bg-[#8814B1] text-white rounded-xl hover:bg-[#8814B1]/90 transition-all font-bold"
            >
              Выбрать из каталога
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Layout */}
          <div className="hidden md:flex flex-col justify-center md:flex-row gap-[78px] animate-in fade-in duration-700">
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

          {/* Mobile Layout */}
          <div className="md:hidden animate-in slide-in-from-bottom duration-500">
            <MobileConfigurator
              selectedProduct={selectedProduct}
              selectedPrint={selectedPrint}
              onAddToCart={handleAddToCart}
              onProductClick={() => setActiveModal("products")}
              onPrintClick={() => setActiveModal("prints")}
            />
          </div>
        </>
      )}

      {/* Shared Modals Collection */}
      <MenuModal
        isOpen={activeModal === "menu"}
        onClose={() => setActiveModal(null)}
      />

      <MobileMenuModal
        isOpen={activeModal === "menu"}
        onClose={() => setActiveModal(null)}
        onGalleryClick={() => setActiveModal("gallery")}
      />

      <GalleryModal
        isOpen={activeModal === "gallery"}
        onClose={() => setActiveModal(null)}
        onSelectProduct={handleSelectProduct}
      />

      <MobileGalleryModal
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
        onCheckout={handleCheckout}
      />

      <MobileCartModal
        isOpen={activeModal === "cart"}
        onClose={() => setActiveModal(null)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      <ProductsModal
        isOpen={activeModal === "products"}
        onClose={() => setActiveModal(null)}
        onSelectProduct={handleSelectProduct}
      />

      <MobileProductsModal
        isOpen={activeModal === "products"}
        onClose={() => setActiveModal(null)}
        onSelectProduct={handleSelectProduct}
      />

      <MobilePrintsModal
        isOpen={activeModal === "prints"}
        onClose={() => setActiveModal(null)}
        onSelectPrint={setSelectedPrint}
        selectedPrint={selectedPrint}
      />

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        items={cartItems}
        totalAmount={totalAmount}
        onSuccess={handleOrderSuccess}
      />

      <OrderSuccessModal
        isOpen={showOrderSuccess}
        onClose={handleCloseOrderSuccess}
        orderNumber={orderNumber}
      />
    </MainLayout>
  );
}
