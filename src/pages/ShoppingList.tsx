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
    <main style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px 40px', background: '#F0FDF4' }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 0 0', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #DCFCE7', cursor: 'pointer', color: '#166534' }}>
            <ArrowLeft size={18} />
          </button>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em', color: '#14532D' }}>Gatekeep</span>
        </div>
        <button onClick={copyList}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', background: copied ? '#DCFCE7' : 'white', border: `1px solid ${copied ? '#22C55E' : '#DCFCE7'}`, color: copied ? '#16A34A' : '#166534', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(22,101,52,0.02)' }}>
          {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy list</>}
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', marginTop: 32 }}>
        
        {/* Heading */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', color: '#14532D' }}>Ready for pickup</h2>
          <p style={{ fontSize: 16, color: '#166534', opacity: 0.8, marginTop: 4 }}>
            {activeStoreIds.length} store{activeStoreIds.length > 1 ? 's' : ''} nearby · Total <strong style={{ color: '#22C55E' }}>${total}</strong>
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32, padding: 6, borderRadius: 18, background: 'white', border: '1px solid #DCFCE7', width: 'fit-content' }}>
          {(['list', 'map'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '10px 32px', borderRadius: 14, fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', background: tab === t ? '#22C55E' : 'transparent', color: tab === t ? 'white' : '#166534', opacity: tab === t ? 1 : 0.6, transition: 'all 0.2s' }}>
              {t === 'list' ? 'List' : 'Map'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: tab === 'map' ? '1fr 1.5fr' : '1fr', gap: 40, flex: 1 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {Object.values(byStore).map(({ store, items }) => (
              <motion.div key={store.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                {/* Store header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: store.dotColor, flexShrink: 0, border: '2px solid white', boxShadow: '0 0 0 1px #DCFCE7' }} />
                  <p style={{ fontWeight: 800, fontSize: 18, color: '#14532D', margin: 0 }}>{store.name}</p>
                  <span style={{ padding: '4px 10px', borderRadius: 10, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', background: store.type === 'thrift' ? '#F0FDF4' : '#DCFCE7', color: store.type === 'thrift' ? '#16A34A' : '#16A34A', border: `1px solid ${store.type === 'thrift' ? '#BBF7D0' : '#BBF7D0'}` }}>{store.type}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, marginLeft: 22 }}>
                  <MapPin size={14} color="#166534" style={{ opacity: 0.6 }} />
                  <p style={{ fontSize: 14, color: '#166534', opacity: 0.8, margin: 0, fontWeight: 500 }}>{store.address}</p>
                </div>

                {/* Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map(({ cat, item }) => (
                    <div key={item!.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderRadius: 20, background: 'white', border: '1px solid #DCFCE7', transition: 'all 0.2s' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, background: item!.bgGradient }}>
                        {item!.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 16, margin: 0, color: '#14532D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item!.name}</p>
                        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                          <span style={{ fontSize: 13, color: '#166534', opacity: 0.6, fontWeight: 600 }}>{CATEGORY_LABELS[cat]}</span>
                          <span style={{ color: '#DCFCE7' }}>·</span>
                          <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#86EFAC', fontWeight: 500 }}>{item!.sku}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontWeight: 800, fontSize: 18, margin: 0, color: '#14532D', letterSpacing: '-0.02em' }}>${item!.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            <div style={{ flex: 1 }} />
            
            <button onClick={() => navigate('/outfit-builder')}
              style={{ width: '100%', padding: '16px', borderRadius: 18, fontWeight: 700, fontSize: 15, color: '#166534', background: 'white', border: '1px solid #DCFCE7', cursor: 'pointer', transition: 'all 0.2s' }}>
              ← Swap items
            </button>
          </div>

          {tab === 'map' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'sticky', top: 32, height: 'calc(100vh - 160px)' }}>
              <Suspense fallback={<div style={{ height: '100%', borderRadius: 24, background: 'white', border: '1px solid #DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#166534', opacity: 0.6 }}>Loading map…</div>}>
                <StoreMap activeStoreIds={activeStoreIds} />
              </Suspense>
            </motion.div>
          )}

        </div>
      </div>
    </main>
  )
}
