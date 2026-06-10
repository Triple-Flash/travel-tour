import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Normalize a phone number to a canonical format for comparison.
 * Strips all non-digit characters, handles Vietnamese prefixes:
 * - "0xxxxxxxxx" → kept as-is for local format
 * - "+84xxxxxxxxx" → converted to "0xxxxxxxxx" for consistency
 */
export function normalizePhoneNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  // Convert +84 prefix to 0 prefix (Vietnamese format)
  if (digits.startsWith("84") && digits.length >= 11) {
    return "0" + digits.slice(2);
  }
  return digits;
}