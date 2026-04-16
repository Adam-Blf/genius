/**
 * Chargement des chapitres + cartes générés par scripts/generate.mjs.
 *
 * Les fichiers cards/<chapterId>.json sont importés dynamiquement via Vite
 * (eager: false) · seul le manifest chapters.json est chargé au boot. Ça évite
 * de bloater le bundle initial alors qu'on a ~3000 cartes.
 *
 * Au premier lancement, `seedGenerated()` insère les cartes générées dans
 * Dexie (source: 'generic'). Les runs suivants sont no-op car on checke les
 * UIDs déjà présents.
 */
import { db, type Flashcard } from "../db";
import manifest from "../generated/chapters.json";

// Glob eager: false → Vite génère un import() paresseux par fichier.
const cardModules = import.meta.glob<{ default: Omit<Flashcard, "id" | "createdAt" | "source">[] }>(
  "../generated/cards/*.json",
);

export interface GeneratedChapter {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  emoji: string;
  category: string;
  cardCount: number;
  cardUids: string[];
}

export const GENERATED_CHAPTERS: GeneratedChapter[] = manifest.chapters as GeneratedChapter[];

/** Charge les cartes d'un chapitre (à la demande). */
export async function loadChapterCards(chapterId: string) {
  const key = `../generated/cards/${chapterId}.json`;
  const mod = cardModules[key];
  if (!mod) return [];
  const m = await mod();
  return m.default;
}

const SEED_FLAG_KEY = "genius.generatedSeededAt";

/**
 * Seed paresseux par chapitre : appelé à l'ouverture d'un chapitre.
 * Charge le JSON correspondant, insère les cartes manquantes dans Dexie,
 * marque le chapitre comme seedé dans localStorage pour éviter toute I/O au
 * prochain accès. C'est la voie rapide par défaut.
 */
export async function ensureChapterSeeded(chapterId: string): Promise<void> {
  const flagKey = `${SEED_FLAG_KEY}.${chapterId}`;
  if (localStorage.getItem(flagKey)) return;
  const cards = await loadChapterCards(chapterId);
  if (!cards.length) return;
  const uids = cards.map((c) => c.uid);
  const existing = await db.flashcards.where("uid").anyOf(uids).toArray();
  const existingUids = new Set(existing.map((c) => c.uid));
  const toInsert: Flashcard[] = cards
    .filter((c) => !existingUids.has(c.uid))
    .map((c) => ({ ...c, source: "generic", createdAt: Date.now() } as Flashcard));
  if (toInsert.length) await db.flashcards.bulkAdd(toInsert);
  localStorage.setItem(flagKey, "1");
}

/**
 * Seed global · non bloquant. À appeler en background après le render initial.
 * Traite les chapitres par petits batches avec `requestIdleCallback` pour ne
 * jamais geler l'UI. Marque la version globale quand tout est terminé.
 */
export function seedGeneratedInBackground(): void {
  const done = localStorage.getItem(SEED_FLAG_KEY);
  const currentVersion = manifest.generatedAt as string;
  if (done === currentVersion) return;

  const queue = [...GENERATED_CHAPTERS];
  const idle: (cb: () => void) => void =
    (typeof requestIdleCallback !== "undefined")
      ? (cb) => requestIdleCallback(() => cb(), { timeout: 1000 })
      : (cb) => setTimeout(cb, 50);

  const tick = async () => {
    const batch = queue.splice(0, 5);
    if (!batch.length) {
      localStorage.setItem(SEED_FLAG_KEY, currentVersion);
      return;
    }
    for (const ch of batch) {
      try { await ensureChapterSeeded(ch.id); } catch { /* skip */ }
    }
    idle(tick);
  };
  idle(tick);
}
