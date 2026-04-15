import { db, type Flashcard, type Category } from './db'

type SeedCard = Omit<Flashcard, 'id' | 'createdAt' | 'source'>

const C = (category: Category) => category

const SEED: SeedCard[] = [
  // ================= ANTIQUITE =================
  { uid: 'ant1', category: C('histoire'), question: 'Auteur de l\'Iliade et l\'Odyssee ?', answer: 'Homere', choices: ['Virgile', 'Homere', 'Sophocle', 'Ovide'] },
  { uid: 'ant2', category: C('histoire'), question: 'Premier empereur romain ?', answer: 'Auguste', choices: ['Cesar', 'Auguste', 'Neron', 'Caligula'] },
  { uid: 'ant3', category: C('histoire'), question: 'Reine d\'Egypte amante de Cesar et Marc Antoine ?', answer: 'Cleopatre', choices: ['Nefertiti', 'Cleopatre', 'Hatchepsout', 'Nitocris'] },
  { uid: 'ant4', category: C('histoire'), question: 'Philosophe grec maitre d\'Alexandre ?', answer: 'Aristote', choices: ['Platon', 'Socrate', 'Aristote', 'Epicure'] },
  { uid: 'ant5', category: C('histoire'), question: 'Ville detruite par le Vesuve en 79 ?', answer: 'Pompei', choices: ['Herculanum', 'Pompei', 'Ostie', 'Naples'] },
  { uid: 'ant6', category: C('histoire'), question: 'Fondateur mythique de Rome ?', answer: 'Romulus', choices: ['Enee', 'Remus', 'Romulus', 'Numa'] },
  { uid: 'ant7', category: C('histoire'), question: 'Jules Cesar franchit quel fleuve en 49 av J.-C. ?', answer: 'Rubicon', choices: ['Tibre', 'Po', 'Rubicon', 'Arno'] },
  { uid: 'ant8', category: C('histoire'), question: '7 merveilles · laquelle subsiste ?', answer: 'Pyramide de Gizeh', choices: ['Colosse de Rhodes', 'Pyramide de Gizeh', 'Phare d\'Alexandrie', 'Mausolee d\'Halicarnasse'] },
  { uid: 'ant9', category: C('histoire'), question: 'Ecriture egyptienne sacree ?', answer: 'Hieroglyphes', choices: ['Cuneiforme', 'Hieroglyphes', 'Demotique', 'Copte'] },
  { uid: 'ant10', category: C('histoire'), question: 'Dieu grec de la mer ?', answer: 'Poseidon', choices: ['Zeus', 'Hades', 'Poseidon', 'Ares'] },

  // ================= MOYEN AGE =================
  { uid: 'ma1', category: C('histoire'), question: 'Chute de Rome ?', answer: '476', choices: ['376', '476', '576', '676'] },
  { uid: 'ma2', category: C('histoire'), question: 'Bataille ou les Francs battent les Arabes (732) ?', answer: 'Poitiers', choices: ['Tours', 'Poitiers', 'Roncevaux', 'Bouvines'] },
  { uid: 'ma3', category: C('histoire'), question: 'Heroine brulee a Rouen en 1431 ?', answer: 'Jeanne d\'Arc', choices: ['Aliénor d\'Aquitaine', 'Jeanne d\'Arc', 'Isabeau de Baviere', 'Blanche de Castille'] },
  { uid: 'ma4', category: C('histoire'), question: 'Roi franc couronne empereur en 800 ?', answer: 'Charlemagne', choices: ['Clovis', 'Charles Martel', 'Charlemagne', 'Hugues Capet'] },
  { uid: 'ma5', category: C('histoire'), question: 'Guerre opposant France et Angleterre (1337-1453) ?', answer: 'Guerre de Cent Ans', choices: ['Guerre des Roses', 'Guerre de Cent Ans', 'Guerre de Trente Ans', 'Reconquista'] },
  { uid: 'ma6', category: C('histoire'), question: 'Premiere croisade lancee en ?', answer: '1095', choices: ['1065', '1095', '1125', '1145'] },
  { uid: 'ma7', category: C('histoire'), question: 'Epidemie medievale decimant un tiers de l\'Europe ?', answer: 'Peste noire', choices: ['Variole', 'Peste noire', 'Lepre', 'Typhus'] },
  { uid: 'ma8', category: C('histoire'), question: 'Document signe par Jean sans Terre en 1215 ?', answer: 'Magna Carta', choices: ['Edit de Nantes', 'Magna Carta', 'Bulle d\'Or', 'Code Justinien'] },

  // ================= RENAISSANCE =================
  { uid: 'ren1', category: C('histoire'), question: 'Decouverte de l\'Amerique ?', answer: '1492', choices: ['1492', '1498', '1453', '1519'] },
  { uid: 'ren2', category: C('histoire'), question: 'Premier circumnavigateur ?', answer: 'Magellan', choices: ['Vasco de Gama', 'Magellan', 'Colomb', 'Drake'] },
  { uid: 'ren3', category: C('histoire'), question: 'Auteur de Romeo et Juliette ?', answer: 'Shakespeare', choices: ['Moliere', 'Shakespeare', 'Racine', 'Dante'] },
  { uid: 'ren4', category: C('histoire'), question: 'Inventeur de l\'imprimerie moderne ?', answer: 'Gutenberg', choices: ['Edison', 'Gutenberg', 'Marconi', 'Da Vinci'] },
  { uid: 'ren5', category: C('histoire'), question: 'Reformateur protestant allemand ?', answer: 'Luther', choices: ['Calvin', 'Luther', 'Zwingli', 'Knox'] },
  { uid: 'ren6', category: C('histoire'), question: 'Astronome italien proces en 1633 ?', answer: 'Galilee', choices: ['Copernic', 'Galilee', 'Kepler', 'Tycho Brahe'] },
  { uid: 'ren7', category: C('histoire'), question: 'Peintre auteur de La Cene ?', answer: 'Leonard de Vinci', choices: ['Michel-Ange', 'Leonard de Vinci', 'Raphael', 'Botticelli'] },
  { uid: 'ren8', category: C('histoire'), question: 'Annee de la Saint-Barthelemy ?', answer: '1572', choices: ['1572', '1562', '1598', '1610'] },

  // ================= REVOLUTIONS =================
  { uid: 'rev1', category: C('histoire'), question: 'Prise de la Bastille ?', answer: '14 juillet 1789', choices: ['14 juillet 1789', '4 aout 1789', '20 juin 1789', '10 aout 1792'] },
  { uid: 'rev2', category: C('histoire'), question: 'Execution de Louis XVI ?', answer: '1793', choices: ['1791', '1792', '1793', '1794'] },
  { uid: 'rev3', category: C('histoire'), question: 'Independance des Etats-Unis ?', answer: '1776', choices: ['1776', '1783', '1763', '1789'] },
  { uid: 'rev4', category: C('histoire'), question: 'Empereur couronne en 1804 ?', answer: 'Napoleon Bonaparte', choices: ['Louis XVIII', 'Napoleon Bonaparte', 'Charles X', 'Louis-Philippe'] },
  { uid: 'rev5', category: C('histoire'), question: 'Revolution industrielle commence au... ?', answer: 'Royaume-Uni', choices: ['France', 'Royaume-Uni', 'Allemagne', 'USA'] },
  { uid: 'rev6', category: C('histoire'), question: 'Defaite finale de Napoleon ?', answer: 'Waterloo', choices: ['Leipzig', 'Waterloo', 'Austerlitz', 'Moscou'] },
  { uid: 'rev7', category: C('histoire'), question: 'Marx et Engels publient le Manifeste en ?', answer: '1848', choices: ['1848', '1871', '1830', '1789'] },
  { uid: 'rev8', category: C('histoire'), question: 'Guerre de Secession (USA) ?', answer: '1861-1865', choices: ['1776-1783', '1812-1815', '1861-1865', '1898-1899'] },

  // ================= XXe SIECLE =================
  { uid: 'xx1', category: C('histoire'), question: 'Debut de la Premiere Guerre mondiale ?', answer: '1914', choices: ['1910', '1914', '1918', '1920'] },
  { uid: 'xx2', category: C('histoire'), question: 'Debarquement de Normandie ?', answer: '6 juin 1944', choices: ['6 juin 1944', '8 mai 1945', '11 novembre 1918', '1er septembre 1939'] },
  { uid: 'xx3', category: C('histoire'), question: 'Bombe d\'Hiroshima ?', answer: '6 aout 1945', choices: ['6 aout 1945', '9 aout 1945', '15 aout 1945', '2 septembre 1945'] },
  { uid: 'xx4', category: C('histoire'), question: 'Chute du mur de Berlin ?', answer: '1989', choices: ['1989', '1991', '1985', '1979'] },
  { uid: 'xx5', category: C('histoire'), question: 'Fin officielle de l\'URSS ?', answer: '1991', choices: ['1989', '1990', '1991', '1992'] },
  { uid: 'xx6', category: C('histoire'), question: 'Premier homme sur la Lune ?', answer: 'Neil Armstrong', choices: ['Youri Gagarine', 'Neil Armstrong', 'Buzz Aldrin', 'John Glenn'] },
  { uid: 'xx7', category: C('histoire'), question: 'Annee du premier homme dans l\'espace ?', answer: '1961', choices: ['1957', '1961', '1969', '1972'] },
  { uid: 'xx8', category: C('histoire'), question: 'Qui a dirige l\'Allemagne nazie ?', answer: 'Hitler', choices: ['Himmler', 'Hitler', 'Goebbels', 'Goering'] },
  { uid: 'xx9', category: C('histoire'), question: 'Pere de l\'Inde independante ?', answer: 'Gandhi', choices: ['Nehru', 'Gandhi', 'Mandela', 'Sukarno'] },
  { uid: 'xx10', category: C('histoire'), question: 'Leader noir sud-africain libere en 1990 ?', answer: 'Mandela', choices: ['Mandela', 'Tutu', 'Biko', 'Mbeki'] },

  // ================= CORPS HUMAIN =================
  { uid: 'bio1', category: C('sciences'), question: 'Organe qui pompe le sang ?', answer: 'Le coeur', choices: ['Le foie', 'Les poumons', 'Le coeur', 'Le cerveau'] },
  { uid: 'bio2', category: C('sciences'), question: 'Nombre d\'os chez l\'adulte ?', answer: '206', choices: ['186', '206', '226', '246'] },
  { uid: 'bio3', category: C('sciences'), question: 'Plus long os du corps ?', answer: 'Femur', choices: ['Tibia', 'Femur', 'Humerus', 'Radius'] },
  { uid: 'bio4', category: C('sciences'), question: 'Organe filtrant le sang ?', answer: 'Reins', choices: ['Foie', 'Reins', 'Rate', 'Pancreas'] },
  { uid: 'bio5', category: C('sciences'), question: 'Cellules du sang transportant l\'oxygene ?', answer: 'Globules rouges', choices: ['Globules rouges', 'Globules blancs', 'Plaquettes', 'Lymphocytes'] },
  { uid: 'bio6', category: C('sciences'), question: 'Nombre de chromosomes humains ?', answer: '46', choices: ['23', '44', '46', '48'] },
  { uid: 'bio7', category: C('sciences'), question: 'Organe du gout ?', answer: 'La langue', choices: ['Le nez', 'La langue', 'Le palais', 'Les dents'] },
  { uid: 'bio8', category: C('sciences'), question: 'Vitamine produite grace au soleil ?', answer: 'D', choices: ['A', 'C', 'D', 'K'] },
  { uid: 'bio9', category: C('sciences'), question: 'Plus grand organe du corps ?', answer: 'Peau', choices: ['Foie', 'Peau', 'Intestin', 'Cerveau'] },
  { uid: 'bio10', category: C('sciences'), question: 'Globules qui combattent les infections ?', answer: 'Globules blancs', choices: ['Rouges', 'Blancs', 'Plaquettes', 'Histamines'] },

  // ================= UNIVERS ESPACE =================
  { uid: 'esp1', category: C('sciences'), question: 'Planete la plus proche du Soleil ?', answer: 'Mercure', choices: ['Venus', 'Mercure', 'Mars', 'Terre'] },
  { uid: 'esp2', category: C('sciences'), question: 'Plus grande planete du systeme solaire ?', answer: 'Jupiter', choices: ['Saturne', 'Jupiter', 'Neptune', 'Uranus'] },
  { uid: 'esp3', category: C('sciences'), question: 'Etoile la plus proche de la Terre ?', answer: 'Le Soleil', choices: ['Alpha Centauri', 'Le Soleil', 'Sirius', 'Proxima'] },
  { uid: 'esp4', category: C('sciences'), question: 'Notre galaxie ?', answer: 'Voie lactee', choices: ['Andromede', 'Voie lactee', 'Triangle', 'Sombrero'] },
  { uid: 'esp5', category: C('sciences'), question: 'Vitesse de la lumiere (km/s) ?', answer: '300 000', choices: ['150 000', '300 000', '1 000 000', '30 000'] },
  { uid: 'esp6', category: C('sciences'), question: 'Satellite naturel de la Terre ?', answer: 'La Lune', choices: ['Phobos', 'La Lune', 'Titan', 'Europe'] },
  { uid: 'esp7', category: C('sciences'), question: 'Planete connue pour ses anneaux ?', answer: 'Saturne', choices: ['Jupiter', 'Saturne', 'Uranus', 'Neptune'] },
  { uid: 'esp8', category: C('sciences'), question: 'Theorie de l\'origine de l\'univers ?', answer: 'Big Bang', choices: ['Big Bang', 'Big Crunch', 'Steady State', 'Inflation'] },
  { uid: 'esp9', category: C('sciences'), question: 'Rover martien de la NASA lance en 2020 ?', answer: 'Perseverance', choices: ['Curiosity', 'Perseverance', 'Opportunity', 'Spirit'] },
  { uid: 'esp10', category: C('sciences'), question: 'Annee du 1er pas sur la Lune ?', answer: '1969', choices: ['1961', '1965', '1969', '1972'] },

  // ================= CHIMIE =================
  { uid: 'chi1', category: C('sciences'), question: 'Formule chimique de l\'eau ?', answer: 'H2O', choices: ['H2O', 'CO2', 'O2', 'NaCl'] },
  { uid: 'chi2', category: C('sciences'), question: 'Element de symbole Au ?', answer: 'Or', choices: ['Argent', 'Aluminium', 'Or', 'Cuivre'] },
  { uid: 'chi3', category: C('sciences'), question: 'Element le plus abondant dans l\'univers ?', answer: 'Hydrogene', choices: ['Helium', 'Oxygene', 'Hydrogene', 'Carbone'] },
  { uid: 'chi4', category: C('sciences'), question: 'pH neutre ?', answer: '7', choices: ['5', '6', '7', '8'] },
  { uid: 'chi5', category: C('sciences'), question: 'Symbole du sodium ?', answer: 'Na', choices: ['S', 'Na', 'No', 'Sn'] },
  { uid: 'chi6', category: C('sciences'), question: 'Gaz le plus abondant dans l\'atmosphere ?', answer: 'Azote', choices: ['Oxygene', 'Azote', 'CO2', 'Hydrogene'] },
  { uid: 'chi7', category: C('sciences'), question: 'Nombre d\'atomes de carbone dans le methane ?', answer: '1', choices: ['1', '2', '3', '4'] },
  { uid: 'chi8', category: C('sciences'), question: 'Pere du tableau periodique ?', answer: 'Mendeleiev', choices: ['Lavoisier', 'Mendeleiev', 'Dalton', 'Avogadro'] },

  // ================= PHYSIQUE =================
  { uid: 'phy1', category: C('sciences'), question: 'Unite de force ?', answer: 'Newton', choices: ['Joule', 'Watt', 'Newton', 'Pascal'] },
  { uid: 'phy2', category: C('sciences'), question: 'E = mc² auteur ?', answer: 'Einstein', choices: ['Newton', 'Einstein', 'Bohr', 'Planck'] },
  { uid: 'phy3', category: C('sciences'), question: 'Unite d\'energie SI ?', answer: 'Joule', choices: ['Watt', 'Joule', 'Newton', 'Calorie'] },
  { uid: 'phy4', category: C('sciences'), question: 'Loi de la gravitation · auteur ?', answer: 'Newton', choices: ['Newton', 'Einstein', 'Galilee', 'Kepler'] },
  { uid: 'phy5', category: C('sciences'), question: 'Temperature absolue zero (°C) ?', answer: '-273,15', choices: ['-100', '-273,15', '-459', '0'] },
  { uid: 'phy6', category: C('sciences'), question: 'Etat de la matiere plus dense que gaz mais moins que liquide ?', answer: 'Aucun', choices: ['Plasma', 'Aucun', 'Cristal', 'Condensat'] },
  { uid: 'phy7', category: C('sciences'), question: 'Unite de puissance ?', answer: 'Watt', choices: ['Joule', 'Watt', 'Newton', 'Volt'] },
  { uid: 'phy8', category: C('sciences'), question: 'Particule chargee positivement du noyau ?', answer: 'Proton', choices: ['Electron', 'Neutron', 'Proton', 'Photon'] },

  // ================= EVOLUTION =================
  { uid: 'evo1', category: C('sciences'), question: 'Pere de la theorie de l\'evolution ?', answer: 'Darwin', choices: ['Mendel', 'Einstein', 'Darwin', 'Pasteur'] },
  { uid: 'evo2', category: C('sciences'), question: 'ADN signifie ?', answer: 'Acide desoxyribonucleique', choices: ['Acide desoxyribonucleique', 'Acide dinitrique', 'Alcool dextrose neutre', 'Agent double nucleaire'] },
  { uid: 'evo3', category: C('sciences'), question: 'Ancetre commun homme-chimpanze il y a environ ?', answer: '6-7 millions d\'annees', choices: ['1-2 M ans', '6-7 M ans', '20 M ans', '50 M ans'] },
  { uid: 'evo4', category: C('sciences'), question: 'Extinction ayant tue les dinosaures il y a ?', answer: '66 millions d\'annees', choices: ['10 M ans', '66 M ans', '200 M ans', '500 M ans'] },
  { uid: 'evo5', category: C('sciences'), question: 'Unite de base du vivant ?', answer: 'Cellule', choices: ['Molecule', 'Atome', 'Cellule', 'Tissu'] },
  { uid: 'evo6', category: C('sciences'), question: 'Fondateur de la genetique moderne ?', answer: 'Mendel', choices: ['Darwin', 'Mendel', 'Watson', 'Crick'] },
  { uid: 'evo7', category: C('sciences'), question: 'Plus grand animal vivant ?', answer: 'Baleine bleue', choices: ['Elephant', 'Baleine bleue', 'Requin baleine', 'Calmar geant'] },
  { uid: 'evo8', category: C('sciences'), question: 'Oiseau incapable de voler le plus grand ?', answer: 'Autruche', choices: ['Emeu', 'Autruche', 'Casoar', 'Kiwi'] },

  // ================= CAPITALES =================
  { uid: 'cap1', category: C('geo'), question: 'Capitale de l\'Australie ?', answer: 'Canberra', choices: ['Sydney', 'Canberra', 'Melbourne', 'Perth'] },
  { uid: 'cap2', category: C('geo'), question: 'Capitale du Canada ?', answer: 'Ottawa', choices: ['Toronto', 'Montreal', 'Ottawa', 'Vancouver'] },
  { uid: 'cap3', category: C('geo'), question: 'Capitale du Bresil ?', answer: 'Brasilia', choices: ['Rio', 'Sao Paulo', 'Brasilia', 'Salvador'] },
  { uid: 'cap4', category: C('geo'), question: 'Capitale de l\'Argentine ?', answer: 'Buenos Aires', choices: ['Santiago', 'Lima', 'Buenos Aires', 'Montevideo'] },
  { uid: 'cap5', category: C('geo'), question: 'Capitale de l\'Egypte ?', answer: 'Le Caire', choices: ['Alexandrie', 'Le Caire', 'Louxor', 'Giza'] },
  { uid: 'cap6', category: C('geo'), question: 'Capitale de la Coree du Sud ?', answer: 'Seoul', choices: ['Busan', 'Seoul', 'Incheon', 'Daegu'] },
  { uid: 'cap7', category: C('geo'), question: 'Capitale de la Turquie ?', answer: 'Ankara', choices: ['Istanbul', 'Ankara', 'Izmir', 'Antalya'] },
  { uid: 'cap8', category: C('geo'), question: 'Capitale du Vietnam ?', answer: 'Hanoi', choices: ['Ho Chi Minh', 'Hanoi', 'Hue', 'Da Nang'] },
  { uid: 'cap9', category: C('geo'), question: 'Capitale de la Nouvelle-Zelande ?', answer: 'Wellington', choices: ['Auckland', 'Wellington', 'Christchurch', 'Dunedin'] },
  { uid: 'cap10', category: C('geo'), question: 'Capitale des Pays-Bas ?', answer: 'Amsterdam', choices: ['La Haye', 'Amsterdam', 'Rotterdam', 'Utrecht'] },

  // ================= FLEUVES MONTAGNES =================
  { uid: 'geo1', category: C('geo'), question: 'Plus long fleuve du monde ?', answer: 'Nil', choices: ['Amazone', 'Nil', 'Yangtse', 'Mississippi'] },
  { uid: 'geo2', category: C('geo'), question: 'Plus haut sommet du monde ?', answer: 'Everest', choices: ['K2', 'Everest', 'Mont Blanc', 'Kilimandjaro'] },
  { uid: 'geo3', category: C('geo'), question: 'Fleuve qui traverse Paris ?', answer: 'Seine', choices: ['Loire', 'Seine', 'Rhone', 'Garonne'] },
  { uid: 'geo4', category: C('geo'), question: 'Plus long fleuve d\'Europe ?', answer: 'Volga', choices: ['Danube', 'Volga', 'Rhin', 'Dniepr'] },
  { uid: 'geo5', category: C('geo'), question: 'Massif montagneux Europe-Asie ?', answer: 'Oural', choices: ['Alpes', 'Oural', 'Caucase', 'Pyrenees'] },
  { uid: 'geo6', category: C('geo'), question: 'Montagne sacree du Japon ?', answer: 'Mont Fuji', choices: ['Fuji', 'Mont Fuji', 'Tate', 'Asama'] },
  { uid: 'geo7', category: C('geo'), question: 'Plus haut sommet d\'Afrique ?', answer: 'Kilimandjaro', choices: ['Kenya', 'Kilimandjaro', 'Meru', 'Ruwenzori'] },
  { uid: 'geo8', category: C('geo'), question: 'Fleuve americain celebre pour son canyon ?', answer: 'Colorado', choices: ['Mississippi', 'Colorado', 'Hudson', 'Rio Grande'] },

  // ================= MONDE ET CLIMAT =================
  { uid: 'mon1', category: C('geo'), question: 'Desert le plus vaste ?', answer: 'Antarctique', choices: ['Sahara', 'Gobi', 'Antarctique', 'Kalahari'] },
  { uid: 'mon2', category: C('geo'), question: 'Ocean entre l\'Afrique et l\'Australie ?', answer: 'Ocean Indien', choices: ['Atlantique', 'Pacifique', 'Ocean Indien', 'Arctique'] },
  { uid: 'mon3', category: C('geo'), question: 'Pays avec le plus d\'habitants ?', answer: 'Inde', choices: ['Chine', 'Inde', 'USA', 'Indonesie'] },
  { uid: 'mon4', category: C('geo'), question: 'Mer la plus salee ?', answer: 'Mer Morte', choices: ['Mer Rouge', 'Mer Morte', 'Mer Noire', 'Mer Baltique'] },
  { uid: 'mon5', category: C('geo'), question: 'Plus petit pays du monde ?', answer: 'Vatican', choices: ['Monaco', 'Vatican', 'Saint-Marin', 'Liechtenstein'] },
  { uid: 'mon6', category: C('geo'), question: 'Pays traverse par l\'equateur ?', answer: 'Equateur', choices: ['Perou', 'Equateur', 'Colombie', 'Bolivie'] },
  { uid: 'mon7', category: C('geo'), question: 'Foret tropicale la plus vaste ?', answer: 'Amazonie', choices: ['Amazonie', 'Congo', 'Bornéo', 'Taiga'] },
  { uid: 'mon8', category: C('geo'), question: 'Monnaie du Japon ?', answer: 'Yen', choices: ['Yuan', 'Won', 'Yen', 'Baht'] },

  // ================= PEINTURE =================
  { uid: 'pei1', category: C('arts'), question: 'Auteur de La Joconde ?', answer: 'Leonard de Vinci', choices: ['Leonard de Vinci', 'Raphael', 'Michel-Ange', 'Botticelli'] },
  { uid: 'pei2', category: C('arts'), question: 'Mouvement de Monet ?', answer: 'Impressionnisme', choices: ['Cubisme', 'Impressionnisme', 'Surrealisme', 'Realisme'] },
  { uid: 'pei3', category: C('arts'), question: 'Nationalite de Picasso ?', answer: 'Espagnol', choices: ['Francais', 'Italien', 'Espagnol', 'Portugais'] },
  { uid: 'pei4', category: C('arts'), question: 'Celebre tableau de Munch ?', answer: 'Le Cri', choices: ['La Nuit etoilee', 'Le Cri', 'Guernica', 'Le Baiser'] },
  { uid: 'pei5', category: C('arts'), question: 'Auteur de La Nuit etoilee ?', answer: 'Van Gogh', choices: ['Monet', 'Van Gogh', 'Gauguin', 'Cezanne'] },
  { uid: 'pei6', category: C('arts'), question: 'Peintre surrealiste espagnol aux montres molles ?', answer: 'Dali', choices: ['Miro', 'Dali', 'Magritte', 'Ernst'] },
  { uid: 'pei7', category: C('arts'), question: 'Auteur de Guernica ?', answer: 'Picasso', choices: ['Dali', 'Picasso', 'Miro', 'Kahlo'] },
  { uid: 'pei8', category: C('arts'), question: 'Peintre des nympheas ?', answer: 'Monet', choices: ['Monet', 'Renoir', 'Degas', 'Pissarro'] },

  // ================= MUSIQUE CLASSIQUE =================
  { uid: 'mus1', category: C('arts'), question: 'Compositeur de la 9e Symphonie ?', answer: 'Beethoven', choices: ['Mozart', 'Bach', 'Beethoven', 'Brahms'] },
  { uid: 'mus2', category: C('arts'), question: 'Auteur des 4 Saisons ?', answer: 'Vivaldi', choices: ['Bach', 'Vivaldi', 'Haendel', 'Mozart'] },
  { uid: 'mus3', category: C('arts'), question: 'Compositeur autrichien mort jeune, auteur du Requiem ?', answer: 'Mozart', choices: ['Mozart', 'Schubert', 'Haydn', 'Chopin'] },
  { uid: 'mus4', category: C('arts'), question: 'Compositeur de Cosi fan tutte ?', answer: 'Mozart', choices: ['Verdi', 'Mozart', 'Puccini', 'Rossini'] },
  { uid: 'mus5', category: C('arts'), question: 'Opera italien · Aida ?', answer: 'Verdi', choices: ['Puccini', 'Verdi', 'Rossini', 'Donizetti'] },
  { uid: 'mus6', category: C('arts'), question: 'Compositeur de Clair de Lune ?', answer: 'Debussy', choices: ['Ravel', 'Debussy', 'Satie', 'Faure'] },
  { uid: 'mus7', category: C('arts'), question: 'Nombre de touches d\'un piano standard ?', answer: '88', choices: ['66', '76', '88', '96'] },
  { uid: 'mus8', category: C('arts'), question: 'Compositeur du Bolero ?', answer: 'Ravel', choices: ['Debussy', 'Ravel', 'Stravinsky', 'Satie'] },

  // ================= LITTERATURE =================
  { uid: 'lit1', category: C('arts'), question: 'Auteur de Hamlet ?', answer: 'Shakespeare', choices: ['Moliere', 'Shakespeare', 'Goethe', 'Racine'] },
  { uid: 'lit2', category: C('arts'), question: 'Auteur des Miserables ?', answer: 'Victor Hugo', choices: ['Zola', 'Hugo', 'Flaubert', 'Balzac'] },
  { uid: 'lit3', category: C('arts'), question: 'Auteur de Madame Bovary ?', answer: 'Flaubert', choices: ['Zola', 'Balzac', 'Flaubert', 'Maupassant'] },
  { uid: 'lit4', category: C('arts'), question: 'Auteur de L\'Etranger ?', answer: 'Camus', choices: ['Sartre', 'Camus', 'Gide', 'Malraux'] },
  { uid: 'lit5', category: C('arts'), question: 'Auteur de 1984 ?', answer: 'Orwell', choices: ['Huxley', 'Orwell', 'Kafka', 'Wells'] },
  { uid: 'lit6', category: C('arts'), question: 'Auteur de Don Quichotte ?', answer: 'Cervantes', choices: ['Cervantes', 'Dante', 'Boccace', 'Petrarque'] },
  { uid: 'lit7', category: C('arts'), question: 'Auteur de Crime et Chatiment ?', answer: 'Dostoievski', choices: ['Tolstoi', 'Dostoievski', 'Tchekhov', 'Gogol'] },
  { uid: 'lit8', category: C('arts'), question: 'Auteur du Petit Prince ?', answer: 'Saint-Exupery', choices: ['Camus', 'Saint-Exupery', 'Malraux', 'Giono'] },

  // ================= SPORTS =================
  { uid: 'spo1', category: C('sports'), question: 'Joueurs dans une equipe de foot ?', answer: '11', choices: ['10', '11', '12', '13'] },
  { uid: 'spo2', category: C('sports'), question: 'Pays de naissance des JO modernes ?', answer: 'Grece', choices: ['Italie', 'Grece', 'France', 'Egypte'] },
  { uid: 'spo3', category: C('sports'), question: 'Pays ayant gagne le plus de Coupes du Monde ?', answer: 'Bresil', choices: ['Allemagne', 'Bresil', 'Italie', 'Argentine'] },
  { uid: 'spo4', category: C('sports'), question: 'Tour de France · maillot du leader ?', answer: 'Jaune', choices: ['Vert', 'Jaune', 'A pois', 'Blanc'] },
  { uid: 'spo5', category: C('sports'), question: 'Distance d\'un marathon ?', answer: '42,195 km', choices: ['40', '42,195', '45', '50'] },
  { uid: 'spo6', category: C('sports'), question: 'Sport de Michael Jordan ?', answer: 'Basketball', choices: ['Football US', 'Basketball', 'Baseball', 'Hockey'] },
  { uid: 'spo7', category: C('sports'), question: 'Combien de sets (H) a Roland-Garros ?', answer: '3', choices: ['2', '3', '4', '5'] },
  { uid: 'spo8', category: C('sports'), question: 'Tournoi du Grand Chelem sur herbe ?', answer: 'Wimbledon', choices: ['Roland-Garros', 'Wimbledon', 'US Open', 'Australian Open'] },
  { uid: 'spo9', category: C('sports'), question: 'Touchdown vaut combien en NFL ?', answer: '6', choices: ['3', '6', '7', '8'] },
  { uid: 'spo10', category: C('sports'), question: 'F1 · plus titre de l\'histoire (7) ?', answer: 'Hamilton/Schumacher', choices: ['Senna', 'Prost', 'Hamilton/Schumacher', 'Vettel'] },

  // ================= MYTHOLOGIE =================
  { uid: 'myt1', category: C('arts'), question: 'Roi des dieux grecs ?', answer: 'Zeus', choices: ['Zeus', 'Apollon', 'Hermes', 'Cronos'] },
  { uid: 'myt2', category: C('arts'), question: 'Dieu romain de la guerre ?', answer: 'Mars', choices: ['Mars', 'Apollon', 'Mercure', 'Jupiter'] },
  { uid: 'myt3', category: C('arts'), question: 'Heros aux 12 travaux ?', answer: 'Hercule', choices: ['Persee', 'Hercule', 'Thesee', 'Achille'] },
  { uid: 'myt4', category: C('arts'), question: 'Dieu nordique du tonnerre ?', answer: 'Thor', choices: ['Odin', 'Thor', 'Loki', 'Freyr'] },
  { uid: 'myt5', category: C('arts'), question: 'Dieu egyptien des morts ?', answer: 'Anubis', choices: ['Ra', 'Anubis', 'Osiris', 'Horus'] },
  { uid: 'myt6', category: C('arts'), question: 'Hero\'s mythique du cheval de Troie ?', answer: 'Ulysse', choices: ['Achille', 'Ulysse', 'Agamemnon', 'Hector'] },
  { uid: 'myt7', category: C('arts'), question: 'Createur grec du labyrinthe ?', answer: 'Dedale', choices: ['Minos', 'Dedale', 'Icare', 'Thesee'] },
  { uid: 'myt8', category: C('arts'), question: 'Dieu grec du vin ?', answer: 'Dionysos', choices: ['Apollon', 'Dionysos', 'Hermes', 'Hephaistos'] },

  // ================= CINEMA =================
  { uid: 'cin1', category: C('arts'), question: 'Realisateur de Pulp Fiction ?', answer: 'Tarantino', choices: ['Scorsese', 'Tarantino', 'Coppola', 'Spielberg'] },
  { uid: 'cin2', category: C('arts'), question: 'Oscar du meilleur film 2020 ?', answer: 'Parasite', choices: ['1917', 'Parasite', 'Joker', 'Once Upon a Time'] },
  { uid: 'cin3', category: C('arts'), question: 'Acteur dans tous les Iron Man Marvel ?', answer: 'Robert Downey Jr.', choices: ['Chris Evans', 'Robert Downey Jr.', 'Chris Hemsworth', 'Mark Ruffalo'] },
  { uid: 'cin4', category: C('arts'), question: 'Realisateur du Parrain ?', answer: 'Coppola', choices: ['Scorsese', 'Coppola', 'De Palma', 'Lumet'] },
  { uid: 'cin5', category: C('arts'), question: 'Film · phrase "Que la Force soit avec toi" ?', answer: 'Star Wars', choices: ['Star Trek', 'Star Wars', 'Matrix', 'Dune'] },
  { uid: 'cin6', category: C('arts'), question: 'Festival francais de cinema ?', answer: 'Cannes', choices: ['Cannes', 'Venise', 'Berlin', 'Deauville'] },
  { uid: 'cin7', category: C('arts'), question: 'Realisateur de Inception ?', answer: 'Nolan', choices: ['Villeneuve', 'Nolan', 'Fincher', 'Scott'] },
  { uid: 'cin8', category: C('arts'), question: 'Premier Pixar sorti (1995) ?', answer: 'Toy Story', choices: ['Toy Story', 'Monstres et Cie', '1001 Pattes', 'Finding Nemo'] },

  // ================= INVENTIONS =================
  { uid: 'inv1', category: C('sciences'), question: 'Inventeur du telephone ?', answer: 'Bell', choices: ['Edison', 'Bell', 'Marconi', 'Tesla'] },
  { uid: 'inv2', category: C('sciences'), question: 'Invention attribuee a Edison ?', answer: 'Ampoule', choices: ['Telephone', 'Ampoule', 'Radio', 'TV'] },
  { uid: 'inv3', category: C('sciences'), question: 'Freres pionniers de l\'aviation ?', answer: 'Wright', choices: ['Lumiere', 'Wright', 'Mongolfier', 'Bleriot'] },
  { uid: 'inv4', category: C('sciences'), question: 'Inventeur de la penicilline ?', answer: 'Fleming', choices: ['Pasteur', 'Fleming', 'Curie', 'Koch'] },
  { uid: 'inv5', category: C('sciences'), question: 'Invention par Tim Berners-Lee (1989) ?', answer: 'World Wide Web', choices: ['Internet', 'World Wide Web', 'Email', 'HTML'] },
  { uid: 'inv6', category: C('sciences'), question: 'Freres du cinema ?', answer: 'Lumiere', choices: ['Wright', 'Lumiere', 'Mongolfier', 'Grimm'] },
  { uid: 'inv7', category: C('sciences'), question: 'Vaccin de Pasteur contre ?', answer: 'Rage', choices: ['Variole', 'Rage', 'Cholera', 'Peste'] },
  { uid: 'inv8', category: C('sciences'), question: 'Inventeur de la dynamite ?', answer: 'Nobel', choices: ['Nobel', 'Edison', 'Tesla', 'Curie'] },

  // ================= MATH =================
  { uid: 'mat1', category: C('sciences'), question: 'Pi arrondi a 2 decimales ?', answer: '3,14', choices: ['3,10', '3,14', '3,18', '3,24'] },
  { uid: 'mat2', category: C('sciences'), question: 'Racine carree de 144 ?', answer: '12', choices: ['10', '12', '14', '16'] },
  { uid: 'mat3', category: C('sciences'), question: 'Cotes d\'un hexagone ?', answer: '6', choices: ['5', '6', '7', '8'] },
  { uid: 'mat4', category: C('sciences'), question: 'Somme des angles d\'un triangle ?', answer: '180°', choices: ['90°', '180°', '270°', '360°'] },
  { uid: 'mat5', category: C('sciences'), question: 'Theoreme celebre · a²+b²=c² ?', answer: 'Pythagore', choices: ['Thales', 'Pythagore', 'Euclide', 'Descartes'] },
  { uid: 'mat6', category: C('sciences'), question: 'Plus petit nombre premier ?', answer: '2', choices: ['0', '1', '2', '3'] },
  { uid: 'mat7', category: C('sciences'), question: 'Nombre d\'or approximatif ?', answer: '1,618', choices: ['1,414', '1,618', '2,718', '3,141'] },
  { uid: 'mat8', category: C('sciences'), question: 'Inventeur du systeme decimal ?', answer: 'Les Indiens', choices: ['Les Grecs', 'Les Romains', 'Les Indiens', 'Les Arabes'] },

  // ================= PHILOSOPHIE =================
  { uid: 'phi1', category: C('divers'), question: '"Je pense donc je suis" · auteur ?', answer: 'Descartes', choices: ['Kant', 'Descartes', 'Spinoza', 'Pascal'] },
  { uid: 'phi2', category: C('divers'), question: 'Philosophe grec buveur de cigue ?', answer: 'Socrate', choices: ['Platon', 'Socrate', 'Aristote', 'Diogene'] },
  { uid: 'phi3', category: C('divers'), question: 'Auteur du Contrat social ?', answer: 'Rousseau', choices: ['Voltaire', 'Rousseau', 'Montesquieu', 'Diderot'] },
  { uid: 'phi4', category: C('divers'), question: '"Dieu est mort" · auteur ?', answer: 'Nietzsche', choices: ['Marx', 'Nietzsche', 'Hegel', 'Kierkegaard'] },
  { uid: 'phi5', category: C('divers'), question: 'Philosophe allemand de La Critique de la raison pure ?', answer: 'Kant', choices: ['Hegel', 'Kant', 'Fichte', 'Leibniz'] },
  { uid: 'phi6', category: C('divers'), question: 'Existentialiste francais, auteur de L\'Etre et le Neant ?', answer: 'Sartre', choices: ['Camus', 'Sartre', 'Beauvoir', 'Merleau-Ponty'] },

  // ================= LANGUES =================
  { uid: 'lan1', category: C('divers'), question: 'Langue la plus parlee (natifs) ?', answer: 'Mandarin', choices: ['Anglais', 'Espagnol', 'Mandarin', 'Hindi'] },
  { uid: 'lan2', category: C('divers'), question: 'Langue officielle du Bresil ?', answer: 'Portugais', choices: ['Espagnol', 'Portugais', 'Anglais', 'Francais'] },
  { uid: 'lan3', category: C('divers'), question: 'Alphabet russe ?', answer: 'Cyrillique', choices: ['Latin', 'Cyrillique', 'Grec', 'Arabe'] },
  { uid: 'lan4', category: C('divers'), question: 'Combien de lettres l\'alphabet latin ?', answer: '26', choices: ['24', '26', '28', '30'] },
  { uid: 'lan5', category: C('divers'), question: 'Langue morte de l\'Empire romain ?', answer: 'Latin', choices: ['Grec', 'Latin', 'Etrusque', 'Osque'] },
  { uid: 'lan6', category: C('divers'), question: 'Pays de la langue neerlandaise ?', answer: 'Pays-Bas', choices: ['Belgique', 'Pays-Bas', 'Allemagne', 'Suede'] },

  // ================= ECO TECH =================
  { uid: 'eco1', category: C('divers'), question: 'Monnaie europeenne ?', answer: 'Euro', choices: ['Euro', 'Dollar', 'Livre', 'Franc'] },
  { uid: 'eco2', category: C('divers'), question: 'Siege de l\'ONU ?', answer: 'New York', choices: ['Geneve', 'New York', 'Paris', 'Bruxelles'] },
  { uid: 'eco3', category: C('divers'), question: 'CEO de Tesla ?', answer: 'Elon Musk', choices: ['Bezos', 'Elon Musk', 'Zuckerberg', 'Pichai'] },
  { uid: 'eco4', category: C('divers'), question: 'Siege de Google ?', answer: 'Mountain View', choices: ['Seattle', 'Mountain View', 'Cupertino', 'Austin'] },
  { uid: 'eco5', category: C('divers'), question: 'Auteur du Capital ?', answer: 'Marx', choices: ['Smith', 'Marx', 'Keynes', 'Ricardo'] },
  { uid: 'eco6', category: C('divers'), question: 'Langage de programmation cree par Guido van Rossum ?', answer: 'Python', choices: ['Ruby', 'Python', 'PHP', 'Perl'] },

  // ================= FOND BASIQUE =================
  { uid: 'bas1', category: C('divers'), question: 'Monnaie du Japon ?', answer: 'Yen', choices: ['Yuan', 'Won', 'Yen', 'Baht'] },
  { uid: 'bas2', category: C('divers'), question: 'Couleur · bleu + jaune ?', answer: 'Vert', choices: ['Vert', 'Violet', 'Orange', 'Marron'] },
  { uid: 'bas3', category: C('divers'), question: 'Cotes d\'un hexagone ?', answer: '6', choices: ['5', '6', '7', '8'] },
  { uid: 'bas4', category: C('divers'), question: 'Joueurs aux echecs ?', answer: '2', choices: ['1', '2', '3', '4'] },
  { uid: 'bas5', category: C('divers'), question: 'Jours en fevrier bissextile ?', answer: '29', choices: ['28', '29', '30', '31'] },
  { uid: 'bas6', category: C('divers'), question: 'Continent avec le plus de pays ?', answer: 'Afrique', choices: ['Asie', 'Afrique', 'Europe', 'Amerique'] },
]

export async function seedIfEmpty() {
  const count = await db.flashcards.where('source').equals('generic').count()
  if (count > 0) return
  const now = Date.now()
  await db.flashcards.bulkAdd(
    SEED.map((c) => ({ ...c, source: 'generic' as const, createdAt: now }))
  )
}

/**
 * Force re-seed (on version bump) · wipes generic cards + re-inserts
 */
export async function forceReseed() {
  await db.flashcards.where('source').equals('generic').delete()
  await seedIfEmpty()
}
