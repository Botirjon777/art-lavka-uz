"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { LANGUAGES } from "@/lib/i18n";
import { HiChevronDown } from "react-icons/hi2";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = LANGUAGES.find((l) => l.id === lang) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-white/70 backdrop-blur-md rounded-xl px-3 py-2.5 shadow-sm border border-gray-100 hover:bg-white/90 hover:shadow-md transition-all duration-300 active:scale-95 group justify-center"
      >
        <img src={currentLanguage.flag} alt={currentLanguage.label} className="w-6 h-4 object-cover rounded-sm shrink-0" />
        <HiChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:text-[#8814B1] ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 mt-2 w-36 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 z-100 ${
          isOpen
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-2 invisible"
        }`}
      >
        <div className="py-1">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              onClick={() => {
                setLang(l.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-purple-50 ${
                lang === l.id
                  ? "text-[#8814B1] bg-purple-50/50"
                  : "text-gray-600"
              }`}
            >
              <div className="flex items-center gap-2">
                <img src={l.flag} alt={l.label} className="w-5 h-3.5 object-cover rounded-sm shrink-0" />
                <span>{l.label}</span>
              </div>
              {lang === l.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#8814B1] shadow-[0_0_8px_rgba(136,20,177,0.6)] shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
