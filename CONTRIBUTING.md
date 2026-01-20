# Contributing to Swipy

Merci de vouloir contribuer à Swipy ! Voici comment participer.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/Adam-Blf/Swipy.git
cd Swipy

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Tech Stack

- **React 18** + **TypeScript** - Framework & Language
- **Vite** + **SWC** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Framer Motion** - Animations
- **vite-plugin-pwa** - PWA support

## Project Structure

```
src/
├── components/
│   ├── atoms/       # Button, Icon, Input...
│   ├── molecules/   # Card, Modal, Toast...
│   └── organisms/   # SwipeDeck, TabBar...
├── pages/           # Route components
├── store/           # Zustand store
├── data/            # Questions, badges...
├── lib/             # Utils, algorithms
└── types/           # TypeScript interfaces
```

## Code Style

- **ESLint** + **Prettier** sont configurés
- Husky lance les checks au pre-commit
- Commits suivent le format: `type: description`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Pull Requests

1. Fork le repo
2. Crée une branche: `git checkout -b feat/ma-feature`
3. Commit tes changements
4. Push et ouvre une PR

## Questions?

Ouvre une issue sur GitHub !
