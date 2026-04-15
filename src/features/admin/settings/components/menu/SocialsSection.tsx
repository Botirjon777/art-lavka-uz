"use client";

import { FiMessageCircle, FiMail, FiInstagram } from "react-icons/fi";
import { SettingsData } from "../../types";

interface SocialsSectionProps {
  menuDraft: SettingsData["menu"] | null;
  handleMenuDraftChange: (field: keyof SettingsData["menu"], value: string) => void;
}

export default function SocialsSection({
  menuDraft,
  handleMenuDraftChange,
}: SocialsSectionProps) {
  return (
    <div className="lg:col-span-2 bg-gray-900 p-10 rounded-[40px] shadow-xl space-y-8">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <FiMessageCircle className="text-purple-400 text-2xl" />
        <h3 className="text-2xl font-bold text-white">Каналы связи и соцсети</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FiMessageCircle className="text-[#229ED9]" />
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Telegram Link
            </label>
          </div>
          <input
            type="text"
            value={menuDraft?.telegram || ""}
            onChange={(e) => handleMenuDraftChange("telegram", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FiMail className="text-purple-400" />
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Email Address
            </label>
          </div>
          <input
            type="text"
            value={menuDraft?.email || ""}
            onChange={(e) => handleMenuDraftChange("email", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FiInstagram className="text-pink-500" />
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Instagram (Artists)
            </label>
          </div>
          <input
            type="text"
            value={menuDraft?.instagramArtists || ""}
            onChange={(e) => handleMenuDraftChange("instagramArtists", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FiInstagram className="text-purple-500" />
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Instagram (Store)
            </label>
          </div>
          <input
            type="text"
            value={menuDraft?.instagramStore || ""}
            onChange={(e) => handleMenuDraftChange("instagramStore", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
}
