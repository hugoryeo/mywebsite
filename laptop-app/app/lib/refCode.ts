import { randomInt } from "crypto";

/**
 * Alphabet for reference codes: Crockford-style base32 with the characters
 * that get misread off a sticker removed — no 0/O, no 1/I/L, no U. 31 symbols
 * over 4 places gives ~923,000 codes, which is far more than this app will
 * ever hold, so collisions are rare and handled by retrying anyway.
 */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const LENGTH = 4;

/** e.g. "LT-4F2A". Server-side only — uses node:crypto. */
export function generateRefCode(): string {
  let body = "";
  for (let i = 0; i < LENGTH; i++) {
    body += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return `LT-${body}`;
}

/**
 * Accepts what someone would actually type when looking a laptop up:
 * "lt-4f2a", "4F2A", " LT4F2A ". Returns the canonical "LT-4F2A", or null
 * if it isn't a plausible code.
 */
export function normaliseRefCode(raw: string): string | null {
  const cleaned = raw.trim().toUpperCase().replace(/[\s-]/g, "").replace(/^LT/, "");
  if (cleaned.length !== LENGTH) return null;
  if (![...cleaned].every((c) => ALPHABET.includes(c))) return null;
  return `LT-${cleaned}`;
}
