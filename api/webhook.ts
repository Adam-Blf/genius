/**
 * POST /api/webhook  · endpoint Stripe webhook.
 * Vérifie la signature `Stripe-Signature` avec STRIPE_WEBHOOK_SECRET.
 *
 * Événements gérés :
 *  - checkout.session.completed · souscription initiale
 *  - customer.subscription.updated / deleted · renouvellement / annulation
 *
 * Dans cette version "sans base", on se contente de logger · le client
 * ressouscrit côté UI en appelant /api/verify au retour. Pour un vrai prod,
 * brancher ici une KV (Upstash/Supabase) pour stocker premiumUntil par userId.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18.acacia" });
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

async function rawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(typeof c === "string" ? Buffer.from(c) : c);
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const sig = req.headers["stripe-signature"];
  if (typeof sig !== "string") return res.status(400).json({ error: "no_signature" });

  let event: Stripe.Event;
  try {
    const body = await rawBody(req);
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (e) {
    return res.status(400).json({ error: "bad_signature", detail: e instanceof Error ? e.message.slice(0, 120) : "err" });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      // TODO : brancher KV pour persister premiumUntil[userId].
      // Pour l'instant on acknowledge · le client pollera /api/status si besoin.
      console.log("[stripe]", event.type, event.id);
      break;
    default:
      break;
  }
  return res.status(200).json({ received: true });
}
