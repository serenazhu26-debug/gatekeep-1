import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Link2, Sparkles, X } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'

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
  const setEventPrompt = useAppStore(s => s.setEventPrompt)
  const [prompt, setPrompt] = useState('')
  const [phase, setPhase] = useState<Phase>('input')
  const [findingStep, setFindingStep] = useState(0)

  const canProceed = prompt.trim().length > 3

  const steps = [
    'Analyzing your event…',
    'Scanning local inventory…',
    'Matching styles to occasion…',
    'Curating your final look…',
  ]

  const handleSubmit = () => {
    if (!canProceed) return
    setEventPrompt(prompt)
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
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px 40px', background: '#F0FDF4' }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '28px 0 0', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <button onClick={() => navigate(-1)}
          style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #DCFCE7', cursor: 'pointer', color: '#166534' }}>
          <ArrowLeft size={18} />
        </button>
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em', color: '#14532D' }}>Gatekeep</span>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {phase === 'input' && (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              style={{ display: 'flex', flexDirection: 'column' }}>

              <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.04em', color: '#14532D', lineHeight: 1.1 }}>
                What's the <span style={{ color: '#22C55E' }}>occasion?</span>
              </h2>
              <p style={{ marginTop: 12, fontSize: 16, color: '#166534', opacity: 0.8, lineHeight: 1.5, maxWidth: 500 }}>
                Describe the event you're dressing for. The more specific, the better. (Pinterest board links work too!)
              </p>

              {/* Main prompt textarea */}
              <div style={{ marginTop: 40, position: 'relative' }}>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. Job interview at a creative agency, or paste a Pinterest board link..."
                  rows={5}
                  style={{ width: '100%', padding: '24px', borderRadius: 24, fontSize: 18, color: '#14532D', background: 'white', border: `2px solid ${prompt ? '#22C55E' : '#DCFCE7'}`, outline: 'none', resize: 'none', lineHeight: 1.6, boxSizing: 'border-box', fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: prompt ? '0 10px 30px -10px rgba(34, 197, 94, 0.1)' : 'none' }}
                />
                {prompt && (
                  <button onClick={() => setPrompt('')}
                    style={{ position: 'absolute', top: 20, right: 20, width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0FDF4', border: 'none', cursor: 'pointer', color: '#16A34A' }}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Suggestions */}
              {!prompt && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  style={{ marginTop: 24 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {SUGGESTIONS.map(s => (
                      <button key={s} onClick={() => setPrompt(s)}
                        style={{ padding: '10px 18px', borderRadius: 14, fontSize: 14, color: '#166534', background: 'white', border: '1px solid #DCFCE7', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', fontWeight: 500 }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Submit */}
              <div style={{ marginTop: 48 }}>
                <button onClick={handleSubmit} disabled={!canProceed}
                  style={{ padding: '18px 32px', borderRadius: 20, fontWeight: 700, fontSize: 18, color: 'white', background: canProceed ? '#22C55E' : '#DCFCE7', border: 'none', cursor: canProceed ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s', letterSpacing: '-0.01em', boxShadow: canProceed ? '0 10px 25px -5px rgba(34, 197, 94, 0.3)' : 'none' }}>
                  Find Outfits <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'finding' && (
            <motion.div key="finding" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 48 }}>

              {/* Animated icon */}
              <motion.div
                animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: 100, height: 100, borderRadius: 32, background: 'white', border: '2px solid #DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px -15px rgba(22, 101, 52, 0.05)' }}>
                <Sparkles size={40} color="#22C55E" />
              </motion.div>

              {/* Steps */}
              <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {steps.map((s, i) => (
                  <motion.div key={s}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: i <= findingStep ? 1 : 0.2, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i < findingStep ? '#22C55E' : i === findingStep ? '#DCFCE7' : '#F0FDF4', border: i === findingStep ? '1.5px solid #22C55E' : 'none', transition: 'all 0.3s' }}>
                      {i < findingStep ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: i === findingStep ? '#22C55E' : '#BBF7D0' }} />
                      )}
                    </div>
                    <span style={{ fontSize: 16, color: i <= findingStep ? '#14532D' : '#166534', fontWeight: i === findingStep ? 600 : 400, transition: 'all 0.3s' }}>{s}</span>
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
