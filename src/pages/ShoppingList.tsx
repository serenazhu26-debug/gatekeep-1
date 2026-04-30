import { useState, Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Copy, Check } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'
import Logo from '../components/Logo'
import { outfitItems, CATEGORY_ORDER, CATEGORY_LABELS } from '@/lib/data/outfitItems'
import { getStore } from '@/lib/data/stores'

const StoreMap = lazy(() => import('../components/StoreMap'))

export default function ShoppingList() {
  const navigate = useNavigate()
  const { layers, getTotalCost, location } = useAppStore()
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
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px 40px', background: '#F5F5DC', fontFamily: "'Lora', serif" }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 0 0', maxWidth: 1200, margin: '0 auto', width: '100%', borderBottom: '1px solid black', paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ width: 44, height: 44, border: '1px solid black', display: 'center', alignItems: 'center', justifyContent: 'center', background: 'white', cursor: 'pointer', color: 'black' }}>
            <ArrowLeft size={18} />
          </button>
          <span style={{ fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', color: 'black', fontFamily: "'Playfair Display', serif" }}>Gatekeep</span>
        </div>
        <button onClick={copyList}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', border: '1px solid black', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: copied ? 'black' : 'white', color: copied ? 'white' : 'black', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
          {copied ? <><Check size={14} /> COPIED_SUCCESS</> : <><Copy size={14} /> COPY_LIST</>}
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', marginTop: 32 }}>
        
        {/* Heading */}
        <div style={{ marginBottom: 32, borderLeft: '4px solid black', paddingLeft: 24 }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', color: 'black', fontFamily: "'Playfair Display', serif" }}>READY_FOR_PICKUP</h2>
          <p style={{ fontSize: 16, color: 'black', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            {activeStoreIds.length} STORE{activeStoreIds.length > 1 ? 'S' : ''} IN {location.toUpperCase()} // TOTAL_VAL: ${total}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 32, border: '1px solid black', width: 'fit-content' }}>
          {(['list', 'map'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '10px 40px', border: 'none', borderRight: t === 'list' ? '1px solid black' : 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: tab === t ? 'black' : 'white', color: tab === t ? 'white' : 'black', transition: 'all 0.2s', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: tab === 'map' ? '1fr 1.5fr' : '1fr', gap: 48, flex: 1 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {Object.values(byStore).map(({ store, items }) => (
              <motion.div key={store.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                {/* Store header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 14, height: 14, background: 'black', flexShrink: 0, border: '1px solid white' }} />
                  <p style={{ fontWeight: 700, fontSize: 22, color: 'black', margin: 0, fontFamily: "'Playfair Display', serif" }}>{store.name.toUpperCase()}</p>
                  <span style={{ padding: '2px 8px', border: '1px solid black', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'black', background: 'transparent', fontFamily: "'JetBrains Mono', monospace" }}>[{store.type}]</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, marginLeft: 26 }}>
                  <MapPin size={14} color="black" />
                  <p style={{ fontSize: 14, color: 'black', margin: 0, fontWeight: 500, fontFamily: "'JetBrains Mono', monospace" }}>{store.address.toUpperCase()}</p>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {items.map(({ cat, item }) => (
                    <div key={item!.id} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px', border: '1px solid black', background: 'white' }}>
                      <div style={{ width: 48, height: 48, border: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, background: '#F5F5DC' }}>
                        {item!.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 16, margin: 0, color: 'black', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Playfair Display', serif" }}>{item!.name.toUpperCase()}</p>
                        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                          <span style={{ fontSize: 12, color: 'black', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{CATEGORY_LABELS[cat]}</span>
                          <span style={{ color: 'black' }}>/</span>
                          <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'black' }}>SKU:{item!.sku}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 18, margin: 0, color: 'black', fontFamily: "'JetBrains Mono', monospace" }}>${item!.price}.00</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            <div style={{ flex: 1 }} />
            
            <button onClick={() => navigate('/outfit-builder')}
              style={{ width: '100%', padding: '18px', border: '1px solid black', fontWeight: 600, fontSize: 14, color: 'black', background: 'white', cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'JetBrains Mono', monospace" }}>
              [ SWAP_ITEMS ]
            </button>
          </div>

          {tab === 'map' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'sticky', top: 32, height: 'calc(100vh - 160px)', border: '1px solid black' }}>
              <Suspense fallback={<div style={{ height: '100%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'black', fontFamily: "'JetBrains Mono', monospace" }}>LOADING_MAP...</div>}>
                <StoreMap activeStoreIds={activeStoreIds} />
              </Suspense>
            </motion.div>
          )}

        </div>
      </div>
    </main>
  )
}
