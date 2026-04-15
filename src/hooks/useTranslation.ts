"use client";

import { useLanguageStore } from "@/stores/languageStore";
import type { Translations } from "@/lib/i18n";
import ru from "@/lib/i18n/locales/ru.json";
import en from "@/lib/i18n/locales/en.json";
import uz from "@/lib/i18n/locales/uz.json";

const locales: Record<string, Translations> = { ru, en, uz };

export function useTranslation() {
  const lang = useLanguageStore((s) => s.lang);
  const t = (locales[lang] ?? ru) as Translations;
  return { t, lang };
}
