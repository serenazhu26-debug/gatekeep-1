import { useState, type CSSProperties, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ArrowRight, MapPin, Bookmark } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'
import { outfitItems, CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/data/outfitItems'
import { getStore } from '@/lib/data/stores'
import Logo from '../components/Logo'

export default function OutfitBuilder() {
  const navigate = useNavigate()
  const { setEventPrompt, budget, setBudget, layers, swipeLayer, getTotalCost, location } = useAppStore()
  const [showSlider, setShowSlider] = useState(false)
  const [refinePrompt, setRefinePrompt] = useState('')
  const [minCost, setMinCost] = useState(50)
  const [maxCost, setMaxCost] = useState(500)
  const [minCostInput, setMinCostInput] = useState('50')
  const [maxCostInput, setMaxCostInput] = useState('500')
  const total = getTotalCost()
  const over  = total > budget
  const pct   = Math.min((total / budget) * 100, 100)
  const rangePct = ((budget - minCost) / (maxCost - minCost)) * 100

  const currentItems = CATEGORY_ORDER
    .map(cat => {
      const item = outfitItems[cat]?.[layers[cat]?.currentIndex ?? 0]
      return item ? { cat, item, store: getStore(item.storeId) } : null
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .filter(({ item }) => item.price > 0)
  const hasVisibleBelt = currentItems.some(({ cat }) => cat === 'belt')

  const handleRefineSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const refined = refinePrompt.trim()
    if (!refined) return
    setEventPrompt(refined)
    setRefinePrompt('')
  }

  const commitMinCost = () => {
    const nextMin = Number(minCostInput) || 0
    const safeMin = Math.min(nextMin, maxCost - 10)
    setMinCost(safeMin)
    setMinCostInput(String(safeMin))
    if (budget < safeMin) setBudget(safeMin)
  }

  const commitMaxCost = () => {
    const nextMax = Number(maxCostInput) || minCost + 10
    const safeMax = Math.max(nextMax, minCost + 10)
    setMaxCost(safeMax)
    setMaxCostInput(String(safeMax))
    if (budget > safeMax) setBudget(safeMax)
  }

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
        <button onClick={() => navigate('/saved-outfits')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', border: '1px solid black', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: 'white', color: 'black', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
          <Bookmark size={14} /> SAVED OUTFITS
        </button>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', marginTop: 32 }}>
        
        {/* Section heading */}
        <div style={{ marginBottom: 32, borderLeft: '4px solid black', paddingLeft: 24 }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', color: 'black', fontFamily: "'Playfair Display', serif" }}>CURATED LOOKS</h2>
          <p style={{ fontSize: 16, color: 'black', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>CURATED FOR YOUR EVENT. STOCK IN {location.toUpperCase()}.</p>
        </div>

        <form onSubmit={handleRefineSubmit} style={{ width: '100%', display: 'flex', alignItems: 'stretch', marginBottom: 32 }}>
          <input
            type="text"
            value={refinePrompt}
            onChange={e => setRefinePrompt(e.target.value)}
            placeholder="Refine your search..."
            style={{ flex: 1, minWidth: 0, padding: '18px 22px', borderRadius: 0, fontSize: 16, color: 'black', background: 'white', border: '1px solid black', borderRight: 'none', outline: 'none', fontFamily: "'JetBrains Mono', monospace" }}
          />
          <button
            type="submit"
            disabled={!refinePrompt.trim()}
            style={{ width: 64, borderRadius: 0, border: '1px solid black', background: refinePrompt.trim() ? 'black' : '#CCCCCC', color: 'white', cursor: refinePrompt.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowRight size={20} />
          </button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.9fr', gap: 48, alignItems: 'start' }}>
          {/* Left: curated outfit */}
          <section style={{ border: '1px solid black', background: '#F5F5DC', padding: 0, overflow: 'hidden', boxShadow: '8px 8px 0px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '8px 10px', borderBottom: '1px solid black', background: 'white' }}>
              <p style={{ margin: 0, fontSize: 12, color: 'black', fontWeight: 700, letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace" }}>curated_outfit</p>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'black', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {currentItems.length} pieces
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: hasVisibleBelt ? 'repeat(4, 76px)' : 'repeat(3, 76px)', gap: 0 }}>
              {currentItems.map(({ cat, item }) => {
                const slotStyle: CSSProperties = cat === 'headgear'
                  ? { gridColumn: '1 / 3', gridRow: '1' }
                  : cat === 'top'
                    ? { gridColumn: '1 / 3', gridRow: '2' }
                    : cat === 'belt'
                      ? { gridColumn: '1 / 3', gridRow: '3' }
                      : cat === 'bottom'
                        ? { gridColumn: '1', gridRow: hasVisibleBelt ? '4' : '3' }
                        : { gridColumn: '2', gridRow: hasVisibleBelt ? '4' : '3' }

                return (
                  <div key={item.id} style={{ ...slotStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px solid black', borderTop: 'none', background: '#F5F5DC', padding: '6px 8px', overflow: 'hidden' }}>
                    <div style={{ width: 44, height: 44, border: '1px solid black', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                      {item.emoji}
                    </div>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'black', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>{CATEGORY_LABELS[cat]}</p>
                  </div>
                )
              })}
            </div>
          </section>

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
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>MIN_</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={minCostInput}
                          onChange={e => setMinCostInput(e.target.value.replace(/\D/g, ''))}
                          onBlur={commitMinCost}
                          onKeyDown={e => {
                            if (e.key === 'Enter') e.currentTarget.blur()
                          }}
                          style={{ width: 54, border: '1px solid black', padding: '6px 4px', color: 'black', background: 'white', fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textAlign: 'center', outline: 'none' }}
                        />
                      </label>
                      <span style={{ fontWeight: 700 }}>CURR_{budget}</span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>MAX_</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={maxCostInput}
                          onChange={e => setMaxCostInput(e.target.value.replace(/\D/g, ''))}
                          onBlur={commitMaxCost}
                          onKeyDown={e => {
                            if (e.key === 'Enter') e.currentTarget.blur()
                          }}
                          style={{ width: 54, border: '1px solid black', padding: '6px 4px', color: 'black', background: 'white', fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textAlign: 'center', outline: 'none' }}
                        />
                      </label>
                    </div>
                    <input type="range" min={minCost} max={maxCost} step={10} value={budget}
                      onChange={e => setBudget(Number(e.target.value))}
                      style={{ '--pct': `${rangePct}%` } as CSSProperties} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => navigate('/shopping-list')}
              style={{ width: '100%', padding: '22px', borderRadius: 0, fontWeight: 700, fontSize: 18, color: 'white', background: 'black', border: '1px solid black', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, transition: 'all 0.3s', fontFamily: "'JetBrains Mono', monospace", boxShadow: '8px 8px 0px rgba(0,0,0,0.1)' }}>
              <Heart size={20} fill="white" />
              GET THE LIST
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'black', fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
              // AVAILABLE AT STORES IN {location.toUpperCase()}
            </p>

          </div>
        </div>

        <section style={{ marginTop: 40 }}>
          <div style={{ marginBottom: 16, borderLeft: '4px solid black', paddingLeft: 18 }}>
            <h3 style={{ margin: 0, fontSize: 28, color: 'black', fontFamily: "'Playfair Display', serif" }}>ITEM SOURCES</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'black', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
              CLOTHING DETAILS // STORES NEAR {location.toUpperCase()}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {currentItems.map(({ cat, item, store }) => (
              <article key={item.id} style={{ display: 'flex', gap: 14, alignItems: 'center', border: '1px solid black', background: 'white', padding: 16 }}>
                <button
                  type="button"
                  onClick={() => swipeLayer(cat, 'left')}
                  style={{ width: 34, height: 52, border: '1px solid black', background: '#F5F5DC', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                  aria-label={`Previous ${CATEGORY_LABELS[cat]}`}
                >
                  <ChevronLeft size={18} />
                </button>
                <div style={{ width: 52, height: 52, border: '1px solid black', background: '#F5F5DC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                  {item.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'black', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>{CATEGORY_LABELS[cat]}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 700, color: 'black', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Playfair Display', serif" }}>{item.name}</p>
                  <p style={{ margin: '5px 0 0', fontSize: 12, color: 'black', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{item.brand} // SKU:{item.sku}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, minWidth: 0 }}>
                    <MapPin size={13} color="black" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'black', fontFamily: "'JetBrains Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {store ? `${store.name} / ${store.address}` : 'SOURCE PENDING'}
                    </span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'black', fontFamily: "'JetBrains Mono', monospace" }}>${item.price}</p>
                <button
                  type="button"
                  onClick={() => swipeLayer(cat, 'right')}
                  style={{ width: 34, height: 52, border: '1px solid black', background: '#F5F5DC', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                  aria-label={`Next ${CATEGORY_LABELS[cat]}`}
                >
                  <ChevronRight size={18} />
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
