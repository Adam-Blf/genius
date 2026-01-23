/**
 * Centralized API Service for Genius App
 * All free, no-auth APIs for educational content
 */

// ============================================
// TYPES
// ============================================

export interface FunFact {
  id: string
  fact: string
  category?: string
  source?: string
}

export interface Quote {
  id: string
  content: string
  author: string
  tags?: string[]
}

export interface TriviaQuestion {
  id: string
  question: string
  correctAnswer: string
  incorrectAnswers: string[]
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'multiple' | 'boolean'
}

export interface WordDefinition {
  word: string
  phonetic?: string
  meanings: {
    partOfSpeech: string
    definitions: {
      definition: string
      example?: string
      synonyms?: string[]
    }[]
  }[]
}

export interface NumberFact {
  number: number
  text: string
  type: 'trivia' | 'math' | 'date' | 'year'
}

// ============================================
// FALLBACK DATA
// ============================================

const fallbackFacts: FunFact[] = [
  { id: 'fb1', fact: 'Le miel ne perime jamais. Des pots de miel vieux de 3000 ans ont ete trouves dans des tombes egyptiennes et etaient toujours comestibles.', category: 'science', source: 'local' },
  { id: 'fb2', fact: 'Les dauphins dorment avec un oeil ouvert pour rester vigilants face aux predateurs.', category: 'nature', source: 'local' },
  { id: 'fb3', fact: 'La Tour Eiffel peut grandir de 15 cm en ete a cause de la dilatation thermique du metal.', category: 'science', source: 'local' },
  { id: 'fb4', fact: 'Les pieuvres ont trois coeurs et du sang bleu.', category: 'nature', source: 'local' },
  { id: 'fb5', fact: 'Venus est la seule planete du systeme solaire qui tourne dans le sens inverse des autres.', category: 'science', source: 'local' },
  { id: 'fb6', fact: 'Les pandas geants passent environ 12 heures par jour a manger du bambou.', category: 'nature', source: 'local' },
  { id: 'fb7', fact: 'Le cerveau humain utilise 20% de l\'oxygene que nous respirons.', category: 'science', source: 'local' },
  { id: 'fb8', fact: 'Les empreintes digitales des koalas sont presque identiques a celles des humains.', category: 'nature', source: 'local' },
  { id: 'fb9', fact: 'La Grande Muraille de Chine n\'est pas visible depuis l\'espace a l\'oeil nu.', category: 'history', source: 'local' },
  { id: 'fb10', fact: 'Les abeilles peuvent reconnaitre les visages humains.', category: 'nature', source: 'local' },
  { id: 'fb11', fact: 'Le coeur d\'une baleine bleue est si gros qu\'un enfant pourrait ramper dans ses arteres.', category: 'nature', source: 'local' },
  { id: 'fb12', fact: 'Cleopatre a vecu plus proche de l\'invention de l\'iPhone que de la construction des pyramides.', category: 'history', source: 'local' },
  { id: 'fb13', fact: 'Un eclair contient assez d\'energie pour griller 100,000 tranches de pain.', category: 'science', source: 'local' },
  { id: 'fb14', fact: 'Les chats ne peuvent pas gouter le sucre.', category: 'nature', source: 'local' },
  { id: 'fb15', fact: 'Il pleut des diamants sur Jupiter et Saturne.', category: 'science', source: 'local' },
]

const fallbackQuotes: Quote[] = [
  { id: 'fq1', content: 'La seule facon de faire du bon travail est d\'aimer ce que vous faites.', author: 'Steve Jobs', tags: ['motivation', 'work'] },
  { id: 'fq2', content: 'L\'education est l\'arme la plus puissante que vous pouvez utiliser pour changer le monde.', author: 'Nelson Mandela', tags: ['education', 'change'] },
  { id: 'fq3', content: 'Le succes, c\'est d\'aller d\'echec en echec sans perdre son enthousiasme.', author: 'Winston Churchill', tags: ['success', 'motivation'] },
  { id: 'fq4', content: 'La vie, c\'est comme une bicyclette, il faut avancer pour ne pas perdre l\'equilibre.', author: 'Albert Einstein', tags: ['life', 'wisdom'] },
  { id: 'fq5', content: 'Celui qui n\'a pas d\'objectifs ne risque pas de les atteindre.', author: 'Sun Tzu', tags: ['goals', 'strategy'] },
  { id: 'fq6', content: 'Le plus grand risque est de ne prendre aucun risque.', author: 'Mark Zuckerberg', tags: ['risk', 'entrepreneurship'] },
  { id: 'fq7', content: 'Croyez en vos reves et ils se realiseront peut-etre. Croyez en vous et ils se realiseront surement.', author: 'Martin Luther King Jr.', tags: ['dreams', 'belief'] },
  { id: 'fq8', content: 'L\'imagination est plus importante que le savoir.', author: 'Albert Einstein', tags: ['imagination', 'knowledge'] },
  { id: 'fq9', content: 'Ne jugez pas chaque journee par votre recolte, mais par les graines que vous avez plantees.', author: 'Robert Louis Stevenson', tags: ['patience', 'growth'] },
  { id: 'fq10', content: 'Le meilleur moment pour planter un arbre etait il y a 20 ans. Le deuxieme meilleur moment est maintenant.', author: 'Proverbe Chinois', tags: ['action', 'timing'] },
]

const fallbackTrivia: TriviaQuestion[] = [
  {
    id: 'ft1',
    question: 'Quel est le plus grand ocean du monde ?',
    correctAnswer: 'Ocean Pacifique',
    incorrectAnswers: ['Ocean Atlantique', 'Ocean Indien', 'Ocean Arctique'],
    category: 'Geography',
    difficulty: 'easy',
    type: 'multiple'
  },
  {
    id: 'ft2',
    question: 'En quelle annee l\'homme a-t-il marche sur la Lune pour la premiere fois ?',
    correctAnswer: '1969',
    incorrectAnswers: ['1965', '1972', '1959'],
    category: 'History',
    difficulty: 'easy',
    type: 'multiple'
  },
  {
    id: 'ft3',
    question: 'Quel element chimique a pour symbole "O" ?',
    correctAnswer: 'Oxygene',
    incorrectAnswers: ['Or', 'Osmium', 'Oganesson'],
    category: 'Science',
    difficulty: 'easy',
    type: 'multiple'
  },
  {
    id: 'ft4',
    question: 'Combien de continents y a-t-il sur Terre ?',
    correctAnswer: '7',
    incorrectAnswers: ['5', '6', '8'],
    category: 'Geography',
    difficulty: 'easy',
    type: 'multiple'
  },
  {
    id: 'ft5',
    question: 'Qui a peint la Joconde ?',
    correctAnswer: 'Leonard de Vinci',
    incorrectAnswers: ['Michel-Ange', 'Raphael', 'Rembrandt'],
    category: 'Arts',
    difficulty: 'easy',
    type: 'multiple'
  },
  {
    id: 'ft6',
    question: 'Quelle est la capitale du Japon ?',
    correctAnswer: 'Tokyo',
    incorrectAnswers: ['Kyoto', 'Osaka', 'Hiroshima'],
    category: 'Geography',
    difficulty: 'easy',
    type: 'multiple'
  },
  {
    id: 'ft7',
    question: 'Quel est le plus grand pays du monde par superficie ?',
    correctAnswer: 'Russie',
    incorrectAnswers: ['Canada', 'Chine', 'Etats-Unis'],
    category: 'Geography',
    difficulty: 'medium',
    type: 'multiple'
  },
  {
    id: 'ft8',
    question: 'Combien d\'os compte le corps humain adulte ?',
    correctAnswer: '206',
    incorrectAnswers: ['196', '216', '186'],
    category: 'Science',
    difficulty: 'medium',
    type: 'multiple'
  },
  {
    id: 'ft9',
    question: 'En quelle annee a ete fondee l\'entreprise Apple ?',
    correctAnswer: '1976',
    incorrectAnswers: ['1974', '1978', '1980'],
    category: 'Technology',
    difficulty: 'medium',
    type: 'multiple'
  },
  {
    id: 'ft10',
    question: 'Quel est l\'animal terrestre le plus rapide ?',
    correctAnswer: 'Guepard',
    incorrectAnswers: ['Lion', 'Antilope', 'Cheval'],
    category: 'Nature',
    difficulty: 'easy',
    type: 'multiple'
  },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function decodeHTMLEntities(text: string): string {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

// ============================================
// FUN FACTS APIs
// ============================================

/**
 * Fetch random fact from Useless Facts API
 */
export async function fetchUselessFact(): Promise<FunFact> {
  try {
    const response = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
    if (!response.ok) throw new Error('API request failed')

    const data = await response.json()
    return {
      id: generateId(),
      fact: data.text,
      category: 'general',
      source: 'Useless Facts'
    }
  } catch (error) {
    console.error('Useless Facts API error:', error)
    return fallbackFacts[Math.floor(Math.random() * fallbackFacts.length)]
  }
}

/**
 * Fetch multiple random facts from API Ninja (if key available) or fallback
 */
export async function fetchApiFacts(count: number = 10): Promise<FunFact[]> {
  const apiKey = import.meta.env.VITE_API_NINJA_KEY

  if (!apiKey || apiKey === 'demo') {
    // Return shuffled fallback facts
    return shuffleArray(fallbackFacts).slice(0, count).map(f => ({
      ...f,
      id: generateId()
    }))
  }

  try {
    const response = await fetch(`https://api.api-ninjas.com/v1/facts?limit=${count}`, {
      headers: { 'X-Api-Key': apiKey }
    })

    if (!response.ok) throw new Error('API request failed')

    const data = await response.json()
    const categories = ['science', 'history', 'nature', 'geography', 'general']

    return data.map((item: { fact: string }) => ({
      id: generateId(),
      fact: item.fact,
      category: categories[Math.floor(Math.random() * categories.length)],
      source: 'API Ninjas'
    }))
  } catch (error) {
    console.error('API Ninjas error:', error)
    return shuffleArray(fallbackFacts).slice(0, count)
  }
}

/**
 * Fetch all facts from multiple sources
 */
export async function fetchMultipleFacts(count: number = 10): Promise<FunFact[]> {
  const facts: FunFact[] = []

  // Try to get facts from multiple sources in parallel
  const promises = [
    fetchUselessFact(),
    fetchUselessFact(),
    fetchApiFacts(count - 2)
  ]

  try {
    const results = await Promise.allSettled(promises)

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        if (Array.isArray(result.value)) {
          facts.push(...result.value)
        } else {
          facts.push(result.value)
        }
      }
    })

    if (facts.length === 0) {
      return shuffleArray(fallbackFacts).slice(0, count)
    }

    return shuffleArray(facts).slice(0, count)
  } catch (error) {
    console.error('Error fetching facts:', error)
    return shuffleArray(fallbackFacts).slice(0, count)
  }
}

// ============================================
// QUOTES APIs
// ============================================

/**
 * Fetch random quote from Quotable API
 */
export async function fetchQuotableQuote(): Promise<Quote> {
  try {
    const response = await fetch('https://api.quotable.io/random')
    if (!response.ok) throw new Error('Quotable API failed')

    const data = await response.json()
    return {
      id: data._id || generateId(),
      content: data.content,
      author: data.author,
      tags: data.tags
    }
  } catch (error) {
    console.error('Quotable API error:', error)
    // Try ZenQuotes as fallback
    return fetchZenQuote()
  }
}

/**
 * Fetch random quote from ZenQuotes API
 */
export async function fetchZenQuote(): Promise<Quote> {
  try {
    // ZenQuotes has CORS issues, so we use a proxy or fallback
    const response = await fetch('https://zenquotes.io/api/random')
    if (!response.ok) throw new Error('ZenQuotes API failed')

    const data = await response.json()
    if (data && data[0]) {
      return {
        id: generateId(),
        content: data[0].q,
        author: data[0].a,
        tags: []
      }
    }
    throw new Error('Invalid response')
  } catch (error) {
    console.error('ZenQuotes API error:', error)
    // Return random fallback quote
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]
  }
}

/**
 * Fetch quote - tries multiple sources
 */
export async function fetchRandomQuote(): Promise<Quote> {
  try {
    return await fetchQuotableQuote()
  } catch {
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]
  }
}

/**
 * Get all fallback quotes (for offline mode)
 */
export function getFallbackQuotes(): Quote[] {
  return shuffleArray([...fallbackQuotes])
}

// ============================================
// TRIVIA / QUIZ APIs
// ============================================

/**
 * Fetch trivia questions from Open Trivia DB
 */
export async function fetchOpenTriviaQuestions(
  amount: number = 10,
  category?: number,
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<TriviaQuestion[]> {
  try {
    let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`
    if (category) url += `&category=${category}`
    if (difficulty) url += `&difficulty=${difficulty}`

    const response = await fetch(url)
    if (!response.ok) throw new Error('Open Trivia API failed')

    const data = await response.json()

    if (data.response_code !== 0) {
      throw new Error('No trivia questions available')
    }

    return data.results.map((q: any) => ({
      id: generateId(),
      question: decodeHTMLEntities(q.question),
      correctAnswer: decodeHTMLEntities(q.correct_answer),
      incorrectAnswers: q.incorrect_answers.map((a: string) => decodeHTMLEntities(a)),
      category: q.category,
      difficulty: q.difficulty,
      type: q.type
    }))
  } catch (error) {
    console.error('Open Trivia DB error:', error)
    return fetchTheTriviaApi(amount, difficulty)
  }
}

/**
 * Fetch trivia from The Trivia API (backup)
 */
export async function fetchTheTriviaApi(
  limit: number = 10,
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<TriviaQuestion[]> {
  try {
    let url = `https://the-trivia-api.com/api/questions?limit=${limit}`
    if (difficulty) url += `&difficulty=${difficulty}`

    const response = await fetch(url)
    if (!response.ok) throw new Error('The Trivia API failed')

    const data = await response.json()

    return data.map((q: any) => ({
      id: q.id || generateId(),
      question: q.question,
      correctAnswer: q.correctAnswer,
      incorrectAnswers: q.incorrectAnswers,
      category: q.category,
      difficulty: q.difficulty,
      type: 'multiple'
    }))
  } catch (error) {
    console.error('The Trivia API error:', error)
    // Return fallback questions
    return shuffleArray(fallbackTrivia).slice(0, limit)
  }
}

/**
 * Fetch trivia questions - tries multiple sources
 */
export async function fetchTriviaQuestions(
  amount: number = 10,
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<TriviaQuestion[]> {
  try {
    const questions = await fetchOpenTriviaQuestions(amount, undefined, difficulty)
    if (questions.length > 0) return questions
  } catch {
    // Continue to backup
  }

  try {
    return await fetchTheTriviaApi(amount, difficulty)
  } catch {
    return shuffleArray(fallbackTrivia).slice(0, amount)
  }
}

/**
 * Get trivia categories from Open Trivia DB
 */
export async function fetchTriviaCategories(): Promise<{ id: number; name: string }[]> {
  try {
    const response = await fetch('https://opentdb.com/api_category.php')
    if (!response.ok) throw new Error('Failed to fetch categories')

    const data = await response.json()
    return data.trivia_categories
  } catch (error) {
    console.error('Error fetching trivia categories:', error)
    return [
      { id: 9, name: 'General Knowledge' },
      { id: 17, name: 'Science & Nature' },
      { id: 23, name: 'History' },
      { id: 22, name: 'Geography' },
      { id: 25, name: 'Art' },
      { id: 21, name: 'Sports' }
    ]
  }
}

// ============================================
// NUMBERS API
// ============================================

/**
 * Fetch random number fact from Numbers API
 */
export async function fetchNumberFact(number?: number, type: 'trivia' | 'math' | 'date' | 'year' = 'trivia'): Promise<NumberFact> {
  try {
    const num = number ?? Math.floor(Math.random() * 1000)
    const response = await fetch(`http://numbersapi.com/${num}/${type}?json`)

    if (!response.ok) throw new Error('Numbers API failed')

    const data = await response.json()
    return {
      number: data.number,
      text: data.text,
      type: type
    }
  } catch (error) {
    console.error('Numbers API error:', error)
    // Fallback
    const num = number ?? Math.floor(Math.random() * 100)
    return {
      number: num,
      text: `${num} est un nombre interessant !`,
      type: type
    }
  }
}

/**
 * Fetch random date fact
 */
export async function fetchDateFact(month?: number, day?: number): Promise<NumberFact> {
  try {
    const m = month ?? (new Date().getMonth() + 1)
    const d = day ?? new Date().getDate()
    const response = await fetch(`http://numbersapi.com/${m}/${d}/date?json`)

    if (!response.ok) throw new Error('Numbers API failed')

    const data = await response.json()
    return {
      number: data.number,
      text: data.text,
      type: 'date'
    }
  } catch (error) {
    console.error('Numbers API date error:', error)
    return {
      number: new Date().getDate(),
      text: 'Aujourd\'hui est un jour special !',
      type: 'date'
    }
  }
}

// ============================================
// DICTIONARY API
// ============================================

/**
 * Fetch word definition from Free Dictionary API
 */
export async function fetchWordDefinition(word: string): Promise<WordDefinition | null> {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)

    if (!response.ok) {
      if (response.status === 404) {
        return null // Word not found
      }
      throw new Error('Dictionary API failed')
    }

    const data = await response.json()

    if (data && data[0]) {
      return {
        word: data[0].word,
        phonetic: data[0].phonetic || data[0].phonetics?.[0]?.text,
        meanings: data[0].meanings.map((m: any) => ({
          partOfSpeech: m.partOfSpeech,
          definitions: m.definitions.slice(0, 3).map((d: any) => ({
            definition: d.definition,
            example: d.example,
            synonyms: d.synonyms?.slice(0, 5)
          }))
        }))
      }
    }

    return null
  } catch (error) {
    console.error('Dictionary API error:', error)
    return null
  }
}

/**
 * Get word of the day (random common word)
 */
export async function getWordOfTheDay(): Promise<WordDefinition | null> {
  const commonWords = [
    'serendipity', 'ephemeral', 'luminous', 'ethereal', 'resilience',
    'eloquent', 'enigma', 'paradigm', 'catalyst', 'euphoria',
    'benevolent', 'melancholy', 'pristine', 'quintessential', 'vivacious'
  ]

  // Use date to get consistent word for the day
  const dayIndex = new Date().getDate() % commonWords.length
  const word = commonWords[dayIndex]

  return fetchWordDefinition(word)
}

// ============================================
// IMAGE APIs
// ============================================

/**
 * Get random image URL from Lorem Picsum
 */
export function getRandomImageUrl(width: number = 400, height: number = 300, seed?: string): string {
  if (seed) {
    return `https://picsum.photos/seed/${seed}/${width}/${height}`
  }
  return `https://picsum.photos/${width}/${height}?random=${Date.now()}`
}

/**
 * Get themed image URL (categories: nature, city, tech, etc.)
 */
export function getThemedImageUrl(
  category: 'nature' | 'city' | 'tech' | 'food' | 'people' | 'random',
  width: number = 400,
  height: number = 300
): string {
  // Lorem Picsum doesn't support categories, but we can use seed for consistency
  const categorySeeds: Record<string, string[]> = {
    nature: ['forest', 'mountain', 'ocean', 'sunset', 'flower'],
    city: ['building', 'street', 'skyline', 'bridge', 'night'],
    tech: ['computer', 'phone', 'code', 'circuit', 'robot'],
    food: ['fruit', 'meal', 'coffee', 'cake', 'salad'],
    people: ['portrait', 'crowd', 'team', 'smile', 'work'],
    random: ['random1', 'random2', 'random3', 'random4', 'random5']
  }

  const seeds = categorySeeds[category] || categorySeeds.random
  const seed = seeds[Math.floor(Math.random() * seeds.length)]

  return getRandomImageUrl(width, height, seed)
}

// ============================================
// EXPORT COMBINED SERVICE
// ============================================

export const apiService = {
  // Facts
  fetchUselessFact,
  fetchApiFacts,
  fetchMultipleFacts,
  fallbackFacts,

  // Quotes
  fetchQuotableQuote,
  fetchZenQuote,
  fetchRandomQuote,
  getFallbackQuotes,

  // Trivia
  fetchOpenTriviaQuestions,
  fetchTheTriviaApi,
  fetchTriviaQuestions,
  fetchTriviaCategories,
  fallbackTrivia,

  // Numbers
  fetchNumberFact,
  fetchDateFact,

  // Dictionary
  fetchWordDefinition,
  getWordOfTheDay,

  // Images
  getRandomImageUrl,
  getThemedImageUrl
}

export default apiService
