"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface WelcomeScreenProps {
  show: boolean;
}

export default function WelcomeScreen({ show }: WelcomeScreenProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-9999 flex items-center justify-center bg-white"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-48 h-48"
          >
            <Image
              src="/art-lavka.png"
              alt="Art Lavka Logo"
              fill
              sizes="192px"
              className="object-contain"
              priority
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
