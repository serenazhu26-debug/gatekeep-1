import { Store } from '@/lib/types';

export const stores: Store[] = [
  { id: 'hm',      name: 'H&M',              lat: 40.7484, lng: -73.9967, address: '640 5th Ave, New York, NY 10019',         type: 'chain',   dotColor: '#E50010', website: 'https://www2.hm.com/' },
  { id: 'zara',    name: 'Zara',             lat: 40.7519, lng: -73.9800, address: '666 5th Ave, New York, NY 10103',         type: 'chain',   dotColor: '#1a1a1a', website: 'https://www.zara.com/' },
  { id: 'uo',      name: 'Urban Outfitters', lat: 40.7282, lng: -73.9942, address: '628 Broadway, New York, NY 10012',        type: 'chain',   dotColor: '#FF6B35', website: 'https://www.urbanoutfitters.com/' },
  { id: 'fl',      name: 'Foot Locker',      lat: 40.7520, lng: -73.9855, address: '120 W 34th St, New York, NY 10001',       type: 'chain',   dotColor: '#003087', website: 'https://www.footlocker.com/' },
  { id: 'buffalo', name: 'Buffalo Exchange', lat: 40.7193, lng: -74.0001, address: '114 W Houston St, New York, NY 10012',    type: 'thrift',  dotColor: '#8B4513', website: 'https://buffaloexchange.com/' },
  { id: 'goodwill',name: 'Goodwill',         lat: 40.7131, lng: -73.9894, address: '217 Havemeyer St, Brooklyn, NY 11211',    type: 'thrift',  dotColor: '#2E8B57', website: 'https://www.goodwill.org/' },
  // Sydney Stores
  { id: 'hmsyd',   name: 'H&M Sydney',       lat: -33.8688, lng: 151.2093, address: '188 Pitt St, Sydney NSW 2000',           type: 'chain',   dotColor: '#E50010', website: 'https://www2.hm.com/en_au/' },
  { id: 'zarasyd', name: 'Zara Sydney',      lat: -33.8696, lng: 151.2088, address: '450 George St, Sydney NSW 2000',          type: 'chain',   dotColor: '#1a1a1a', website: 'https://www.zara.com/au/' },
  { id: 'gpsyd',   name: 'General Pants',    lat: -33.8715, lng: 151.2075, address: '500 George St, Sydney NSW 2000',          type: 'chain',   dotColor: '#FFD700', website: 'https://www.generalpants.com/' },
  { id: 'flsyd',   name: 'Foot Locker Syd',  lat: -33.8690, lng: 151.2090, address: '188 Pitt St, Sydney NSW 2000',           type: 'chain',   dotColor: '#003087', website: 'https://www.footlocker.com.au/' },
  { id: 'vinnies', name: 'Vinnies Sydney',   lat: -33.8785, lng: 151.2135, address: '223 Crown St, Darlinghurst NSW 2010',   type: 'thrift',  dotColor: '#0056b3', website: 'https://www.vinnies.org.au/' },
  ];

export const getStore = (id: string): Store | undefined => stores.find(s => s.id === id);
