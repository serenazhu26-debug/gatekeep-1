import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'
import Logo from '../components/Logo'

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

function ClothingGraphic() {
  return (
    <svg width="100%" viewBox="0 0 360 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: 360 }}>
      <g transform="translate(20, 10)">
        <path d="M30 10 L10 30 L20 35 L20 80 L60 80 L60 35 L70 30 L50 10 Q40 20 30 10Z"
          fill="none" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
        <line x1="30" y1="10" x2="30" y2="80" stroke="black" strokeWidth="1" strokeDasharray="4 4"/>
      </g>
      <g transform="translate(120, 10)">
        <path d="M10 10 L5 80 L25 80 L35 45 L45 80 L65 80 L60 10Z"
          fill="none" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
        <line x1="35" y1="10" x2="35" y2="45" stroke="black" strokeWidth="1"/>
      </g>
      <g transform="translate(230, 40)">
        <path d="M10 40 Q10 20 25 15 L55 15 Q70 15 75 25 L80 40 Q60 45 10 40Z"
          fill="none" stroke="black" strokeWidth="1.5" strokeLinejoin="round"/>
        <line x1="10" y1="40" x2="80" y2="40" stroke="black" strokeWidth="1"/>
      </g>
      <g transform="translate(310, 5)">
        <rect x="5" y="20" width="38" height="32" stroke="black" strokeWidth="1.5" fill="none"/>
        <path d="M13 20 Q13 8 24 8 Q35 8 35 20" stroke="black" strokeWidth="1.5" fill="none"/>
      </g>
    </svg>
  )
}

export default function Welcome() {
  const navigate = useNavigate()
  const { scrollYProgress } = useScroll()
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])
  const workflowOpacity = useTransform(scrollYProgress, [0.15, 0.3], [0, 1])
  const workflowY = useTransform(scrollYProgress, [0.15, 0.3], [50, 0])

  return (
    <main style={{ width: '100%', minHeight: '200vh', background: '#F5F5DC', position: 'relative' }}>
      
      {/* Fixed Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '24px', background: 'rgba(245, 245, 220, 0.8)', backdropFilter: 'blur(8px)', borderBottom: '1px solid black' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo />
          <span style={{ fontSize: 11, color: 'black', fontWeight: 600, letterSpacing: '0.2em', fontFamily: "'JetBrains Mono', monospace" }}>001_READY</span>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          opacity: heroOpacity,
          scale: heroScale,
          padding: '0 24px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          pointerEvents: 'none'
        }}
      >
        <div style={{ maxWidth: 1200, width: '100%', pointerEvents: 'auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em', color: 'black', fontFamily: "'Playfair Display', serif", marginBottom: 32 }}>
            Find <span style={{ fontStyle: 'italic' }}>your look</span> <br/> in minutes.
          </h1>
          <p style={{ fontSize: 20, color: 'black', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 48px', fontFamily: "'Lora', serif" }}>
            The local inventory search engine for your immediate style needs. Curated outfits from stores around you.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, alignItems: 'center' }}>
            <button onClick={() => navigate('/style-input')}
              style={{ padding: '20px 60px', borderRadius: 0, fontWeight: 600, fontSize: 18, color: 'white', background: 'black', border: '1px solid black', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontFamily: "'JetBrains Mono', monospace", boxShadow: '8px 8px 0px rgba(0,0,0,0.1)' }}>
              GET STARTED <ArrowRight size={20} />
            </button>
          </div>
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ duration: 2, repeat: Infinity }}
            style={{ marginTop: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'black' }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace" }}>SCROLL TO DISCOVER</span>
            <ChevronDown size={20} />
          </motion.div>
        </div>
      </motion.section>

      {/* Workflow Section */}
      <motion.section 
        style={{ 
          minHeight: '100vh',
          padding: '160px 24px 100px',
          opacity: workflowOpacity,
          y: workflowY,
          maxWidth: 1200,
          margin: '0 auto'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
          
          {/* Left Side: Sticky Title */}
          <div style={{ position: 'sticky', top: 160 }}>
            <h2 style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'black', fontFamily: "'Playfair Display', serif" }}>
              The <br/><span style={{ fontStyle: 'italic' }}>Workflow</span>
            </h2>
            <div style={{ marginTop: 40 }}>
              <ClothingGraphic />
            </div>
          </div>

          {/* Right Side: Workflow Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {steps.map((step, i) => (
              <motion.div 
                key={step.n}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{ background: 'white', padding: 48, border: '1px solid black', boxShadow: '12px 12px 0px rgba(0,0,0,1)' }}
              >
                <div style={{ display: 'flex', gap: 24, alignItems: 'start' }}>
                  <div style={{ width: 64, height: 64, border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'black', color: 'white', flexShrink: 0 }}>
                    {step.icon}
                  </div>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#666' }}>STEP {step.n}</span>
                    <h3 style={{ fontWeight: 700, fontSize: 32, color: 'black', margin: '8px 0 16px', fontFamily: "'Playfair Display', serif" }}>{step.title}</h3>
                    <p style={{ fontSize: 18, color: 'black', lineHeight: 1.6, fontFamily: "'Lora', serif" }}>{step.sub}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <div style={{ marginTop: 40, padding: 40, border: '1px dashed black', textAlign: 'center' }}>
               <button onClick={() => navigate('/style-input')}
                style={{ padding: '20px 40px', borderRadius: 0, fontWeight: 600, fontSize: 18, color: 'black', background: 'transparent', border: '2px solid black', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: "'JetBrains Mono', monospace", margin: '0 auto' }}>
                START YOUR SEARCH <ArrowRight size={20} />
              </button>
            </div>
          </div>

        </div>
      </motion.section>
    </main>
  )
}
  
