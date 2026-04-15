"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang } from "@/lib/i18n";

interface LanguageStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      lang: "ru",
      setLang: (lang) => set({ lang }),
    }),
    {
      name: "art-lavka-lang",
    }
  )
);
