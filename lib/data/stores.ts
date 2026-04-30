import { Store } from '@/lib/types';

export const stores: Store[] = [
  { id: 'hm',      name: 'H&M',              lat: 40.7484, lng: -73.9967, address: '640 5th Ave, New York, NY 10019',         type: 'chain',   dotColor: '#E50010' },
  { id: 'zara',    name: 'Zara',             lat: 40.7519, lng: -73.9800, address: '666 5th Ave, New York, NY 10103',         type: 'chain',   dotColor: '#1a1a1a' },
  { id: 'uo',      name: 'Urban Outfitters', lat: 40.7282, lng: -73.9942, address: '628 Broadway, New York, NY 10012',        type: 'chain',   dotColor: '#FF6B35' },
  { id: 'fl',      name: 'Foot Locker',      lat: 40.7520, lng: -73.9855, address: '120 W 34th St, New York, NY 10001',       type: 'chain',   dotColor: '#003087' },
  { id: 'buffalo', name: 'Buffalo Exchange', lat: 40.7193, lng: -74.0001, address: '114 W Houston St, New York, NY 10012',    type: 'thrift',  dotColor: '#8B4513' },
  { id: 'goodwill',name: 'Goodwill',         lat: 40.7131, lng: -73.9894, address: '217 Havemeyer St, Brooklyn, NY 11211',    type: 'thrift',  dotColor: '#2E8B57' },
];

export const getStore = (id: string): Store | undefined => stores.find(s => s.id === id);
