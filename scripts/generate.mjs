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

/**
 * 12. Films par décennie (Oscar Best Picture + top rated)
 */
async function filmsParDecennie() {
  const q = `
    SELECT ?film ?filmLabel ?year ?directorLabel WHERE {
      ?film wdt:P31 wd:Q11424 ; wdt:P577 ?date ; wdt:P57 ?director .
      ?award ^wdt:P166 ?film . FILTER(?award IN (wd:Q102427, wd:Q103360, wd:Q179808, wd:Q213080))
      BIND(YEAR(?date) AS ?year)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } LIMIT 2000`;
  try {
    const rows = await sparql(q);
    const byDec = new Map();
    for (const r of rows) {
      const y = +r.year?.value;
      if (!y) continue;
      const dec = Math.floor(y / 10) * 10;
      if (!byDec.has(dec)) byDec.set(dec, []);
      byDec.get(dec).push(r);
    }
    const allDirs = [...new Set(rows.map(r => r.directorLabel?.value).filter(Boolean))];
    for (const [dec, items] of [...byDec].sort((a, b) => a[0] - b[0])) {
      const chapterId = `films-${dec}s`;
      const seen = new Set();
      const cards = [];
      for (const r of items) {
        const f = r.filmLabel?.value, d = r.directorLabel?.value;
        if (!f || !d || seen.has(f)) continue;
        seen.add(f);
        cards.push(makeCard({
          chapterId, category: "arts",
          question: `Qui a réalisé « ${f} » (${r.year.value}) ?`,
          answer: d, choicesPool: allDirs,
        }));
        if (cards.length >= 12) break;
      }
      if (cards.length >= 3)
        addChapter({ id: chapterId, title: `Films ${dec}s`, subtitle: `${cards.length} films primés`, emoji: "🎬", category: "arts", cards });
    }
    console.log(`✓ films · ${byDec.size} décennies`);
  } catch (e) { console.warn(`✗ films:`, e.message); }
}

/**
 * 13. Prix Nobel par discipline × décennie.
 */
async function nobelParDiscipline() {
  const disciplines = [
    { id: "phys", label: "Physique", q: "Q38104", emoji: "⚛️" },
    { id: "chim", label: "Chimie", q: "Q44585", emoji: "🧪" },
    { id: "med", label: "Médecine", q: "Q80061", emoji: "💊" },
    { id: "lit", label: "Littérature", q: "Q37922", emoji: "📚" },
    { id: "peace", label: "Paix", q: "Q35637", emoji: "🕊️" },
    { id: "eco", label: "Économie", q: "Q47170", emoji: "💹" },
  ];
  for (const d of disciplines) {
    const qq = `
      SELECT ?p ?pLabel ?year WHERE {
        ?p p:P166 ?aw . ?aw ps:P166 wd:${d.q} ; pq:P585 ?date .
        BIND(YEAR(?date) AS ?year)
        SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
      } ORDER BY ?year`;
    try {
      const rows = await sparql(qq);
      const names = [...new Set(rows.map(r => r.pLabel?.value).filter(Boolean))];
      const byDec = new Map();
      for (const r of rows) {
        const y = +r.year?.value; if (!y) continue;
        const dec = Math.floor(y / 10) * 10;
        if (!byDec.has(dec)) byDec.set(dec, []);
        byDec.get(dec).push(r);
      }
      for (const [dec, items] of [...byDec].sort((a, b) => a[0] - b[0])) {
        const chapterId = `nobel-${d.id}-${dec}`;
        const cards = items.slice(0, 15).map(r => makeCard({
          chapterId, category: "sciences",
          question: `Prix Nobel de ${d.label} en ${r.year.value} ?`,
          answer: r.pLabel.value, choicesPool: names,
        }));
        if (cards.length >= 3)
          addChapter({ id: chapterId, title: `Nobel ${d.label} · ${dec}s`, subtitle: `${cards.length} lauréats`, emoji: d.emoji, category: "sciences", cards });
      }
    } catch (e) { console.warn(`✗ nobel ${d.label}:`, e.message); }
  }
}

/**
 * 14. Écrivains célèbres par nationalité.
 */
async function ecrivainsParPays() {
  const q = `
    SELECT ?p ?pLabel ?natLabel ?birth WHERE {
      ?p wdt:P106 wd:Q36180 ; wdt:P27 ?nat ; wdt:P569 ?birth .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } LIMIT 3000`;
  try {
    const rows = await sparql(q);
    const byNat = new Map();
    for (const r of rows) {
      const k = r.natLabel?.value;
      if (!k) continue;
      if (!byNat.has(k)) byNat.set(k, []);
      byNat.get(k).push(r);
    }
    const names = [...new Set(rows.map(r => r.pLabel?.value).filter(Boolean))];
    for (const [nat, items] of byNat) {
      if (items.length < 5) continue;
      const slug = nat.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 25);
      const chapterId = `ecriv-${slug}`;
      const seen = new Set();
      const cards = [];
      for (const r of items) {
        const n = r.pLabel?.value;
        if (!n || seen.has(n)) continue;
        seen.add(n);
        const year = r.birth?.value?.slice(0, 4);
        cards.push(makeCard({
          chapterId, category: "arts",
          question: `Écrivain ${nat} né en ${year} ?`,
          answer: n, choicesPool: names,
        }));
        if (cards.length >= 10) break;
      }
      if (cards.length >= 3)
        addChapter({ id: chapterId, title: `Écrivains · ${nat}`, subtitle: `${cards.length} auteurs`, emoji: "✍️", category: "arts", cards });
    }
    console.log(`✓ écrivains · ${byNat.size} nationalités`);
  } catch (e) { console.warn(`✗ écrivains:`, e.message); }
}

/**
 * 15. Scientifiques par discipline.
 */
async function scientifiquesParDiscipline() {
  const disc = [
    { id: "phys", label: "physicien·ne", q: "Q169470", emoji: "⚛️" },
    { id: "math", label: "mathématicien·ne", q: "Q170790", emoji: "🔢" },
    { id: "chim", label: "chimiste", q: "Q593644", emoji: "🧪" },
    { id: "bio", label: "biologiste", q: "Q864503", emoji: "🧬" },
    { id: "astro", label: "astronome", q: "Q11063", emoji: "🔭" },
    { id: "phil", label: "philosophe", q: "Q4964182", emoji: "🤔" },
  ];
  for (const d of disc) {
    const qq = `
      SELECT ?p ?pLabel ?natLabel WHERE {
        ?p wdt:P106 wd:${d.q} ; wdt:P27 ?nat .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
      } LIMIT 1500`;
    try {
      const rows = await sparql(qq);
      const byNat = new Map();
      for (const r of rows) {
        const k = r.natLabel?.value;
        if (!k) continue;
        if (!byNat.has(k)) byNat.set(k, []);
        byNat.get(k).push(r.pLabel?.value);
      }
      const pool = [...new Set(rows.map(r => r.pLabel?.value).filter(Boolean))];
      for (const [nat, list] of byNat) {
        const uniq = [...new Set(list.filter(Boolean))];
        if (uniq.length < 5) continue;
        const slug = nat.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20);
        const chapterId = `sci-${d.id}-${slug}`;
        const cards = uniq.slice(0, 10).map(n => makeCard({
          chapterId, category: "sciences",
          question: `Quel ${d.label} ${nat} célèbre ?`,
          answer: n, choicesPool: pool,
        }));
        addChapter({ id: chapterId, title: `${d.label[0].toUpperCase()+d.label.slice(1)}s · ${nat}`, subtitle: `${cards.length} figures`, emoji: d.emoji, category: "sciences", cards });
      }
    } catch (e) { console.warn(`✗ sci ${d.label}:`, e.message); }
  }
}

/**
 * 16. Îles importantes par pays (superficie).
 */
async function ilesParPays() {
  const q = `
    SELECT ?i ?iLabel ?countryLabel ?area WHERE {
      ?i wdt:P31 wd:Q23442 ; wdt:P17 ?country ; wdt:P2046 ?area .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } LIMIT 2000`;
  try {
    const rows = await sparql(q);
    const byCountry = new Map();
    for (const r of rows) {
      const k = r.countryLabel?.value;
      if (!k) continue;
      if (!byCountry.has(k)) byCountry.set(k, []);
      byCountry.get(k).push(r);
    }
    const allIsles = [...new Set(rows.map(r => r.iLabel?.value).filter(Boolean))];
    for (const [country, items] of byCountry) {
      if (items.length < 4) continue;
      items.sort((a, b) => +b.area.value - +a.area.value);
      const slug = country.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 25);
      const chapterId = `iles-${slug}`;
      const cards = items.slice(0, 10).map(r => makeCard({
        chapterId, category: "geo",
        question: `Île rattachée à quel pays ? · ${r.iLabel.value}`,
        answer: country, choicesPool: [...byCountry.keys()],
      }));
      addChapter({ id: chapterId, title: `Îles · ${country}`, subtitle: `${cards.length} plus grandes`, emoji: "🏝️", category: "geo", cards });
    }
    console.log(`✓ îles · ${byCountry.size} pays`);
  } catch (e) { console.warn(`✗ îles:`, e.message); }
}

/**
 * 17. Champions League winners (UEFA).
 */
async function championsLeague() {
  const q = `
    SELECT ?ed ?edLabel ?winnerLabel ?year WHERE {
      ?ed wdt:P31 wd:Q18756140 ; wdt:P1346 ?winner ; wdt:P585 ?date .
      BIND(YEAR(?date) AS ?year)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } ORDER BY ?year`;
  try {
    const rows = await sparql(q);
    const teams = [...new Set(rows.map(r => r.winnerLabel?.value).filter(Boolean))];
    const cards = rows.filter(r => r.year && r.winnerLabel).map(r => makeCard({
      chapterId: "uefa-cl", category: "sports",
      question: `Vainqueur de la Ligue des Champions ${r.year.value} ?`,
      answer: r.winnerLabel.value, choicesPool: teams,
    }));
    if (cards.length) addChapter({ id: "uefa-cl", title: "Ligue des Champions UEFA", subtitle: `${cards.length} éditions`, emoji: "🏆", category: "sports", cards });
  } catch (e) { console.warn(`✗ UCL:`, e.message); }
}

/**
 * 18. Jeux olympiques d'été · pays hôtes.
 */
async function jeuxOlympiques() {
  const q = `
    SELECT ?ed ?edLabel ?cityLabel ?year WHERE {
      ?ed wdt:P31 wd:Q159821 ; wdt:P276 ?city ; wdt:P580 ?date .
      BIND(YEAR(?date) AS ?year)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } ORDER BY ?year`;
  try {
    const rows = await sparql(q);
    const cities = [...new Set(rows.map(r => r.cityLabel?.value).filter(Boolean))];
    const cards = rows.filter(r => r.year && r.cityLabel).map(r => makeCard({
      chapterId: "jo-ete", category: "sports",
      question: `Ville hôte des JO d'été ${r.year.value} ?`,
      answer: r.cityLabel.value, choicesPool: cities,
    }));
    if (cards.length) addChapter({ id: "jo-ete", title: "JO d'été · villes hôtes", subtitle: `${cards.length} éditions`, emoji: "🏅", category: "sports", cards });
  } catch (e) { console.warn(`✗ JO:`, e.message); }
}

/**
 * 19. Montagnes et sommets par pays.
 */
async function montagnesParPays() {
  const q = `
    SELECT ?m ?mLabel ?countryLabel ?elev WHERE {
      ?m wdt:P31 wd:Q8502 ; wdt:P17 ?country ; wdt:P2044 ?elev .
      FILTER(?elev > 2000)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } LIMIT 2000`;
  try {
    const rows = await sparql(q);
    const byCountry = new Map();
    for (const r of rows) {
      const k = r.countryLabel?.value;
      if (!k) continue;
      if (!byCountry.has(k)) byCountry.set(k, []);
      byCountry.get(k).push(r);
    }
    for (const [country, items] of byCountry) {
      if (items.length < 5) continue;
      items.sort((a, b) => +b.elev.value - +a.elev.value);
      const slug = country.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 25);
      const chapterId = `mont-${slug}`;
      const cards = items.slice(0, 10).map(r => makeCard({
        chapterId, category: "geo",
        question: `Sommet de ${Math.round(+r.elev.value)} m situé en ?`,
        answer: country, choicesPool: [...byCountry.keys()],
      }));
      addChapter({ id: chapterId, title: `Montagnes · ${country}`, subtitle: `Plus hauts sommets`, emoji: "🏔️", category: "geo", cards });
    }
    console.log(`✓ montagnes · ${byCountry.size} pays`);
  } catch (e) { console.warn(`✗ montagnes:`, e.message); }
}

/**
 * 20. Races de chiens par origine.
 */
async function racesChiens() {
  const q = `
    SELECT ?b ?bLabel ?originLabel WHERE {
      ?b wdt:P31 wd:Q39367 . OPTIONAL { ?b wdt:P495 ?origin . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } LIMIT 600`;
  try {
    const rows = await sparql(q);
    const byOrigin = new Map();
    for (const r of rows) {
      const k = r.originLabel?.value || "?";
      if (k === "?") continue;
      if (!byOrigin.has(k)) byOrigin.set(k, []);
      byOrigin.get(k).push(r.bLabel?.value);
    }
    const allBreeds = [...new Set(rows.map(r => r.bLabel?.value).filter(Boolean))];
    for (const [origin, breeds] of byOrigin) {
      const uniq = [...new Set(breeds.filter(Boolean))];
      if (uniq.length < 4) continue;
      const slug = origin.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20);
      const cards = uniq.slice(0, 10).map(b => makeCard({
        chapterId: `chien-${slug}`, category: "divers",
        question: `Race de chien originaire de ${origin} ?`,
        answer: b, choicesPool: allBreeds,
      }));
      addChapter({ id: `chien-${slug}`, title: `Chiens · ${origin}`, subtitle: `${cards.length} races`, emoji: "🐕", category: "divers", cards });
    }
    console.log(`✓ chiens · ${byOrigin.size} origines`);
  } catch (e) { console.warn(`✗ chiens:`, e.message); }
}

/**
 * 21. Dieux par mythologie.
 */
async function mythologies() {
  const mythos = [
    { id: "grec", label: "grecque", q: "Q42675", emoji: "⚡" },
    { id: "romaine", label: "romaine", q: "Q2859204", emoji: "🏛️" },
    { id: "nordique", label: "nordique", q: "Q106030", emoji: "⚔️" },
    { id: "egyptienne", label: "égyptienne", q: "Q51615", emoji: "🐍" },
    { id: "hindoue", label: "hindoue", q: "Q46681", emoji: "🕉️" },
    { id: "japonaise", label: "japonaise", q: "Q217041", emoji: "⛩️" },
  ];
  for (const m of mythos) {
    const qq = `
      SELECT ?d ?dLabel ?domainLabel WHERE {
        ?d wdt:P31/wdt:P279* wd:Q178885 ; wdt:P1343 wd:${m.q} .
        OPTIONAL { ?d wdt:P101 ?domain }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
      } LIMIT 100`;
    try {
      const rows = await sparql(qq);
      const names = [...new Set(rows.map(r => r.dLabel?.value).filter(Boolean))];
      const seen = new Set();
      const cards = [];
      for (const r of rows) {
        const n = r.dLabel?.value, d = r.domainLabel?.value;
        if (!n || seen.has(n)) continue;
        seen.add(n);
        cards.push(makeCard({
          chapterId: `myth-${m.id}`, category: "histoire",
          question: d ? `Divinité ${m.label} liée à ${d} ?` : `Divinité de la mythologie ${m.label} ?`,
          answer: n, choicesPool: names,
        }));
        if (cards.length >= 15) break;
      }
      if (cards.length >= 3)
        addChapter({ id: `myth-${m.id}`, title: `Mythologie · ${m.label}`, subtitle: `${cards.length} figures divines`, emoji: m.emoji, category: "histoire", cards });
    } catch (e) { console.warn(`✗ myth ${m.label}:`, e.message); }
  }
}

/**
 * 22. Planètes, lunes et corps célestes.
 */
async function corpsCelestes() {
  const q = `
    SELECT ?b ?bLabel ?parentLabel WHERE {
      ?b wdt:P31/wdt:P279* wd:Q2537 . ?b wdt:P397 ?parent .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } LIMIT 300`;
  try {
    const rows = await sparql(q);
    const byParent = new Map();
    for (const r of rows) {
      const k = r.parentLabel?.value;
      if (!k) continue;
      if (!byParent.has(k)) byParent.set(k, []);
      byParent.get(k).push(r.bLabel?.value);
    }
    const pool = [...new Set(rows.map(r => r.bLabel?.value).filter(Boolean))];
    for (const [parent, moons] of byParent) {
      const uniq = [...new Set(moons.filter(Boolean))];
      if (uniq.length < 3) continue;
      const slug = parent.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20);
      const cards = uniq.slice(0, 10).map(m => makeCard({
        chapterId: `lune-${slug}`, category: "sciences",
        question: `Lune/satellite de ${parent} ?`,
        answer: m, choicesPool: pool,
      }));
      addChapter({ id: `lune-${slug}`, title: `Satellites · ${parent}`, subtitle: `${cards.length} corps`, emoji: "🌙", category: "sciences", cards });
    }
    console.log(`✓ satellites · ${byParent.size} parents`);
  } catch (e) { console.warn(`✗ satellites:`, e.message); }
}

/**
 * 23. Acteurs par pays.
 */
async function acteursParPays() {
  const q = `
    SELECT ?p ?pLabel ?natLabel WHERE {
      ?p wdt:P106 wd:Q33999 ; wdt:P27 ?nat .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } LIMIT 4000`;
  try {
    const rows = await sparql(q);
    const byNat = new Map();
    for (const r of rows) {
      const k = r.natLabel?.value;
      if (!k) continue;
      if (!byNat.has(k)) byNat.set(k, []);
      byNat.get(k).push(r.pLabel?.value);
    }
    const pool = [...new Set(rows.map(r => r.pLabel?.value).filter(Boolean))];
    for (const [nat, list] of byNat) {
      const uniq = [...new Set(list.filter(Boolean))];
      if (uniq.length < 5) continue;
      const slug = nat.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 25);
      const chapterId = `acteur-${slug}`;
      const cards = uniq.slice(0, 10).map(n => makeCard({
        chapterId, category: "arts",
        question: `Acteur/actrice ${nat} ?`, answer: n, choicesPool: pool,
      }));
      addChapter({ id: chapterId, title: `Acteurs · ${nat}`, subtitle: `${cards.length} vedettes`, emoji: "🎭", category: "arts", cards });
    }
    console.log(`✓ acteurs · ${byNat.size}`);
  } catch (e) { console.warn(`✗ acteurs:`, e.message); }
}

/**
 * 24. Universités par pays.
 */
async function universitesParPays() {
  const q = `
    SELECT ?u ?uLabel ?countryLabel WHERE {
      ?u wdt:P31/wdt:P279* wd:Q3918 ; wdt:P17 ?country .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } LIMIT 3000`;
  try {
    const rows = await sparql(q);
    const byCountry = new Map();
    for (const r of rows) {
      const k = r.countryLabel?.value; if (!k) continue;
      if (!byCountry.has(k)) byCountry.set(k, []);
      byCountry.get(k).push(r.uLabel?.value);
    }
    for (const [country, list] of byCountry) {
      const uniq = [...new Set(list.filter(Boolean))];
      if (uniq.length < 5) continue;
      const slug = country.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 25);
      const chapterId = `univ-${slug}`;
      const cards = uniq.slice(0, 10).map(n => makeCard({
        chapterId, category: "divers",
        question: `Université située en ${country} ?`,
        answer: n, choicesPool: [...new Set([].concat(...[...byCountry.values()]))].slice(0, 200),
      }));
      addChapter({ id: chapterId, title: `Universités · ${country}`, subtitle: `${cards.length} établissements`, emoji: "🎓", category: "divers", cards });
    }
    console.log(`✓ universités · ${byCountry.size}`);
  } catch (e) { console.warn(`✗ universités:`, e.message); }
}

/**
 * 25. Groupes musicaux par pays.
 */
async function groupesMusicauxParPays() {
  const q = `
    SELECT ?g ?gLabel ?countryLabel WHERE {
      ?g wdt:P31 wd:Q215380 ; wdt:P495 ?country .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } LIMIT 3000`;
  try {
    const rows = await sparql(q);
    const byCountry = new Map();
    for (const r of rows) {
      const k = r.countryLabel?.value; if (!k) continue;
      if (!byCountry.has(k)) byCountry.set(k, []);
      byCountry.get(k).push(r.gLabel?.value);
    }
    const pool = [...new Set(rows.map(r => r.gLabel?.value).filter(Boolean))];
    for (const [country, list] of byCountry) {
      const uniq = [...new Set(list.filter(Boolean))];
      if (uniq.length < 5) continue;
      const slug = country.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 25);
      const chapterId = `groupe-${slug}`;
      const cards = uniq.slice(0, 10).map(n => makeCard({
        chapterId, category: "arts",
        question: `Groupe musical originaire de ${country} ?`,
        answer: n, choicesPool: pool,
      }));
      addChapter({ id: chapterId, title: `Groupes · ${country}`, subtitle: `${cards.length} formations`, emoji: "🎸", category: "arts", cards });
    }
    console.log(`✓ groupes · ${byCountry.size}`);
  } catch (e) { console.warn(`✗ groupes:`, e.message); }
}

/**
 * 26. Séries TV par pays de production.
 */
async function seriesTVParPays() {
  const q = `
    SELECT ?s ?sLabel ?countryLabel WHERE {
      ?s wdt:P31 wd:Q5398426 ; wdt:P495 ?country .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } LIMIT 4000`;
  try {
    const rows = await sparql(q);
    const byCountry = new Map();
    for (const r of rows) {
      const k = r.countryLabel?.value; if (!k) continue;
      if (!byCountry.has(k)) byCountry.set(k, []);
      byCountry.get(k).push(r.sLabel?.value);
    }
    const pool = [...new Set(rows.map(r => r.sLabel?.value).filter(Boolean))];
    for (const [country, list] of byCountry) {
      const uniq = [...new Set(list.filter(Boolean))];
      if (uniq.length < 8) continue;
      const slug = country.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 25);
      const chapterId = `serie-${slug}`;
      const cards = uniq.slice(0, 10).map(n => makeCard({
        chapterId, category: "arts",
        question: `Série TV produite en ${country} ?`,
        answer: n, choicesPool: pool,
      }));
      addChapter({ id: chapterId, title: `Séries · ${country}`, subtitle: `${cards.length} productions`, emoji: "📺", category: "arts", cards });
    }
    console.log(`✓ séries TV · ${byCountry.size}`);
  } catch (e) { console.warn(`✗ séries:`, e.message); }
}

/**
 * 27. Régions administratives par pays (P150 contains).
 */
async function regionsParPays() {
  const countries = [
    { id: "fr", qid: "Q142", label: "France", emoji: "🇫🇷" },
    { id: "es", qid: "Q29", label: "Espagne", emoji: "🇪🇸" },
    { id: "it", qid: "Q38", label: "Italie", emoji: "🇮🇹" },
    { id: "de", qid: "Q183", label: "Allemagne", emoji: "🇩🇪" },
    { id: "us", qid: "Q30", label: "USA", emoji: "🇺🇸" },
    { id: "uk", qid: "Q145", label: "Royaume-Uni", emoji: "🇬🇧" },
    { id: "br", qid: "Q155", label: "Brésil", emoji: "🇧🇷" },
    { id: "ca", qid: "Q16", label: "Canada", emoji: "🇨🇦" },
    { id: "ch", qid: "Q39", label: "Suisse", emoji: "🇨🇭" },
    { id: "be", qid: "Q31", label: "Belgique", emoji: "🇧🇪" },
  ];
  for (const c of countries) {
    const qq = `
      SELECT ?r ?rLabel WHERE {
        wd:${c.qid} wdt:P150 ?r .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
      } LIMIT 60`;
    try {
      const rows = await sparql(qq);
      const names = [...new Set(rows.map(r => r.rLabel?.value).filter(Boolean))];
      if (names.length < 5) continue;
      const cards = names.slice(0, 15).map(n => makeCard({
        chapterId: `reg-${c.id}`, category: "geo",
        question: `Région administrative de ${c.label} ?`,
        answer: n, choicesPool: names,
      }));
      addChapter({ id: `reg-${c.id}`, title: `Régions · ${c.label}`, subtitle: `${cards.length} divisions`, emoji: c.emoji, category: "geo", cards });
    } catch (e) { console.warn(`✗ régions ${c.label}:`, e.message); }
  }
}

/**
 * 28. Langues par pays.
 */
async function languesParPays() {
  const q = `
    SELECT ?c ?cLabel ?langLabel WHERE {
      ?c wdt:P31 wd:Q6256 ; wdt:P37 ?lang .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } LIMIT 500`;
  try {
    const rows = await sparql(q);
    const pool = [...new Set(rows.map(r => r.langLabel?.value).filter(Boolean))];
    // 1 chapitre global langues officielles · 1 carte par pays
    const seen = new Set();
    const cards = [];
    for (const r of rows) {
      const c = r.cLabel?.value, l = r.langLabel?.value;
      if (!c || !l || seen.has(c)) continue;
      seen.add(c);
      cards.push(makeCard({
        chapterId: "langues-off", category: "geo",
        question: `Langue officielle en ${c} ?`,
        answer: l, choicesPool: pool,
      }));
    }
    addChapter({ id: "langues-off", title: "Langues officielles", subtitle: `${cards.length} pays`, emoji: "🗣️", category: "geo", cards: cards.slice(0, 30) });
  } catch (e) { console.warn(`✗ langues:`, e.message); }
}

/**
 * 29. Religions majeures · fondateurs/prophètes.
 */
async function religions() {
  const rels = [
    { id: "chr", label: "chrétien", q: "Q5043", emoji: "✝️" },
    { id: "isl", label: "musulman", q: "Q432", emoji: "☪️" },
    { id: "boud", label: "bouddhiste", q: "Q748", emoji: "☸️" },
    { id: "hind", label: "hindou", q: "Q9089", emoji: "🕉️" },
    { id: "jud", label: "juif", q: "Q9268", emoji: "✡️" },
  ];
  for (const r of rels) {
    const qq = `
      SELECT ?p ?pLabel WHERE {
        ?p wdt:P140 wd:${r.q} ; wdt:P31 wd:Q5 .
        ?p wdt:P106 ?occ . FILTER(?occ IN (wd:Q42857, wd:Q713200, wd:Q1234713))
        SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
      } LIMIT 50`;
    try {
      const rows = await sparql(qq);
      const names = [...new Set(rows.map(x => x.pLabel?.value).filter(Boolean))];
      if (names.length < 3) continue;
      const cards = names.slice(0, 15).map(n => makeCard({
        chapterId: `relig-${r.id}`, category: "histoire",
        question: `Figure religieuse ${r.label} ?`,
        answer: n, choicesPool: names,
      }));
      addChapter({ id: `relig-${r.id}`, title: `Religion · ${r.label}`, subtitle: `${cards.length} figures`, emoji: r.emoji, category: "histoire", cards });
    } catch (e) { console.warn(`✗ relig ${r.label}:`, e.message); }
  }
}

/**
 * 30. Inventions par domaine (P31 = invention + P1056 product).
 */
async function inventionsParDomaine() {
  const q = `
    SELECT ?i ?iLabel ?invLabel ?year WHERE {
      ?i wdt:P31 wd:Q131800 ; wdt:P61 ?inv . OPTIONAL { ?i wdt:P575 ?date . BIND(YEAR(?date) AS ?year) }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } LIMIT 1500`;
  try {
    const rows = await sparql(q);
    const byCent = new Map();
    for (const r of rows) {
      const y = +r.year?.value;
      if (!y) continue;
      const c = Math.floor(y / 100) + 1;
      if (!byCent.has(c)) byCent.set(c, []);
      byCent.get(c).push(r);
    }
    const invNames = [...new Set(rows.map(r => r.invLabel?.value).filter(Boolean))];
    for (const [cent, items] of byCent) {
      if (items.length < 4) continue;
      const chapterId = `inv-${cent}`;
      const seen = new Set();
      const cards = [];
      for (const r of items) {
        const it = r.iLabel?.value, inv = r.invLabel?.value;
        if (!it || !inv || seen.has(it)) continue;
        seen.add(it);
        cards.push(makeCard({
          chapterId, category: "sciences",
          question: `Inventeur de « ${it} » ?`,
          answer: inv, choicesPool: invNames,
        }));
        if (cards.length >= 12) break;
      }
      if (cards.length >= 3)
        addChapter({ id: chapterId, title: `Inventions · ${cent}e siècle`, subtitle: `${cards.length} innovations`, emoji: "💡", category: "sciences", cards });
    }
    console.log(`✓ inventions · ${byCent.size} siècles`);
  } catch (e) { console.warn(`✗ inventions:`, e.message); }
}

/**
 * 31. Tableaux célèbres par peintre.
 */
async function tableauxParPeintre() {
  const q = `
    SELECT ?w ?wLabel ?authorLabel WHERE {
      ?w wdt:P31 wd:Q3305213 ; wdt:P170 ?author .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } LIMIT 3000`;
  try {
    const rows = await sparql(q);
    const byAuthor = new Map();
    for (const r of rows) {
      const a = r.authorLabel?.value; if (!a) continue;
      if (!byAuthor.has(a)) byAuthor.set(a, []);
      byAuthor.get(a).push(r.wLabel?.value);
    }
    const authors = [...byAuthor.keys()];
    for (const [author, works] of byAuthor) {
      const uniq = [...new Set(works.filter(Boolean))];
      if (uniq.length < 5) continue;
      const slug = author.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 25);
      const chapterId = `oeuvres-${slug}`;
      const cards = uniq.slice(0, 10).map(w => makeCard({
        chapterId, category: "arts",
        question: `Qui a peint/créé « ${w} » ?`,
        answer: author, choicesPool: authors,
      }));
      addChapter({ id: chapterId, title: `Œuvres · ${author}`, subtitle: `${cards.length} tableaux`, emoji: "🖼️", category: "arts", cards });
    }
    console.log(`✓ tableaux · ${byAuthor.size} auteurs`);
  } catch (e) { console.warn(`✗ tableaux:`, e.message); }
}

/**
 * 32. Aéroports par pays (top trafic).
 */
async function aeroportsParPays() {
  const q = `
    SELECT ?a ?aLabel ?countryLabel WHERE {
      ?a wdt:P31/wdt:P279* wd:Q1248784 ; wdt:P17 ?country .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
    } LIMIT 3000`;
  try {
    const rows = await sparql(q);
    const byCountry = new Map();
    for (const r of rows) {
      const k = r.countryLabel?.value; if (!k) continue;
      if (!byCountry.has(k)) byCountry.set(k, []);
      byCountry.get(k).push(r.aLabel?.value);
    }
    const pool = [...new Set(rows.map(r => r.aLabel?.value).filter(Boolean))];
    for (const [country, list] of byCountry) {
      const uniq = [...new Set(list.filter(Boolean))].filter(n => !/IATA|ICAO/i.test(n));
      if (uniq.length < 5) continue;
      const slug = country.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 25);
      const chapterId = `aero-${slug}`;
      const cards = uniq.slice(0, 10).map(n => makeCard({
        chapterId, category: "geo",
        question: `Aéroport situé en ${country} ?`,
        answer: n, choicesPool: pool,
      }));
      addChapter({ id: chapterId, title: `Aéroports · ${country}`, subtitle: `${cards.length}`, emoji: "✈️", category: "geo", cards });
    }
    console.log(`✓ aéroports · ${byCountry.size}`);
  } catch (e) { console.warn(`✗ aéroports:`, e.message); }
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
  filmsParDecennie,
  nobelParDiscipline,
  ecrivainsParPays,
  scientifiquesParDiscipline,
  ilesParPays,
  championsLeague,
  jeuxOlympiques,
  montagnesParPays,
  racesChiens,
  mythologies,
  corpsCelestes,
  acteursParPays,
  universitesParPays,
  groupesMusicauxParPays,
  seriesTVParPays,
  regionsParPays,
  languesParPays,
  religions,
  inventionsParDomaine,
  tableauxParPeintre,
  aeroportsParPays,
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
