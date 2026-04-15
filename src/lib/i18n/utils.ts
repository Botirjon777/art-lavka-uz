import { Lang } from "@/lib/i18n";

export interface Translatable {
  translations?: Record<string, any>;
  [key: string]: any;
}

/**
 * Utility to get translated value with fallback to base fields
 */
export function getTranslated<T extends Translatable>(
  item: T | null | undefined,
  lang: Lang,
  field: string = "name"
): string {
  if (!item) return "";

  const translation = item.translations?.[lang];
  
  // Try to get from translation object first
  if (translation && typeof translation === 'object' && translation[field]) {
    return translation[field];
  }

  // Fallback to the base item field
  return item[field] || "";
}
