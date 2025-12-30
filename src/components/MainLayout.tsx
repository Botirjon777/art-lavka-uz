"use client";

import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
  onMenuClick: () => void;
  onCartClick: () => void;
  cartItemCount: number;
}

export default function MainLayout({
  children,
  onMenuClick,
  onCartClick,
  cartItemCount,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6">
      {/* Centered Container */}
      <div className="relative w-full max-w-[1600px]">
        {/* Menu Icon - Top Left of Container */}
        <button
          onClick={onMenuClick}
          className="absolute top-0 left-0 w-14 h-14 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 cursor-pointer text-white rounded-xl transition-colors shadow-lg z-50"
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

        {/* Cart Icon - Top Right of Container */}
        <button
          onClick={onCartClick}
          className="absolute top-0 right-0 w-14 h-14 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 cursor-pointer text-white rounded-xl transition-colors shadow-lg z-50"
          aria-label="Open cart"
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
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>

        {/* Main Content */}
        <div className="py-20">{children}</div>
      </div>
    </div>
  );
}
