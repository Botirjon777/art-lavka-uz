"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import toast from "react-hot-toast";

import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";
import MainLayout from "./shared/MainLayout";
import RightConfigurator from "./desktop/RightConfigurator";

// LeftSidebar runs two paginated API hooks and is never shown on mobile.
// Lazy-loading it keeps it out of the critical mobile JS path entirely.
const LeftSidebar = dynamic(() => import("./desktop/LeftSidebar"), {
  ssr: false,
  loading: () => (
    <div className="hidden lg:flex flex-col w-[420px] shrink-0 gap-4 pt-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-24 rounded-2xl bg-white/30 animate-pulse" />
      ))}
    </div>
  ),
});
import MobileConfigurator from "./mobile/MobileConfigurator";
import { useSettings } from "../hooks/useSettings";
import { useProducts } from "../hooks/useProducts";
import { usePrints } from "../hooks/usePrints";
import { usePrintCategories } from "../hooks/usePrintCategories";
import { useCartStore } from "@/stores/cartStore";
import { useConfiguratorStore } from "@/stores/configuratorStore";
import { useIsMobile } from "@/hooks/useIsMobile";
import SizeTableModal from "@/components/SizeTableModal";

import {
  CartItem,
  Product,
  PrintDesign,
  ConfiguratorState,
  PrintCategory,
} from "@/types";
import { fetchProducts } from "../api/products";

// All modals are loaded lazily — none are open on initial page load so their
// JS should never be part of the critical-path bundle.
const MenuModal         = dynamic(() => import("../modals/desktop/MenuModal"));
const MobileMenuModal   = dynamic(() => import("../modals/mobile/MobileMenuModal"));
const GalleryModal      = dynamic(() => import("../modals/desktop/GalleryModal"));
const MobileGalleryModal= dynamic(() => import("../modals/mobile/MobileGalleryModal"));
const CartModal         = dynamic(() => import("../modals/desktop/CartModal"));
const ProductsModal     = dynamic(() => import("../modals/desktop/ProductsModal"));
const MobileProductsModal=dynamic(() => import("../modals/mobile/MobileProductsModal"));
const MobilePrintsModal = dynamic(() => import("../modals/mobile/MobilePrintsModal"));
const CheckoutModal     = dynamic(() => import("../modals/shared/CheckoutModal"));
const OrderSuccessModal = dynamic(() => import("../modals/shared/OrderSuccessModal"));

export default function HomeContainer() {
  const { t } = useTranslation();
  const { lang } = useLanguageStore();
  const isMobile = useIsMobile();
  const [activeModal, setActiveModal] = useState<
    "menu" | "cart" | "gallery" | "products" | "prints" | "sizes" | null
  >(null);
  const {
    cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalAmount: calculateTotal,
  } = useCartStore();
  const {
    selectedProduct,
    selectedPrint,
    setSelectedProduct,
    setSelectedPrint,
    _hasHydrated,
  } = useConfiguratorStore();

  // Use hooks for consolidated fetching
  const { data: settings } = useSettings();
  const { data: productsData, isLoading: productsLoading } = useProducts();
  // Prints are lazy-loaded: desktop LeftSidebar fetches its own, mobile fetches on modal open
  const { data: printsData = [], isLoading: printsLoading } = usePrints({
    enabled: activeModal === "prints",
  });
  const { data: printCategories = [] } = usePrintCategories();

  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [oneClickItem, setOneClickItem] = useState<CartItem | null>(null);
  const [hasMultipleProducts, setHasMultipleProducts] = useState(false);

  const selectedProductRef = useRef(selectedProduct);
  const settingsRef = useRef(settings);

  // Sync refs with state to avoid stale closures in interval
  useEffect(() => {
    selectedProductRef.current = selectedProduct;
  }, [selectedProduct]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Handle initial product selection when products are loaded
  useEffect(() => {
    if (productsData && productsData.length > 0) {
      const normalizedProducts = productsData.map((item: any) => ({
        ...item,
        id: item._id,
      }));

      setHasMultipleProducts(normalizedProducts.length > 1);

      if (!selectedProductRef.current) {
        // Priority 1: Default Product
        const defaultProduct = normalizedProducts.find(
          (p: Product) => p.isDefault,
        );
        if (defaultProduct) {
          setSelectedProduct(defaultProduct);
        } else {
          // Priority 2: Active Category Match
          if (settings) {
            const categoryOrder = ["women", "men", "kids"] as const;
            const firstActiveCategory = categoryOrder.find(
              (cat) => settings.categoryStatuses?.[cat] === "active",
            );

            if (firstActiveCategory) {
              const match = normalizedProducts.find(
                (p: Product) => p.category === firstActiveCategory,
              );
              if (match) {
                setSelectedProduct(match);
              } else {
                setSelectedProduct(normalizedProducts[0]);
              }
            } else {
              setSelectedProduct(normalizedProducts[0]);
            }
          } else {
            setSelectedProduct(normalizedProducts[0]);
          }
        }
      }

      // Preload all product models for instant switching
      normalizedProducts.forEach((p: Product) => {
        if (p.model) {
          try {
            const { useGLTF } = require("@react-three/drei");
            useGLTF.preload(p.model);
          } catch (e) {
            // Ignore if not in browser or three.js context
          }
        }
      });
    }
  }, [productsData, settings]);

  const prints = printsData; // Alias for compatibility with existing code

  const handleAddToCart = (config: ConfiguratorState) => {
    if (!selectedProduct) return;

    const selectedVariant = selectedProduct.colors
      ?.find(
        (c) =>
          getTranslated(c, lang) === config.selectedColor ||
          c.hex === config.selectedColor,
      )
      ?.variants?.find((v) => v.size === config.selectedSize);

    const maxStock = selectedVariant?.stock || 0;

    if (config.quantity > maxStock) {
      toast.error(`${t.inStock}: ${maxStock}`);
      return;
    }

    const newItem: CartItem = {
      id: Date.now().toString(),
      product: selectedProduct,
      print: config.selectedPrint,
      color: config.selectedColor,
      size: config.selectedSize,
      quantity: config.quantity,
      price: config.price || selectedProduct.price,
      oldPrice: config.oldPrice,
    };

    addItem(newItem);
    toast.success(t.productAddedToCart);
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
      price: config.price || selectedProduct.price,
      oldPrice: config.oldPrice,
    };

    setOneClickItem(newItem);
    handleCheckout();
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    updateQuantity(id, quantity);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveModal(null);
  };

  const handleSelectPrint = (print: PrintDesign | null) => {
    setSelectedPrint(print);
  };

  const handleCheckout = () => {
    setActiveModal(null);
    setShowCheckout(true);
  };

  const handleOrderSuccess = (orderNum: string) => {
    setOrderNumber(orderNum);
    setShowCheckout(false);
    setShowOrderSuccess(true);

    // Only clear the main cart if this WASN'T a one-click purchase
    if (!oneClickItem) {
      clearCart();
    }

    setOneClickItem(null); // Always clear the one-click state
  };

  const handleCloseOrderSuccess = () => {
    setShowOrderSuccess(false);
    setOrderNumber("");
  };

  const totalAmount = calculateTotal();

  return (
    <MainLayout
      onMenuClick={() => setActiveModal(activeModal === "menu" ? null : "menu")}
      onCartClick={() => setActiveModal(activeModal === "cart" ? null : "cart")}
      onCloseModal={() => setActiveModal(null)}
      cartItemCount={cartItems.length}
      activeModal={activeModal}
      isCheckoutOpen={showCheckout}
    >
      {!_hasHydrated || !productsData ? (
        // Show the t-shirt placeholder immediately so it becomes the LCP
        // element — no dependency on the products API response.
        <div className="flex items-center justify-center">
          {/* Desktop skeleton */}
          <div className="hidden lg:flex h-[calc(100vh-160px)] max-h-[886px] min-w-[964px] rounded-[30px] bg-image items-center justify-center relative before:content-[''] before:absolute before:inset-0 before:bg-black/10 before:rounded-[30px]">
            <Image
              src="/white-t-shirt.webp"
              alt="T-shirt"
              width={300}
              height={380}
              priority
              className="object-contain drop-shadow-xl relative z-10"
            />
          </div>

          {/* Mobile skeleton — mirrors MobileConfigurator's full layout so no
              height shift occurs when real content replaces it (CLS fix). */}
          <div className="lg:hidden flex flex-col bg-white w-full min-h-screen">
            {/* Preview area */}
            <div className="relative bg-image w-full flex items-center justify-center" style={{ minHeight: 480 }}>
              <Image
                src="/white-t-shirt.webp"
                alt="T-shirt"
                width={200}
                height={260}
                priority
                className="object-contain drop-shadow-lg"
              />
              <div className="h-[480px]" />
            </div>
            {/* Print / gallery button row */}
            <div className="flex gap-2.5 px-5 pt-4">
              <div className="flex-1 h-11 rounded-xl bg-[#00C6F1]/15 animate-pulse" />
              <div className="flex-1 h-11 rounded-xl bg-gray-100 animate-pulse" />
            </div>
            {/* Options skeleton (colour + size + action buttons) */}
            <div className="px-5 pt-5 space-y-5 flex-1">
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 rounded bg-gray-100 animate-pulse" />
                ))}
              </div>
              <div className="flex gap-2.5 pt-2">
                <div className="flex-1 h-12 rounded-xl bg-[#00C6F1]/15 animate-pulse" />
                <div className="flex-1 h-12 rounded-xl bg-[#8814B1]/10 animate-pulse" />
              </div>
            </div>
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
              {t.productsNotFound}
            </p>
            <button
              onClick={() => fetchProducts()}
              className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all font-bold active:scale-95"
            >
              {t.reload}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Layout */}
          <div className="hidden lg:flex flex-col justify-center md:flex-row gap-[78px] animate-in fade-in duration-700">
            <LeftSidebar
              onGalleryClick={() => setActiveModal("gallery")}
              selectedPrint={selectedPrint}
              onPrintSelect={handleSelectPrint}
              initialPrints={prints}
              initialLoading={printsLoading}
              printCategories={printCategories}
            />

            <RightConfigurator
              selectedProduct={selectedProduct}
              selectedPrint={selectedPrint}
              onAddToCart={handleAddToCart}
              onBuyOneClick={handleBuyOneClick}
              onProductClick={
                hasMultipleProducts
                  ? () => setActiveModal("products")
                  : undefined
              }
              onSizeClick={() => setActiveModal("sizes")}
            />
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden">
            <MobileConfigurator
              selectedProduct={selectedProduct}
              selectedPrint={selectedPrint}
              onAddToCart={handleAddToCart}
              onBuyOneClick={handleBuyOneClick}
              onProductClick={
                hasMultipleProducts
                  ? () => setActiveModal("products")
                  : undefined
              }
              onPrintClick={() => setActiveModal("prints")}
              onGalleryClick={() => setActiveModal("gallery")}
              onSizeClick={() => setActiveModal("sizes")}
            />
          </div>
        </>
      )}

      {/* Shared Modals Collection - render only the appropriate version */}
      {isMobile ? (
        <MobileMenuModal
          isOpen={activeModal === "menu"}
          onClose={() => setActiveModal(null)}
        />
      ) : (
        <MenuModal
          isOpen={activeModal === "menu"}
          onClose={() => setActiveModal(null)}
        />
      )}

      {isMobile ? (
        <MobileGalleryModal
          isOpen={activeModal === "gallery"}
          onClose={() => setActiveModal(null)}
          onSelectProduct={handleSelectProduct}
        />
      ) : (
        <GalleryModal
          isOpen={activeModal === "gallery"}
          onClose={() => setActiveModal(null)}
          onSelectProduct={handleSelectProduct}
        />
      )}

      {/* Cart is desktop-only (mobile uses /cart route) */}
      {!isMobile && (
        <CartModal
          isOpen={activeModal === "cart"}
          onClose={() => setActiveModal(null)}
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
        />
      )}

      {isMobile ? (
        <MobileProductsModal
          isOpen={activeModal === "products"}
          onClose={() => setActiveModal(null)}
          onSelectProduct={handleSelectProduct}
        />
      ) : (
        <ProductsModal
          isOpen={activeModal === "products"}
          onClose={() => setActiveModal(null)}
          onSelectProduct={handleSelectProduct}
        />
      )}

      {isMobile && (
        <MobilePrintsModal
          isOpen={activeModal === "prints"}
          onClose={() => setActiveModal(null)}
          onSelectPrint={handleSelectPrint}
          selectedPrint={selectedPrint}
        />
      )}

      <SizeTableModal
        isOpen={activeModal === "sizes"}
        onClose={() => setActiveModal(null)}
        data={selectedProduct?.sizeTable}
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
