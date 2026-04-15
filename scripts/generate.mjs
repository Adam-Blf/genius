/**
 * Générateur de chapitres Genius · interroge Wikidata SPARQL pour créer
 * des milliers de cartes culture G structurées. Résultat écrit dans
 * src/generated/{chapters.json,cards/<chapterId>.json}.
 *
 * Chaque "template" produit N chapitres par slicing (continent, époque,
 * lettre, domaine...). Le total vise 2000+ chapitres.
 *
 * Lancer : node scripts/generate.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "src", "generated");
const CARDS_DIR = path.join(OUT, "cards");
fs.mkdirSync(CARDS_DIR, { recursive: true });

const ENDPOINT = "https://query.wikidata.org/sparql";
const UA = "GeniusApp/1.0 (https://github.com/Adam-Blf/genius; contact@genius.app)";

async function sparql(query) {
  const url = `${ENDPOINT}?format=json&query=${encodeURIComponent(query)}`;
  const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/sparql-results+json" } });
  if (!r.ok) throw new Error(`SPARQL ${r.status} · ${query.slice(0, 80)}...`);
  return (await r.json()).results.bindings;
}

/** Mélange Fisher-Yates déterministe-ish */
function shuffle(arr, seed = 1) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Génère 3 distracteurs distincts de l'answer parmi un pool. */
function distractors(pool, answer, n = 3, seed = 1) {
  const filtered = pool.filter(p => p && p !== answer);
  return shuffle(filtered, seed).slice(0, n);
}

/** Fabrique une carte Q/A normalisée. */
let uidCounter = 0;
function makeCard({ chapterId, category, question, answer, choicesPool }) {
  const uid = `gen-${chapterId}-${++uidCounter}`;
  const distr = distractors(choicesPool, answer, 3, uidCounter);
  const choices = shuffle([answer, ...distr], uidCounter);
  return { uid, category, question, answer, choices, chapterId };
}

const chapters = [];
const cardsByChapter = new Map();

function addChapter({ id, title, subtitle, emoji, category, cards }) {
  if (!cards.length) return;
  chapters.push({ id, order: chapters.length + 1, title, subtitle, emoji, category, cardCount: cards.length });
  cardsByChapter.set(id, cards);
}

// ───────────────────────────── Templates SPARQL ─────────────────────────────

/**
 * 1. Capitales par région (6 chapitres)
 *    Un chapitre par continent, 1 carte par pays "Quelle est la capitale de X ?".
 */
const REGIONS = [
  { id: "eu", name: "Europe", qid: "Q46", emoji: "🇪🇺" },
  { id: "as", name: "Asie", qid: "Q48", emoji: "🌏" },
  { id: "af", name: "Afrique", qid: "Q15", emoji: "🌍" },
  { id: "na", name: "Amérique du Nord", qid: "Q49", emoji: "🌎" },
  { id: "sa", name: "Amérique du Sud", qid: "Q18", emoji: "🏔️" },
  { id: "oc", name: "Océanie", qid: "Q538", emoji: "🏝️" },
];

async function capitalesParRegion() {
  for (const r of REGIONS) {
    const q = `
      SELECT ?countryLabel ?capitalLabel WHERE {
        ?country wdt:P31 wd:Q6256 ; wdt:P30 wd:${r.qid} ; wdt:P36 ?capital .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
      } LIMIT 100`;
    try {
      const rows = await sparql(q);
      const pool = rows.map(x => x.capitalLabel?.value).filter(Boolean);
      const cards = rows
        .filter(x => x.countryLabel && x.capitalLabel)
        .map(x => makeCard({
          chapterId: `cap-${r.id}`,
          category: "geo",
          question: `Quelle est la capitale de ${x.countryLabel.value} ?`,
          answer: x.capitalLabel.value,
          choicesPool: pool,
        }));
      addChapter({
        id: `cap-${r.id}`,
        title: `Capitales · ${r.name}`,
        subtitle: `${cards.length} pays`,
        emoji: r.emoji,
        category: "geo",
        cards,
      });
      console.log(`✓ capitales ${r.name} · ${cards.length} cartes`);
    } catch (e) { console.warn(`✗ capitales ${r.name}:`, e.message); }
  }
}

/**
 * 2. Un chapitre par pays avec ses infos clés (capitale, langue, monnaie...)
 *    Génère ~200 chapitres · 1 par pays indépendant.
 */
async function paysFiches() {
  const q = `
    SELECT ?c ?cLabel ?capLabel ?langLabel ?currLabel ?contLabel WHERE {
      ?c wdt:P31 wd:Q6256 ; wdt:P36 ?cap .
      OPTIONAL { ?c wdt:P37 ?lang }
      OPTIONAL { ?c wdt:P38 ?curr }
      OPTIONAL { ?c wdt:P30 ?cont }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    }`;
  const rows = await sparql(q);
  const byCountry = new Map();
  for (const r of rows) {
    const k = r.cLabel?.value;
    if (!k) continue;
    const entry = byCountry.get(k) || { capitale: null, langues: new Set(), monnaies: new Set(), continent: null };
    if (r.capLabel) entry.capitale = r.capLabel.value;
    if (r.langLabel) entry.langues.add(r.langLabel.value);
    if (r.currLabel) entry.monnaies.add(r.currLabel.value);
    if (r.contLabel) entry.continent = r.contLabel.value;
    byCountry.set(k, entry);
  }
  const allCapitales = [...byCountry.values()].map(v => v.capitale).filter(Boolean);
  const allLangues = [...new Set([...byCountry.values()].flatMap(v => [...v.langues]))];
  const allMonnaies = [...new Set([...byCountry.values()].flatMap(v => [...v.monnaies]))];

  for (const [country, info] of byCountry) {
    const cards = [];
    const slug = country.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
    const chapterId = `pays-${slug}`;
    if (info.capitale) cards.push(makeCard({
      chapterId, category: "geo",
      question: `Quelle est la capitale de ${country} ?`,
      answer: info.capitale, choicesPool: allCapitales,
    }));
    for (const l of [...info.langues].slice(0, 2)) cards.push(makeCard({
      chapterId, category: "geo",
      question: `Langue officielle en ${country} ?`,
      answer: l, choicesPool: allLangues,
    }));
    for (const m of [...info.monnaies].slice(0, 1)) cards.push(makeCard({
      chapterId, category: "geo",
      question: `Monnaie du ${country} ?`,
      answer: m, choicesPool: allMonnaies,
    }));
    if (info.continent) cards.push(makeCard({
      chapterId, category: "geo",
      question: `Sur quel continent se situe ${country} ?`,
      answer: info.continent, choicesPool: REGIONS.map(r => r.name),
    }));
    if (cards.length >= 3) {
      addChapter({
        id: chapterId, title: country,
        subtitle: `Fiche pays`, emoji: "🌐", category: "geo", cards,
      });
    }
  }
  console.log(`✓ pays · ${byCountry.size} fiches examinées`);
}

/**
 * 3. Monuments UNESCO par pays · 1 chapitre par pays ayant >= 3 sites.
 */
async function unescoParPays() {
  const q = `
    SELECT ?site ?siteLabel ?countryLabel WHERE {
      ?site wdt:P1435 wd:Q9259 ; wdt:P17 ?country .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } LIMIT 2000`;
  const rows = await sparql(q);
  const byCountry = new Map();
  for (const r of rows) {
    const k = r.countryLabel?.value;
    const s = r.siteLabel?.value;
    if (!k || !s) continue;
    if (!byCountry.has(k)) byCountry.set(k, []);
    byCountry.get(k).push(s);
  }
  const allSites = [...new Set(rows.map(r => r.siteLabel?.value).filter(Boolean))];
  for (const [country, sites] of byCountry) {
    if (sites.length < 3) continue;
    const slug = country.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
    const chapterId = `unesco-${slug}`;
    const cards = sites.slice(0, 10).map(s => makeCard({
      chapterId, category: "arts",
      question: `Ce site UNESCO se trouve dans quel pays ? · ${s}`,
      answer: country, choicesPool: [...byCountry.keys()],
    }));
    addChapter({
      id: chapterId, title: `UNESCO · ${country}`,
      subtitle: `${sites.length} sites classés`, emoji: "🏛️", category: "arts", cards,
    });
  }
  console.log(`✓ UNESCO · ${byCountry.size} pays`);
}

/**
 * 4. Éléments chimiques par période (7 chapitres)
 */
async function elementsChimiques() {
  const q = `
    SELECT ?el ?elLabel ?symbol ?number ?period WHERE {
      ?el wdt:P31 wd:Q11344 ; wdt:P246 ?symbol ; wdt:P1086 ?number ; wdt:P2791 ?period .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } ORDER BY ?number`;
  const rows = await sparql(q);
  const allSymbols = rows.map(r => r.symbol?.value).filter(Boolean);
  const allNames = rows.map(r => r.elLabel?.value).filter(Boolean);
  const byPeriod = new Map();
  for (const r of rows) {
    const p = r.period?.value;
    if (!p) continue;
    if (!byPeriod.has(p)) byPeriod.set(p, []);
    byPeriod.get(p).push(r);
  }
  for (const [p, items] of [...byPeriod].sort((a, b) => +a[0] - +b[0])) {
    const chapterId = `chim-p${p}`;
    const cards = items.flatMap(x => {
      const el = x.elLabel?.value, sym = x.symbol?.value, num = x.number?.value;
      if (!el || !sym) return [];
      return [
        makeCard({
          chapterId, category: "sciences",
          question: `Symbole chimique de ${el} ?`,
          answer: sym, choicesPool: allSymbols,
        }),
        makeCard({
          chapterId, category: "sciences",
          question: `Élément de symbole ${sym} (n°${num}) ?`,
          answer: el, choicesPool: allNames,
        }),
      ];
    });
    addChapter({
      id: chapterId, title: `Éléments · Période ${p}`,
      subtitle: `${items.length} éléments`, emoji: "🧪", category: "sciences", cards,
    });
  }
  console.log(`✓ éléments chimiques · ${byPeriod.size} périodes`);
}

/**
 * 5. Présidents d'un pays (Wikidata office P39). Pour la France, USA, Brésil, Allemagne, Russie...
 */
async function dirigeantsParPays() {
  const offices = [
    { id: "france", label: "France", officeQ: "Q191954", emoji: "🇫🇷" },   // Président FR
    { id: "usa", label: "USA", officeQ: "Q11696", emoji: "🇺🇸" },          // Président USA
    { id: "de", label: "Allemagne", officeQ: "Q4970706", emoji: "🇩🇪" },   // Chancelier fédéral
    { id: "uk", label: "Royaume-Uni", officeQ: "Q14211", emoji: "🇬🇧" },   // PM UK
    { id: "it", label: "Italie", officeQ: "Q742701", emoji: "🇮🇹" },        // PM Italie
    { id: "ru", label: "Russie", officeQ: "Q313925", emoji: "🇷🇺" },        // Président RU
  ];
  for (const o of offices) {
    const q = `
      SELECT ?person ?personLabel ?start WHERE {
        ?person p:P39 ?statement .
        ?statement ps:P39 wd:${o.officeQ} ; pq:P580 ?start .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
      } ORDER BY ?start`;
    try {
      const rows = await sparql(q);
      const names = rows.map(r => r.personLabel?.value).filter(Boolean);
      const pool = [...new Set(names)];
      const cards = rows.slice(0, 40).map(r => {
        const year = r.start?.value?.slice(0, 4);
        return makeCard({
          chapterId: `dir-${o.id}`, category: "histoire",
          question: `Dirigeant de ${o.label} à partir de ${year} ?`,
          answer: r.personLabel.value, choicesPool: pool,
        });
      });
      addChapter({
        id: `dir-${o.id}`, title: `Dirigeants · ${o.label}`,
        subtitle: `${cards.length} leaders`, emoji: o.emoji, category: "histoire", cards,
      });
    } catch (e) { console.warn(`✗ dirigeants ${o.label}:`, e.message); }
  }
}

/**
 * 6. Peintres célèbres par mouvement artistique.
 */
async function peintresParMouvement() {
  const mouvements = [
    { id: "renaiss", label: "Renaissance", q: "Q1474884", emoji: "🎨" },
    { id: "baroque", label: "Baroque", q: "Q37853", emoji: "🖌️" },
    { id: "impr", label: "Impressionnisme", q: "Q40415", emoji: "🌅" },
    { id: "cub", label: "Cubisme", q: "Q42934", emoji: "🔷" },
    { id: "surr", label: "Surréalisme", q: "Q39427", emoji: "🌀" },
    { id: "roman", label: "Romantisme", q: "Q37068", emoji: "🌹" },
    { id: "exp", label: "Expressionnisme", q: "Q80930", emoji: "🔥" },
  ];
  for (const m of mouvements) {
    const qq = `
      SELECT ?p ?pLabel ?workLabel WHERE {
        ?p wdt:P106 wd:Q1028181 ; wdt:P135 wd:${m.q} .
        OPTIONAL { ?work wdt:P170 ?p ; rdfs:label ?workLabel . FILTER(LANG(?workLabel) = "fr") }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
      } LIMIT 150`;
    try {
      const rows = await sparql(qq);
      const names = [...new Set(rows.map(r => r.pLabel?.value).filter(Boolean))];
      const cards = [];
      const seen = new Set();
      for (const r of rows) {
        const p = r.pLabel?.value, w = r.workLabel?.value;
        if (!p || seen.has(p)) continue;
        seen.add(p);
        cards.push(makeCard({
          chapterId: `peintre-${m.id}`, category: "arts",
          question: `Peintre associé au ${m.label} ?`,
          answer: p, choicesPool: names,
        }));
        if (w) cards.push(makeCard({
          chapterId: `peintre-${m.id}`, category: "arts",
          question: `Qui a peint « ${w} » ?`,
          answer: p, choicesPool: names,
        }));
      }
      addChapter({
        id: `peintre-${m.id}`, title: `Peintres · ${m.label}`,
        subtitle: `${seen.size} artistes`, emoji: m.emoji, category: "arts", cards: cards.slice(0, 20),
      });
    } catch (e) { console.warn(`✗ peintres ${m.label}:`, e.message); }
  }
}

/**
 * 7. Compositeurs par époque (classical music).
 */
async function compositeursParEpoque() {
  const eres = [
    { id: "baroque", label: "Baroque", from: "1600", to: "1750", emoji: "🎻" },
    { id: "class", label: "Classique", from: "1750", to: "1820", emoji: "🎹" },
    { id: "rom", label: "Romantique", from: "1820", to: "1900", emoji: "🎼" },
    { id: "xxmod", label: "XXe moderne", from: "1900", to: "1975", emoji: "🎵" },
  ];
  const q = `
    SELECT ?c ?cLabel ?birth ?nationalityLabel WHERE {
      ?c wdt:P106 wd:Q36834 ; wdt:P569 ?birth .
      OPTIONAL { ?c wdt:P27 ?nat . ?nat rdfs:label ?nationalityLabel . FILTER(LANG(?nationalityLabel) = "fr") }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } LIMIT 3000`;
  try {
    const rows = await sparql(q);
    const names = [...new Set(rows.map(r => r.cLabel?.value).filter(Boolean))];
    for (const e of eres) {
      const sub = rows.filter(r => {
        const y = +r.birth?.value?.slice(0, 4);
        return y >= +e.from && y < +e.to;
      });
      const seen = new Set();
      const cards = [];
      for (const r of sub) {
        const n = r.cLabel?.value;
        if (!n || seen.has(n)) continue;
        seen.add(n);
        const nat = r.nationalityLabel?.value;
        cards.push(makeCard({
          chapterId: `comp-${e.id}`, category: "arts",
          question: nat
            ? `Compositeur ${e.label} né en ${r.birth.value.slice(0, 4)} (${nat}) ?`
            : `Compositeur ${e.label} né en ${r.birth.value.slice(0, 4)} ?`,
          answer: n, choicesPool: names,
        }));
        if (cards.length >= 15) break;
      }
      addChapter({
        id: `comp-${e.id}`, title: `Compositeurs · ${e.label}`,
        subtitle: `${cards.length} maîtres`, emoji: e.emoji, category: "arts", cards,
      });
    }
  } catch (err) { console.warn(`✗ compositeurs:`, err.message); }
}

/**
 * 8. Vainqueurs de Coupe du Monde FIFA par édition.
 */
async function coupesMonde() {
  const q = `
    SELECT ?edLabel ?winnerLabel ?year WHERE {
      ?ed wdt:P31 wd:Q19317 ; wdt:P1346 ?winner ; wdt:P585 ?date .
      BIND(YEAR(?date) AS ?year)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } ORDER BY ?year`;
  try {
    const rows = await sparql(q);
    const teams = [...new Set(rows.map(r => r.winnerLabel?.value).filter(Boolean))];
    const cards = rows.map(r => makeCard({
      chapterId: "fifa-wc", category: "sports",
      question: `Vainqueur de la Coupe du Monde ${r.year?.value} ?`,
      answer: r.winnerLabel.value, choicesPool: teams,
    }));
    addChapter({
      id: "fifa-wc", title: "Coupes du Monde FIFA",
      subtitle: `${cards.length} éditions`, emoji: "⚽", category: "sports", cards,
    });
  } catch (e) { console.warn(`✗ FIFA:`, e.message); }
}

/**
 * 9. Villes par pays · top 5 villes par pays → chapitre par pays.
 */
async function villesParPays() {
  const q = `
    SELECT ?country ?countryLabel ?city ?cityLabel ?pop WHERE {
      ?city wdt:P31/wdt:P279* wd:Q515 ; wdt:P17 ?country ; wdt:P1082 ?pop .
      FILTER(?pop > 500000)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } LIMIT 3000`;
  try {
    const rows = await sparql(q);
    const byCountry = new Map();
    for (const r of rows) {
      const k = r.countryLabel?.value;
      const c = r.cityLabel?.value;
      if (!k || !c) continue;
      if (!byCountry.has(k)) byCountry.set(k, []);
      byCountry.get(k).push({ name: c, pop: +r.pop.value });
    }
    const allCities = [...new Set(rows.map(r => r.cityLabel?.value).filter(Boolean))];
    for (const [country, cities] of byCountry) {
      if (cities.length < 5) continue;
      cities.sort((a, b) => b.pop - a.pop);
      const top = cities.slice(0, 10);
      const slug = country.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
      const chapterId = `villes-${slug}`;
      const cards = top.map(c => makeCard({
        chapterId, category: "geo",
        question: `Dans quel pays se trouve ${c.name} ? (${(c.pop / 1e6).toFixed(1)}M hab.)`,
        answer: country, choicesPool: [...byCountry.keys()],
      }));
      addChapter({
        id: chapterId, title: `Villes · ${country}`,
        subtitle: `Top ${top.length} par population`, emoji: "🏙️", category: "geo", cards,
      });
    }
    console.log(`✓ villes · ${byCountry.size} pays`);
  } catch (e) { console.warn(`✗ villes:`, e.message); }
}

/**
 * 10. Monnaies · 1 chapitre global.
 */
async function monnaiesChapitre() {
  const q = `
    SELECT ?cLabel ?currLabel WHERE {
      ?c wdt:P31 wd:Q6256 ; wdt:P38 ?curr .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } LIMIT 300`;
  try {
    const rows = await sparql(q);
    const seen = new Set();
    const pool = [...new Set(rows.map(r => r.currLabel?.value).filter(Boolean))];
    const cards = [];
    for (const r of rows) {
      const c = r.cLabel?.value, m = r.currLabel?.value;
      if (!c || !m || seen.has(c)) continue;
      seen.add(c);
      cards.push(makeCard({
        chapterId: "monnaies", category: "geo",
        question: `Monnaie du/de ${c} ?`,
        answer: m, choicesPool: pool,
      }));
    }
    addChapter({
      id: "monnaies", title: "Monnaies du monde",
      subtitle: `${cards.length} devises`, emoji: "💶", category: "geo", cards: cards.slice(0, 30),
    });
  } catch (e) { console.warn(`✗ monnaies:`, e.message); }
}

/**
 * 11. Fleuves et montagnes par continent.
 */
async function fleuvesParContinent() {
  for (const r of REGIONS.slice(0, 5)) {
    const qq = `
      SELECT ?river ?riverLabel ?length WHERE {
        ?river wdt:P31/wdt:P279* wd:Q4022 ; wdt:P2043 ?length ; wdt:P30 wd:${r.qid} .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
      } ORDER BY DESC(?length) LIMIT 25`;
    try {
      const rows = await sparql(qq);
      const names = [...new Set(rows.map(x => x.riverLabel?.value).filter(Boolean))];
      const cards = rows.filter(x => x.riverLabel && x.length).map(x => makeCard({
        chapterId: `fleuve-${r.id}`, category: "geo",
        question: `Long fleuve (${Math.round(+x.length.value / 1000)} km) en ${r.name} ?`,
        answer: x.riverLabel.value, choicesPool: names,
      }));
      addChapter({
        id: `fleuve-${r.id}`, title: `Fleuves · ${r.name}`,
        subtitle: `Les plus longs`, emoji: "🏞️", category: "geo", cards,
      });
    } catch (e) { console.warn(`✗ fleuves ${r.name}:`, e.message); }
  }
}

// ─────────────────────────── Exécution ───────────────────────────

const tasks = [
  capitalesParRegion,
  paysFiches,
  unescoParPays,
  elementsChimiques,
  dirigeantsParPays,
  peintresParMouvement,
  compositeursParEpoque,
  coupesMonde,
  villesParPays,
  monnaiesChapitre,
  fleuvesParContinent,
];

console.log(`→ lance ${tasks.length} templates SPARQL...`);
for (const fn of tasks) {
  await fn();
  await new Promise(r => setTimeout(r, 400));
}

// ─────────── Écriture des fichiers ───────────

for (const [id, cards] of cardsByChapter) {
  fs.writeFileSync(path.join(CARDS_DIR, `${id}.json`), JSON.stringify(cards));
}
fs.writeFileSync(path.join(OUT, "chapters.json"), JSON.stringify({ chapters, generatedAt: new Date().toISOString() }, null, 2));

const totalCards = [...cardsByChapter.values()].reduce((s, c) => s + c.length, 0);
console.log(`\n✅ ${chapters.length} chapitres · ${totalCards} cartes · ${CARDS_DIR}`);
