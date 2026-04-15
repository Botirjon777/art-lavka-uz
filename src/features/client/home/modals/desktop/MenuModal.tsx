"use client";

import Image from "next/image";
import Modal from "@/components/Modal";
import { RiTelegram2Fill } from "react-icons/ri";
import { MdOutlineEmail } from "react-icons/md";
import { useSettings } from "@/features/client/home/hooks/useSettings";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuModal({ isOpen, onClose }: MenuModalProps) {
  const { t } = useTranslation();
  const { lang } = useLanguageStore();
  const { data: settings, isLoading } = useSettings();

  if (isLoading || !settings) return null;

  const { menu } = settings;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[1500px] max-w-full min-h-[600px]">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Delivery Section */}
          <section className="bg-white rounded-[20px] p-10 shadow-sm text-left">
            <h3 className="text-[30px]/[37px] text-[#333333] mb-5">{t.delivery}</h3>
            <div className="text-[16px]/[22px] text-[#666666] whitespace-pre-wrap">
              {getTranslated(menu, lang, "delivery")}
            </div>
          </section>

          {/* Payment Section */}
          <section className="bg-white rounded-[20px] space-y-5 p-10 shadow-sm text-left">
            <h3 className="text-[30px]/[37px] text-[#333333]">{t.payment}</h3>
            <div className="text-[16px]/[22px] text-[#666666] whitespace-pre-wrap">
              {getTranslated(menu, lang, "payment")}
            </div>
            <div className="flex items-center gap-5">
              <div className="h-25 w-full bg-[#efefef] rounded-xl flex items-center justify-center">
                <Image
                  src="/payment-method/uzcard.png"
                  alt="UZCARD"
                  width={110}
                  height={64}
                />
              </div>
              <div className="h-25 w-full bg-[#efefef] rounded-xl flex items-center justify-center">
                <Image
                  src="/payment-method/humo.png"
                  alt="HUMO"
                  width={100}
                  height={30}
                />
              </div>
              <div className="h-25 w-full bg-[#efefef] rounded-xl flex items-center justify-center">
                <Image
                  src="/payment-method/pay-me.png"
                  alt="PAYME"
                  width={99}
                  height={28}
                />
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[20px] p-10 shadow-sm text-left">
            <h3 className="text-[30px]/[37px] text-[#333333] mb-5">{t.contactUs}</h3>
            <div className="space-y-3">
              <a
                href={menu.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[14px] text-[#0088cc] hover:text-[#0088cc]/80 transition-colors"
              >
                <div className="w-10 h-10 bg-[#229ED9] rounded-full flex items-center justify-center text-white">
                  <RiTelegram2Fill size={18} />
                </div>
                <div className="text-[16px]/[22px] text-[#333333]">
                  <p>Telegram</p>
                  <p className="text-[#8814B1] truncate max-w-[200px]">{menu.telegram}</p>
                </div>
              </a>
              <a
                href={`mailto:${menu.email}`}
                className="flex items-center gap-2.5 text-[14px] text-[#8814B1] hover:text-[#8814B1]/80 transition-colors"
              >
                <div className="w-10 h-10 bg-[#229ED9] rounded-full flex items-center justify-center text-white">
                  <MdOutlineEmail size={18} />
                </div>
                <div className="text-[16px]/[22px] text-[#333333]">
                  <p>Email</p>
                  <p className="text-[#8814B1]">{menu.email}</p>
                </div>
              </a>
            </div>
          </section>
        </div>

        <section className="bg-white rounded-[20px] p-10 shadow-sm text-left">
          <h3 className="text-[30px]/[37px] text-[#333333] mb-5">{t.aboutUs}</h3>
          <div className="space-y-5 text-[16px]/[22px] text-[#666666] whitespace-pre-wrap">
            {getTranslated(menu, lang, "about")}
            <div className="space-y-3 pt-4 border-t border-gray-50">
              <a
                href={menu.instagramArtists}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[14px] text-[#0088cc] hover:text-[#0088cc]/80 transition-colors"
              >
                <div className="w-10 h-10 bg-linear-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] rounded-full flex items-center justify-center text-white">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div className="text-[16px]/[22px] text-[#333333]">
                  <p>{t.artists}:</p>
                  <p className="text-[#8814B1] truncate max-w-[400px]">
                    {menu.instagramArtists}
                  </p>
                </div>
              </a>
              <a
                href={menu.instagramStore}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[14px] text-[#0088cc] hover:text-[#0088cc]/80 transition-colors"
              >
                <div className="w-10 h-10 bg-linear-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] rounded-full flex items-center justify-center text-white">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <div className="text-[16px]/[22px] text-[#333333]">
                  <p>Instagram:</p>
                  <p className="text-[#8814B1] truncate max-w-[400px]">
                    {menu.instagramStore}
                  </p>
                </div>
              </a>
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}
