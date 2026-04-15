export interface Chapter {
  id: string
  order: number
  title: string
  subtitle: string
  emoji: string
  /** Cartes pour chapitres curés. Chapitres générés n'ont que `cardCount`. */
  cardUids?: string[]
  cardCount?: number
}

/**
 * Roadmap thematique · 20 chapitres.
 * Chaque chapitre = un theme precis, pas une categorie generique.
 * Completion a 8/10 bonnes reponses (meilleur score).
 */
export const CHAPTERS: Chapter[] = [
  // Fondamentaux · mix facile pour demarrer
  { id: 'ch-fond', order: 1, title: 'Les fondamentaux', subtitle: 'Tout commence ici', emoji: '🌱',
    cardUids: ['bas1', 'bas2', 'bas3', 'bas4', 'bas5', 'bas6', 'cap1', 'geo3', 'esp1', 'chi1'] },

  // HISTOIRE chronologique
  { id: 'ch-antiq', order: 2, title: 'Antiquite', subtitle: 'Pharaons, Grecs, Romains', emoji: '🏺',
    cardUids: ['ant1', 'ant2', 'ant3', 'ant4', 'ant5', 'ant6', 'ant7', 'ant8', 'ant9', 'ant10'] },

  { id: 'ch-ma', order: 3, title: 'Moyen Age', subtitle: 'Chevaliers et cathedrales', emoji: '⚔️',
    cardUids: ['ma1', 'ma2', 'ma3', 'ma4', 'ma5', 'ma6', 'ma7', 'ma8'] },

  { id: 'ch-renaiss', order: 4, title: 'Renaissance', subtitle: 'Art, science, explorations', emoji: '🎨',
    cardUids: ['ren1', 'ren2', 'ren3', 'ren4', 'ren5', 'ren6', 'ren7', 'ren8'] },

  { id: 'ch-revo', order: 5, title: 'Revolutions', subtitle: 'France, Amerique, industrielle', emoji: '🔥',
    cardUids: ['rev1', 'rev2', 'rev3', 'rev4', 'rev5', 'rev6', 'rev7', 'rev8'] },

  { id: 'ch-xx', order: 6, title: 'XXe siecle', subtitle: 'Guerres et geopolitique', emoji: '🕊️',
    cardUids: ['xx1', 'xx2', 'xx3', 'xx4', 'xx5', 'xx6', 'xx7', 'xx8', 'xx9', 'xx10'] },

  // SCIENCES par thème
  { id: 'ch-bio', order: 7, title: 'Corps humain', subtitle: 'Anatomie essentielle', emoji: '🫀',
    cardUids: ['bio1', 'bio2', 'bio3', 'bio4', 'bio5', 'bio6', 'bio7', 'bio8', 'bio9', 'bio10'] },

  { id: 'ch-esp', order: 8, title: 'Univers et espace', subtitle: 'Planetes, etoiles, cosmos', emoji: '🌌',
    cardUids: ['esp1', 'esp2', 'esp3', 'esp4', 'esp5', 'esp6', 'esp7', 'esp8', 'esp9', 'esp10'] },

  { id: 'ch-chi', order: 9, title: 'Chimie essentielle', subtitle: 'Atomes et elements', emoji: '🧪',
    cardUids: ['chi1', 'chi2', 'chi3', 'chi4', 'chi5', 'chi6', 'chi7', 'chi8'] },

  { id: 'ch-phy', order: 10, title: 'Physique classique', subtitle: 'Forces et energie', emoji: '⚛️',
    cardUids: ['phy1', 'phy2', 'phy3', 'phy4', 'phy5', 'phy6', 'phy7', 'phy8'] },

  { id: 'ch-evo', order: 11, title: 'Evolution et biologie', subtitle: 'Du vivant aux especes', emoji: '🧬',
    cardUids: ['evo1', 'evo2', 'evo3', 'evo4', 'evo5', 'evo6', 'evo7', 'evo8'] },

  // GEO par thème
  { id: 'ch-cap', order: 12, title: 'Capitales du monde', subtitle: '5 continents', emoji: '🏙️',
    cardUids: ['cap1', 'cap2', 'cap3', 'cap4', 'cap5', 'cap6', 'cap7', 'cap8', 'cap9', 'cap10'] },

  { id: 'ch-flmt', order: 13, title: 'Fleuves et montagnes', subtitle: 'Geographie physique', emoji: '⛰️',
    cardUids: ['geo1', 'geo2', 'geo3', 'geo4', 'geo5', 'geo6', 'geo7', 'geo8'] },

  { id: 'ch-mon', order: 14, title: 'Monde et climat', subtitle: 'Biomes et societes', emoji: '🌍',
    cardUids: ['mon1', 'mon2', 'mon3', 'mon4', 'mon5', 'mon6', 'mon7', 'mon8'] },

  // ARTS par thème
  { id: 'ch-pei', order: 15, title: 'Peinture', subtitle: 'Maitres et mouvements', emoji: '🖼️',
    cardUids: ['pei1', 'pei2', 'pei3', 'pei4', 'pei5', 'pei6', 'pei7', 'pei8'] },

  { id: 'ch-mus', order: 16, title: 'Musique classique', subtitle: 'Des baroques aux modernes', emoji: '🎼',
    cardUids: ['mus1', 'mus2', 'mus3', 'mus4', 'mus5', 'mus6', 'mus7', 'mus8'] },

  { id: 'ch-lit', order: 17, title: 'Litterature', subtitle: 'Chefs-d\'oeuvre mondiaux', emoji: '📚',
    cardUids: ['lit1', 'lit2', 'lit3', 'lit4', 'lit5', 'lit6', 'lit7', 'lit8'] },

  { id: 'ch-cin', order: 18, title: 'Cinema', subtitle: '7e art et blockbusters', emoji: '🎬',
    cardUids: ['cin1', 'cin2', 'cin3', 'cin4', 'cin5', 'cin6', 'cin7', 'cin8'] },

  { id: 'ch-myt', order: 19, title: 'Mythologies', subtitle: 'Grecque, romaine, nordique, egyptienne', emoji: '⚡',
    cardUids: ['myt1', 'myt2', 'myt3', 'myt4', 'myt5', 'myt6', 'myt7', 'myt8'] },

  // SPORTS
  { id: 'ch-spo', order: 20, title: 'Sports', subtitle: 'Terrain et disciplines', emoji: '⚽',
    cardUids: ['spo1', 'spo2', 'spo3', 'spo4', 'spo5', 'spo6', 'spo7', 'spo8', 'spo9', 'spo10'] },

  // TRANSVERSE
  { id: 'ch-inv', order: 21, title: 'Inventions', subtitle: 'Qui a invente quoi', emoji: '💡',
    cardUids: ['inv1', 'inv2', 'inv3', 'inv4', 'inv5', 'inv6', 'inv7', 'inv8'] },

  { id: 'ch-mat', order: 22, title: 'Mathematiques', subtitle: 'Nombres et geometrie', emoji: '➗',
    cardUids: ['mat1', 'mat2', 'mat3', 'mat4', 'mat5', 'mat6', 'mat7', 'mat8'] },

  { id: 'ch-phi', order: 23, title: 'Philosophie', subtitle: 'Les grands penseurs', emoji: '🤔',
    cardUids: ['phi1', 'phi2', 'phi3', 'phi4', 'phi5', 'phi6'] },

  { id: 'ch-lan', order: 24, title: 'Langues et mots', subtitle: 'Du monde entier', emoji: '🗣️',
    cardUids: ['lan1', 'lan2', 'lan3', 'lan4', 'lan5', 'lan6'] },

  { id: 'ch-eco', order: 25, title: 'Economie et tech', subtitle: 'Monnaies, entreprises, numerique', emoji: '💼',
    cardUids: ['eco1', 'eco2', 'eco3', 'eco4', 'eco5', 'eco6'] },
]

// Chapitres générés automatiquement depuis Wikidata (scripts/generate.mjs).
// On les concatène après les chapitres "curés" pour que le début du parcours
// reste la roadmap thématique soigneusement ordonnée.
import generatedManifest from './generated/chapters.json'

const OFFSET = CHAPTERS.length
const GENERATED: Chapter[] = (generatedManifest.chapters as Array<{
  id: string; title: string; subtitle: string; emoji: string; cardCount: number
}>).map((c, i) => ({
  id: c.id,
  order: OFFSET + i + 1,
  title: c.title,
  subtitle: c.subtitle,
  emoji: c.emoji,
  cardCount: c.cardCount,
}))

CHAPTERS.push(...GENERATED)

export function chapterState(
  chapter: Chapter,
  completedIds: Set<string>
): 'done' | 'current' | 'locked' {
  if (completedIds.has(chapter.id)) return 'done'
  const prev = CHAPTERS.find((c) => c.order === chapter.order - 1)
  if (!prev) return 'current'
  if (completedIds.has(prev.id)) return 'current'
  return 'locked'
}
