"use client";

import Image from "next/image";
import { PiShoppingCartSimpleBold } from "react-icons/pi";

interface NavbarProps {
  onMenuClick: () => void;
  onCartClick: () => void;
  cartItemCount: number;
}

export default function Navbar({
  onMenuClick,
  onCartClick,
  cartItemCount,
}: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Menu Button */}
        <button
          onClick={onMenuClick}
          className="w-12 h-12 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 text-white rounded-xl transition-colors"
          aria-label="Open menu"
        >
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

        {/* Cart Button */}
        <button
          onClick={onCartClick}
          className="relative w-12 h-12 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 text-white rounded-xl transition-colors"
          aria-label="Open cart"
        >
          <PiShoppingCartSimpleBold size={22} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#00C6F1] text-white text-xs font-bold rounded-full flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
