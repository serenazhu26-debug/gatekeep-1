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
