/**
 * Normalizes a phone number to a consistent digits-only format.
 * Specifically handles Uzbekistan numbers by ensuring +998 prefix is handled correctly.
 * 
 * @param phone The raw phone number string
 * @returns A normalized string containing only digits (e.g., "998901234567")
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return "";

  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, "");

  // If the number starts with 0, remove it (not common in UZ but good for robustness)
  if (digits.startsWith("0")) {
    digits = digits.substring(1);
  }

  // If it's a 9-digit number (e.g., "901234567"), add the country code 998
  if (digits.length === 9) {
    digits = "998" + digits;
  }

  // If it starts with 8, it might be an old Russian-style prefix or regional, 
  // but in UZ context, if it's 10 digits starting with 8, we likely want to replace it.
  // However, most modern UZ numbers are 9 digits + 998.

  return digits;
}

/**
 * Formats a normalized phone number for display.
 * 
 * @param digits Normalized phone number (e.g., "998901234567")
 * @returns Formatted string (e.g., "+998 (90) 123-45-67")
 */
export function formatPhoneNumber(digits: string): string {
  if (!digits) return "";
  
  // Strip any accidental non-digits just in case
  const d = digits.replace(/\D/g, "");
  
  if (d.length === 12 && d.startsWith("998")) {
    return `+998 (${d.substring(3, 5)}) ${d.substring(5, 8)}-${d.substring(8, 10)}-${d.substring(10, 12)}`;
  }
  
  if (d.length === 9) {
    return `+998 (${d.substring(0, 2)}) ${d.substring(2, 5)}-${d.substring(5, 7)}-${d.substring(7, 9)}`;
  }
  
  // Fallback: just prepend + if it looks like a full number
  return d.startsWith("998") ? "+" + d : d;
}

/**
 * Applies an input mask to a phone number string (Uzbekistan format: XX XXX XX XX).
 * 
 * @param value The raw input value
 * @returns A masked string
 */
export function applyPhoneMask(value: string): string {
  // Extract only digits
  const digits = value.replace(/\D/g, "");
  
  // Limit to 9 digits (Uzbekistan local number length)
  const d = digits.substring(0, 9);
  
  let result = "";
  if (d.length > 0) {
    result += d.substring(0, 2);
  }
  if (d.length > 2) {
    result += " " + d.substring(2, 5);
  }
  if (d.length > 5) {
    result += " " + d.substring(5, 7);
  }
  if (d.length > 7) {
    result += " " + d.substring(7, 9);
  }
  
  return result;
}
