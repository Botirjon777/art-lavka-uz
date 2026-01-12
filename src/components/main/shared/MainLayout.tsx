"use client";

import { ReactNode } from "react";
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import { Toaster } from "react-hot-toast";
import Navbar from "../mobile/Navbar";

interface MainLayoutProps {
  children: ReactNode;
  onMenuClick: () => void;
  onCartClick: () => void;
  cartItemCount: number;
  activeModal: "menu" | "cart" | "gallery" | "products" | "prints" | null;
}

export default function MainLayout({
  children,
  onMenuClick,
  onCartClick,
  cartItemCount,
  activeModal,
}: MainLayoutProps) {
  return (
    <>
      {/* Mobile Navbar */}
      <Navbar
        onMenuClick={onMenuClick}
        onCartClick={onCartClick}
        cartItemCount={cartItemCount}
      />

      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-3 py-4 pt-24 md:p-6">
        {/* Centered Container */}
        <div className="relative w-full max-w-[1600px]">
          {/* Menu Icon - Top Left of Container */}
          <button
            onClick={onMenuClick}
            className="absolute top-20 -left-15 w-14 h-14 hidden md:flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 cursor-pointer text-white rounded-xl transition-colors shadow-lg z-9999"
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
            onClick={onCartClick}
            className="absolute top-20 -right-15 w-14 h-14 hidden md:flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 cursor-pointer text-white rounded-xl transition-colors shadow-lg z-9999"
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
          <div className="py-20 relative">{children}</div>
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#8814B1",
              color: "#fff",
              padding: "16px",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
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
