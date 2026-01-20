# Swipy

![Progress](https://img.shields.io/badge/Progress-90%2F103-blue)
![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![PWA](https://img.shields.io/badge/PWA-Ready-green)

## Description

**Swipy** est une PWA de micro-learning gamifié. Apprends en swipant des cartes de culture générale, gagne de l'XP, débloques des badges et maintiens ta série quotidienne.

## Features

- Swipe intuitif (Gauche = Apprendre, Droite = Connu)
- Gamification complète (XP, Niveaux, Badges, Streaks)
- Mode Révision avec répétition espacée
- 100% Offline grâce au Service Worker
- Dark Mode par défaut
- Multilingue (EN/FR/ES)

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build**: Vite + SWC
- **Styling**: Tailwind CSS
- **State**: Zustand + Persist
- **Animations**: Framer Motion
- **PWA**: vite-plugin-pwa
- **i18n**: i18next

## Installation

```bash
# Clone
git clone https://github.com/Adam-Blf/Swipy.git
cd Swipy

# Install
npm install

# Dev
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## Roadmap

Voir [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md) pour le détail des 103 phases.

## Changelog

### 2026-01-20
- Phase 81-90: SETTINGS & POLISH complet
  - Page Settings redesignée avec sections
  - Export des données en JSON
  - Sound FX Engine avec Web Audio API
  - Error Boundary global avec retry
  - Glassmorphism et backdrop-blur
  - Confetti sur Level Up Toast
- Phase 71-80: PWA & PERF complet
  - vite-plugin-pwa avec manifest complet
  - Service Worker avec Workbox offline strategy
  - Custom Install Prompt animé
  - Lazy loading des routes avec Suspense
  - Meta tags SEO et OpenGraph
  - Touch optimization (no-zoom, no-bounce)
  - Code splitting pour vendor chunks
- Phase 61-70: LEARNING ALGO complet
  - Algorithme de répétition espacée SM-2 simplifié
  - Mode Review Only pour cartes à réviser
  - Mode Hardcore avec timer 10 secondes
  - Filtre par difficulté (Facile/Moyen/Difficile)
  - Timer component avec animation urgence
  - Explanations et funFacts sur les cartes
- Phase 51-60: GAMIFICATION complet
  - XP formulas et level thresholds
  - Streak calculator avec streak flame
  - Level Up Toast animé
  - Page Stats avec graphique radar catégories
  - Système de 20 badges avec progression
  - Persistence automatique via Zustand
- Phase 41-50: SWIPE ENGINE complet
  - Framer Motion pour animations swipe
  - SwipeCard avec flip 3D et drag gestures
  - SwipeDeck avec gestion du stack de cartes
  - Overlays colorés (vert/rouge) selon direction
  - TabBar navigation avec 3 onglets
  - Undo last swipe fonctionnel
- Phase 31-40: ONBOARDING complet
  - React Router configuration
  - Splash, Welcome, Name input screens
  - Category selector avec haptics
  - Route guards et redirections
- Phase 21-30: ATOMIC UI complet
  - Composants atomiques (Icon, Button, Badge, Progress, Avatar, Input)
  - Molécules (Card, Modal, Toast)
  - Theme toggle hook
- Phase 11-20: DATA CORE complet
  - TypeScript interfaces (Question, User)
  - Zod validation schemas
  - 100 questions trivia
  - Zustand store avec persist
  - Selectors optimisés
- Phase 01-10: FONDATIONS complètes
  - Vite + React + TypeScript + SWC
  - Tailwind CSS v4 avec Dark Theme
  - ESLint strict + Prettier + Husky
  - Structure Atomic Design

## Author

**Adam Beloucif**

## License

MIT
