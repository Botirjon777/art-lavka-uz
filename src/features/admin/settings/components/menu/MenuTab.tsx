"use client";

import { FiClock, FiSave, FiTruck, FiCreditCard, FiBookOpen } from "react-icons/fi";
import { LANGUAGES, Lang } from "@/lib/i18n";
import { SettingsData } from "../../types";
import MenuSection from "./MenuSection";
import SocialsSection from "./SocialsSection";

interface MenuTabProps {
  settings: SettingsData | null;
  menuDraft: SettingsData["menu"] | null;
  activeLangTab: Lang;
  setActiveLangTab: (lang: Lang) => void;
  isMenuDirty: boolean;
  saving: boolean;
  handleMenuDraftChange: (field: keyof SettingsData["menu"], value: string) => void;
  handleSaveMenu: () => void;
}

export default function MenuTab({
  settings,
  menuDraft,
  activeLangTab,
  setActiveLangTab,
  isMenuDirty,
  saving,
  handleMenuDraftChange,
  handleSaveMenu,
}: MenuTabProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
            Контент меню
          </h2>
          {settings?.updatedAt && (
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-bold uppercase tracking-widest">
              <FiClock className="w-3 h-3" />
              Изменено: {new Date(settings.updatedAt).toLocaleString()}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex border border-gray-100 bg-white rounded-xl overflow-hidden p-1">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setActiveLangTab(l.id as Lang)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all rounded-lg ${
                  activeLangTab === l.id
                    ? "bg-[#8814B1] text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <img src={l.flag} alt={l.label} className="w-4 h-3 object-cover rounded-sm shrink-0" />
                <span>{l.id.toUpperCase()}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleSaveMenu}
            disabled={!isMenuDirty || saving}
            className={`px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95 ${
              isMenuDirty
                ? "bg-[#8814B1] text-white shadow-purple-100 hover:bg-[#8814B1]/90"
                : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
            }`}
          >
            <FiSave />
            {saving ? "Сохранение..." : "Сохранить изменения"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MenuSection
          icon={FiTruck}
          title="Доставка"
          value={
            activeLangTab === "ru"
              ? menuDraft?.delivery || ""
              : menuDraft?.translations?.[activeLangTab]?.delivery || ""
          }
          onChange={(val) => handleMenuDraftChange("delivery", val)}
          placeholder="Текст об условиях доставки..."
          lang={activeLangTab}
        />

        <MenuSection
          icon={FiCreditCard}
          title="Оплата"
          value={
            activeLangTab === "ru"
              ? menuDraft?.payment || ""
              : menuDraft?.translations?.[activeLangTab]?.payment || ""
          }
          onChange={(val) => handleMenuDraftChange("payment", val)}
          placeholder="Текст о способах оплаты..."
          iconBgColor="bg-[#8814B1]/10"
          iconColor="text-[#8814B1]"
          lang={activeLangTab}
        />

        <MenuSection
          icon={FiBookOpen}
          title="О нас"
          value={
            activeLangTab === "ru"
              ? menuDraft?.about || ""
              : menuDraft?.translations?.[activeLangTab]?.about || ""
          }
          onChange={(val) => handleMenuDraftChange("about", val)}
          placeholder="Расскажите о вашем магазине..."
          rows={8}
          iconBgColor="bg-green-50"
          iconColor="text-green-600"
          lang={activeLangTab}
        />

        <SocialsSection
          menuDraft={menuDraft}
          handleMenuDraftChange={handleMenuDraftChange}
        />
      </div>
    </div>
  );
}
