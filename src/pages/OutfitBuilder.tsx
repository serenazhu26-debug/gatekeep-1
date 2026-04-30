import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'
import { outfitItems, CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/data/outfitItems'
import OutfitLayer from '../components/OutfitLayer'

export default function OutfitBuilder() {
  const navigate = useNavigate()
  const { eventPrompt, budget, setBudget, layers, swipeLayer, toggleLock, getTotalCost } = useAppStore()
  const [showSlider, setShowSlider] = useState(false)
  const total = getTotalCost()
  const over  = total > budget
  const pct   = Math.min((total / budget) * 100, 100)

  const shortPrompt = eventPrompt
    ? (eventPrompt.length > 42 ? eventPrompt.slice(0, 42) + '…' : eventPrompt)
    : 'Your outfit'

  return (
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px 40px', background: '#F0FDF4' }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 0 0', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #DCFCE7', cursor: 'pointer', color: '#166534' }}>
            <ArrowLeft size={18} />
          </button>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em', color: '#14532D' }}>Gatekeep</span>
        </div>
        <div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: '#166534', opacity: 0.6, fontWeight: 500 }}>
          {shortPrompt}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', marginTop: 32 }}>
        
        {/* Section heading */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', color: '#14532D' }}>Curated for you</h2>
          <p style={{ fontSize: 16, color: '#166534', opacity: 0.8, marginTop: 4 }}>Swipe to swap items. Everything here is in stock nearby.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, alignItems: 'start' }}>
          
          {/* Left: Outfit layers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {CATEGORY_ORDER.map(cat => {
              const items = outfitItems[cat] || []
              const layer = layers[cat]
              const item  = items[layer?.currentIndex ?? 0]
              if (!item) return null
              return (
                <div key={cat}>
                  <p style={{ fontSize: 12, color: '#166534', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, margin: '0 0 8px 4px' }}>
                    {CATEGORY_LABELS[cat]}
                  </p>
                  <OutfitLayer category={cat} label={CATEGORY_LABELS[cat]} item={item}
                    itemIndex={layer?.currentIndex ?? 0} totalItems={items.length}
                    locked={layer?.locked ?? false}
                    onSwipe={dir => swipeLayer(cat, dir)}
                    onToggleLock={() => toggleLock(cat)} />
                </div>
              )
            })}
          </div>

          {/* Right: Summary & Budget */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            <div style={{ padding: 24, borderRadius: 24, background: 'white', border: '1px solid #DCFCE7', boxShadow: '0 4px 12px rgba(22,101,52,0.02)' }}>
              <button onClick={() => setShowSlider(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                  <span style={{ fontSize: 13, color: '#166534', opacity: 0.6, fontWeight: 600 }}>Total Cost</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 36, color: over ? '#DC2626' : '#14532D', letterSpacing: '-0.04em' }}>${total}</span>
                    <span style={{ fontSize: 14, color: '#166534', opacity: 0.6 }}>/ ${budget} budget</span>
                  </div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {showSlider ? <ChevronUp size={18} color="#166534" /> : <ChevronDown size={18} color="#166534" />}
                </div>
              </button>

              {/* Progress bar */}
              <div style={{ marginTop: 20, height: 8, borderRadius: 4, background: '#F0FDF4', overflow: 'hidden' }}>
                <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }}
                  style={{ height: '100%', borderRadius: 4, background: over ? '#DC2626' : '#22C55E' }} />
              </div>

              <AnimatePresence>
                {showSlider && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: 24, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#166534', opacity: 0.6, marginBottom: 12, fontWeight: 500 }}>
                      <span>$50</span>
                      <span style={{ color: '#22C55E', fontWeight: 800 }}>${budget}</span>
                      <span>$500</span>
                    </div>
                    <input type="range" min={50} max={500} step={10} value={budget}
                      onChange={e => setBudget(Number(e.target.value))}
                      style={{ '--pct': `${((budget - 50) / 450) * 100}%` } as React.CSSProperties} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => navigate('/shopping-list')} disabled={over}
              style={{ width: '100%', padding: '20px', borderRadius: 20, fontWeight: 700, fontSize: 18, color: 'white', background: over ? '#DCFCE7' : '#22C55E', border: 'none', cursor: over ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, letterSpacing: '-0.01em', boxShadow: over ? 'none' : '0 10px 25px -5px rgba(34, 197, 94, 0.3)', transition: 'all 0.2s' }}>
              <Heart size={20} fill={over ? 'none' : 'white'} />
              {over ? 'Over budget' : 'Get the List'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#166534', opacity: 0.6, fontWeight: 500 }}>
              All items are available at stores within 5 miles.
            </p>

          </div>
        </div>
      </div>
    </main>
  )
}
