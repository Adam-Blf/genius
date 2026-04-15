import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Volume2, Smartphone, Palette, Info } from 'lucide-react'
import { isSoundOn, setSound, isHapticOn, setHaptic } from '../lib/feedback'

type Theme = 'dark' | 'light'

function getTheme(): Theme {
  return (localStorage.getItem('genius-theme') as Theme) || 'dark'
}
function applyTheme(t: Theme) {
  document.documentElement.classList.toggle('theme-light', t === 'light')
}

export function SettingsPage() {
  const navigate = useNavigate()
  const [sound, setSoundState] = useState(isSoundOn())
  const [haptic, setHapticState] = useState(isHapticOn())
  const [theme, setThemeState] = useState<Theme>(getTheme())

  useEffect(() => { applyTheme(theme) }, [theme])

  return (
    <div className="max-w-lg mx-auto px-5 pt-6 pb-6 safe-t">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 hover:text-white mb-6">
        <ArrowLeft className="w-5 h-5" /> <span className="text-sm">Retour</span>
      </button>

      <h1 className="font-display text-4xl mb-8">Reglages</h1>

      <section className="mb-6">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">Experience</h2>
        <div className="bg-surface border border-line rounded-2xl divide-y divide-line">
          <Row
            icon={<Volume2 className="w-4 h-4 text-elephant-300" />}
            label="Son"
            desc="Tonalites correct/erreur/niveau"
            checked={sound}
            onChange={(v) => { setSound(v); setSoundState(v) }}
          />
          <Row
            icon={<Smartphone className="w-4 h-4 text-elephant-300" />}
            label="Vibrations"
            desc="Retour haptique (mobile)"
            checked={haptic}
            onChange={(v) => { setHaptic(v); setHapticState(v) }}
          />
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">Apparence</h2>
        <div className="bg-surface border border-line rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-elephant-300" />
            <span className="text-sm font-semibold">Theme</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['dark', 'light'] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => { localStorage.setItem('genius-theme', t); setThemeState(t) }}
                className={`rounded-xl border-2 p-3 text-sm font-semibold capitalize transition ${
                  theme === t ? 'border-elephant-400 bg-elephant-500/10' : 'border-line'
                }`}
              >
                {t === 'dark' ? '🌙 Sombre' : '☀️ Clair'}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-white/40 mt-3">Le mode clair est preview · ajustements a venir.</p>
        </div>
      </section>

      <section>
        <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">A propos</h2>
        <div className="bg-surface border border-line rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-elephant-300 mt-0.5" />
          <div className="text-sm text-white/70">
            <div className="font-semibold text-white mb-1">Genius · v1</div>
            <p className="text-xs">PWA de culture generale gamifiee. Stockage 100% local. Par <a href="https://adam.beloucif.com" className="text-elephant-300 underline">Adam Beloucif</a>.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

function Row({ icon, label, desc, checked, onChange }: {
  icon: React.ReactNode; label: string; desc: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-3 p-4 cursor-pointer">
      {icon}
      <div className="flex-1">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-white/50">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        type="button"
        className={`relative w-11 h-6 rounded-full transition ${checked ? 'bg-elephant-500' : 'bg-white/15'}`}
        aria-pressed={checked}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
      </button>
    </label>
  )
}
