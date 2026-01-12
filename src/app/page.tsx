"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import MainLayout from "@/components/main/MainLayout";
import LeftSidebar from "@/components/main/LeftSidebar";
import RightConfigurator from "@/components/main/RightConfigurator";
import MobileConfigurator from "@/components/main/MobileConfigurator";
import MenuModal from "@/components/main/MenuModal";
import MobileMenuModal from "@/components/main/MobileMenuModal";
import GalleryModal from "@/components/main/GalleryModal";
import MobileGalleryModal from "@/components/main/MobileGalleryModal";
import CartModal from "@/components/main/CartModal";
import MobileCartModal from "@/components/main/MobileCartModal";
import ProductsModal from "@/components/main/ProductsModal";
import MobileProductsModal from "@/components/main/MobileProductsModal";
import MobilePrintsModal from "@/components/main/MobilePrintsModal";
import CheckoutModal from "@/components/main/CheckoutModal";
import OrderSuccessModal from "@/components/main/OrderSuccessModal";
import { CartItem, Product, PrintDesign, ConfiguratorState } from "@/types";

export default function Home() {
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
        <>
          {/* Desktop Layout */}
          <div className="hidden md:flex flex-col justify-center md:flex-row gap-[78px]">
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
          <div className="md:hidden">
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

      {/* Desktop Modals */}
      <MenuModal
        isOpen={activeModal === "menu"}
        onClose={() => setActiveModal(null)}
      />

      {/* Mobile Modals */}
      <MobileMenuModal
        isOpen={activeModal === "menu"}
        onClose={() => setActiveModal(null)}
      />

      {/* Desktop Gallery Modal */}
      <GalleryModal
        isOpen={activeModal === "gallery"}
        onClose={() => setActiveModal(null)}
        onSelectProduct={handleSelectProduct}
      />

      {/* Mobile Gallery Modal */}
      <MobileGalleryModal
        isOpen={activeModal === "gallery"}
        onClose={() => setActiveModal(null)}
        onSelectProduct={handleSelectProduct}
      />

      {/* Desktop Cart Modal */}
      <CartModal
        isOpen={activeModal === "cart"}
        onClose={() => setActiveModal(null)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      {/* Mobile Cart Modal */}
      <MobileCartModal
        isOpen={activeModal === "cart"}
        onClose={() => setActiveModal(null)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      {/* Desktop Products Modal */}
      <ProductsModal
        isOpen={activeModal === "products"}
        onClose={() => setActiveModal(null)}
        onSelectProduct={handleSelectProduct}
      />

      {/* Mobile Products Modal */}
      <MobileProductsModal
        isOpen={activeModal === "products"}
        onClose={() => setActiveModal(null)}
        onSelectProduct={handleSelectProduct}
      />

      {/* Mobile Prints Modal */}
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
