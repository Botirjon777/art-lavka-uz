"use client";

import { useLanguageStore } from "@/stores/languageStore";
import { LANGUAGES } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguageStore();

  return (
    <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-xl px-1 py-1 shadow-sm border border-gray-100">
      {LANGUAGES.map((l) => (
        <button
          key={l.id}
          onClick={() => setLang(l.id)}
          className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
            lang === l.id
              ? "bg-[#8814B1] text-white shadow-md"
              : "text-gray-500 hover:text-[#8814B1] hover:bg-purple-50"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
