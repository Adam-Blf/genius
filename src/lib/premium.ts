/**
 * Gestion du Premium côté client.
 *
 * - `userId` anonyme (nanoid 16) généré au premier lancement et persisté en
 *   localStorage → sert de `client_reference_id` pour Stripe et de clé de
 *   lookup dans la KV (future).
 * - `premiumUntil` (timestamp ms) stocké en localStorage + miroir Dexie.
 *   Le frontend traite l'utilisateur comme Premium tant que `Date.now() < premiumUntil`.
 * - Source de vérité = serveur Stripe via `/api/verify` ; le cache local
 *   peut être périmé mais jamais "avant l'heure" (on n'écrit que sur réponse
 *   serveur).
 */

const USER_KEY = "genius.userId";
const UNTIL_KEY = "genius.premiumUntil";

export function getUserId(): string {
  let v = localStorage.getItem(USER_KEY);
  if (!v) {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    v = Array.from(bytes).map((b) => b.toString(36).padStart(2, "0")).join("").slice(0, 20);
    localStorage.setItem(USER_KEY, v);
  }
  return v;
}

export function premiumUntil(): number {
  const raw = localStorage.getItem(UNTIL_KEY);
  if (!raw) return 0;
  const n = +raw;
  return Number.isFinite(n) ? n : 0;
}

export function isPremium(): boolean {
  return premiumUntil() > Date.now();
}

export function setPremiumUntil(ms: number) {
  if (!Number.isFinite(ms) || ms < Date.now()) return;
  localStorage.setItem(UNTIL_KEY, String(ms));
}

export async function startCheckout(email?: string): Promise<string> {
  const r = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: getUserId(), email }),
  });
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    if (r.status === 429) throw new Error(`Trop de tentatives · ${d.retryAfter ?? 20}s`);
    throw new Error(d.error || "checkout_failed");
  }
  const { url } = await r.json();
  if (!url) throw new Error("no_url");
  return url as string;
}

export async function verifySession(sessionId: string): Promise<number | null> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
  const r = await fetch(`/api/verify?session_id=${encodeURIComponent(sessionId)}`);
  if (!r.ok) return null;
  const d = await r.json();
  if (!d.ok || !d.premiumUntil) return null;
  setPremiumUntil(d.premiumUntil);
  return d.premiumUntil;
}
