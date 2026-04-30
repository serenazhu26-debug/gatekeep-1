import { useState, Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Package, Copy, Check } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'
import { outfitItems, CATEGORY_ORDER, CATEGORY_LABELS } from '@/lib/data/outfitItems'
import { getStore } from '@/lib/data/stores'

const StoreMap = lazy(() => import('../components/StoreMap'))

export default function ShoppingList() {
  const navigate = useNavigate()
  const { layers, getTotalCost } = useAppStore()
  const [copied, setCopied] = useState(false)
  const [tab, setTab]       = useState<'list' | 'map'>('list')
  const total = getTotalCost()

  const currentItems = CATEGORY_ORDER
    .map(cat => ({ cat, item: outfitItems[cat]?.[layers[cat]?.currentIndex ?? 0] }))
    .filter(({ item }) => item && item.price > 0)

  const activeStoreIds = [...new Set(currentItems.map(({ item }) => item!.storeId))]

  type StoreGroup = { store: NonNullable<ReturnType<typeof getStore>>; items: typeof currentItems }
  const byStore = currentItems.reduce((acc, row) => {
    const store = getStore(row.item!.storeId)
    if (!store) return acc
    if (!acc[store.id]) acc[store.id] = { store, items: [] }
    acc[store.id].items.push(row)
    return acc
  }, {} as Record<string, StoreGroup>)

  const copyList = () => {
    const text = Object.values(byStore).map(({ store, items }) =>
      `${store.name} — ${store.address}\n` +
      items.map(({ item }) => `  · ${item!.name} (${item!.brand}) — $${item!.price} — SKU: ${item!.sku}`).join('\n')
    ).join('\n\n')
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px 40px', background: 'radial-gradient(circle at top left, #FDFBEB, #F5F5DC)', fontFamily: "'Lora', serif" }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 0 0', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)', border: '1px solid #E8E8C0', cursor: 'pointer', color: '#5A5A50', backdropFilter: 'blur(10px)' }}>
            <ArrowLeft size={18} />
          </button>
          <span style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em', color: '#2D2D2A', fontFamily: "'Playfair Display', serif" }}>Gatekeep</span>
        </div>
        <button onClick={copyList}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: 'pointer', background: copied ? 'rgba(134, 239, 172, 0.2)' : 'rgba(255,255,255,0.6)', border: `1px solid ${copied ? '#86EFAC' : '#E8E8C0'}`, color: copied ? '#166534' : '#5A5A50', transition: 'all 0.3s', backdropFilter: 'blur(10px)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy list</>}
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', marginTop: 32 }}>
        
        {/* Heading */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', color: '#2D2D2A', fontFamily: "'Playfair Display', serif" }}>Ready for pickup</h2>
          <p style={{ fontSize: 18, color: '#5A5A50', opacity: 0.8, marginTop: 4 }}>
            {activeStoreIds.length} store{activeStoreIds.length > 1 ? 's' : ''} nearby · Total <strong style={{ color: '#166534', fontStyle: 'italic' }}>${total}</strong>
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, padding: 8, borderRadius: 100, background: 'rgba(255,255,255,0.4)', border: '1px solid #E8E8C0', width: 'fit-content', backdropFilter: 'blur(10px)' }}>
          {(['list', 'map'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '10px 40px', borderRadius: 100, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', background: tab === t ? 'linear-gradient(135deg, #86EFAC, #4ADE80)' : 'transparent', color: tab === t ? 'white' : '#8B8B7A', transition: 'all 0.3s' }}>
              {t === 'list' ? 'List' : 'Map'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: tab === 'map' ? '1fr 1.5fr' : '1fr', gap: 48, flex: 1 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {Object.values(byStore).map(({ store, items }) => (
              <motion.div key={store.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                {/* Store header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: store.dotColor, flexShrink: 0, border: '3px solid white', boxShadow: '0 0 0 1px #E8E8C0' }} />
                  <p style={{ fontWeight: 700, fontSize: 22, color: '#2D2D2A', margin: 0, fontFamily: "'Playfair Display', serif" }}>{store.name}</p>
                  <span style={{ padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(255,255,255,0.6)', color: '#166534', border: '1px solid #E8E8C0', fontStyle: 'italic' }}>{store.type}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, marginLeft: 26 }}>
                  <MapPin size={14} color="#8B8B7A" />
                  <p style={{ fontSize: 15, color: '#5A5A50', margin: 0, fontWeight: 500, fontStyle: 'italic', opacity: 0.8 }}>{store.address}</p>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {items.map(({ cat, item }) => (
                    <div key={item!.id} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', borderRadius: 24, background: 'rgba(255,255,255,0.4)', border: '1px solid #E8E8C0', transition: 'all 0.3s', backdropFilter: 'blur(10px)' }}>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, background: item!.bgGradient }}>
                        {item!.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 18, margin: 0, color: '#2D2D2A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Playfair Display', serif" }}>{item!.name}</p>
                        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                          <span style={{ fontSize: 14, color: '#8B8B7A', fontWeight: 600, fontStyle: 'italic' }}>{CATEGORY_LABELS[cat]}</span>
                          <span style={{ color: '#E8E8C0' }}>·</span>
                          <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#D9D9A3', fontWeight: 500 }}>{item!.sku}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 20, margin: 0, color: '#2D2D2A', letterSpacing: '-0.02em', fontFamily: "'Playfair Display', serif" }}>${item!.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            <div style={{ flex: 1 }} />
            
            <button onClick={() => navigate('/outfit-builder')}
              style={{ width: '100%', padding: '18px', borderRadius: 100, fontWeight: 600, fontSize: 16, color: '#5A5A50', background: 'rgba(255,255,255,0.4)', border: '1px solid #E8E8C0', cursor: 'pointer', transition: 'all 0.3s', backdropFilter: 'blur(10px)', fontStyle: 'italic' }}>
              ← Swap items
            </button>
          </div>

          {tab === 'map' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'sticky', top: 32, height: 'calc(100vh - 160px)' }}>
              <Suspense fallback={<div style={{ height: '100%', borderRadius: 24, background: 'rgba(255,255,255,0.4)', border: '1px solid #E8E8C0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#8B8B7A', fontStyle: 'italic', backdropFilter: 'blur(10px)' }}>Loading map…</div>}>
                <StoreMap activeStoreIds={activeStoreIds} />
              </Suspense>
            </motion.div>
          )}

        </div>
      </div>
    </main>
  )
}
