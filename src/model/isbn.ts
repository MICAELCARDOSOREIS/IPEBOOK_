/**
 * Utilitário de normalização e validação de ISBN (ISBN-10 e ISBN-13).
 */

export function normalizeIsbn(raw: string): string {
  if (!raw || typeof raw !== "string") return "";
  return raw.replace(/[-\s]/g, "").trim().toUpperCase();
}

export function isValidIsbn10(isbn: string): boolean {
  const clean = normalizeIsbn(isbn);
  if (!/^\d{9}[\dX]$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(clean[i], 10) * (10 - i);
  }
  const checksum = clean[9] === "X" ? 10 : Number.parseInt(clean[9], 10);
  sum += checksum;

  return sum % 11 === 0;
}

export function isValidIsbn13(isbn: string): boolean {
  const clean = normalizeIsbn(isbn);
  if (!/^\d{13}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = Number.parseInt(clean[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === Number.parseInt(clean[12], 10);
}

export function isValidIsbn(isbn: string): boolean {
  const clean = normalizeIsbn(isbn);
  if (clean.length === 10) return isValidIsbn10(clean);
  if (clean.length === 13) return isValidIsbn13(clean);
  return false;
}
