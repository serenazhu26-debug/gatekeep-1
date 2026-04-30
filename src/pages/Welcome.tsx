import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react'
import Logo from '../components/Logo'
import { getCurrentUser } from '@/lib/auth'

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

const BRANDS = ['ZARA', 'H&M', 'UNIQLO', 'ARITZIA', 'NIKE', 'ADIDAS', 'PRADA', 'GUCCI']

const OUTFITS = [
  {
    name: 'TECH NETWORKING EVENT',
    items: ['👕', '👖', '👟', '⌚'],
    sub: 'Clean, professional, approachable.'
  },
  {
    name: 'ROOFTOP BIRTHDAY DINNER',
    items: ['👗', '👠', '🍸', '💍'],
    sub: 'Elegant, elevated, festive.'
  },
  {
    name: 'SUNDAY MUSEUM DATE',
    items: ['🧥', '🎨', '🧣', '👟'],
    sub: 'Artsy, comfortable, curated.'
  },
  {
    name: 'CREATIVE JOB INTERVIEW',
    items: ['👔', '👞', '💼', '👓'],
    sub: 'Sharp, individualistic, ready.'
  }
]

function VerticalOutfitAnimator() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % OUTFITS.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ 
      marginTop: 40,
      height: 480, 
      background: 'white', 
      border: '1px solid black', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      position: 'relative', 
      overflow: 'hidden', 
      boxShadow: '8px 8px 0px rgba(0,0,0,1)' 
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={OUTFITS[index].name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '0 20px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {OUTFITS[index].items.map((emoji, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                style={{ fontSize: 42, filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.1))', textAlign: 'center' }}
              >
                {emoji}
              </motion.div>
            ))}
          </div>
          <div style={{ textAlign: 'center', borderTop: '1px solid black', paddingTop: 16, width: '100%' }}>
            <p style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#666', margin: 0 }}>GOAL:</p>
            <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Playfair Display', serif", margin: '4px 0', lineHeight: 1.2 }}>{OUTFITS[index].name}</h3>
            <p style={{ fontSize: 12, fontFamily: "'Lora', serif", margin: 0, fontStyle: 'italic' }}>{OUTFITS[index].sub}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        <Sparkles size={16} />
      </div>
    </div>
  )
}

export default function Welcome() {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const { scrollYProgress } = useScroll()
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95])
  const workflowOpacity = useTransform(scrollYProgress, [0.1, 0.25], [0, 1])

  return (
    <main style={{ width: '100%', minHeight: '350vh', background: '#F5F5DC', position: 'relative' }}>
      
      {/* Fixed Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '24px', background: 'rgba(245, 245, 220, 0.8)', backdropFilter: 'blur(8px)', borderBottom: '1px solid black' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo />
          <button onClick={() => navigate(currentUser ? '/account' : '/auth')}
            style={{ padding: '10px 18px', border: '1px solid black', background: 'white', color: 'black', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
            {currentUser ? 'ACCOUNT' : 'SIGN IN'}
          </button>
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
          zIndex: 1
        }}
      >
        <div style={{ maxWidth: 1200, width: '100%', textAlign: 'center', marginTop: 100 }}>
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

      <div style={{ height: '100vh' }} />

      {/* Main Content Area */}
      <div style={{ position: 'relative', zIndex: 2, background: 'transparent' }}>
        
        {/* Workflow Section */}
        <motion.section 
          style={{ 
            minHeight: '100vh',
            padding: '160px 24px 100px',
            opacity: workflowOpacity,
            maxWidth: 1200,
            margin: '0 auto',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
            
            {/* Left Side: Sticky Title + Vertical Animator */}
            <div style={{ position: 'sticky', top: 160 }}>
              <h2 style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'black', fontFamily: "'Playfair Display', serif" }}>
                The <br/><span style={{ fontStyle: 'italic' }}>Workflow.</span>
              </h2>
              <VerticalOutfitAnimator />
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
            </div>
          </div>
        </motion.section>

        {/* Sponsored Brands Section */}
        <section style={{ background: 'black', padding: '80px 0', borderTop: '1px solid black', borderBottom: '1px solid black', marginBottom: 100 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
            <p style={{ color: 'white', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', fontFamily: "'JetBrains Mono', monospace", marginBottom: 40, textAlign: 'center' }}>SPONSORED_BY_PARTNER_BRANDS</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 40 }}>
              {BRANDS.map(brand => (
                <span key={brand} style={{ color: 'white', fontSize: 32, fontWeight: 900, fontFamily: "'Playfair Display', serif", opacity: 0.5 }}>{brand}</span>
              ))}
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1200, margin: '0 auto 160px', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ padding: '80px 40px', border: '1px solid black', background: 'white', boxShadow: '12px 12px 0px rgba(0,0,0,1)' }}>
             <h2 style={{ fontSize: 48, fontWeight: 700, fontFamily: "'Playfair Display', serif", marginBottom: 32 }}>Ready to Gatekeep?</h2>
             <button onClick={() => navigate('/style-input')}
              style={{ padding: '24px 80px', borderRadius: 0, fontWeight: 600, fontSize: 20, color: 'white', background: 'black', border: '1px solid black', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: "'JetBrains Mono', monospace", margin: '0 auto' }}>
              START YOUR SEARCH <ArrowRight size={24} />
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid black', padding: '80px 24px 40px', background: 'white' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 60, marginBottom: 80 }}>
              
              {/* Brand Col */}
              <div>
                <Logo />
                <p style={{ marginTop: 24, fontSize: 18, color: 'black', lineHeight: 1.6, fontFamily: "'Lora', serif", maxWidth: 300 }}>
                  The local inventory search engine for your immediate style needs. Curated outfits from stores around you.
                </p>
                <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
                  {['INSTAGRAM', 'X / TWITTER', 'TIKTOK'].map(social => (
                    <a key={social} href="#" style={{ fontSize: 10, fontWeight: 700, color: 'black', textDecoration: 'none', borderBottom: '1px solid black', paddingBottom: 2, fontFamily: "'JetBrains Mono', monospace" }}>{social}</a>
                  ))}
                </div>
              </div>

              {/* Links Col 1 */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, color: 'black', letterSpacing: '0.1em', marginBottom: 24, fontFamily: "'JetBrains Mono', monospace" }}>PRODUCT</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Find Looks', 'Nearby Stores', 'Style Guide', 'API Access'].map(link => (
                    <a key={link} href="#" style={{ fontSize: 15, color: 'black', textDecoration: 'none', fontFamily: "'Lora', serif" }}>{link}</a>
                  ))}
                </div>
              </div>

              {/* Links Col 2 */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, color: 'black', letterSpacing: '0.1em', marginBottom: 24, fontFamily: "'JetBrains Mono', monospace" }}>COMPANY</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Our Mission', 'Careers', 'Partner Brands', 'Press Kit'].map(link => (
                    <a key={link} href="#" style={{ fontSize: 15, color: 'black', textDecoration: 'none', fontFamily: "'Lora', serif" }}>{link}</a>
                  ))}
                </div>
              </div>

              {/* Contact Col */}
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, color: 'black', letterSpacing: '0.1em', marginBottom: 24, fontFamily: "'JetBrains Mono', monospace" }}>CONTACT</p>
                <p style={{ fontSize: 15, color: 'black', fontFamily: "'Lora', serif", marginBottom: 8 }}>hello@gatekeep.app</p>
                <p style={{ fontSize: 15, color: 'black', fontFamily: "'Lora', serif" }}>Sydney, Australia</p>
                <div style={{ marginTop: 24, padding: 12, border: '1px solid black', background: '#F5F5DC', fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                  // SYSTEM_STATUS: ONLINE
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #EEE', paddingTop: 40 }}>
              <p style={{ fontSize: 12, color: '#666', fontFamily: "'JetBrains Mono', monospace" }}>
                © 2026 GATEKEEP TECHNOLOGIES INC. ALL RIGHTS RESERVED.
              </p>
              <div style={{ display: 'flex', gap: 24 }}>
                {['PRIVACY POLICY', 'TERMS OF SERVICE', 'COOKIES'].map(link => (
                  <a key={link} href="#" style={{ fontSize: 11, fontWeight: 700, color: '#666', textDecoration: 'none', fontFamily: "'JetBrains Mono', monospace" }}>{link}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </main>
  )
}
