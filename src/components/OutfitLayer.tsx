import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react'
import { OutfitItem } from '@/lib/types'

interface Props {
  category: string
  label: string
  item: OutfitItem
  itemIndex: number
  totalItems: number
  locked: boolean
  onSwipe: (direction: 'left' | 'right') => void
  onToggleLock: () => void
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 180 : -180, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -180 : 180, opacity: 0 }),
}

export default function OutfitLayer({ category, item, itemIndex, totalItems, locked, onSwipe, onToggleLock }: Props) {
  const [direction, setDirection] = useState(0)

  const handleSwipe = (dir: 'left' | 'right') => {
    if (locked) return
    setDirection(dir === 'right' ? 1 : -1)
    onSwipe(dir)
  }

  return (
    <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', height: 80 }}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${category}-${itemIndex}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingLeft: 14, paddingRight: 8, gap: 14, background: item.bgGradient, cursor: locked ? 'default' : 'grab' }}
          drag={locked ? false : 'x'}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            const dx = (info as any).offset?.x ?? 0
            if (dx < -40) handleSwipe('right')
            else if (dx > 40) handleSwipe('left')
          }}
        >
          {/* Emoji */}
          <span style={{ fontSize: 28, flexShrink: 0, userSelect: 'none' }}>{item.emoji}</span>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 14, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: item.textLight ? 'white' : '#1A1A1A' }}>
              {item.name}
            </p>
            <p style={{ fontSize: 12, margin: '2px 0 0', color: item.textLight ? 'rgba(255,255,255,0.6)' : '#9CA3AF' }}>
              {item.brand}
            </p>
          </div>

          {/* Price + counter */}
          <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 36 }}>
            <p style={{ fontWeight: 800, fontSize: 16, margin: 0, letterSpacing: '-0.02em', color: item.textLight ? 'white' : '#1A1A1A' }}>
              {item.price === 0 ? '—' : `$${item.price}`}
            </p>
            <p style={{ fontSize: 11, margin: '2px 0 0', color: item.textLight ? 'rgba(255,255,255,0.4)' : '#D1D5DB' }}>
              {itemIndex + 1}/{totalItems}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Left arrow */}
      {!locked && (
        <button onClick={() => handleSwipe('left')}
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', opacity: 0, transition: 'opacity 0.15s', zIndex: 10 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
          <ChevronLeft size={16} color="white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} />
        </button>
      )}

      {/* Right arrow + lock */}
      {!locked && (
        <button onClick={() => handleSwipe('right')}
          style={{ position: 'absolute', right: 32, top: 0, bottom: 0, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', opacity: 0, transition: 'opacity 0.15s', zIndex: 10 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
          <ChevronRight size={16} color="white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} />
        </button>
      )}

      {/* Lock button */}
      <button onClick={onToggleLock}
        style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: locked ? '#22C55E' : 'rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer', zIndex: 10, transition: 'background 0.2s' }}>
        {locked
          ? <Lock size={13} color="white" />
          : <Unlock size={13} color="rgba(255,255,255,0.7)" />}
      </button>
    </div>
  )
}
