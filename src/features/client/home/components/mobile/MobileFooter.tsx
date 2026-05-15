import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export function MobileFooter() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#111111] px-5 py-5 text-center space-y-5">
      {/* Simplified Links */}
      <div className="flex justify-center gap-10">
        <Link
          href="/support"
          className="text-gray-400 text-[13px] font-bold underline underline-offset-4 decoration-white/20 hover:text-white transition-colors"
        >
          {t.support}
        </Link>
        <Link
          href="/track-order"
          className="text-gray-400 text-[13px] font-bold underline underline-offset-4 decoration-white/20 hover:text-white transition-colors"
        >
          {t.trackOrder}
        </Link>
      </div>

      {/* Copyright */}
      <div className="pt-0">
        <p className="text-gray-600 text-[10px] leading-relaxed uppercase tracking-[0.2em] font-medium">
          All rights reserved Art Lavka, 2023 - {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
