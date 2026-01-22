# Genius - Plateforme d'Apprentissage Gamifiee

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![PWA](https://img.shields.io/badge/PWA-ready-blue)
![Version](https://img.shields.io/badge/version-2.1.0-green)

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

### Nouveautes v2.1 - Gamification
- [x] **Persistance localStorage** - Toutes les flashcards sont sauvegardees localement
- [x] **Systeme de gamification complet** - XP, niveaux, badges, streaks
- [x] **13 badges a debloquer** - Common, Rare, Epic, Legendary
- [x] **Objectifs quotidiens** - Cartes, XP, temps d'etude
- [x] **Dashboard de progression** - Stats, graphique XP hebdo, historique
- [x] **Micro-animations CSS** - Shine, pulse, float, shake effects
- [x] **Popup XP** - Feedback visuel apres chaque session

### Coming Soon
- [ ] Ligues hebdomadaires
- [ ] Systeme d'amis
- [ ] Mode hors-ligne pour flashcards
- [ ] Export PDF des flashcards
- [ ] Synchronisation Supabase

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 7
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Auth/DB**: Supabase
- **PWA**: VitePWA
- **Icons**: Lucide React
- **AI**: OpenAI API (optionnel)
- **Facts API**: API Ninjas
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
VITE_OPENAI_API_KEY=your_openai_key (optionnel)
```

## Structure du Projet

```
src/
  components/
    ui/          # Composants UI reutilisables (Button, Card, Badge...)
    layout/      # TopBar, BottomNav
    ralph/       # Mascotte animee avec ralph.png
    lesson/      # Composants de quiz
  contexts/      # AuthContext, GameContext
  pages/
    Home.tsx         # Accueil avec acces rapide
    FunFacts.tsx     # Swipe de fun facts
    NotesInput.tsx   # Saisie de notes + generation IA
    FlashcardsPlayer.tsx  # Lecture des flashcards
    Profile.tsx      # Profil utilisateur
    Learn.tsx        # Categories de quiz
    Lesson.tsx       # Session de quiz
  routes/        # React Router configuration
  services/      # Supabase, heartService
  types/         # Types TypeScript
  hooks/         # Custom hooks
  data/          # Donnees locales (facts.ts)
```

## Ecrans Principaux

| Ecran | Route | Description |
|-------|-------|-------------|
| Home | `/` | Dashboard avec XP, streak, acces rapide |
| Fun Facts | `/funfacts` | Swipe de faits avec sauvegarde |
| Notes | `/notes` | Saisie de cours pour flashcards IA |
| Flashcards | `/flashcards` | Player de revision |
| Profile | `/profile` | Stats, settings, deconnexion |

## API Integration

### Fun Facts (API Ninjas)
- Endpoint: `https://api.api-ninjas.com/v1/facts`
- Rate limit: 10,000 requests/mois (gratuit)
- Fallback: facts locaux si API indisponible

### OpenAI (Optionnel)
- Model: GPT-3.5 Turbo
- Usage: Generation de flashcards depuis notes
- Fallback: generation locale basique

## Changelog

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

## Auteur

Adam Beloucif
