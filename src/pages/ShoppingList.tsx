import { useState, Suspense, lazy, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Copy, Check, ExternalLink } from 'lucide-react'
import { useAppStore } from '@/lib/store/useAppStore'
import Logo from '../components/Logo'
import { outfitItems, CATEGORY_ORDER, CATEGORY_LABELS } from '@/lib/data/outfitItems'
import type { MapStore } from '../components/StoreMap'

const StoreMap = lazy(() => import('../components/StoreMap'))

export default function ShoppingList() {
  const navigate = useNavigate()
  const { layers, getTotalCost, location, curatedOutfits, searchMeta } = useAppStore()
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'list' | 'map'>('list')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const hasScrapedSession = Boolean(searchMeta)
  const total = getTotalCost()

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserLocation(null),
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }, [])

  const currentItems = CATEGORY_ORDER
    .map(cat => {
      const source = hasScrapedSession
        ? (curatedOutfits[cat] || [])
        : (curatedOutfits[cat]?.length ? curatedOutfits[cat] : outfitItems[cat])
      return { cat, item: source?.[layers[cat]?.currentIndex ?? 0] }
    })
    .filter(({ item }) => item && (item.price > 0 || (item as any).isUserOwned))

  type StoreGroup = {
    store: {
      id: string
      name: string
      address: string
      locationLink?: string
      type: string
      dotColor: string
      lat?: number
      lng?: number
    }
    items: typeof currentItems
  }

  const byStore = currentItems.reduce((acc, row) => {
    const item = row.item!
    const store = {
      id: item.storeId,
      name: (item as any).storeName || item.brand || 'Store',
      address: (item as any).storeAddress || location,
      locationLink: (item as any).storeLocationLink as string | undefined,
      type: item.storeId === 'wardrobe' ? 'owned' : 'retail',
      dotColor: '#1a1a1a',
      lat: (item as any).storeLat as number | undefined,
      lng: (item as any).storeLng as number | undefined,
    }
    if (!acc[store.id]) acc[store.id] = { store, items: [] }
    acc[store.id].items.push(row)
    return acc
  }, {} as Record<string, StoreGroup>)

  const mapStores: MapStore[] = Object.values(byStore)
    .filter(({ store }) => store.lat != null && store.lng != null && store.type !== 'owned')
    .map(({ store }) => ({
      id: store.id,
      name: store.name,
      address: store.address,
      lat: store.lat!,
      lng: store.lng!,
      dotColor: store.dotColor,
    }))

  const storeCount = Object.values(byStore).filter(({ store }) => store.type !== 'owned').length

  const haversineKm = (aLat: number, aLng: number, bLat: number, bLng: number) => {
    const toRad = (d: number) => (d * Math.PI) / 180
    const dLat = toRad(bLat - aLat)
    const dLng = toRad(bLng - aLng)
    const sa = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2
    return 6371 * 2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1 - sa))
  }

  const copyList = () => {
    const text = Object.values(byStore).map(({ store, items }) =>
      `${store.name} — ${store.address}\n` +
      `  location: ${store.locationLink || '-'}\n` +
      items.map(({ item }) => {
        const distance = (item as any).distanceKm ?? '-'
        const stock = (item as any).stockLeft ?? '-'
        const link = (item as any).externalLink || '-'
        return `  · ${item!.name} (${item!.brand}) — $${item!.price} — SKU: ${item!.sku} — ${distance}km — stock:${stock} — ${link}`
      }).join('\n')
    ).join('\n\n')
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
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
        <button onClick={copyList} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', border: '1px solid black', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: copied ? 'black' : 'white', color: copied ? 'white' : 'black', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
          {copied ? <><Check size={14} /> COPIED_SUCCESS</> : <><Copy size={14} /> COPY_LIST</>}
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', marginTop: 32 }}>
        <div style={{ marginBottom: 32, borderLeft: '4px solid black', paddingLeft: 24 }}>
          <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em', color: 'black', fontFamily: "'Playfair Display', serif" }}>READY_FOR_PICKUP</h2>
          <p style={{ fontSize: 16, color: 'black', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            {storeCount} STORE{storeCount !== 1 ? 'S' : ''} NEAR {location.toUpperCase()} // TOTAL_VAL: ${total}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 0, marginBottom: 32, border: '1px solid black', width: 'fit-content' }}>
          {(['list', 'map'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 40px', border: 'none', borderRight: t === 'list' ? '1px solid black' : 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: tab === t ? 'black' : 'white', color: tab === t ? 'white' : 'black', transition: 'all 0.2s', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: tab === 'map' ? '1fr 1.5fr' : '1fr', gap: 48, flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {Object.values(byStore).map(({ store, items }) => (
              <motion.div key={store.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 14, height: 14, background: 'black', flexShrink: 0, border: '1px solid white' }} />
                  <p style={{ fontWeight: 700, fontSize: 22, color: 'black', margin: 0, fontFamily: "'Playfair Display', serif" }}>{store.name.toUpperCase()}</p>
                  <span style={{ padding: '2px 8px', border: '1px solid black', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'black', background: 'transparent', fontFamily: "'JetBrains Mono', monospace" }}>[{store.type}]</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, marginLeft: 26 }}>
                  <MapPin size={14} color="black" />
                  <a
                    href={store.locationLink || (
                      userLocation && store.lat != null && store.lng != null
                      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${store.lat},${store.lng}`
                      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address)}`)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 14, color: 'black', margin: 0, fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", textDecoration: 'underline' }}
                  >
                    {store.address.toUpperCase()}
                  </a>
                  {userLocation && store.lat != null && store.lng != null && (
                    <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                      {haversineKm(userLocation.lat, userLocation.lng, store.lat, store.lng).toFixed(1)}KM
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {items.map(({ cat, item }) => (
                    <div key={item!.id} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px', border: '1px solid black', background: 'white' }}>
                      <div style={{ width: 64, height: 64, border: '1px solid black', flexShrink: 0, overflow: 'hidden', background: '#F5F5DC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {(item as any).imageUrl
                          ? <img src={(item as any).imageUrl} alt={item!.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          : <span style={{ fontSize: 24 }}>{item!.emoji}</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 16, margin: 0, color: 'black', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Playfair Display', serif" }}>{item!.name.toUpperCase()}</p>
                        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                          <span style={{ fontSize: 12, color: 'black', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{CATEGORY_LABELS[cat]}</span>
                          <span style={{ color: 'black' }}>/</span>
                          <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'black' }}>SKU:{item!.sku}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                          {(item as any).distanceKm > 0 && <span>{(item as any).distanceKm}KM</span>}
                          <span>STOCK:{(item as any).stockLeft ?? '-'}</span>
                          <span>SIZES:{item!.sizes.join(', ')}</span>
                        </div>
                        {(item as any).externalLink && (item as any).externalLink !== '#' && (
                          <a href={(item as any).externalLink} target="_blank" rel="noreferrer" style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'black', fontFamily: "'JetBrains Mono', monospace" }}>
                            PRODUCT_LINK <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 18, margin: 0, color: 'black', fontFamily: "'JetBrains Mono', monospace" }}>
                          {(item as any).isUserOwned ? 'OWNED' : `$${item!.price}.00`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            <div style={{ flex: 1 }} />

            <button onClick={() => navigate('/outfit-builder')} style={{ width: '100%', padding: '18px', border: '1px solid black', fontWeight: 600, fontSize: 14, color: 'black', background: 'white', cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'JetBrains Mono', monospace" }}>
              [ SWAP_ITEMS ]
            </button>
          </div>

          {tab === 'map' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'sticky', top: 32, height: 'calc(100vh - 160px)', border: '1px solid black' }}>
              <Suspense fallback={<div style={{ height: '100%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'black', fontFamily: "'JetBrains Mono', monospace" }}>LOADING_MAP...</div>}>
                {mapStores.length > 0
                  ? <StoreMap stores={mapStores} userLocation={userLocation} />
                  : <div style={{ height: '100%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'black', fontFamily: "'JetBrains Mono', monospace", flexDirection: 'column', gap: 8 }}>
                      <span>NO_MAP_DATA</span>
                      <span style={{ opacity: 0.5, fontSize: 11 }}>stores may be online-only</span>
                    </div>}
              </Suspense>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
