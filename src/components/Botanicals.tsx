import { motion } from 'framer-motion'
import { useReducedMotion } from '../lib/useReducedMotion'

/** A single editorial botanical leaf drawn as SVG. */
function Leaf({ className = '', color = '#AEC4D4' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 160" className={className} fill="none" aria-hidden>
      <path
        d="M50 4C20 40 8 92 50 156C92 92 80 40 50 4Z"
        fill={color}
        fillOpacity="0.22"
      />
      <path d="M50 18V150" stroke={color} strokeOpacity="0.45" strokeWidth="1.4" />
      <path d="M50 50C40 58 30 60 24 58M50 50C60 58 70 60 76 58M50 86C38 96 28 98 20 96M50 86C62 96 72 98 80 96M50 118C42 124 36 126 30 125M50 118C58 124 64 126 70 125" stroke={color} strokeOpacity="0.35" strokeWidth="1.2" />
    </svg>
  )
}

interface Float {
  top: string
  left: string
  size: number
  rotate: number
  dur: number
  color: string
  blur?: number
}

const FLOATS: Float[] = [
  { top: '12%', left: '6%', size: 90, rotate: -18, dur: 13, color: '#AEC4D4' },
  { top: '64%', left: '88%', size: 130, rotate: 24, dur: 17, color: '#790D16', blur: 1 },
  { top: '38%', left: '92%', size: 70, rotate: 60, dur: 15, color: '#E5D3AF' },
  { top: '82%', left: '10%', size: 110, rotate: -40, dur: 19, color: '#AEC4D4', blur: 2 },
  { top: '50%', left: '50%', size: 60, rotate: 10, dur: 14, color: '#790D16' },
]

/**
 * Site-wide ambient botanical layer — leaves and particles drifting
 * continuously to add depth & atmosphere. Pointer-events disabled.
 */
export default function Botanicals() {
  const reduced = useReducedMotion()
  if (reduced) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] hidden overflow-hidden md:block" aria-hidden>
      {FLOATS.map((f, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: f.top, left: f.left, width: f.size, filter: f.blur ? `blur(${f.blur}px)` : undefined }}
          animate={{ y: [0, -26, 0], x: [0, 12, 0], rotate: [f.rotate, f.rotate + 12, f.rotate] }}
          transition={{ duration: f.dur, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Leaf color={f.color} className="h-auto w-full opacity-70" />
        </motion.div>
      ))}

      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={`p-${i}`}
          className="absolute rounded-full bg-accent/40"
          style={{
            top: `${(i * 53) % 100}%`,
            left: `${(i * 37 + 8) % 100}%`,
            width: 3 + (i % 3) * 2,
            height: 3 + (i % 3) * 2,
          }}
          animate={{ y: [0, -40, 0], opacity: [0.15, 0.6, 0.15] }}
          transition={{ duration: 8 + (i % 6), repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        />
      ))}
    </div>
  )
}
