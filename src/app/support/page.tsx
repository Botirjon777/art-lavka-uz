"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { applyPhoneMask } from "@/lib/phoneUtils";
import { createSupportRequest } from "@/features/client/support/actions/support";
import toast from "react-hot-toast";
import { RiArrowLeftSLine, RiCustomerService2Fill } from "react-icons/ri";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function SupportPage() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !phone || !message) {
      toast.error(t.errorFormFix);
      return;
    }

    if (phone.replace(/\D/g, "").length !== 9) {
      toast.error(t.errorPhoneInvalid);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createSupportRequest({
        fullName,
        phone,
        message,
      });

      if (result.success) {
        setIsSuccess(true);
        toast.success(t.supportSuccess);
      } else {
        toast.error(result.error || "Failed to send request");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[32px] p-10 max-w-md w-full text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#333333] mb-4">{t.supportSuccess}</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {t.supportSuccessDesc}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full py-4 bg-[#8814B1] text-white rounded-2xl font-bold shadow-lg shadow-purple-100 transition-all hover:bg-[#8814B1]/90 active:scale-95"
          >
            {t.backToHome}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-10 px-4 md:py-20">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#8814B1] transition-colors mb-8 font-medium"
        >
          <RiArrowLeftSLine size={24} />
          {t.backToMain}
        </Link>

        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-2xl border border-white/50">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-purple-50 text-[#8814B1] rounded-2xl flex items-center justify-center shrink-0">
              <RiCustomerService2Fill size={32} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#333333]">
                {t.support}
              </h1>
              <p className="text-gray-400 text-sm mt-1">{t.supportTitle}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#333333] ml-1">
                {t.fullName} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-14 px-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-200 outline-none transition-all placeholder:text-gray-300"
                placeholder={t.fullNamePlaceholder}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#333333] ml-1">
                {t.phoneNumber} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                  +998
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(applyPhoneMask(e.target.value))}
                  className="w-full h-14 pl-16 pr-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-200 outline-none transition-all placeholder:text-gray-300"
                  placeholder="XX XXX XX XX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#333333] ml-1">
                {t.message} <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full p-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-200 outline-none transition-all placeholder:text-gray-300 resize-none"
                placeholder={t.messagePlaceholder}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-[#8814B1] text-white rounded-2xl font-bold shadow-lg shadow-purple-100 transition-all hover:bg-[#8814B1]/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  t.send
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
