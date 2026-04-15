import { db, type Flashcard, type Category } from './db'

const SEED: Array<Omit<Flashcard, 'id' | 'createdAt' | 'source'>> = [
  // HISTOIRE
  { uid: 'h1', category: 'histoire', question: 'En quelle annee est tombe le mur de Berlin ?', answer: '1989', choices: ['1989', '1991', '1985', '1979'] },
  { uid: 'h2', category: 'histoire', question: 'Qui a peint le plafond de la Chapelle Sixtine ?', answer: 'Michel-Ange', choices: ['Leonard de Vinci', 'Michel-Ange', 'Raphael', 'Le Caravage'] },
  { uid: 'h3', category: 'histoire', question: 'Premier empereur romain ?', answer: 'Auguste', choices: ['Cesar', 'Auguste', 'Neron', 'Caligula'] },
  { uid: 'h4', category: 'histoire', question: 'Annee de la prise de la Bastille ?', answer: '1789', choices: ['1789', '1776', '1804', '1871'] },
  { uid: 'h5', category: 'histoire', question: 'Qui a fonde l\'Empire mongol ?', answer: 'Gengis Khan', choices: ['Kubilai Khan', 'Tamerlan', 'Gengis Khan', 'Attila'] },
  { uid: 'h6', category: 'histoire', question: 'Debarquement de Normandie ?', answer: '6 juin 1944', choices: ['6 juin 1944', '8 mai 1945', '11 novembre 1918', '1er septembre 1939'] },
  { uid: 'h7', category: 'histoire', question: 'Reine d\'Egypte celebre pour son histoire avec Cesar ?', answer: 'Cleopatre', choices: ['Nefertiti', 'Cleopatre', 'Hatchepsout', 'Nitocris'] },
  { uid: 'h8', category: 'histoire', question: 'Decouverte de l\'Amerique par Christophe Colomb ?', answer: '1492', choices: ['1492', '1498', '1521', '1453'] },
  { uid: 'h9', category: 'histoire', question: 'Guerre de Cent Ans · qui oppose-t-elle ?', answer: 'France et Angleterre', choices: ['France et Espagne', 'France et Angleterre', 'France et Prusse', 'France et Italie'] },
  { uid: 'h10', category: 'histoire', question: 'Inventeur de l\'imprimerie moderne ?', answer: 'Gutenberg', choices: ['Edison', 'Gutenberg', 'Marconi', 'Da Vinci'] },

  // SCIENCES
  { uid: 's1', category: 'sciences', question: 'Formule chimique de l\'eau ?', answer: 'H2O', choices: ['H2O', 'CO2', 'O2', 'NaCl'] },
  { uid: 's2', category: 'sciences', question: 'Vitesse de la lumiere (km/s) ?', answer: '300 000', choices: ['150 000', '300 000', '1 000 000', '30 000'] },
  { uid: 's3', category: 'sciences', question: 'Element avec le symbole Au ?', answer: 'Or', choices: ['Argent', 'Aluminium', 'Or', 'Cuivre'] },
  { uid: 's4', category: 'sciences', question: 'Planete la plus proche du Soleil ?', answer: 'Mercure', choices: ['Venus', 'Mercure', 'Mars', 'Terre'] },
  { uid: 's5', category: 'sciences', question: 'ADN signifie ?', answer: 'Acide desoxyribonucleique', choices: ['Acide desoxyribonucleique', 'Acide dinitrique', 'Alcool dextrose neutre', 'Agent double nucleaire'] },
  { uid: 's6', category: 'sciences', question: 'Pere de la theorie de l\'evolution ?', answer: 'Darwin', choices: ['Newton', 'Einstein', 'Darwin', 'Pasteur'] },
  { uid: 's7', category: 'sciences', question: 'Organe qui pompe le sang ?', answer: 'Le coeur', choices: ['Le foie', 'Les poumons', 'Le coeur', 'Le cerveau'] },
  { uid: 's8', category: 'sciences', question: 'Unite de force ?', answer: 'Newton', choices: ['Joule', 'Watt', 'Newton', 'Pascal'] },
  { uid: 's9', category: 'sciences', question: 'E = mc² · auteur ?', answer: 'Einstein', choices: ['Newton', 'Einstein', 'Bohr', 'Planck'] },
  { uid: 's10', category: 'sciences', question: 'Gaz le plus abondant dans l\'atmosphere ?', answer: 'Azote', choices: ['Oxygene', 'Azote', 'CO2', 'Hydrogene'] },

  // GEO
  { uid: 'g1', category: 'geo', question: 'Capitale de l\'Australie ?', answer: 'Canberra', choices: ['Sydney', 'Canberra', 'Melbourne', 'Perth'] },
  { uid: 'g2', category: 'geo', question: 'Plus long fleuve du monde ?', answer: 'Nil', choices: ['Amazone', 'Nil', 'Yangtse', 'Mississippi'] },
  { uid: 'g3', category: 'geo', question: 'Plus haut sommet du monde ?', answer: 'Everest', choices: ['K2', 'Everest', 'Mont Blanc', 'Kilimandjaro'] },
  { uid: 'g4', category: 'geo', question: 'Capitale du Canada ?', answer: 'Ottawa', choices: ['Toronto', 'Montreal', 'Ottawa', 'Vancouver'] },
  { uid: 'g5', category: 'geo', question: 'Pays du soleil levant ?', answer: 'Japon', choices: ['Chine', 'Coree du Sud', 'Japon', 'Vietnam'] },
  { uid: 'g6', category: 'geo', question: 'Desert le plus vaste ?', answer: 'Antarctique', choices: ['Sahara', 'Gobi', 'Antarctique', 'Kalahari'] },
  { uid: 'g7', category: 'geo', question: 'Ocean entre l\'Afrique et l\'Australie ?', answer: 'Ocean Indien', choices: ['Atlantique', 'Pacifique', 'Ocean Indien', 'Arctique'] },
  { uid: 'g8', category: 'geo', question: 'Pays avec le plus d\'habitants ?', answer: 'Inde', choices: ['Chine', 'Inde', 'USA', 'Indonesie'] },
  { uid: 'g9', category: 'geo', question: 'Capitale de l\'Argentine ?', answer: 'Buenos Aires', choices: ['Santiago', 'Lima', 'Buenos Aires', 'Montevideo'] },
  { uid: 'g10', category: 'geo', question: 'Mer la plus salee ?', answer: 'Mer Morte', choices: ['Mer Rouge', 'Mer Morte', 'Mer Noire', 'Mer Baltique'] },

  // ARTS
  { uid: 'a1', category: 'arts', question: 'Auteur de La Joconde ?', answer: 'Leonard de Vinci', choices: ['Leonard de Vinci', 'Raphael', 'Michel-Ange', 'Botticelli'] },
  { uid: 'a2', category: 'arts', question: 'Compositeur de la 9e Symphonie ?', answer: 'Beethoven', choices: ['Mozart', 'Bach', 'Beethoven', 'Brahms'] },
  { uid: 'a3', category: 'arts', question: 'Auteur des Miserables ?', answer: 'Victor Hugo', choices: ['Zola', 'Hugo', 'Flaubert', 'Balzac'] },
  { uid: 'a4', category: 'arts', question: 'Mouvement artistique de Monet ?', answer: 'Impressionnisme', choices: ['Cubisme', 'Impressionnisme', 'Surrealisme', 'Realisme'] },
  { uid: 'a5', category: 'arts', question: 'Sculpteur du Penseur ?', answer: 'Rodin', choices: ['Rodin', 'Michel-Ange', 'Bernini', 'Giacometti'] },
  { uid: 'a6', category: 'arts', question: 'Nationalite de Picasso ?', answer: 'Espagnol', choices: ['Francais', 'Italien', 'Espagnol', 'Portugais'] },
  { uid: 'a7', category: 'arts', question: 'Auteur d\'Hamlet ?', answer: 'Shakespeare', choices: ['Moliere', 'Shakespeare', 'Goethe', 'Racine'] },
  { uid: 'a8', category: 'arts', question: 'Celebre tableau de Munch ?', answer: 'Le Cri', choices: ['La Nuit etoilee', 'Le Cri', 'Guernica', 'Le Baiser'] },

  // SPORTS
  { uid: 'sp1', category: 'sports', question: 'Nombre de joueurs dans une equipe de foot ?', answer: '11', choices: ['10', '11', '12', '13'] },
  { uid: 'sp2', category: 'sports', question: 'Pays de naissance des JO ?', answer: 'Grece', choices: ['Italie', 'Grece', 'France', 'Egypte'] },
  { uid: 'sp3', category: 'sports', question: 'Nombre de sets pour gagner a Roland-Garros homme ?', answer: '3', choices: ['2', '3', '4', '5'] },
  { uid: 'sp4', category: 'sports', question: 'Sport de Michael Jordan ?', answer: 'Basketball', choices: ['Football US', 'Basketball', 'Baseball', 'Hockey'] },
  { uid: 'sp5', category: 'sports', question: 'Tour de France · couleur du maillot du leader ?', answer: 'Jaune', choices: ['Vert', 'Jaune', 'Blanc a pois', 'Rouge'] },
  { uid: 'sp6', category: 'sports', question: 'Distance d\'un marathon ?', answer: '42,195 km', choices: ['40 km', '42,195 km', '45 km', '50 km'] },
  { uid: 'sp7', category: 'sports', question: 'Combien de points vaut un touchdown en NFL ?', answer: '6', choices: ['3', '6', '7', '8'] },
  { uid: 'sp8', category: 'sports', question: 'Pays ayant gagne le plus de Coupes du Monde de foot ?', answer: 'Bresil', choices: ['Allemagne', 'Bresil', 'Italie', 'Argentine'] },

  // DIVERS
  { uid: 'd1', category: 'divers', question: 'Nombre de cles sur un piano standard ?', answer: '88', choices: ['66', '76', '88', '96'] },
  { uid: 'd2', category: 'divers', question: 'Couleur obtenue en melangeant bleu et jaune ?', answer: 'Vert', choices: ['Vert', 'Violet', 'Orange', 'Marron'] },
  { uid: 'd3', category: 'divers', question: 'Nombre de cotes d\'un hexagone ?', answer: '6', choices: ['5', '6', '7', '8'] },
  { uid: 'd4', category: 'divers', question: 'Monnaie du Japon ?', answer: 'Yen', choices: ['Yuan', 'Won', 'Yen', 'Baht'] },
  { uid: 'd5', category: 'divers', question: 'Langue la plus parlee au monde ?', answer: 'Mandarin', choices: ['Anglais', 'Espagnol', 'Mandarin', 'Hindi'] },
  { uid: 'd6', category: 'divers', question: 'Plus petit pays du monde ?', answer: 'Vatican', choices: ['Monaco', 'Vatican', 'Saint-Marin', 'Liechtenstein'] },
  { uid: 'd7', category: 'divers', question: 'Nombre de joueurs aux echecs ?', answer: '2', choices: ['1', '2', '3', '4'] },
  { uid: 'd8', category: 'divers', question: 'Combien de jours en fevrier bissextile ?', answer: '29', choices: ['28', '29', '30', '31'] },
]

export async function seedIfEmpty() {
  const count = await db.flashcards.where('source').equals('generic').count()
  if (count > 0) return
  const now = Date.now()
  await db.flashcards.bulkAdd(
    SEED.map((c) => ({ ...c, source: 'generic' as const, createdAt: now }))
  )
}
