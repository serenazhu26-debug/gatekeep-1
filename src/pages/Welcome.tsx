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
        <defs>
          <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DCFCE7" />
            <stop offset="100%" stopColor="#F0FDF4" />
          </linearGradient>
        </defs>
        <path d="M30 10 L10 30 L20 35 L20 80 L60 80 L60 35 L70 30 L50 10 Q40 20 30 10Z"
          fill="url(#shirtGrad)" stroke="#86EFAC" strokeWidth="1.5" strokeLinejoin="round"/>
      </g>
      {/* Trousers */}
      <g transform="translate(120, 10)">
        <path d="M10 10 L5 80 L25 80 L35 45 L45 80 L65 80 L60 10Z"
          fill="rgba(255,255,255,0.6)" stroke="#E8E8C0" strokeWidth="1.5" strokeLinejoin="round"/>
      </g>
      {/* Sneaker */}
      <g transform="translate(230, 40)">
        <path d="M10 40 Q10 20 25 15 L55 15 Q70 15 75 25 L80 40 Q60 45 10 40Z"
          fill="rgba(255,255,255,0.8)" stroke="#DCFCE7" strokeWidth="1.5" strokeLinejoin="round"/>
      </g>
      {/* Bag / accessory */}
      <g transform="translate(310, 5)">
        <rect x="5" y="20" width="38" height="32" rx="4" fill="#FFFDF0" stroke="#E8E8C0" strokeWidth="1.5"/>
      </g>
    </svg>
  )
}

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px 40px', background: 'radial-gradient(circle at top left, #FDFBEB, #F5F5DC)', fontFamily: "'Playfair Display', serif" }}>

      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 0 0', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <span style={{ fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', color: '#2D2D2A' }}>Gatekeep</span>
        <span style={{ fontSize: 11, color: '#8B8B7A', fontWeight: 600, letterSpacing: '0.2em' }}>READY IN MINUTES</span>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          
          {/* Left Side: Copy */}
          <div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <h1 style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#2D2D2A' }}>
                The fastest way to find <span style={{ fontStyle: 'italic', color: '#166534', opacity: 0.7 }}>your look.</span>
              </h1>
              <p style={{ marginTop: 24, fontSize: 20, color: '#5A5A50', lineHeight: 1.7, maxWidth: 460, fontFamily: "'Lora', serif" }}>
                In a hurry? Tell us what you need. We find complete outfits from stores around you, ready for pickup today.
              </p>

              {/* CTA */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
                style={{ marginTop: 48 }}>
                <button onClick={() => navigate('/style-input')}
                  style={{ padding: '20px 40px', borderRadius: 100, fontWeight: 600, fontSize: 18, color: 'white', background: 'linear-gradient(135deg, #86EFAC, #4ADE80)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 15px 35px -5px rgba(134, 239, 172, 0.4)', fontFamily: "'Lora', serif" }}>
                  Get Started <ArrowRight size={20} />
                </button>
                <p style={{ fontSize: 13, color: '#8B8B7A', marginTop: 20, fontWeight: 500, fontStyle: 'italic' }}>
                  Curated outfits · Nearby stores · Zero wait
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Side: Flowchart & Graphics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.8 }}>
              <ClothingGraphic />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.8 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 0, background: 'rgba(255,255,255,0.4)', padding: 40, borderRadius: 24, border: '1px solid rgba(232, 232, 192, 0.5)', backdropFilter: 'blur(10px)' }}>
              {steps.map((step, i) => (
                <div key={step.n} style={{ display: 'flex', gap: 24 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === 0 ? 'linear-gradient(135deg, #86EFAC, #4ADE80)' : 'rgba(255,255,255,0.8)', border: `1px solid ${i === 0 ? '#4ADE80' : '#E8E8C0'}`, color: i === 0 ? 'white' : '#166534', flexShrink: 0 }}>
                      {step.icon}
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{ width: 1, flex: 1, minHeight: 32, background: 'linear-gradient(to bottom, #E8E8C0, transparent)', margin: '4px 0' }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < steps.length - 1 ? 32 : 0, paddingTop: 4 }}>
                    <p style={{ fontWeight: 700, fontSize: 18, color: '#2D2D2A', marginBottom: 4 }}>{step.title}</p>
                    <p style={{ fontSize: 15, color: '#5A5A50', lineHeight: 1.6, fontFamily: "'Lora', serif" }}>{step.sub}</p>
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
  
