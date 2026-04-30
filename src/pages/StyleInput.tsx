import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Sparkles, X, MapPin, DollarSign } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'

const Logo = () => (
  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Playfair Display', serif", letterSpacing: '0.05em' }}>
    VIBECHECK
  </div>
)

const SUGGESTIONS = [
  'Job interview at a tech startup',
  'Rooftop birthday dinner',
  'First date, casual drinks',
  'Friend\'s wedding, cocktail attire',
  'Museum day, artsy casual',
  'Monday morning office meeting',
]

type Phase = 'input' | 'finding'

export default function StyleInput() {
  const navigate = useNavigate()
  const { setEventPrompt, setBudget, setLocation, budget: storeBudget, location: storeLocation } = useAppStore()
  const [prompt, setPrompt] = useState('')
  const [localBudget, setLocalBudget] = useState(storeBudget.toString())
  const [localLocation, setLocalLocation] = useState(storeLocation)
  const [phase, setPhase] = useState<Phase>('input')
  const [findingStep, setFindingStep] = useState(0)

  const canProceed = prompt.trim().length > 3 && localLocation.trim().length > 1

  const steps = [
    'Analyzing your event…',
    `Scanning inventory in ${localLocation}…`,
    'Matching styles to occasion…',
    'Curating your final look…',
  ]

  const handleSubmit = () => {
    if (!canProceed) return
    setEventPrompt(prompt)
    setBudget(Number(localBudget) || 200)
    setLocation(localLocation)
    setPhase('finding')
    setFindingStep(0)
    let s = 0
    const iv = setInterval(() => {
      s++
      if (s >= steps.length) {
        clearInterval(iv)
        setTimeout(() => navigate('/outfit-builder'), 400)
      } else {
        setFindingStep(s)
      }
    }, 900)
  }

  return (
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px 40px', background: '#F5F5DC', fontFamily: "'Lora', serif" }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '28px 0 0', maxWidth: 1200, margin: '0 auto', width: '100%', borderBottom: '1px solid black', paddingBottom: 16 }}>
        <button onClick={() => navigate(-1)}
          style={{ width: 44, height: 44, border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', cursor: 'pointer', color: 'black' }}>
          <ArrowLeft size={18} />
        </button>
        <Logo />
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 0' }}>
        <AnimatePresence mode="wait">
          {phase === 'input' && (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              style={{ display: 'flex', flexDirection: 'column' }}>

              <h2 style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.02em', color: 'black', lineHeight: 1.2, fontFamily: "'Playfair Display', serif", borderLeft: '4px solid black', paddingLeft: 24 }}>
                WHAT IS THE <span style={{ fontStyle: 'italic' }}>OCCASION?</span>
              </h2>
              <p style={{ marginTop: 12, fontSize: 18, color: 'black', lineHeight: 1.6, maxWidth: 500 }}>
                // DESCRIBE THE EVENT IN DETAIL.
              </p>

              {/* Main prompt textarea */}
              <div style={{ marginTop: 40, position: 'relative' }}>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. Job interview at a creative agency..."
                  rows={4}
                  style={{ width: '100%', padding: '28px', borderRadius: 0, fontSize: 18, color: 'black', background: 'white', border: '1px solid black', outline: 'none', resize: 'none', lineHeight: 1.6, boxSizing: 'border-box', fontFamily: 'inherit', transition: 'all 0.3s' }}
                />
                {prompt && (
                  <button onClick={() => setPrompt('')}
                    style={{ position: 'absolute', top: 24, right: 24, width: 32, height: 32, border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', cursor: 'pointer', color: 'black' }}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Budget and Location inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'black' }}>
                    <DollarSign size={20} />
                  </div>
                  <input
                    type="number"
                    value={localBudget}
                    onChange={e => setLocalBudget(e.target.value)}
                    placeholder="BUDGET"
                    style={{ width: '100%', padding: '18px 20px 18px 52px', borderRadius: 0, fontSize: 16, color: 'black', background: 'white', border: '1px solid black', outline: 'none', fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'black' }}>
                    <MapPin size={20} />
                  </div>
                  <input
                    type="text"
                    value={localLocation}
                    onChange={e => setLocalLocation(e.target.value)}
                    placeholder="LOCATION"
                    style={{ width: '100%', padding: '18px 20px 18px 52px', borderRadius: 0, fontSize: 16, color: 'black', background: 'white', border: '1px solid black', outline: 'none', fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>
              </div>

              {/* Suggestions */}
              {!prompt && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  style={{ marginTop: 24 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {SUGGESTIONS.map(s => (
                      <button key={s} onClick={() => setPrompt(s)}
                        style={{ padding: '10px 20px', border: '1px solid black', fontSize: 13, color: 'black', background: 'transparent', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
                        [{s}]
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Submit */}
              <div style={{ marginTop: 40 }}>
                <button onClick={handleSubmit} disabled={!canProceed}
                  style={{ padding: '20px 40px', borderRadius: 0, fontWeight: 700, fontSize: 18, color: 'white', background: canProceed ? 'black' : '#CCCCCC', border: '1px solid black', cursor: canProceed ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, transition: 'all 0.3s', fontFamily: "'JetBrains Mono', monospace", boxShadow: canProceed ? '8px 8px 0px rgba(0,0,0,0.01)' : 'none' }}>
                  FIND OUTFITS <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'finding' && (
            <motion.div key="finding" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 48 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                style={{ width: 100, height: 100, border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
                <Sparkles size={40} color="black" />
              </motion.div>
              <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {steps.map((s, i) => (
                  <motion.div key={s}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: i <= findingStep ? 1 : 0.2, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 24, height: 24, border: '1px solid black', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i < findingStep ? 'black' : 'white' }}>
                      {i < findingStep ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <div style={{ width: 6, height: 6, background: i === findingStep ? 'black' : '#CCCCCC' }} />
                      )}
                    </div>
                    <span style={{ fontSize: 14, color: 'black', fontWeight: i === findingStep ? 700 : 400, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
                      {i === findingStep ? '> ' : ''}{s}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
} 