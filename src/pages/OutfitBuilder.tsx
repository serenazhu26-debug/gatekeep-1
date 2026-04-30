import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'
import { outfitItems, CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/data/outfitItems'
import OutfitLayer from '../components/OutfitLayer'
import Logo from '../components/Logo'

export default function OutfitBuilder() {
  const navigate = useNavigate()
  const { eventPrompt, budget, setBudget, layers, swipeLayer, toggleLock, getTotalCost, location } = useAppStore()
  const [showSlider, setShowSlider] = useState(false)
  const total = getTotalCost()
  const over  = total > budget
  const pct   = Math.min((total / budget) * 100, 100)

  const shortPrompt = eventPrompt
    ? (eventPrompt.length > 42 ? eventPrompt.slice(0, 42) + '…' : eventPrompt)
    : 'Your outfit'

  return (
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px 40px', background: '#F5F5DC', fontFamily: "'Lora', serif" }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 0 0', maxWidth: 1200, margin: '0 auto', width: '100%', borderBottom: '1px solid black', paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ width: 44, height: 44, border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', cursor: 'pointer', color: 'black' }}>
            <ArrowLeft size={18} />
          </button>
          <Logo />
        </div>
        <div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: 'black', fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
          // {shortPrompt}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', marginTop: 32 }}>
        
        {/* Section heading */}
        <div style={{ marginBottom: 32, borderLeft: '4px solid black', paddingLeft: 24 }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', color: 'black', fontFamily: "'Playfair Display', serif" }}>CURATED LOOKS</h2>
          <p style={{ fontSize: 16, color: 'black', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>SWIPE TO SWAP. STOCK IN {location.toUpperCase()}.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 48, alignItems: 'start' }}>
          
          {/* Left: Outfit layers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {CATEGORY_ORDER.map(cat => {
              const items = outfitItems[cat] || []
              const layer = layers[cat]
              const item  = items[layer?.currentIndex ?? 0]
              if (!item) return null
              return (
                <div key={cat} style={{ border: '1px solid black', background: 'white', padding: '4px' }}>
                  <p style={{ fontSize: 11, color: 'black', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, margin: '4px 0 8px 8px', fontFamily: "'JetBrains Mono', monospace" }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            <div style={{ padding: 28, border: '1px solid black', background: 'white', boxShadow: '8px 8px 0px rgba(0,0,0,0.1)' }}>
              <button onClick={() => setShowSlider(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                  <span style={{ fontSize: 12, color: 'black', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace" }}>TOTAL_COST</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 42, color: over ? '#CC0000' : 'black', letterSpacing: '-0.02em', fontFamily: "'Playfair Display', serif" }}>${total}</span>
                    <span style={{ fontSize: 14, color: 'black', fontFamily: "'JetBrains Mono', monospace" }}>/ ${budget}</span>
                  </div>
                </div>
                <div style={{ width: 40, height: 40, border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
                  {showSlider ? <ChevronUp size={20} color="black" /> : <ChevronDown size={20} color="black" />}
                </div>
              </button>

              {/* Progress bar */}
              <div style={{ marginTop: 24, height: 4, background: '#EEEEEE', overflow: 'hidden', border: '1px solid black' }}>
                <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ height: '100%', background: over ? '#CC0000' : 'black' }} />
              </div>

              <AnimatePresence>
                {showSlider && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: 32, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'black', marginBottom: 12, fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>
                      <span>MIN_50</span>
                      <span style={{ fontWeight: 700 }}>CURR_{budget}</span>
                      <span>MAX_500</span>
                    </div>
                    <input type="range" min={50} max={500} step={10} value={budget}
                      onChange={e => setBudget(Number(e.target.value))}
                      style={{ '--pct': `${((budget - 50) / 450) * 100}%` } as React.CSSProperties} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => navigate('/shopping-list')} disabled={over}
              style={{ width: '100%', padding: '22px', borderRadius: 0, fontWeight: 700, fontSize: 18, color: 'white', background: over ? '#999999' : 'black', border: '1px solid black', cursor: over ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, transition: 'all 0.3s', fontFamily: "'JetBrains Mono', monospace", boxShadow: over ? 'none' : '8px 8px 0px rgba(0,0,0,0.1)' }}>
              <Heart size={20} fill={over ? 'none' : 'white'} />
              {over ? 'OVER BUDGET' : 'GET THE LIST'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'black', fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
              // AVAILABLE AT STORES IN {location.toUpperCase()}
            </p>

          </div>
        </div>
      </div>
    </main>
  )
}
