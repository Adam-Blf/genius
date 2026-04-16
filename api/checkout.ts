/**
 * POST /api/checkout
 * Body : { userId: string, email?: string }
 * Crée une Stripe Checkout Session en mode subscription (mensuel) et renvoie
 * l'URL de redirection. `userId` anonyme stocké localement côté client suffit
 * pour associer l'abonnement à l'appareil (mode PWA sans comptes auth).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18.acacia" });

// Prix mensuel Genius Premium · configuré côté dashboard Stripe
// Allowlist des plans autorisés · le client ne passe qu'un identifiant court
// pour éviter la substitution de price_id côté navigateur.
const PRICES: Record<string, string | undefined> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  yearly: process.env.STRIPE_PRICE_YEARLY,
};
const ALLOWED_ORIGIN = process.env.APP_URL || "https://genius.vercel.app";

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

// Rate limit en mémoire · ~ 1 session / userId / 20s. Simple, suffisant pour
// empêcher un utilisateur de spammer la création de sessions. Pour du prod
// multi-régions il faudrait Upstash/Redis ; ici Vercel Fluid garde l'instance
// chaude quelques minutes, ce qui rend ce cache efficace en pratique.
const lastSeen = new Map<string, number>();
const WINDOW_MS = 20_000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const { userId, email, plan } = (req.body || {}) as { userId?: string; email?: string; plan?: string };
  const priceId = PRICES[plan ?? "monthly"];
  if (!priceId) return res.status(400).json({ error: "bad_plan" });
  if (!userId || typeof userId !== "string" || userId.length < 8 || userId.length > 64) {
    return res.status(400).json({ error: "bad_userId" });
  }
  if (email && (typeof email !== "string" || email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))) {
    return res.status(400).json({ error: "bad_email" });
  }
  const now = Date.now();
  const prev = lastSeen.get(userId) ?? 0;
  if (now - prev < WINDOW_MS) {
    return res.status(429).json({ error: "rate_limited", retryAfter: Math.ceil((WINDOW_MS - (now - prev)) / 1000) });
  }
  lastSeen.set(userId, now);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${ALLOWED_ORIGIN}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${ALLOWED_ORIGIN}/premium?canceled=1`,
      allow_promotion_codes: true,
      client_reference_id: userId,
      customer_email: email,
      metadata: { userId },
      subscription_data: { metadata: { userId } },
    });
    return res.status(200).json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "stripe_error";
    // Ne pas leaker le stack ni la request ID Stripe au client.
    return res.status(500).json({ error: "stripe_error", detail: msg.slice(0, 200) });
  }
}
