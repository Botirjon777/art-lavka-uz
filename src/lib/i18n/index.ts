import ru from "./locales/ru.json";

export type Translations = typeof ru;
export type Lang = "ru" | "en" | "uz";

export const LANGUAGES: { id: Lang; label: string; flag: string }[] = [
  { id: "ru", label: "RU", flag: "🇷🇺" },
  { id: "en", label: "EN", flag: "🇬🇧" },
  { id: "uz", label: "UZ", flag: "🇺🇿" },
];
