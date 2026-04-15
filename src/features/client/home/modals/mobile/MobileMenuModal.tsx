"use client";

import { useState } from "react";
import Image from "next/image";
import MobileModal from "./MobileModal";
import { RiTelegram2Fill } from "react-icons/ri";
import { MdOutlineEmail } from "react-icons/md";
import Link from "next/link";
import { useSettings } from "@/features/client/home/hooks/useSettings";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";

interface MobileMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGalleryClick: () => void;
}

export default function MobileMenuModal({
  isOpen,
  onClose,
  onGalleryClick,
}: MobileMenuModalProps) {
  const { t } = useTranslation();
  const { lang } = useLanguageStore();
  const [openSection, setOpenSection] = useState<string | null>("delivery");
  const { data: settings, isLoading } = useSettings();

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  if (isLoading || !settings) return null;

  const { menu } = settings;

  return (
    <MobileModal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
      <div className="p-5 space-y-5">
        {/* Delivery Section */}
        <button
          onClick={() => toggleSection("delivery")}
          className="w-full bg-white shadow-md rounded-xl flex items-center justify-between px-5 py-2.5 text-left"
        >
          <h3 className="text-[22px]/[27px] text-[#333333]">{t.delivery}</h3>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              openSection === "delivery" ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {openSection === "delivery" && (
          <div className="pb-5 text-[14px] text-[#666666] leading-relaxed whitespace-pre-wrap px-1">
            {getTranslated(menu, lang, "delivery")}
          </div>
        )}

        {/* Payment Section */}
        <button
          onClick={() => toggleSection("payment")}
          className="w-full bg-white shadow-md rounded-xl flex items-center justify-between px-5 py-2.5 text-left"
        >
          <h3 className="text-[22px]/[27px] text-[#333333]">{t.payment}</h3>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              openSection === "payment" ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {openSection === "payment" && (
          <div className="pb-5 space-y-4 px-1">
            <p className="text-[14px]/[17px] text-[#333333] whitespace-pre-wrap">
              {getTranslated(menu, lang, "payment")}
            </p>
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-21 bg-[#efefef] rounded-lg flex items-center justify-center">
                <Image
                  src="/payment-method/uzcard.png"
                  alt="UZCARD"
                  width={80}
                  height={46}
                />
              </div>
              <div className="flex-1 h-21 bg-[#efefef] rounded-lg flex items-center justify-center">
                <Image
                  src="/payment-method/humo.png"
                  alt="HUMO"
                  width={70}
                  height={21}
                />
              </div>
              <div className="flex-1 h-21 bg-[#efefef] rounded-lg flex items-center justify-center">
                <Image
                  src="/payment-method/pay-me.png"
                  alt="PAYME"
                  width={70}
                  height={20}
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact Section */}
        <button
          onClick={() => toggleSection("contact")}
          className="w-full bg-white shadow-md rounded-xl flex items-center justify-between px-5 py-2.5 text-left"
        >
          <h3 className="text-[22px]/[27px] text-[#333333]">{t.contactUs}</h3>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              openSection === "contact" ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {openSection === "contact" && (
          <div className="pb-5 space-y-3 px-1">
            <a
              href={menu.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-[#229ED9] rounded-full flex items-center justify-center text-white shrink-0">
                <RiTelegram2Fill size={18} />
              </div>
              <div className="text-sm">
                <p className="text-[#333333] font-medium">Telegram</p>
                <p className="text-[#8814B1] break-all">{menu.telegram}</p>
              </div>
            </a>
            <a
              href={`mailto:${menu.email}`}
              className="flex items-center gap-3 p-3 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-[#229ED9] rounded-full flex items-center justify-center text-white shrink-0">
                <MdOutlineEmail size={18} />
              </div>
              <div className="text-sm">
                <p className="text-[#333333] font-medium">Email</p>
                <p className="text-[#8814B1]">{menu.email}</p>
              </div>
            </a>
          </div>
        )}

        {/* About Us Section */}
        <button
          onClick={() => toggleSection("about")}
          className="w-full bg-white shadow-md rounded-xl flex items-center justify-between px-5 py-2.5 text-left"
        >
          <h3 className="text-[22px]/[27px] text-[#333333]">{t.aboutUs}</h3>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              openSection === "about" ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {openSection === "about" && (
          <div className="pb-5 space-y-4 px-1">
            <div className="text-[14px]/[17px] text-[#333333] leading-relaxed whitespace-pre-wrap">
              {getTranslated(menu, lang, "about")}
            </div>

            <div className="space-y-3 pt-2">
              <a
                href={menu.instagramArtists}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 transition-colors"
              >
                <div className="w-10 h-10 bg-linear-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] rounded-full flex items-center justify-center text-white shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="text-[#333333]">{t.artists}:</p>
                  <p className="text-[#8814B1] text-[14px]/[17px] break-all">
                    {menu.instagramArtists}
                  </p>
                </div>
              </a>

              <a
                href={menu.instagramStore}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 transition-colors"
              >
                <div className="w-10 h-10 bg-linear-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] rounded-full flex items-center justify-center text-white shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="text-[#333333]">Instagram:</p>
                  <p className="text-[#8814B1] text-[14px]/[17px] break-all">
                    {menu.instagramStore}
                  </p>
                </div>
              </a>
            </div>
          </div>
        )}

        <div className="flex gap-2.5">
          {/* Track Order Button */}
          <Link
            href="/track-order"
            className="block w-full py-2.5 px-5 bg-linear-to-r from-[#8814B1] to-[#a01dc4] hover:from-[#8814B1]/90 hover:to-[#a01dc4]/90 text-center text-white rounded-xl transition-all shadow-lg text-[14px]/[17px]"
          >
            {t.trackOrder}
          </Link>
          {/* Gallery Button */}
          <button
            onClick={onGalleryClick}
            className="block w-full py-2.5 px-5 bg-[#8814B1] hover:bg-[#8814B1]/90 text-center text-white rounded-xl transition-all shadow-lg text-[14px]/[17px]"
          >
            {t.gallery}
          </button>
        </div>
      </div>
    </MobileModal>
  );
}
