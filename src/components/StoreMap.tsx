import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'

function makeIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:26px;height:26px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.2)"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  })
}

export interface MapStore {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  dotColor?: string
}

interface Props {
  stores: MapStore[]
  center?: [number, number]
  userLocation?: { lat: number; lng: number } | null
}

export default function StoreMap({ stores, center, userLocation }: Props) {
  const mapCenter: [number, number] = center
    ?? (userLocation ? [userLocation.lat, userLocation.lng] : undefined)
    ?? (stores.length > 0 ? [stores[0].lat, stores[0].lng] : [-33.8785, 151.2135])

  const userIcon = L.divIcon({
    className: '',
    html: '<div style="width:18px;height:18px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(37,99,235,0.5)"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })

  return (
    <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #DCFCE7', height: '100%', boxShadow: '0 8px 24px rgba(22,101,52,0.04)' }}>
      <MapContainer key={`${mapCenter[0]}-${mapCenter[1]}`} center={mapCenter} zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false} attributionControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="" />
        {stores.map(store => (
          <Marker key={store.id} position={[store.lat, store.lng]} icon={makeIcon(store.dotColor || '#1a1a1a')}>
            <Popup>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{store.name}</div>
              <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{store.address}</div>
              <a
                href={userLocation
                  ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${store.lat},${store.lng}`
                  : `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12, marginTop: 6, display: 'inline-block' }}
              >
                Directions
              </a>
            </Popup>
          </Marker>
        ))}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Your Location</div>
            </Popup>
          </Marker>
        )}
        {userLocation && stores.map(store => (
          <Polyline key={`line-${store.id}`} positions={[[userLocation.lat, userLocation.lng], [store.lat, store.lng]]} pathOptions={{ color: '#94a3b8', weight: 2, dashArray: '6 6' }} />
        ))}
      </MapContainer>
    </div>
  )
}
