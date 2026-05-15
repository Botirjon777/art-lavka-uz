"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { RiTelegram2Fill, RiCloseLine, RiInstagramFill, RiArrowRightSLine, RiCustomerService2Fill } from "react-icons/ri";
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-101 shadow-2xl flex flex-col lg:hidden"
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
                                        style={{ height: "auto" }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {section.id === "contact" && (
                              <div className="space-y-3">
                                <a
                                  href={menu.telegram}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-2.5 bg-blue-50/50 hover:bg-blue-50 rounded-xl transition-all"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#229ED9] text-white rounded-xl flex items-center justify-center shadow-sm">
                                      <RiTelegram2Fill size={22} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-gray-800">Telegram</p>
                                      <p className="text-[11px] text-gray-500">Channel</p>
                                    </div>
                                  </div>
                                  <div className="w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center text-gray-400">
                                    <RiArrowRightSLine size={20} />
                                  </div>
                                </a>

                                <Link
                                  href="/support"
                                  onClick={onClose}
                                  className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#8814B1] text-white rounded-xl flex items-center justify-center shadow-sm">
                                      <RiCustomerService2Fill size={22} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-gray-800">{t.support}</p>
                                      <p className="text-[11px] text-gray-500">{t.supportTitle}</p>
                                    </div>
                                  </div>
                                  <div className="w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center text-gray-400">
                                    <RiArrowRightSLine size={20} />
                                  </div>
                                </Link>
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
                                    <a
                                      key={link.value}
                                      href={link.value}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-between p-2.5 bg-pink-50/30 hover:bg-pink-50 rounded-xl transition-all"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-linear-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-xl flex items-center justify-center shadow-sm">
                                          <RiInstagramFill size={22} />
                                        </div>
                                        <div>
                                          <p className="text-sm font-bold text-gray-800">{link.label}</p>
                                          <p className="text-[11px] text-gray-500">Instagram</p>
                                        </div>
                                      </div>
                                      <div className="w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center text-gray-400">
                                        <RiArrowRightSLine size={20} />
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

