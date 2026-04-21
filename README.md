# Genius · Culture Generale

![Status](https://img.shields.io/badge/status-active-brightgreen)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white)
![Vercel](https://img.shields.io/badge/deploy-Vercel-000?logo=vercel&logoColor=white)

PWA Duolingo-like pour apprendre la culture generale en swipant, avec **flashcards generiques** pre-chargees et **ajout de cartes perso** stockees localement.

## Features

- 60+ questions pre-chargees (6 categories · Histoire, Sciences, Geo, Arts, Sports, Divers)
- Ajout de ses propres flashcards (question + bonne reponse + distracteurs optionnels)
- Sessions de 10 cartes tirees aleatoirement, par categorie ou melange
- Systeme XP, series (streaks), vies (regen 1/30min)
- Badges de progression
- Stockage local IndexedDB · aucune donnee ne quitte l'appareil
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
  <sub>Par <a href="https://adam.beloucif.com">Adam Beloucif</a> · Data Engineer & Fullstack Developer · <a href="https://github.com/Adam-Blf">GitHub</a> · <a href="https://www.linkedin.com/in/adambeloucif/">LinkedIn</a></sub>
</p>
