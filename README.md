# Genius - Culture Generale

[![version](https://img.shields.io/badge/version-1.0.0-000091?style=flat-square)](https://github.com/Adam-Blf/genius/releases)

<!-- adam-badges:start -->
[![commits](https://img.shields.io/github/commit-activity/t/Adam-Blf/genius?color=001329&label=commits&style=flat-square)](https://github.com/Adam-Blf/genius/commits) [![visites](https://hits.sh/github.com/Adam-Blf/genius.svg?style=flat-square&label=visites&color=001329)](https://hits.sh/github.com/Adam-Blf/genius/) [![last commit](https://img.shields.io/github/last-commit/Adam-Blf/genius?color=D4A437&style=flat-square&label=dernier%20push)](https://github.com/Adam-Blf/genius/commits) [![top language](https://img.shields.io/github/languages/top/Adam-Blf/genius?style=flat-square)](https://github.com/Adam-Blf/genius) [![license](https://img.shields.io/github/license/Adam-Blf/genius?style=flat-square&color=D4A437)](LICENSE)
<!-- adam-badges:end -->


![Status](https://img.shields.io/badge/status-active-brightgreen)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white)
![Vercel](https://img.shields.io/badge/deploy-Vercel-000?logo=vercel&logoColor=white)

PWA Duolingo-like pour apprendre la culture generale en swipant, avec **flashcards generiques** pre-chargees et **ajout de cartes perso** stockees localement.

## Architecture

```mermaid
flowchart TB
    Main["src/main.tsx<br/>bootstrap React - React Router - vite-plugin-pwa"]
    App["src/App.tsx<br/>routes - AuthContext - bannières install/offline"]
    Pages["src/pages<br/>Home - Learn - Daily - Course - Chapter<br/>AddCard - Community - Premium - Profile - Settings - Login"]
    Lib["src/lib<br/>sm2 - daily - feedback - generated - pdf - premium - security"]
    Db["src/db.ts - Dexie<br/>IndexedDB - flashcards - progression - XP - streaks"]
    Auth["src/contexts/AuthContext.tsx<br/>session Supabase"]
    Supa["Supabase<br/>auth - cartes publiques communauté"]
    Stripe["api/checkout - verify - webhook<br/>Vercel functions - Stripe premium"]

    Main --> App
    App --> Pages
    App --> Auth
    Pages --> Lib
    Pages --> Db
    Lib --> Db
    Auth --> Supa
    Pages --> Stripe
    Stripe --> Supa
```

## Features

- 60+ questions pre-chargees (6 categories - Histoire, Sciences, Geo, Arts, Sports, Divers)
- Ajout de ses propres flashcards (question + bonne reponse + distracteurs optionnels)
- Sessions de 10 cartes tirees aleatoirement, par categorie ou melange
- Systeme XP, series (streaks), vies (regen 1/30min)
- Badges de progression
- Stockage local IndexedDB - aucune donnee ne quitte l'appareil
- PWA installable, offline-first

## Stack

Vite + React 18 + TypeScript + Tailwind 3 + Framer Motion + Dexie + React Router + vite-plugin-pwa

## Dev

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
npm run preview
```

## Deploy

Deploy auto via Vercel sur push `main`.

---

<p align="center">
  <sub>Par <a href="https://adam.beloucif.com">Adam Beloucif</a> - Data Engineer & Fullstack Developer - <a href="https://github.com/Adam-Blf">GitHub</a> - <a href="https://www.linkedin.com/in/adambeloucif/">LinkedIn</a></sub>
</p>


## Star History

<a href="https://www.star-history.com/?repos=Adam-Blf%2Fgenius&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=Adam-Blf/genius&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=Adam-Blf/genius&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=Adam-Blf/genius&type=date&legend=top-left" />
 </picture>
</a>
