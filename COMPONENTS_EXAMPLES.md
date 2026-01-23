# Genius Blue Edition - Exemples de Composants

Guide visuel avec exemples de code pour tous les composants clés de la palette "Blue Shift".

---

## 🔵 Boutons Primaires

### Bouton Gradient (Principal)
```jsx
<button className="btn-primary">
  Action Principale
</button>

// Manière longue
<button className="bg-gradient-genius text-white font-semibold py-3 px-6 rounded-xl
                   shadow-lg shadow-primary-600/25 hover:shadow-lg hover:-translate-y-1
                   active:scale-95 transition-all duration-200">
  Action Principale
</button>
```

**Visuellement :**
- Gradient diagonal : Deep Electric (#0052D4) → Royal Blue (#4364F7) → Sky Blue (#6FB1FC)
- Ombre : Subtile bleu `0 4px 14px rgba(0, 82, 212, 0.25)`
- Hover : +élevé avec translateY(-1px)
- Active : Scale 95%

---

## 🎨 Boutons Secondaires

### Bouton Bleu Royal
```jsx
<button className="btn-secondary">
  Action Secondaire
</button>

// Tailwind
<button className="bg-gradient-to-b from-primary-400 to-primary-300 text-white
                   font-semibold py-3 px-6 rounded-xl transition-all
                   hover:shadow-lg active:scale-95">
  Action Secondaire
</button>
```

### Bouton Ghost (Transparent)
```jsx
<button className="btn-ghost">
  Action Tertiaire
</button>

// Tailwind
<button className="bg-transparent hover:bg-white/10 border border-white/20
                   text-white font-medium py-3 px-6 rounded-xl
                   transition-all active:scale-95">
  Action Tertiaire
</button>
```

---

## 🎯 FAB Controls (Boutons Flottants)

### Ensemble Complet
```jsx
<FABControls
  onSwipeLeft={() => handleNope()}
  onSwipeRight={() => handleGenius()}
  onFlip={() => handleFlip()}
/>
```

**Résultat Visuel :**
```
┌─────────────────────────────────┐
│  ⊘ White/Coral    ⟳ Blue    ✨ White/Cyan  │
│  (NOPE)            (FLIP)      (GENIUS)    │
│  #FF5252           Gradient    #00E5FF     │
└─────────────────────────────────┘
```

### Détail des Boutons

#### NOPE (Gauche)
```jsx
<motion.button
  className="w-12 h-12 rounded-full bg-white border-2 border-genius-coral
             flex items-center justify-center"
>
  <X className="w-6 h-6 text-genius-coral" />
</motion.button>
```
- Fond blanc + border coral #FF5252
- Icône X coral
- Feedback : Scale 0.95 au tap

#### FLIP (Centre)
```jsx
<motion.button
  className="w-10 h-10 rounded-full
             bg-gradient-to-br from-genius-grad-start via-genius-grad-mid to-genius-grad-end
             flex items-center justify-center"
>
  <RotateCcw className="w-5 h-5 text-white" />
</motion.button>
```
- Gradient complet bleu (135°)
- Icône rotate blanc
- Plus petit que les autres (10px vs 12px)

#### GENIUS (Droite)
```jsx
<motion.button
  className="w-12 h-12 rounded-full bg-white border-2 border-genius-cyan
             flex items-center justify-center"
>
  <Sparkles className="w-6 h-6 text-genius-cyan" />
</motion.button>
```
- Fond blanc + border cyan #00E5FF
- Icône sparkles cyan
- Feedback : Scale 0.95 au tap

---

## 🎴 Cartes (Cards)

### Genius Card (Swipeable 3D)
```jsx
<div className="genius-card">
  <div className="stamp-genius pointer-events-none opacity-0">
    GENIUS
  </div>
  <div className="stamp-nope pointer-events-none opacity-0">
    NOPE
  </div>

  <div className="w-full h-full p-6 flex flex-col justify-center items-center">
    <span className="text-6xl mb-4">📚</span>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">Question</h2>
    <p className="text-lg text-gray-600 text-center">Contenu de la carte</p>
  </div>
</div>

// Styles CSS
.genius-card {
  border-radius: 24px;  /* rounded-card */
  box-shadow: 0 20px 40px -10px rgba(0, 82, 212, 0.15);  /* shadow-genius-card */
  aspect-ratio: 3 / 4;
  background: white;
  transform: preserve-3d;  /* 3D flip support */
}

.genius-card:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 82, 212, 0.25);  /* shadow-genius-card-hover */
}
```

**Comportements :**
- **Drag X** : Rotation jusqu'à ±25deg
- **Swipe Right** : Ombre cyan + stamp GENIUS
- **Swipe Left** : Ombre coral + stamp NOPE
- **Click** : Flip 3D verso/recto

### Glass Card (Glassmorphism)
```jsx
<div className="glass-card p-6">
  <h3 className="text-white font-semibold mb-2">Titre</h3>
  <p className="text-white/70">Contenu avec blur effect</p>
</div>

// CSS
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  -webkit-backdrop-filter: blur(12px);  /* Safari support */
}
```

---

## 🏷️ Badges & Indicators

### XP Badge (Cyan)
```jsx
<div className="badge-xp">
  <Zap className="w-4 h-4 fill-current" />
  <span>+100 XP</span>
</div>

// CSS
.badge-xp {
  background: rgba(0, 229, 255, 0.2);      /* Cyan semi-transparent */
  color: #00E5FF;                           /* Cyan text */
  border-radius: 9999px;                    /* Pill shape */
  padding: 0.25rem 0.75rem;                /* py-1 px-3 */
  font-weight: bold;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
```

**Visuellement :**
```
┌─────────────────┐
│ ⚡ +100 XP      │  ← Texte cyan sur fond cyan pâle
└─────────────────┘
```

### Streak Badge (Orange)
```jsx
<div className="badge-streak">
  <Flame className="w-4 h-4 fill-current" />
  <span>5</span>
</div>

// CSS
.badge-streak {
  background: rgba(255, 159, 64, 0.2);      /* Orange semi-transparent */
  color: #FF9F40;                           /* Orange text */
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-weight: bold;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
```

**Visuellement :**
```
┌──────────────┐
│ 🔥 5         │  ← Texte orange sur fond orange pâle
└──────────────┘
```

---

## 🎫 Stamps (Indicateurs Swipe)

### GENIUS Stamp (Cyan)
```jsx
<motion.div
  className="stamp-genius pointer-events-none z-10"
  style={{ opacity: geniusOpacity }}  /* Dynamique lors swipe right */
>
  GENIUS
</motion.div>

// CSS
.stamp-genius {
  position: absolute;
  top: 2rem;
  left: 2rem;
  color: #00E5FF;                     /* Cyan */
  border: 4px solid #00E5FF;          /* Cyan border */
  background: rgba(0, 229, 255, 0.1); /* Cyan semi-transparent */
  border-radius: 0.75rem;
  padding: 0.5rem 1rem;
  font-weight: bold;
  font-size: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transform: rotate(-20deg);          /* Tilted left */
}
```

**Visuellement :**
```
    GENIUS
    ╱ (20deg)
```

### NOPE Stamp (Coral)
```jsx
<motion.div
  className="stamp-nope pointer-events-none z-10"
  style={{ opacity: nopeOpacity }}   /* Dynamique lors swipe left */
>
  NOPE
</motion.div>

// CSS
.stamp-nope {
  position: absolute;
  top: 2rem;
  right: 2rem;
  color: #FF5252;                     /* Coral */
  border: 4px solid #FF5252;          /* Coral border */
  background: rgba(255, 82, 82, 0.1); /* Coral semi-transparent */
  border-radius: 0.75rem;
  padding: 0.5rem 1rem;
  font-weight: bold;
  font-size: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transform: rotate(20deg);           /* Tilted right */
}
```

**Visuellement :**
```
        NOPE
        ╲ (20deg)
```

---

## ✨ Gradients Text

### Gradient Bleu sur Texte
```jsx
<span className="text-gradient-blue">
  Texte dégradé bleu
</span>

// CSS
.text-gradient-blue {
  background: linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  /* Safari fallback */
  color: #4364F7;  /* Royal Blue */
}
```

**Visuellement :**
```
Texte dégradé bleu  (Du bleu foncé au bleu clair)
```

---

## 💫 Animations

### Fade In (0.2s)
```jsx
<div className="animate-fade-in">
  Apparition progressive
</div>

// CSS
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
```

### Slide Up (0.4s)
```jsx
<div className="animate-slide-up">
  Glissement vers le haut
</div>

// CSS
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.4s ease-out;
}
```

### Scale In (0.2s)
```jsx
<div className="animate-scale-in">
  Zoom in depuis 90%
</div>

// CSS
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
```

---

## 🌟 Glow Effects

### Glow Cyan (GENIUS)
```jsx
<div className="shadow-genius-glow">
  Élément avec glow cyan
</div>

// CSS
.shadow-genius-glow {
  box-shadow: 0 0 30px rgba(0, 229, 255, 0.3);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
```

**Visuellement :**
```
Élément brillant cyan pulsant
✨ (pulsation douce)
```

### Glow Coral (NOPE)
```jsx
<div className="shadow-nope-glow">
  Élément avec glow coral
</div>

// CSS
.shadow-nope-glow {
  box-shadow: 0 0 30px rgba(255, 82, 82, 0.3);
  animation: pulse-glow 2s ease-in-out infinite;
}
```

---

## 📐 Layout Responsive

### Grid Responsive
```jsx
<div className="grid
  grid-cols-1              /* 1 colonne sur mobile */
  sm:grid-cols-2           /* 2 colonnes sur tablet */
  lg:grid-cols-3           /* 3 colonnes sur desktop */
  gap-4 sm:gap-6 lg:gap-8  /* Gap adaptatif */
">
  {items.map(item => (
    <Card key={item.id} />
  ))}
</div>
```

### Container Responsive
```jsx
<div className="
  px-4 sm:px-6 md:px-8     /* Padding progressif */
  max-w-7xl mx-auto         /* Centré avec max-width */
">
  {content}
</div>
```

---

## ✅ Checklist - Utiliser Genius Blue Edition

Quand vous créez un nouveau composant :

```jsx
// ✅ À faire
<div className="bg-primary-500 text-white rounded-xl shadow-genius-card">
  Bon composant
</div>

// ❌ À éviter
<div style={{ backgroundColor: '#0052D4', color: 'white', boxShadow: '0 20px 40px rgba(0,82,212,0.15)' }}>
  Pas bon - inline styles
</div>

// ✅ Couleurs d'action
<span className="text-genius-cyan">✓</span>   {/* Positif */}
<span className="text-genius-coral">✗</span>  {/* Négatif */}

// ✅ Animations
<div className="animate-fade-in hover:shadow-genius-card-hover">
  Bon - utilise les utilitaires
</div>

// ✅ Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Bon - mobile-first
</div>
```

---

## 📚 Fichiers de Référence

- **tailwind.config.js** → Configuration complète des couleurs
- **src/index.css** → Définitions CSS des composants
- **DESIGN_SYSTEM.md** → Documentation complète
- **STYLE_GUIDE_QUICK.md** → Référence rapide

---

**Dernière mise à jour** : 23 Janvier 2026
**Palette** : Genius Blue Edition (#0052D4, #4364F7, #6FB1FC)
