"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileFooter } from "../../components/mobile/MobileFooter";
import { useScrollLock } from "@/hooks/useScrollLock";

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  showCloseButton?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
}

export default function MobileModal({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  onBack,
  rightAction,
}: MobileModalProps) {
  useScrollLock(isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-0 bg-white flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="relative flex items-center h-14 px-4 border-b border-gray-100 shrink-0">
              {/* Left: Back Button */}
              <div className="flex-1 flex items-center">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-gray-600 active:scale-90 transition-transform"
                    aria-label="Go back"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Center: Title */}
              <div className="absolute inset-x-0 flex justify-center pointer-events-none">
                <h2 className="text-[18px] font-bold text-[#333333] px-16 truncate pointer-events-auto">
                  {title}
                </h2>
              </div>

              {/* Right: Actions / Close */}
              <div className="flex-1 flex items-center justify-end z-10">
                {rightAction}
                {showCloseButton && !rightAction && !onBack && (
                  <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center bg-gray-100/80 text-gray-500 rounded-full active:scale-90 transition-all hover:bg-gray-200"
                    aria-label="Close"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>

            {/* Footer */}
            <MobileFooter />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
