"use client";

import Image from "next/image";
import { PiShoppingCartSimpleBold } from "react-icons/pi";

interface NavbarProps {
  onMenuClick: () => void;
  onCartClick: () => void;
  cartItemCount: number;
  activeModal: "menu" | "cart" | "gallery" | "products" | "prints" | null;
}

export default function Navbar({
  onMenuClick,
  onCartClick,
  cartItemCount,
  activeModal,
}: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Menu Button / Close Button */}
        <button
          onClick={onMenuClick}
          className="w-12 h-12 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 text-white rounded-xl transition-colors"
          aria-label={activeModal === "menu" ? "Close menu" : "Open menu"}
        >
          {activeModal === "menu" ? (
            <svg
              className="w-6 h-6"
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
            <svg
              className="w-6 h-6"
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
          )}
        </button>

        {/* Logo */}
        <div className="flex-1 flex justify-center">
          <Image
            src="/art-lavka.png"
            alt="ART LAVKA.UZ"
            width={180}
            height={68}
            className="object-contain"
            priority
          />
        </div>

        {/* Cart Button / Close Button */}
        <button
          onClick={onCartClick}
          className="relative w-12 h-12 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 text-white rounded-xl transition-colors"
          aria-label={activeModal === "cart" ? "Close cart" : "Open cart"}
        >
          {activeModal === "cart" ? (
            <svg
              className="w-6 h-6"
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
              <PiShoppingCartSimpleBold size={22} />
              {cartItemCount > 0 && (
                <span className="absolute -bottom-2 -left-2 w-6 h-6 bg-[#00C6F1] text-white text-[13px]/[16px] rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </nav>
  );
}
