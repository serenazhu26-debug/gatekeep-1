import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Logo from '../components/Logo'
import { signInUser, signUpUser } from '@/lib/auth'

export default function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const submit = () => {
    if (!email.trim()) return
    if (mode === 'signup') signUpUser(email, name)
    else signInUser(email)
    navigate('/account')
  }

  return (
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px 40px', background: '#F5F5DC', fontFamily: "'Lora', serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '28px 0 0', maxWidth: 1200, margin: '0 auto', width: '100%', borderBottom: '1px solid black', paddingBottom: 16 }}>
        <button onClick={() => navigate(-1)} style={{ width: 44, height: 44, border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', cursor: 'pointer', color: 'black' }}>
          <ArrowLeft size={18} />
        </button>
        <Logo />
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 0' }}>
        <div style={{ marginBottom: 32, borderLeft: '4px solid black', paddingLeft: 24 }}>
          <h2 style={{ fontSize: 44, fontWeight: 700, color: 'black', fontFamily: "'Playfair Display', serif" }}>{mode === 'signup' ? 'SIGN UP' : 'SIGN IN'}</h2>
          <p style={{ marginTop: 6, fontSize: 14, color: 'black', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>SAVE YOUR OUTFITS TO YOUR ACCOUNT</p>
        </div>

        <div style={{ display: 'flex', border: '1px solid black', marginBottom: 20 }}>
          {(['signin', 'signup'] as const).map(nextMode => (
            <button key={nextMode} onClick={() => setMode(nextMode)}
              style={{ flex: 1, padding: '12px', border: 'none', borderRight: nextMode === 'signin' ? '1px solid black' : 'none', background: mode === nextMode ? 'black' : 'white', color: mode === nextMode ? 'white' : 'black', cursor: 'pointer', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
              {nextMode === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        {mode === 'signup' && (
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name"
            style={{ width: '100%', padding: '18px 20px', border: '1px solid black', background: 'white', color: 'black', outline: 'none', fontSize: 16, fontFamily: "'JetBrains Mono', monospace", marginBottom: 14 }} />
        )}
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email"
          style={{ width: '100%', padding: '18px 20px', border: '1px solid black', background: 'white', color: 'black', outline: 'none', fontSize: 16, fontFamily: "'JetBrains Mono', monospace", marginBottom: 20 }} />

        <button onClick={submit} disabled={!email.trim()}
          style={{ width: '100%', padding: '20px', border: '1px solid black', background: email.trim() ? 'black' : '#CCCCCC', color: 'white', cursor: email.trim() ? 'pointer' : 'not-allowed', fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          CONTINUE <ArrowRight size={18} />
        </button>
      </div>
    </main>
  )
}
