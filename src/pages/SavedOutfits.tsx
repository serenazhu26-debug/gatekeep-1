import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronUp, Download, Pencil, Trash2 } from 'lucide-react'
import Logo from '../components/Logo'

type SavedOutfitItem = {
  id: string
  category: string
  name: string
  brand: string
  price: number
  emoji: string
  storeName: string
  storeAddress: string
}

type SavedOutfit = {
  id: string
  name?: string
  savedAt: string
  location: string
  total: number
  items: SavedOutfitItem[]
}

const STORAGE_KEY = 'gatekeep.savedOutfits'

function loadSavedOutfits(): SavedOutfit[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export default function SavedOutfits() {
  const navigate = useNavigate()
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>(() => loadSavedOutfits())
  const [openOutfits, setOpenOutfits] = useState<Record<string, boolean>>({})
  const titleInputs = useRef<Record<string, HTMLInputElement | null>>({})
  const formatter = useMemo(() => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }), [])

  const removeOutfit = (id: string) => {
    const next = savedOutfits.filter(outfit => outfit.id !== id)
    setSavedOutfits(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const updateOutfitName = (id: string, name: string) => {
    const next = savedOutfits.map(outfit => outfit.id === id ? { ...outfit, name } : outfit)
    setSavedOutfits(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const commitOutfitName = (id: string) => {
    const outfit = savedOutfits.find(item => item.id === id)
    if (outfit && outfit.name !== undefined && outfit.name.trim() === '') {
      updateOutfitName(id, 'Unnamed')
    }
  }

  const focusOutfitName = (id: string) => {
    titleInputs.current[id]?.focus()
    titleInputs.current[id]?.select()
  }

  const exportOutfit = async (outfit: SavedOutfit) => {
    const title = outfit.name || `${outfit.location} outfit`
    const text = `${title}\nTotal: $${outfit.total}\n\n${outfit.items.map(item =>
      `${item.emoji} ${item.name} (${item.brand}) - $${item.price} at ${item.storeName}`
    ).join('\n')}`

    if (navigator.share) {
      await navigator.share({ title, text })
      return
    }

    await navigator.clipboard.writeText(text)
  }

  return (
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px 40px', background: '#F5F5DC', fontFamily: "'Lora', serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '28px 0 0', maxWidth: 1200, margin: '0 auto', width: '100%', borderBottom: '1px solid black', paddingBottom: 16 }}>
        <button onClick={() => navigate(-1)} style={{ width: 44, height: 44, border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', cursor: 'pointer', color: 'black' }}>
          <ArrowLeft size={18} />
        </button>
        <Logo />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', marginTop: 32 }}>
        <div style={{ marginBottom: 32, borderLeft: '4px solid black', paddingLeft: 24 }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', color: 'black', fontFamily: "'Playfair Display', serif" }}>SAVED OUTFITS</h2>
          <p style={{ fontSize: 16, color: 'black', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            {savedOutfits.length} SAVED LOOK{savedOutfits.length === 1 ? '' : 'S'}
          </p>
        </div>

        {savedOutfits.length === 0 ? (
          <div style={{ border: '1px solid black', background: 'white', padding: 32, fontFamily: "'JetBrains Mono', monospace", color: 'black' }}>
            NO SAVED OUTFITS YET.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
            {savedOutfits.map(outfit => (
              <article key={outfit.id} style={{ border: '1px solid black', background: 'white', padding: 18, boxShadow: '8px 8px 0px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}>
                  <button
                    onClick={() => setOpenOutfits(prev => ({ ...prev, [outfit.id]: !prev[outfit.id] }))}
                    style={{ width: 38, height: 38, border: '1px solid black', background: 'white', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                  >
                    {openOutfits[outfit.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input
                      ref={node => { titleInputs.current[outfit.id] = node }}
                      value={outfit.name ?? `${outfit.location} outfit`}
                      onChange={e => updateOutfitName(outfit.id, e.target.value)}
                      onBlur={() => commitOutfitName(outfit.id)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') e.currentTarget.blur()
                      }}
                      style={{ width: '100%', border: 'none', borderBottom: '1px solid black', background: 'transparent', outline: 'none', padding: '0 0 6px', fontSize: 22, fontWeight: 700, color: 'black', fontFamily: "'Playfair Display', serif" }}
                    />
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'black', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>{outfit.location}</p>
                    <h3 style={{ margin: '4px 0 0', fontSize: 28, color: 'black', fontFamily: "'Playfair Display', serif" }}>${outfit.total} <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>/ {outfit.items.length} ITEMS</span></h3>
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: 'black', fontFamily: "'JetBrains Mono', monospace" }}>{formatter.format(new Date(outfit.savedAt)).toUpperCase()}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => focusOutfitName(outfit.id)} style={{ width: 38, height: 38, border: '1px solid black', background: 'white', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label="Edit outfit title">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => exportOutfit(outfit)} style={{ width: 38, height: 38, border: '1px solid black', background: 'white', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label="Export outfit">
                      <Download size={16} />
                    </button>
                    <button onClick={() => removeOutfit(outfit.id)} style={{ width: 38, height: 38, border: '1px solid black', background: 'white', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} aria-label="Delete outfit">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {openOutfits[outfit.id] && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 16 }}>
                    {outfit.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid black', background: '#F5F5DC', padding: 12 }}>
                        <div style={{ width: 42, height: 42, border: '1px solid black', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{item.emoji}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'black', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Playfair Display', serif" }}>{item.name.toUpperCase()}</p>
                          <p style={{ margin: '3px 0 0', fontSize: 11, color: 'black', fontFamily: "'JetBrains Mono', monospace" }}>{item.storeName.toUpperCase()}</p>
                        </div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'black', fontFamily: "'JetBrains Mono', monospace" }}>${item.price}</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
