import ru from "./locales/ru.json";

export type Translations = typeof ru;
export type Lang = "ru" | "en" | "uz";

export const LANGUAGES: { id: Lang; label: string; flag: string }[] = [
  { id: "ru", label: "Русский", flag: "https://flagcdn.com/w40/ru.png" },
  { id: "en", label: "English", flag: "https://flagcdn.com/w40/us.png" },
  { id: "uz", label: "O'zbekcha", flag: "https://flagcdn.com/w40/uz.png" },
];
