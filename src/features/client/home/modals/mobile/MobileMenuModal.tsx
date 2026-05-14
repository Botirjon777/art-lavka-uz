"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { RiTelegram2Fill, RiCloseLine } from "react-icons/ri";
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
  const [openSection, setOpenSection] = useState<string | null>(null);
  const { data: settings, isLoading } = useSettings();

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  if (isLoading || !settings) return null;

  const { menu } = settings;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100 md:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-101 shadow-2xl flex flex-col md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-[#333333]">{t.menu}</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-500 rounded-xl"
              >
                <RiCloseLine size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Sections with Motion */}
              <div className="space-y-4">
                {[
                  { id: "delivery", label: t.delivery },
                  { id: "payment", label: t.payment },
                  { id: "contact", label: t.contactUs },
                  { id: "about", label: t.aboutUs },
                ].map((section) => (
                  <div key={section.id} className="space-y-2">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                        openSection === section.id
                          ? "bg-[#8814B1] text-white shadow-lg shadow-purple-100"
                          : "bg-gray-50 text-[#333333] hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-base font-bold">{section.label}</span>
                      <motion.svg
                        animate={{ rotate: openSection === section.id ? 180 : 0 }}
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </motion.svg>
                    </button>

                    <AnimatePresence>
                      {openSection === section.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden px-1"
                        >
                          <div className="py-2 text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {section.id === "delivery" && getTranslated(menu, lang, "delivery")}
                            {section.id === "payment" && (
                              <div className="space-y-4">
                                <p>{getTranslated(menu, lang, "payment")}</p>
                                <div className="flex items-center gap-2">
                                  {["uzcard", "humo", "pay-me"].map((pm) => (
                                    <div key={pm} className="flex-1 h-14 bg-gray-50 rounded-lg flex items-center justify-center p-2">
                                      <Image
                                        src={`/payment-method/${pm}.png`}
                                        alt={pm}
                                        width={60}
                                        height={30}
                                        className="object-contain"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {section.id === "contact" && (
                              <div className="space-y-2">
                                <a href={menu.telegram} className="flex items-center gap-3 p-2 bg-blue-50/50 rounded-xl">
                                  <div className="w-8 h-8 bg-[#229ED9] text-white rounded-full flex items-center justify-center">
                                    <RiTelegram2Fill size={16} />
                                  </div>
                                  <div className="text-xs">
                                    <p className="font-bold text-gray-700">Telegram</p>
                                    <p className="text-[#8814B1] truncate">{menu.telegram}</p>
                                  </div>
                                </a>
                                <a href={`mailto:${menu.email}`} className="flex items-center gap-3 p-2 bg-blue-50/50 rounded-xl">
                                  <div className="w-8 h-8 bg-[#229ED9] text-white rounded-full flex items-center justify-center">
                                    <MdOutlineEmail size={16} />
                                  </div>
                                  <div className="text-xs">
                                    <p className="font-bold text-gray-700">Email</p>
                                    <p className="text-[#8814B1]">{menu.email}</p>
                                  </div>
                                </a>
                              </div>
                            )}
                            {section.id === "about" && (
                              <div className="space-y-4">
                                <p>{getTranslated(menu, lang, "about")}</p>
                                <div className="space-y-2">
                                  {[
                                    { label: t.artists, value: menu.instagramArtists },
                                    { label: "Instagram", value: menu.instagramStore },
                                  ].map((link) => (
                                    <a key={link.value} href={link.value} className="flex items-center gap-3 p-2 bg-pink-50/50 rounded-xl">
                                      <div className="w-8 h-8 bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                      </div>
                                      <div className="text-xs">
                                        <p className="font-bold text-gray-700">{link.label}</p>
                                        <p className="text-[#8814B1] truncate">{link.value}</p>
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-5 border-t border-gray-100 space-y-2 bg-gray-50/30">
              <Link
                href="/track-order"
                onClick={onClose}
                className="flex items-center justify-center w-full py-3 bg-[#8814B1] text-white rounded-xl font-bold shadow-lg shadow-purple-100 text-sm"
              >
                {t.trackOrder}
              </Link>
              <button
                onClick={() => {
                  onGalleryClick();
                  onClose();
                }}
                className="flex items-center justify-center w-full py-3 border-2 border-[#8814B1] text-[#8814B1] rounded-xl font-bold hover:bg-purple-50 text-sm"
              >
                {t.gallery}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

