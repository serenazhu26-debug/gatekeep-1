'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { stores } from '@/lib/data/stores';
import { Store } from '@/lib/types';

function makeIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;
      background:${color};
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

interface Props {
  activeStoreIds: string[];
}

export default function StoreMap({ activeStoreIds }: Props) {
  const displayStores = activeStoreIds.length > 0
    ? stores.filter(s => activeStoreIds.includes(s.id))
    : stores;

  const center: [number, number] = [40.7282, -73.9942];

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10" style={{ height: 280 }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%', background: '#1a1a2e' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution=""
        />
        {displayStores.map((store: Store) => (
          <Marker
            key={store.id}
            position={[store.lat, store.lng]}
            icon={makeIcon(store.dotColor)}
          >
            <Popup className="vc-popup">
              <div className="font-bold text-sm">{store.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{store.address}</div>
              <div className="text-xs mt-1 capitalize px-2 py-0.5 rounded-full inline-block"
                style={{ background: store.type === 'thrift' ? '#2E8B5720' : '#3B82F620', color: store.type === 'thrift' ? '#2E8B57' : '#3B82F6' }}>
                {store.type}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
