import { Lang } from "@/lib/i18n";

export interface Category {
  id: string;
  label: string;
  status: "active" | "soon";
  translations?: Record<string, { label: string }>;
}

export interface SettingsData {
  categories: Category[];
  menu: {
    delivery: string;
    payment: string;
    about: string;
    telegram: string;
    email: string;
    instagramArtists: string;
    instagramStore: string;
    translations?: Record<
      string,
      { delivery?: string; payment?: string; about?: string }
    >;
  };
  updatedAt?: string;
}
