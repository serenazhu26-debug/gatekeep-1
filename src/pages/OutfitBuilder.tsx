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
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px 40px', background: 'radial-gradient(circle at top left, #FDFBEB, #F5F5DC)', fontFamily: "'Lora', serif" }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 0 0', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)', border: '1px solid #E8E8C0', cursor: 'pointer', color: '#5A5A50', backdropFilter: 'blur(10px)' }}>
            <ArrowLeft size={18} />
          </button>
          <span style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em', color: '#2D2D2A', fontFamily: "'Playfair Display', serif" }}>Gatekeep</span>
        </div>
        <div style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: '#8B8B7A', fontWeight: 500, fontStyle: 'italic' }}>
          {shortPrompt}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', marginTop: 32 }}>
        
        {/* Section heading */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', color: '#2D2D2A', fontFamily: "'Playfair Display', serif" }}>Curated for you</h2>
          <p style={{ fontSize: 18, color: '#5A5A50', marginTop: 4, opacity: 0.8 }}>Swipe to swap items. Everything here is in stock nearby.</p>
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
                <div key={cat}>
                  <p style={{ fontSize: 12, color: '#8B8B7A', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, margin: '0 0 10px 4px' }}>
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
            
            <div style={{ padding: 28, borderRadius: 24, background: 'rgba(255,255,255,0.4)', border: '1px solid #E8E8C0', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
              <button onClick={() => setShowSlider(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                  <span style={{ fontSize: 13, color: '#8B8B7A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Cost</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 42, color: over ? '#991B1B' : '#2D2D2A', letterSpacing: '-0.02em', fontFamily: "'Playfair Display', serif" }}>${total}</span>
                    <span style={{ fontSize: 15, color: '#8B8B7A', fontStyle: 'italic' }}>/ ${budget} budget</span>
                  </div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'white', border: '1px solid #E8E8C0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {showSlider ? <ChevronUp size={20} color="#5A5A50" /> : <ChevronDown size={20} color="#5A5A50" />}
                </div>
              </button>

              {/* Progress bar */}
              <div style={{ marginTop: 24, height: 10, borderRadius: 10, background: 'rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: 10, background: over ? 'linear-gradient(90deg, #F87171, #EF4444)' : 'linear-gradient(90deg, #86EFAC, #4ADE80)' }} />
              </div>

              <AnimatePresence>
                {showSlider && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: 32, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#8B8B7A', marginBottom: 12, fontWeight: 500, fontStyle: 'italic' }}>
                      <span>$50</span>
                      <span style={{ color: '#166534', fontWeight: 700 }}>${budget}</span>
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
              style={{ width: '100%', padding: '22px', borderRadius: 100, fontWeight: 600, fontSize: 18, color: 'white', background: over ? 'rgba(232, 232, 192, 0.6)' : 'linear-gradient(135deg, #86EFAC, #4ADE80)', border: 'none', cursor: over ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, transition: 'all 0.3s', boxShadow: over ? 'none' : '0 15px 35px -5px rgba(134, 239, 172, 0.4)' }}>
              <Heart size={20} fill={over ? 'none' : 'white'} />
              {over ? 'Over budget' : 'Get the List'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 14, color: '#8B8B7A', fontWeight: 500, fontStyle: 'italic' }}>
              All items are available at stores within 5 miles.
            </p>

          </div>
        </div>
      </div>
    </main>
  )
}
