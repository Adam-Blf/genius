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

/** Insère toutes les cartes générées dans Dexie si pas déjà fait. */
export async function seedGenerated(): Promise<void> {
  const done = localStorage.getItem(SEED_FLAG_KEY);
  const currentVersion = manifest.generatedAt as string;
  if (done === currentVersion) return;

  const existingUids = new Set<string>(
    (await db.flashcards.where("source").equals("generic").toArray()).map((c) => c.uid),
  );
  const toInsert: Flashcard[] = [];
  let i = 0;
  const total = GENERATED_CHAPTERS.length;
  for (const ch of GENERATED_CHAPTERS) {
    const cards = await loadChapterCards(ch.id);
    for (const c of cards) {
      if (existingUids.has(c.uid)) continue;
      toInsert.push({
        ...c,
        source: "generic",
        createdAt: Date.now(),
      } as Flashcard);
    }
    i++;
    // Insertion par batches pour ne pas bloquer le thread trop longtemps.
    if (toInsert.length >= 1000 || i === total) {
      if (toInsert.length) await db.flashcards.bulkAdd(toInsert);
      toInsert.length = 0;
    }
  }
  localStorage.setItem(SEED_FLAG_KEY, currentVersion);
}
