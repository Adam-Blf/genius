/**
 * GET /api/verify?session_id=cs_...
 * Appelé par le client au retour de Stripe Checkout. Vérifie que la session
 * est payée et renvoie la période d'accès Premium. Le client stocke l'état
 * dans Dexie (premiumUntil) comme cache local.
 *
 * Anti-abuse : on refuse si la session a déjà été vérifiée pour un autre
 * userId, et on limite le taux d'appels par session_id.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18.acacia" });
const ALLOWED_ORIGIN = process.env.APP_URL || "https://genius.vercel.app";

const seen = new Map<string, number>(); // session_id → first check timestamp

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });

  const sid = String(req.query.session_id || "");
  if (!sid.startsWith("cs_") || sid.length > 200) return res.status(400).json({ error: "bad_session_id" });

  const now = Date.now();
  const first = seen.get(sid) ?? now;
  if (now - first > 10 * 60_000) seen.delete(sid);
  seen.set(sid, first);

  try {
    const session = await stripe.checkout.sessions.retrieve(sid, { expand: ["subscription"] });
    if (session.payment_status !== "paid" && session.status !== "complete") {
      return res.status(402).json({ ok: false, status: session.status });
    }
    const sub = session.subscription as Stripe.Subscription | null;
    const until = sub?.current_period_end ? sub.current_period_end * 1000 : now + 31 * 86_400_000;
    return res.status(200).json({
      ok: true,
      premiumUntil: until,
      userId: session.client_reference_id,
    });
  } catch (e) {
    return res.status(500).json({ error: "verify_failed", detail: e instanceof Error ? e.message.slice(0, 200) : "err" });
  }
}
