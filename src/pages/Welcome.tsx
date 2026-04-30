import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const steps = [
  {
    n: '01',
    title: 'Describe your occasion',
    sub: 'Tell us what you need — a dinner date, a job interview, a casual Sunday.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    n: '02',
    title: 'We find what\'s nearby',
    sub: 'We check stores around you for items that match your look and budget.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Pick it up today',
    sub: 'Get a complete outfit list with store addresses and sizes. Walk in, walk out.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
]

/* Simple SVG clothing illustrations */
function ClothingGraphic() {
  return (
    <svg width="100%" viewBox="0 0 360 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: 360 }}>
      {/* Shirt */}
      <g transform="translate(20, 10)">
        <path d="M30 10 L10 30 L20 35 L20 80 L60 80 L60 35 L70 30 L50 10 Q40 20 30 10Z"
          fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M30 10 Q35 5 40 10 Q45 5 50 10" fill="none" stroke="#93C5FD" strokeWidth="1.5"/>
      </g>
      {/* Trousers */}
      <g transform="translate(120, 10)">
        <path d="M10 10 L5 80 L25 80 L35 45 L45 80 L65 80 L60 10Z"
          fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" strokeLinejoin="round"/>
        <line x1="35" y1="10" x2="35" y2="45" stroke="#CBD5E1" strokeWidth="1"/>
      </g>
      {/* Sneaker */}
      <g transform="translate(230, 40)">
        <path d="M10 40 Q10 20 25 15 L55 15 Q70 15 75 25 L80 40 Q60 45 10 40Z"
          fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M25 15 L20 5 L35 8 L45 15" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.2"/>
        <line x1="30" y1="30" x2="65" y2="28" stroke="#BFDBFE" strokeWidth="1" strokeDasharray="4 3"/>
      </g>
      {/* Bag / accessory */}
      <g transform="translate(310, 5)">
        <rect x="5" y="20" width="38" height="32" rx="4" fill="#FEF3C7" stroke="#FCD34D" strokeWidth="1.5"/>
        <path d="M13 20 Q13 8 24 8 Q35 8 35 20" fill="none" stroke="#FCD34D" strokeWidth="1.5"/>
        <line x1="5" y1="32" x2="43" y2="32" stroke="#FCD34D" strokeWidth="1"/>
      </g>
    </svg>
  )
}

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px 40px', background: '#FAF9F6' }}>

      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 0 0', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <span style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.04em', color: '#1E293B' }}>Gatekeep</span>
        <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.05em' }}>READY IN MINUTES</span>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          
          {/* Left Side: Copy */}
          <div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h1 style={{ fontSize: 64, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.05em', color: '#1E293B' }}>
                The fastest way to find <span style={{ color: '#3B82F6' }}>your look.</span>
              </h1>
              <p style={{ marginTop: 24, fontSize: 18, color: '#64748B', lineHeight: 1.6, maxWidth: 440 }}>
                In a hurry? Tell us what you need. We find complete outfits from stores around you, ready for pickup today.
              </p>

              {/* CTA */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
                style={{ marginTop: 48 }}>
                <button onClick={() => navigate('/style-input')}
                  style={{ padding: '18px 32px', borderRadius: 16, fontWeight: 700, fontSize: 18, color: 'white', background: '#3B82F6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, letterSpacing: '-0.01em', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)' }}>
                  Get Started <ArrowRight size={20} />
                </button>
                <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 16, fontWeight: 500 }}>
                  Curated outfits · Nearby stores · Zero wait
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Side: Flowchart & Graphics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {/* Clothing graphic */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.7 }}>
              <ClothingGraphic />
            </motion.div>

            {/* Flowchart */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.6 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 0, background: 'rgba(255,255,255,0.5)', padding: 32, borderRadius: 32, border: '1px solid rgba(226, 232, 240, 0.8)', backdropFilter: 'blur(8px)' }}>
              {steps.map((step, i) => (
                <div key={step.n} style={{ display: 'flex', gap: 20 }}>
                  {/* Left: icon + connector */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === 0 ? '#3B82F6' : '#EFF6FF', border: `1.5px solid ${i === 0 ? '#3B82F6' : '#DBEAFE'}`, color: i === 0 ? 'white' : '#3B82F6', flexShrink: 0 }}>
                      {step.icon}
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 32, background: '#DBEAFE', margin: '4px 0' }} />
                    )}
                  </div>
                  {/* Right: text */}
                  <div style={{ paddingBottom: i < steps.length - 1 ? 32 : 0, paddingTop: 4 }}>
                    <p style={{ fontWeight: 700, fontSize: 16, color: '#1E293B', marginBottom: 4 }}>{step.title}</p>
                    <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5 }}>{step.sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </main>
  )
}
