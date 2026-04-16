/**
 * Helpers sécurité côté client.
 *
 * - `sanitizeText` : retire caractères de contrôle, HTML tags et limites de
 *   longueur · appliqué à tout input utilisateur stocké en Dexie.
 * - `rateLimit` : token bucket basé sur localStorage · empêche le spam de
 *   submissions (AddCard, import PDF) sans backend.
 */

const HTML_TAG = /<[^>]*>/g;
const CTRL = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export function sanitizeText(s: string, maxLen = 500): string {
  if (typeof s !== "string") return "";
  return s
    .replace(CTRL, "")
    .replace(HTML_TAG, "")
    .trim()
    .slice(0, maxLen);
}

/** Rejette chaînes qui ressemblent à du code injecté (javascript:, data:…). */
export function isSafe(s: string): boolean {
  if (!s) return true;
  const lower = s.toLowerCase();
  const bad = ["javascript:", "data:text/html", "vbscript:", "on error", "<script"];
  return !bad.some((b) => lower.includes(b));
}

interface Bucket { tokens: number; updatedAt: number }

/**
 * Token bucket · `capacity` tokens remplis à raison de `refillPerSec`/s.
 * Une action coûte 1 token. Retourne `true` si l'action peut passer.
 */
export function rateLimit(key: string, capacity: number, refillPerSec: number): boolean {
  const storageKey = `rl.${key}`;
  const now = Date.now();
  let b: Bucket;
  try {
    b = JSON.parse(localStorage.getItem(storageKey) || "") as Bucket;
  } catch {
    b = { tokens: capacity, updatedAt: now };
  }
  const elapsed = Math.max(0, (now - b.updatedAt) / 1000);
  b.tokens = Math.min(capacity, b.tokens + elapsed * refillPerSec);
  b.updatedAt = now;
  if (b.tokens < 1) {
    localStorage.setItem(storageKey, JSON.stringify(b));
    return false;
  }
  b.tokens -= 1;
  localStorage.setItem(storageKey, JSON.stringify(b));
  return true;
}

/** Délai restant avant prochain token disponible (secondes, arrondi sup). */
export function rateLimitWaitSec(key: string, refillPerSec: number): number {
  const storageKey = `rl.${key}`;
  try {
    const b = JSON.parse(localStorage.getItem(storageKey) || "") as Bucket;
    if (b.tokens >= 1) return 0;
    return Math.ceil((1 - b.tokens) / refillPerSec);
  } catch { return 0; }
}
