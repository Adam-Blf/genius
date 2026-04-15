export function Sparkline({ values, max, color = 'currentColor' }: { values: number[]; max?: number; color?: string }) {
  if (values.length === 0) return null
  const m = max ?? Math.max(1, ...values)
  const w = 200
  const h = 40
  const step = w / Math.max(1, values.length - 1)
  const points = values.map((v, i) => `${i * step},${h - (v / m) * h}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {values.map((v, i) => (
        <circle key={i} cx={i * step} cy={h - (v / m) * h} r={1.5} fill={color} />
      ))}
    </svg>
  )
}
