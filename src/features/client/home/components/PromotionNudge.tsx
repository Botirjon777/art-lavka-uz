"use client";

import {
  FiBox,
  FiArrowRight,
  FiShoppingBag,
  FiCheckCircle,
} from "react-icons/fi";
import { Promotion } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

interface PromotionNudgeProps {
  promotion: Promotion;
  currentCount: number;
  onContinue: () => void;
  onShopMore: () => void;
  region: string;
}

export default function PromotionNudge({
  promotion,
  currentCount,
  onContinue,
  onShopMore,
  region,
}: PromotionNudgeProps) {
  const { t } = useTranslation();
  const targetCount = promotion.conditionValue;
  const remaining = Math.max(0, targetCount - currentCount);
  const progress = Math.min(100, (currentCount / targetCount) * 100);

  return (
    <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-60 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300 rounded-[30px]">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon & Message */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-purple-50 rounded-3xl flex items-center justify-center text-[#8814B1] animate-bounce-subtle">
              <FiBox size={48} />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg">
              <FiCheckCircle size={20} />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black text-gray-800 leading-tight">
              {t.almostDone}
            </h2>
            <p className="text-gray-600 font-medium px-4">
              {t.addMoreItems}{" "}
              <span className="text-[#8814B1] font-bold">
                {remaining} {t.pcs}
              </span>
              ,{t.toGetFreeDelivery}{" "}
              <span className="text-green-600 font-bold uppercase tracking-wider">
                {region}
              </span>
              !
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3 px-4">
          <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest">
            <span>{t.nudgeProgress}</span>
            <span>
              {currentCount} / {targetCount}
            </span>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-100 p-0.5">
            <div
              className="h-full bg-linear-to-r from-[#8814B1] to-[#00C6F1] rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 px-4 pt-4">
          <button
            onClick={onShopMore}
            className="w-full py-5 bg-[#8814B1] hover:bg-[#8814B1]/90 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-purple-100 active:scale-95 flex items-center justify-center gap-3 group"
          >
            <FiShoppingBag size={24} />
            <span>{t.shopMore}</span>
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onContinue}
            className="w-full py-4 text-gray-400 hover:text-gray-600 font-bold text-sm transition-all"
          >
            {t.continueCheckoutWithoutPromo}
          </button>
        </div>
      </div>
    </div>
  );
}
