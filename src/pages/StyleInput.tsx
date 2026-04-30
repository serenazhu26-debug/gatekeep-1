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
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px 40px', background: 'radial-gradient(circle at top left, #FDFBEB, #F5F5DC)', fontFamily: "'Lora', serif" }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '28px 0 0', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <button onClick={() => navigate(-1)}
          style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)', border: '1px solid #E8E8C0', cursor: 'pointer', color: '#5A5A50', backdropFilter: 'blur(10px)' }}>
          <ArrowLeft size={18} />
        </button>
        <span style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em', color: '#2D2D2A', fontFamily: "'Playfair Display', serif" }}>Gatekeep</span>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {phase === 'input' && (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              style={{ display: 'flex', flexDirection: 'column' }}>

              <h2 style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.02em', color: '#2D2D2A', lineHeight: 1.2, fontFamily: "'Playfair Display', serif" }}>
                What's the <span style={{ fontStyle: 'italic', color: '#166534', opacity: 0.7 }}>occasion?</span>
              </h2>
              <p style={{ marginTop: 12, fontSize: 18, color: '#5A5A50', lineHeight: 1.6, maxWidth: 500 }}>
                Describe the event you're dressing for. The more specific, the better. (Pinterest board links work too!)
              </p>

              {/* Main prompt textarea */}
              <div style={{ marginTop: 40, position: 'relative' }}>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. Job interview at a creative agency, or paste a Pinterest board link..."
                  rows={5}
                  style={{ width: '100%', padding: '28px', borderRadius: 24, fontSize: 18, color: '#2D2D2A', background: 'rgba(255,255,255,0.4)', border: `1px solid ${prompt ? '#86EFAC' : '#E8E8C0'}`, outline: 'none', resize: 'none', lineHeight: 1.6, boxSizing: 'border-box', fontFamily: 'inherit', transition: 'all 0.3s', backdropFilter: 'blur(10px)', boxShadow: prompt ? '0 10px 40px -10px rgba(134, 239, 172, 0.2)' : 'none' }}
                />
                {prompt && (
                  <button onClick={() => setPrompt('')}
                    style={{ position: 'absolute', top: 24, right: 24, width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #E8E8C0', cursor: 'pointer', color: '#8B8B7A', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
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
                        style={{ padding: '12px 20px', borderRadius: 100, fontSize: 14, color: '#5A5A50', background: 'rgba(255,255,255,0.6)', border: '1px solid #E8E8C0', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', fontWeight: 500, fontStyle: 'italic' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Submit */}
              <div style={{ marginTop: 48 }}>
                <button onClick={handleSubmit} disabled={!canProceed}
                  style={{ padding: '20px 40px', borderRadius: 100, fontWeight: 600, fontSize: 18, color: 'white', background: canProceed ? 'linear-gradient(135deg, #86EFAC, #4ADE80)' : 'rgba(232, 232, 192, 0.5)', border: 'none', cursor: canProceed ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, transition: 'all 0.3s', boxShadow: canProceed ? '0 15px 35px -5px rgba(134, 239, 172, 0.4)' : 'none' }}>
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
                style={{ width: 120, height: 120, borderRadius: '50%', background: 'white', border: '1px solid #DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px -15px rgba(134, 239, 172, 0.2)' }}>
                <Sparkles size={48} color="#86EFAC" />
              </motion.div>

              {/* Steps */}
              <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {steps.map((s, i) => (
                  <motion.div key={s}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: i <= findingStep ? 1 : 0.2, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i < findingStep ? 'linear-gradient(135deg, #86EFAC, #4ADE80)' : i === findingStep ? '#DCFCE7' : 'rgba(255,255,255,0.4)', border: i === findingStep ? '1px solid #86EFAC' : 'none', transition: 'all 0.4s' }}>
                      {i < findingStep ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === findingStep ? '#86EFAC' : '#E8E8C0' }} />
                      )}
                    </div>
                    <span style={{ fontSize: 17, color: i <= findingStep ? '#2D2D2A' : '#8B8B7A', fontWeight: i === findingStep ? 600 : 400, fontStyle: i === findingStep ? 'italic' : 'normal', transition: 'all 0.4s' }}>{s}</span>
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
