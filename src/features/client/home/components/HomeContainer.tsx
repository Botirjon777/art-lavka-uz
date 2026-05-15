"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

// Feature Components (now local to home feature)
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";
import MainLayout from "./shared/MainLayout";
import LeftSidebar from "./desktop/LeftSidebar";
import RightConfigurator from "./desktop/RightConfigurator";
import MobileConfigurator from "./mobile/MobileConfigurator";
import MenuModal from "../modals/desktop/MenuModal";
import MobileMenuModal from "../modals/mobile/MobileMenuModal";
import GalleryModal from "../modals/desktop/GalleryModal";
import MobileGalleryModal from "../modals/mobile/MobileGalleryModal";
import CartModal from "../modals/desktop/CartModal";
import ProductsModal from "../modals/desktop/ProductsModal";
import MobileProductsModal from "../modals/mobile/MobileProductsModal";
import MobilePrintsModal from "../modals/mobile/MobilePrintsModal";
import CheckoutModal from "../modals/shared/CheckoutModal";
import OrderSuccessModal from "../modals/shared/OrderSuccessModal";
import { useSettings } from "../hooks/useSettings";
import { useProducts } from "../hooks/useProducts";
import { usePrints } from "../hooks/usePrints";
import { usePrintCategories } from "../hooks/usePrintCategories";
import { useCartStore } from "@/stores/cartStore";
import { useConfiguratorStore } from "@/stores/configuratorStore";
import SizeTableModal from "@/components/SizeTableModal";

// Shared Types
import {
  CartItem,
  Product,
  PrintDesign,
  ConfiguratorState,
  PrintCategory,
} from "@/types";
import { fetchProducts } from "../api/products";

export default function HomeContainer() {
  const { t } = useTranslation();
  const { lang } = useLanguageStore();
  const [activeModal, setActiveModal] = useState<
    "menu" | "cart" | "gallery" | "products" | "prints" | "sizes" | null
  >(null);
  const { cartItems, addItem, removeItem, updateQuantity, clearCart, totalAmount: calculateTotal } = useCartStore();
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
  const { data: printsData = [], isLoading: printsLoading } = usePrints();
  const { data: printCategories = [] } = usePrintCategories();

  const [loading, setLoading] = useState(!productsData);
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
      setLoading(false);
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

      setLoading(false);
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
      {loading || !_hasHydrated ? (
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8814B1] mx-auto mb-4"></div>
            <p className="text-gray-600 font-bold uppercase tracking-widest text-xs mt-4">
              {t.loadingShowcase}...
            </p>
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
        onSelectPrint={handleSelectPrint}
        selectedPrint={selectedPrint}
        initialPrints={prints}
        initialLoading={printsLoading}
        printCategories={printCategories}
      />

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
