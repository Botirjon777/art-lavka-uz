"use client";

import Image from "next/image";
import { PiShoppingCartSimpleBold } from "react-icons/pi";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface NavbarProps {
  onMenuClick: () => void;
  onCartClick: () => void;
  cartItemCount: number;
  activeModal: "menu" | "cart" | "gallery" | "products" | "prints" | null;
  hidden?: boolean;
}

export default function Navbar({
  onMenuClick,
  onCartClick,
  cartItemCount,
  activeModal,
  hidden,
}: NavbarProps) {
  if (hidden) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 md:hidden">
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Menu Button / Close Button */}
        <div className="flex-1 flex justify-start">
          <button
            onClick={onMenuClick}
            className="w-10 h-10 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 text-white rounded-xl transition-colors"
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
        </div>

        {/* Logo - Centered */}
        <div className="shrink-0 flex justify-center px-2">
          <Image
            src="/art-lavka.png"
            alt="ART LAVKA.UZ"
            width={110}
            height={42}
            className="object-contain"
            priority
          />
        </div>

        {/* Actions - Right */}
        <div className="flex-1 flex items-center justify-end gap-1.5">
          <LanguageSwitcher />
          
          <button
            onClick={onCartClick}
            className="relative w-10 h-10 flex items-center justify-center bg-[#8814B1] hover:bg-[#8814B1]/80 text-white rounded-xl transition-colors"
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
                <PiShoppingCartSimpleBold size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#00C6F1] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {cartItemCount}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
