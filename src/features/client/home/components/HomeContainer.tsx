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
  const [oneClickItem, setOneClickItem] = useState<CartItem | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [prints, setPrints] = useState<PrintDesign[]>([]);
  const [printsLoading, setPrintsLoading] = useState(true);
  const [printCategories, setPrintCategories] = useState<{id: string, label: string}[]>([]);

  // Fetch products on mount and set up auto-refresh
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const currentSettings = await fetchSettings();
      await Promise.all([
        fetchProducts(currentSettings),
        fetchPrints(),
        fetchPrintCategories()
      ]);
    };

    initialize();
    fetchPrints();

    // Auto-refresh every 60 seconds (1 minute)
    const interval = setInterval(() => {
      fetchProducts();
    }, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        return data.data;
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
    return null;
  };

  const fetchProducts = async (currentSettings?: any) => {
    try {
      const response = await fetch("/api/products", {
        cache: "no-store",
      });
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const normalizedProducts = data.data.map((item: any) => ({
          ...item,
          id: item._id,
        }));

        if (!selectedProduct) {
          const activeSettings = currentSettings || settings;
          if (activeSettings) {
            // Find first active category
            const categoryOrder = ["women", "men", "kids"] as const;
            const firstActiveCategory = categoryOrder.find(
              (cat) => activeSettings.categoryStatuses[cat] === "active"
            );

            if (firstActiveCategory) {
              const firstProductInCategory = normalizedProducts.find(
                (p: Product) => p.category === firstActiveCategory
              );
              if (firstProductInCategory) {
                setSelectedProduct(firstProductInCategory);
              } else {
                // Fallback to absolute first product if no product matches active category
                setSelectedProduct(normalizedProducts[0]);
              }
            } else {
              setSelectedProduct(normalizedProducts[0]);
            }
          } else {
            setSelectedProduct(normalizedProducts[0]);
          }
        } else {
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
  
  const fetchPrints = async () => {
    try {
      setPrintsLoading(true);
      const response = await fetch("/api/prints?limit=100", {
        next: { revalidate: 3600 },
      });
      const data = await response.json();
      if (data.success) {
        setPrints(data.data.map((item: any) => ({ ...item, id: item._id })));
      }
    } catch (error) {
      console.error("Error fetching prints:", error);
    } finally {
      setPrintsLoading(false);
    }
  };

  const fetchPrintCategories = async () => {
    try {
      const response = await fetch("/api/prints/categories");
      const data = await response.json();
      if (data.success) {
        setPrintCategories(
          data.data.map((cat: any) => ({
            id: cat.slug,
            label: cat.name,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching print categories:", error);
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

  const handleBuyOneClick = (config: ConfiguratorState) => {
    if (!selectedProduct) return;

    const newItem: CartItem = {
      id: "one-click-" + Date.now().toString(),
      product: selectedProduct,
      print: config.selectedPrint,
      color: config.selectedColor,
      size: config.selectedSize,
      quantity: config.quantity,
      price: selectedProduct.price,
    };

    setOneClickItem(newItem);
    handleCheckout();
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
    setActiveModal(null);
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
    setOneClickItem(null); // Clear one-click state
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
      onCloseModal={() => setActiveModal(null)}
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
        <div className="flex items-center justify-center min-h-[600px] animate-in fade-in duration-1000">
          <div className="text-center px-4">
            <div className="mb-6 flex justify-center">
              <img
                src="/art-lavka.png"
                alt="Logo"
                className="w-48 h-auto opacity-20 grayscale"
              />
            </div>
            <p className="text-gray-400 font-medium mb-6 uppercase tracking-widest text-sm">
              Товары временно не найдены
            </p>
            <button
              onClick={() => fetchProducts()}
              className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all font-bold active:scale-95"
            >
              Перезагрузить
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
              initialPrints={prints}
              initialLoading={printsLoading}
              printCategories={printCategories}
            />

            <RightConfigurator
              selectedProduct={selectedProduct}
              selectedPrint={selectedPrint}
              onAddToCart={handleAddToCart}
              onBuyOneClick={handleBuyOneClick}
              onProductClick={() => setActiveModal("products")}
            />
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden animate-in slide-in-from-bottom duration-500">
            <MobileConfigurator
              selectedProduct={selectedProduct}
              selectedPrint={selectedPrint}
              onAddToCart={handleAddToCart}
              onBuyOneClick={handleBuyOneClick}
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
        initialPrints={prints}
        initialLoading={printsLoading}
        printCategories={printCategories}
      />

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => {
          setShowCheckout(false);
          setOneClickItem(null);
        }}
        items={oneClickItem ? [oneClickItem] : cartItems}
        totalAmount={
          oneClickItem
            ? oneClickItem.price * oneClickItem.quantity
            : totalAmount
        }
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
