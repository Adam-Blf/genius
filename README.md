# Genius - Quiz Culture Generale PWA

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![PWA](https://img.shields.io/badge/PWA-ready-blue)

## Description

Genius est une PWA gamifiee style Duolingo pour apprendre la culture generale. Avec Ralph l'elephant bleu comme mascotte, les utilisateurs progressent a travers des quiz thematiques et gagnent de l'XP.

## Demo

**Live**: https://genius-peach-two.vercel.app

## Features

- [x] PWA avec Service Worker (fonctionne offline)
- [x] Authentification Google OAuth via Supabase
- [x] Mascotte Ralph animee (6 humeurs)
- [x] Systeme de vies (5 coeurs, regeneration 30min)
- [x] XP et systeme de streak
- [x] Categories: Histoire, Sciences, Geographie, Arts, Sports, Divertissement
- [x] Questions avec explications
- [x] Leaderboard et classement
- [x] Mode Premium (Stripe ready)
- [ ] Ligues hebdomadaires
- [ ] Systeme d'amis

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Auth/DB**: Supabase
- **PWA**: VitePWA
- **Icons**: Lucide React
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
# Editer .env.local avec vos credentials Supabase

# Lancer en dev
npm run dev
```

## Configuration Supabase

1. Creer un projet sur [supabase.com](https://supabase.com)
2. Executer le schema SQL dans `supabase/schema.sql`
3. Activer Google Auth dans Authentication > Providers
4. Configurer les credentials dans `.env.local`

## Structure du Projet

```
src/
  components/
    ui/          # Composants UI reutilisables
    layout/      # TopBar, BottomNav
    ralph/       # Mascotte animee
    lesson/      # Composants de quiz
  contexts/      # AuthContext, GameContext
  pages/         # Pages de l'app
  services/      # Supabase, heartService
  types/         # Types TypeScript
  hooks/         # Custom hooks
```

## Changelog

### 2025-01-22
- Deploiement Vercel initial
- Integration Supabase (schema complet)
- PWA fonctionnelle avec offline support
- Mascotte Ralph avec 6 animations
- Systeme de quiz complet avec XP

## Auteur

Adam Beloucif
