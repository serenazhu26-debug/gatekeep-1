export type OutfitCategory = 'headgear' | 'top' | 'belt' | 'bottom' | 'shoes';
export type Vibe = 'Streetwear' | 'Y2K' | 'Minimalist' | 'Cottagecore' | 'Dark Academia';

export interface OutfitItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  storeId: string;
  bgGradient: string;
  emoji: string;
  textLight: boolean;
  sizes: string[];
  sku: string;
  vibes: Vibe[];
  category: OutfitCategory;
}

export interface Store {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  type: 'chain' | 'thrift' | 'boutique';
  dotColor: string;
  website?: string;
}

export interface UserProfile {
  bodyType: string;
  colorSeason: string;
  primaryVibe: Vibe;
  size: string;
}

export interface UploadedWardrobeItem {
  id: string;
  category: OutfitCategory;
  photoName: string;
  styleIntent: string;
  preferredTime: 'day' | 'night' | 'any';
  previewUrl?: string;
}

export interface CuratedOutfitItem extends OutfitItem {
  distanceKm?: number;
  stockLeft?: number;
  storeName?: string;
  storeAddress?: string;
  storeLocationLink?: string;
  storeLat?: number;
  storeLng?: number;
  externalLink?: string;
  source?: string;
  isUserOwned?: boolean;
  imageUrl?: string;
}

export interface SearchStoreMarker {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  locationLink?: string;
  distanceKm?: number;
}

export interface OutfitSearchMeta {
  analysedBy: string;
  provider: string;
  intentSummary: string;
  query: string;
  generatedAt: string;
  storeMarkers?: SearchStoreMarker[];
}
