import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bookmark, Plus, LogOut } from 'lucide-react'
import Logo from '../components/Logo'
import { GatekeepUser, getCurrentUser, setCurrentUser } from '@/lib/auth'

export default function AccountHome() {
  const navigate = useNavigate()
  const [user, setUser] = useState<GatekeepUser | null>(() => getCurrentUser())

  useEffect(() => {
    if (!user) navigate('/auth')
  }, [navigate, user])

  const signOut = () => {
    setCurrentUser(null)
    setUser(null)
    navigate('/')
  }

  return (
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px 40px', background: '#F5F5DC', fontFamily: "'Lora', serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 0 0', maxWidth: 1200, margin: '0 auto', width: '100%', borderBottom: '1px solid black', paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ width: 44, height: 44, border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', cursor: 'pointer', color: 'black' }}>
            <ArrowLeft size={18} />
          </button>
          <Logo />
        </div>
        <button onClick={signOut} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', border: '1px solid black', background: 'white', color: 'black', cursor: 'pointer', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
          <LogOut size={14} /> Sign out
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 0' }}>
        <div style={{ marginBottom: 32, borderLeft: '4px solid black', paddingLeft: 24 }}>
          <h2 style={{ fontSize: 44, fontWeight: 700, color: 'black', fontFamily: "'Playfair Display', serif" }}>YOUR ACCOUNT</h2>
          <p style={{ marginTop: 6, fontSize: 14, color: 'black', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>{user?.email}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <button onClick={() => navigate('/saved-outfits')} style={{ minHeight: 180, border: '1px solid black', background: 'white', color: 'black', cursor: 'pointer', padding: 28, textAlign: 'left', boxShadow: '8px 8px 0px rgba(0,0,0,0.1)' }}>
            <Bookmark size={28} />
            <h3 style={{ margin: '18px 0 8px', fontSize: 28, color: 'black', fontFamily: "'Playfair Display', serif" }}>Saved outfits</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'black', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>View looks saved to this account</p>
          </button>
          <button onClick={() => navigate('/style-input')} style={{ minHeight: 180, border: '1px solid black', background: 'white', color: 'black', cursor: 'pointer', padding: 28, textAlign: 'left', boxShadow: '8px 8px 0px rgba(0,0,0,0.1)' }}>
            <Plus size={28} />
            <h3 style={{ margin: '18px 0 8px', fontSize: 28, color: 'black', fontFamily: "'Playfair Display', serif" }}>New outfit</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'black', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>Start with what's the occasion</p>
          </button>
        </div>
      </div>
    </main>
  )
}
