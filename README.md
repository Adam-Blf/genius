# Genius - Plateforme d'Apprentissage Gamifiee

![Status](https://img.shields.io/badge/status-active-green)
![PWA](https://img.shields.io/badge/PWA-ready-blue)
![Version](https://img.shields.io/badge/version-3.1.0-green)

## Description

Genius est une PWA gamifiee style Duolingo pour apprendre la culture generale et reviser ses cours. Avec Ralph comme mascotte, les utilisateurs progressent a travers des quiz thematiques, decouvrent des fun facts, et generent des flashcards a partir de leurs notes grace a l'IA.

## Demo

**Live**: https://genius-peach-two.vercel.app

## Features

### Core Features
- [x] PWA avec Service Worker (fonctionne offline)
- [x] Authentification Google OAuth via Supabase
- [x] Mascotte Ralph avec image reelle et animations soignees
- [x] Systeme de vies (5 coeurs, regeneration 30min)
- [x] XP et systeme de streak
- [x] Leaderboard et classement

### Nouveautes v3.1 - Onboarding Flow
- [x] **Onboarding Complet** - Tutoriel de premiere utilisation en 10 etapes
- [x] **Detection Premier Lancement** - Redirection automatique vers tutoriel
- [x] **Persistance Immediate** - Toutes les preferences sauvegardees en temps reel
- [x] **Presentation Features** - Introduction animee aux fonctionnalites cles
- [x] **Collecte Preferences** - Nom, niveau, categories, objectifs, temps quotidien
- [x] **Option Revoir Tutoriel** - Disponible dans Settings

### Nouveautes v3.0 - Local-First & LLM
- [x] **Stockage Local Flexible** - Notes, memos, donnees personnalisees sans schema rigide
- [x] **Multi-Provider LLM** - Support Groq, Together.ai, OpenRouter, Ollama (local)
- [x] **Generation de Questions IA** - Quiz illimites generes par LLM
- [x] **Page Settings** - Configuration complete des providers IA
- [x] **Profil Refait** - 7 onglets (Stats, Badges, Historique, Notes, Memos, Objectifs, Donnees)
- [x] **Export/Import** - Sauvegarde et restauration des donnees en JSON
- [x] **Error Boundaries** - Gestion elegante des erreurs
- [x] **Systeme de Logging** - Debug et monitoring integre

### Stockage Local (Local-First Architecture)
- [x] **Notes** - Notes completes avec tags, couleurs, epinglage
- [x] **Memos** - Notes rapides par categorie
- [x] **Donnees Personnalisees** - Stockage de tout type (texte, nombre, date, URL, liste, boolean)
- [x] **Objectifs** - Suivi de progression avec jalons
- [x] **Bookmarks** - Sauvegarde de contenu educatif

### Integration LLM
- [x] **Groq** - API ultra-rapide et gratuite
- [x] **Together.ai** - Large selection de modeles
- [x] **OpenRouter** - Acces multi-providers
- [x] **Ollama** - Modeles 100% locaux et prives
- [x] **Test de Connexion** - Verification en temps reel

### Nouveautes v2.1 - Gamification
- [x] **Persistance localStorage** - Toutes les flashcards sont sauvegardees localement
- [x] **Systeme de gamification complet** - XP, niveaux, badges, streaks
- [x] **13 badges a debloquer** - Common, Rare, Epic, Legendary
- [x] **Objectifs quotidiens** - Cartes, XP, temps d'etude
- [x] **Dashboard de progression** - Stats, graphique XP hebdo, historique
- [x] **Micro-animations CSS** - Shine, pulse, float, shake effects
- [x] **Popup XP** - Feedback visuel apres chaque session

### Nouveautes v2.0
- [x] **Fun Facts Swipe** - Decouvre +10,000 faits incroyables avec swipe Tinder-style
- [x] **Revision IA** - Colle tes cours et genere automatiquement des flashcards
- [x] **Flashcards Player** - Revise avec un systeme de memorisation espacee
- [x] **API Integration** - Connexion API Ninja pour les fun facts
- [x] **LLM Integration** - OpenAI GPT-3.5 pour la generation de flashcards
- [x] **Navigation 5 onglets** - Home, Fun Facts, Revision, Flashcards, Profil

### Quiz & Categories
- [x] Histoire, Sciences, Geographie, Arts, Sports, Divertissement
- [x] Questions avec explications detaillees
- [x] Mode Premium (Stripe ready)

### Coming Soon
- [ ] Ligues hebdomadaires
- [ ] Systeme d'amis
- [ ] Mode hors-ligne pour flashcards
- [ ] Export PDF des flashcards
- [ ] Synchronisation Supabase

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite 6
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Auth/DB**: Supabase
- **PWA**: VitePWA
- **Icons**: Lucide React
- **AI**: Multi-provider (Groq, Together, Ollama, OpenRouter)
- **Facts API**: API Ninjas, Open Trivia DB
- **Deployment**: Vercel

## Installation

```bash
# Cloner le repo
git clone https://github.com/Adam-Blf/genius.git
cd genius

# Installer les dependances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Editer .env.local avec vos credentials

# Lancer en dev
npm run dev
```

## Variables d'Environnement

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_NINJA_KEY=your_api_ninja_key (optionnel)
```

**Note**: Les cles API LLM (Groq, Together, etc.) sont configurees directement dans l'application via Settings.

## Structure du Projet

```
src/
  components/
    ui/              # Composants UI reutilisables (Button, Card, Badge...)
    layout/          # TopBar, BottomNav
    ralph/           # Mascotte animee avec ralph.png
    lesson/          # Composants de quiz
    profile/         # Sections profil (Notes, Memos, Goals, CustomData)
    ErrorBoundary.tsx
  contexts/
    AuthContext.tsx
    GameContext.tsx
    UserDataContext.tsx    # Nouveau contexte local-first
    FlashcardContext.tsx
    OnboardingContext.tsx  # Gestion etat onboarding
  pages/
    Home.tsx              # Accueil avec acces rapide
    FunFacts.tsx          # Swipe de fun facts
    NotesInput.tsx        # Saisie de notes + generation IA
    FlashcardsPlayer.tsx  # Lecture des flashcards
    Profile.tsx           # Profil refait avec 7 onglets
    Settings.tsx          # Configuration LLM
    TriviaQuiz.tsx        # Quiz avec contenu enrichi
    Learn.tsx             # Categories de quiz
    Lesson.tsx            # Session de quiz
    OnboardingFlow.tsx    # Tutoriel premier lancement (10 etapes)
  routes/                 # React Router configuration
  services/
    apis.ts               # APIs externes (Open Trivia DB)
    llmService.ts         # Service multi-provider LLM
    contentService.ts     # Agregation de contenu
    heartService.ts
  types/
    userData.ts           # Types stockage local flexible
    llm.ts               # Types LLM
  hooks/
    useUserDataStore.ts   # Hook CRUD donnees locales
    useLLM.ts            # Hook integration LLM
    useOnboarding.ts     # Hook detection premier lancement
  utils/
    logger.ts            # Systeme de logging
  data/                  # Donnees locales (facts.ts)
```

## Ecrans Principaux

| Ecran | Route | Description |
|-------|-------|-------------|
| Welcome | `/welcome` | Tutoriel onboarding premiere utilisation |
| Home | `/` | Dashboard avec XP, streak, acces rapide |
| Fun Facts | `/funfacts` | Swipe de faits avec sauvegarde |
| Notes | `/notes` | Saisie de cours pour flashcards IA |
| Flashcards | `/flashcards` | Player de revision |
| Profile | `/profile` | Stats, badges, notes, memos, objectifs |
| Settings | `/settings` | Configuration LLM et preferences |
| Trivia | `/trivia` | Quiz enrichi multi-sources |

## Configuration LLM

Accedez a Settings > Generation IA pour configurer un provider:

### Groq (Recommande - Gratuit)
1. Creer un compte sur [console.groq.com](https://console.groq.com)
2. Generer une cle API
3. Coller la cle dans Settings

### Together.ai
1. Creer un compte sur [together.ai](https://api.together.xyz)
2. Recuperer votre cle API dans Settings > API Keys

### Ollama (100% Local & Prive)
1. Installer [Ollama](https://ollama.ai)
2. Telecharger un modele: `ollama pull llama3`
3. Selectionner Ollama dans Settings (pas de cle requise)

### OpenRouter
1. Creer un compte sur [openrouter.ai](https://openrouter.ai)
2. Generer une cle API

## API Integration

### Open Trivia DB
- Questions de culture generale gratuites
- Categories multiples
- Difficultes variees

### Fun Facts (API Ninjas)
- Endpoint: `https://api.api-ninjas.com/v1/facts`
- Rate limit: 10,000 requests/mois (gratuit)
- Fallback: facts locaux si API indisponible

### LLM (Multi-Provider)
- Models: Llama 3, Mistral, Mixtral, etc.
- Usage: Generation de questions, flashcards, explications
- Fallback: contenu local si aucun provider configure

## Changelog

### 2025-01-23 - v3.1.0
- **NEW**: Onboarding Flow complet pour premiere utilisation
- **NEW**: Detection automatique du premier lancement
- **NEW**: Tutoriel en 10 etapes avec animations fluides
- **NEW**: Presentation des features (Revision, LLM, Stats)
- **NEW**: Collecte preferences utilisateur (nom, niveau, categories, objectifs)
- **NEW**: OnboardingGuard pour proteger les routes
- **NEW**: useOnboarding hook pour gestion etat
- **NEW**: Option revoir tutoriel dans Settings
- **UPDATE**: Home affiche le nom personnalise de l'utilisateur
- **UPDATE**: Persistance immediate de toutes les preferences

### 2025-01-23 - v3.0.0
- **NEW**: Architecture Local-First avec stockage flexible
- **NEW**: Systeme de notes complet (tags, couleurs, epinglage)
- **NEW**: Memos rapides avec categories
- **NEW**: Donnees personnalisees (tout type de valeur)
- **NEW**: Objectifs d'apprentissage avec jalons
- **NEW**: Integration multi-provider LLM (Groq, Together, Ollama, OpenRouter)
- **NEW**: Page Settings pour configuration IA
- **NEW**: Generation de questions et categories par IA
- **NEW**: Profil refait avec 7 onglets
- **NEW**: Export/Import des donnees en JSON
- **NEW**: Error Boundaries pour gestion elegante des erreurs
- **NEW**: Systeme de logging pour debug
- **UPDATE**: UserDataContext pour gestion centralisee
- **UPDATE**: ContentService pour agregation multi-sources

### 2025-01-22 - v2.1.0
- **NEW**: Systeme de persistance ameliore avec localStorage v2
- **NEW**: Gamification complete (XP, niveaux, badges, streaks)
- **NEW**: 13 badges deblocables avec 4 niveaux de rarete
- **NEW**: Objectifs quotidiens (cartes, XP, temps d'etude)
- **NEW**: Page Profil avec dashboard complet (stats, badges, historique)
- **NEW**: Graphique XP hebdomadaire
- **NEW**: Popup XP apres session avec animation
- **NEW**: Micro-animations CSS (shine, pulse, float, shake, fire)
- **UPDATE**: FlashcardsPlayer utilise le nouveau store
- **UPDATE**: NotesInput integre avec le systeme de gamification
- **FIX**: Migration automatique des anciennes donnees

### 2025-01-22 - v2.0.0
- **NEW**: Page Fun Facts avec swipe cards et API externe
- **NEW**: Page Revision avec generation de flashcards IA
- **NEW**: Page Flashcards Player avec memorisation
- **NEW**: Navigation 5 onglets
- **UPDATE**: Mascotte Ralph utilise maintenant l'image reelle
- **UPDATE**: Animations ameliorees sur toutes les pages
- **UPDATE**: Home redesignee avec acces aux nouvelles features

### 2025-01-22 - v1.0.0
- Deploiement Vercel initial
- Integration Supabase (schema complet)
- PWA fonctionnelle avec offline support
- Mascotte Ralph avec 6 animations
- Systeme de quiz complet avec XP

## Scripts NPM

```bash
npm run dev      # Serveur de developpement
npm run build    # Build de production
npm run preview  # Preview du build
npm run lint     # Linting ESLint
```

## Auteur

Adam Beloucif
