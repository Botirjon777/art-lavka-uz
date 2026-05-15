"use client";

import { ReactNode } from "react";
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import { Toaster } from "react-hot-toast";
import Navbar from "../mobile/Navbar";

interface MainLayoutProps {
  children: ReactNode;
  onMenuClick: () => void;
  onCartClick: () => void;
  onCloseModal: () => void;
  cartItemCount: number;
  activeModal: "menu" | "cart" | "gallery" | "products" | "prints" | "sizes" | null;
  isCheckoutOpen?: boolean;
}

export default function MainLayout({
  children,
  onMenuClick,
  onCartClick,
  onCloseModal,
  cartItemCount,
  activeModal,
  isCheckoutOpen,
}: MainLayoutProps) {
  return (
    <>
      {/* Mobile Navbar */}
      <Navbar
        onMenuClick={onMenuClick}
        onCartClick={onCartClick}
        onCloseModal={onCloseModal}
        cartItemCount={cartItemCount}
        activeModal={isCheckoutOpen ? null : activeModal}
        hidden={isCheckoutOpen}
      />

      <div className="min-h-screen bg-[#F5F5F5] pt-15 lg:pt-0 flex items-center justify-center">
        {/* Centered Container */}
        <div className="relative w-full max-w-[1600px]">
          {/* Menu Icon - Top Left of Container */}
          <button
            onClick={activeModal ? onCloseModal : onMenuClick}
            className={`absolute top-20 -left-20 w-14 h-14 ${isCheckoutOpen ? "hidden" : "hidden lg:flex"} items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 cursor-pointer text-white rounded-xl transition-colors shadow-lg z-99`}
            aria-label="Open menu"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Cart Icon / Close Button - Top Right of Container */}
          <button
            onClick={activeModal ? onCloseModal : onCartClick}
            className={`absolute top-20 -right-20 w-14 h-14 ${isCheckoutOpen ? "hidden" : "hidden lg:flex"} items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 cursor-pointer text-white rounded-xl transition-colors shadow-lg z-99`}
            aria-label={activeModal ? "Close modal" : "Open cart"}
          >
            {activeModal ? (
              <svg
                className="w-7 h-7"
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
            ) : (
              <>
                <PiShoppingCartSimpleBold size={24} />
                {cartItemCount > 0 && (
                  <span className="absolute -bottom-2 -left-2 w-7 h-7 bg-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </>
            )}
          </button>

          {/* Main Content */}
          <div className="xl:py-20 relative">{children}</div>
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#8814B1",
              color: "#fff",
              padding: "12px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "600",
              maxWidth: "90vw",
            },
            success: {
              iconTheme: {
                primary: "#fff",
                secondary: "#8814B1",
              },
            },
          }}
        />
      </div>
    </>
  );
}
