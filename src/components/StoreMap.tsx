import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { stores } from '@/lib/data/stores'
import { Store } from '@/lib/types'

function makeIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:26px;height:26px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.2)"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  })
}

interface Props {
  activeStoreIds: string[]
}

export default function StoreMap({ activeStoreIds }: Props) {
  const display = activeStoreIds.length > 0
    ? stores.filter(s => activeStoreIds.includes(s.id))
    : stores

  const center: [number, number] = [40.7380, -73.9900]

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #E5E7EB', height: 280 }}>
      <MapContainer center={center} zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false} attributionControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="" />
        {display.map((store: Store) => (
          <Marker key={store.id} position={[store.lat, store.lng]} icon={makeIcon(store.dotColor)}>
            <Popup>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>{store.name}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{store.address}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
