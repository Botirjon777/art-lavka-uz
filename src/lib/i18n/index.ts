import ru from "./locales/ru.json";

export type Translations = typeof ru;
export type Lang = "ru" | "en" | "uz";

export const LANGUAGES: { id: Lang; label: string; flag: string }[] = [
  { id: "ru", label: "ru", flag: "🇷🇺" },
  { id: "en", label: "en", flag: "🇺🇸" },
  { id: "uz", label: "uz", flag: "🇺🇿" },
];
