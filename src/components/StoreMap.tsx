import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { stores } from '@/lib/data/stores'
import { Store } from '@/lib/types'
import { useAppStore } from '@/lib/store/useAppStore'

function makeIcon(color: string, label: number) {
  return L.divIcon({
    className: '',
    html: `<div style="width:34px;height:34px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 3px 10px rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:13px;font-family:JetBrains Mono,monospace">${label}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  })
}

interface Props {
  activeStoreIds: string[]
  storeItems?: Record<string, string[]>
}

function FitStoreBounds({ display, center }: { display: Store[]; center: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    if (display.length === 0) {
      map.setView(center, 13)
      return
    }

    if (display.length === 1) {
      map.setView([display[0].lat, display[0].lng], 15)
      return
    }

    const bounds = L.latLngBounds(display.map(store => [store.lat, store.lng]))
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 })
  }, [center, display, map])

  return null
}

export default function StoreMap({ activeStoreIds, storeItems = {} }: Props) {
  const { location } = useAppStore()
  const display = activeStoreIds.length > 0
    ? stores.filter(s => activeStoreIds.includes(s.id))
    : stores

  const getCenter = (): [number, number] => {
    const loc = location.toLowerCase()
    if (loc.includes('sydney')) return [-33.8688, 151.2093]
    return [40.7380, -73.9900]
  }

  const center = getCenter()

  return (
    <div style={{ overflow: 'hidden', border: '1px solid black', height: '100%', boxShadow: '8px 8px 0px rgba(0,0,0,0.1)', background: 'white' }}>
      <MapContainer key={location} center={center} zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl attributionControl={false}>
        <FitStoreBounds display={display} center={center} />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="" />
        {display.map((store: Store, index) => (
          <Marker key={store.id} position={[store.lat, store.lng]} icon={makeIcon(store.dotColor, index + 1)}>
            <Popup>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'black', fontFamily: 'Playfair Display, serif' }}>{store.name.toUpperCase()}</div>
              <div style={{ fontSize: 12, color: 'black', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{store.address}</div>
              {(storeItems[store.id] || []).length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {(storeItems[store.id] || []).map(item => (
                    <div key={item} style={{ fontSize: 11, color: 'black', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                      [{item}]
                    </div>
                  ))}
                </div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
