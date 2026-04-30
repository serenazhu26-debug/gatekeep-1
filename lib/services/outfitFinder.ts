import { CATEGORY_ORDER } from '@/lib/data/outfitItems';
import { CuratedOutfitItem, OutfitSearchMeta, UploadedWardrobeItem, OutfitCategory, SearchStoreMarker } from '@/lib/types';

interface OutfitSearchInput {
  prompt: string;
  budget: number;
  location: string;
  uploadedWardrobe: UploadedWardrobeItem[];
  userLat?: number;
  userLng?: number;
}

interface OutfitSearchResult {
  itemsByCategory: Record<string, CuratedOutfitItem[]>;
  meta: OutfitSearchMeta;
}

interface GeoResult {
  lat: number;
  lng: number;
  displayName: string;
}

interface NearbyStore {
  id: string;
  name: string;
  address: string;
  locationLink: string;
  lat: number;
  lng: number;
  distanceKm: number;
  feedUrl?: string;
  website?: string;
  source?: 'known' | 'discovered';
}

interface ScrapedProduct {
  title: string;
  price: string;
  imageUrl?: string;
  url: string;
  tags?: string[] | string;
  productType?: string;
  sizes?: string[];
  available?: boolean;
}

interface IntentResult {
  intentSummary: string;
  styleKeywords: string[];
}

const CATEGORY_EMOJI: Record<OutfitCategory, string> = {
  headgear: '🧢',
  top: '👕',
  belt: '🔗',
  bottom: '👖',
  shoes: '👟',
};

const KNOWN_STORES = [
  {
    id: 'pam-sydney',
    name: 'P.A.M. Store Sydney',
    address: '304 Palmer St, Darlinghurst NSW 2010',
    locationLink: 'https://www.google.com/maps/search/?api=1&query=304+Palmer+St,+Darlinghurst+NSW+2010',
    lat: -33.8785,
    lng: 151.2135,
    feedUrl: 'https://perksandmini.com/products.json?limit=250',
    website: 'https://perksandmini.com/',
  },
  {
    id: 'goelia-sydney',
    name: 'GOELIA Fashion Sydney',
    address: 'Dymocks building, Suite2, Level 6/428 George St, Sydney NSW 2000',
    locationLink: 'https://www.google.com/maps/search/?api=1&query=Dymocks+building,+Suite2,+Level+6/428+George+St,+Sydney+NSW+2000',
    lat: -33.8736,
    lng: 151.2069,
    feedUrl: 'https://www.goelia1995.com/en-au/products.json?limit=250',
    website: 'https://www.goelia1995.com/en-au',
  },
  {
    id: 'stily-sydney',
    name: 'Sorry Thanks I Love You',
    address: 'Westfield Sydney, Cnr Pitt St Mall &, Market St, Sydney NSW 2000',
    locationLink: 'https://www.google.com/maps/search/?api=1&query=Westfield+Sydney,+Cnr+Pitt+St+Mall+%26,+Market+St,+Sydney+NSW+2000',
    lat: -33.8707,
    lng: 151.2072,
    feedUrl: 'https://sorrythanksiloveyou.com/products.json?limit=250',
    website: 'https://sorrythanksiloveyou.com/',
  },
  {
    id: 'social-outfit-sydney',
    name: 'The Social Outfit',
    address: '188 King St, Newtown NSW 2042',
    locationLink: 'https://www.google.com/maps/search/?api=1&query=188+King+St,+Newtown+NSW+2042',
    lat: -33.8969,
    lng: 151.1798,
    feedUrl: 'https://thesocialoutfit.org/products.json?limit=250',
    website: 'https://thesocialoutfit.org/',
  },
];

const NON_OUTFIT_TERMS = [
  'gift card',
  'giftcard',
  'sock',
  'socks',
  'incense',
  'book',
  'candle',
  'fragrance',
  'perfume',
  'sticker',
  'poster',
  'bag charm',
  'mug',
];

const STOPWORDS = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'your', 'from', 'wear', 'want', 'near', 'into', 'just']);

const normalize = (text: string) => String(text || '').toLowerCase();
const toRad = (d: number) => (d * Math.PI) / 180;
const haversineKm = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const sa = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1 - sa));
};

const geocodeLocation = async (query: string): Promise<GeoResult | null> => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Vibecheck-Fashion-App/1.0' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) return null;
    const r = data[0];
    return { lat: parseFloat(r.lat), lng: parseFloat(r.lon), displayName: r.display_name || query };
  } catch {
    return null;
  }
};

const discoverSydneyStores = async (lat: number, lng: number): Promise<NearbyStore[]> => {
  try {
    const res = await fetch('/api/sydney-stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, radiusMeters: 35000 }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!Array.isArray(json.stores)) return [];
    return json.stores
      .map((s: any) => ({
        id: String(s.id || ''),
        name: String(s.name || ''),
        address: String(s.address || ''),
        locationLink: String(s.locationLink || '#'),
        lat: Number(s.lat),
        lng: Number(s.lng),
        website: String(s.website || ''),
        distanceKm: Number(s.distanceKm || 0),
        source: 'discovered' as const,
      }))
      .filter((s: NearbyStore) => s.id && s.name && Number.isFinite(s.lat) && Number.isFinite(s.lng))
      .sort((a: NearbyStore, b: NearbyStore) => a.distanceKm - b.distanceKm);
  } catch {
    return [];
  }
};

const normalizeTagList = (tags: ScrapedProduct['tags']) => {
  if (Array.isArray(tags)) return tags.map(t => String(t));
  if (typeof tags === 'string') return tags.split(',').map(t => t.trim()).filter(Boolean);
  return [];
};

const inferCategory = (product: ScrapedProduct): OutfitCategory | null => {
  const tags = normalizeTagList(product.tags).join(' ');
  const haystack = `${normalize(product.title)} ${normalize(product.productType)} ${normalize(tags)}`;
  if (NON_OUTFIT_TERMS.some(term => haystack.includes(term))) return null;
  if (/(tee|t-shirt|shirt|blouse|polo|button[- ]?down|oxford shirt|top|cardigan|knitwear|sweater|hoodie|jacket|coat|vest)/i.test(haystack)) return 'top';
  if (/(hat|cap|beanie|beret|bucket)/i.test(haystack)) return 'headgear';
  if (/(belt)/i.test(haystack)) return 'belt';
  if (/(pant|pants|jeans|trouser|shorts?|skirt|denim)/i.test(haystack)) return 'bottom';
  if (/(shoe|shoes|sneaker|sneakers|boot|boots|loafer|runner|heel|sandals?|footwear)/i.test(haystack) && !/(sock|socks)/i.test(haystack)) return 'shoes';
  return null;
};

const parsePrice = (price: string) => {
  const n = Number.parseFloat(String(price || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? Math.round(n) : 0;
};

const tokenize = (text: string) => normalize(text)
  .split(/[^a-z0-9]+/g)
  .filter(token => token.length > 2 && !STOPWORDS.has(token));

const scrapeProductsViaApi = async (url: string, type: 'shopify-products' | 'search'): Promise<ScrapedProduct[]> => {
  const normalizeShopifyProducts = (feedUrl: string, payload: any): ScrapedProduct[] => {
    const base = String(feedUrl || '').replace(/\/products\.json.*$/i, '');
    return (payload?.products || []).map((p: any) => {
      const prices = (p.variants || []).map((v: any) => Number.parseFloat(v.price)).filter((v: number) => Number.isFinite(v) && v > 0);
      const minPrice = prices.length ? Math.min(...prices) : 0;
      const sizeOpt = (p.options || []).find((o: any) => String(o.name || '').toLowerCase().includes('size'));
      const sizes = sizeOpt?.values?.length ? sizeOpt.values : [...new Set((p.variants || []).map((v: any) => v.title).filter(Boolean))];
      return {
        title: p.title,
        price: minPrice ? `$${Math.round(minPrice)}` : '',
        imageUrl: p.images?.[0]?.src || '',
        url: `${base}/products/${p.handle}`,
        tags: p.tags || [],
        productType: p.product_type || '',
        sizes: sizes.length ? sizes : ['One Size'],
        available: Boolean((p.variants || []).some((v: any) => v.available)),
      } as ScrapedProduct;
    });
  };

  try {
    const res = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, type }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (Array.isArray(json.products)) return json.products;

    // Failsafe: if backend returned generic shape, fetch Shopify feed directly.
    if (/\/products\.json(\?|$)/i.test(String(url))) {
      try {
        const direct = await fetch(url);
        if (!direct.ok) return [];
        const payload = await direct.json();
        if (Array.isArray(payload?.products)) return normalizeShopifyProducts(url, payload);
      } catch {
        return [];
      }
    }

    return [];
  } catch {
    return [];
  }
};

const scrapeStoreProducts = async (store: NearbyStore): Promise<ScrapedProduct[]> => {
  const allProducts: ScrapedProduct[] = [];
  const seenUrls = new Set<string>();

  const tryFeed = async (feedUrl: string) => {
    for (let page = 1; page <= 4; page += 1) {
      const pagedFeed = `${feedUrl}${feedUrl.includes('?') ? '&' : '?'}page=${page}`;
      const batch = await scrapeProductsViaApi(pagedFeed, 'shopify-products');
      if (!batch.length) break;
      for (const product of batch) {
        if (!product?.url || seenUrls.has(product.url)) continue;
        seenUrls.add(product.url);
        allProducts.push(product);
      }
      if (batch.length < 250) break;
    }
  };

  if (store.feedUrl) {
    await tryFeed(store.feedUrl);
    if (allProducts.length) return allProducts;
  }

  if (store.website) {
    const guessedFeed = `${store.website.replace(/\/$/, '')}/products.json?limit=250`;
    await tryFeed(guessedFeed);
    if (allProducts.length) return allProducts;

    const searched = await scrapeProductsViaApi(store.website, 'search');
    for (const product of searched) {
      if (!product?.url || seenUrls.has(product.url)) continue;
      seenUrls.add(product.url);
      allProducts.push(product);
    }
  }

  return allProducts;
};

const analyzeIntentDetailed = async (prompt: string, budget: number, location: string, uploads: UploadedWardrobeItem[]): Promise<IntentResult> => {
  try {
    const res = await fetch('/api/claude/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, budget, location, uploads }),
    });
    if (!res.ok) throw new Error('fallback');
    const json = await res.json();
    const intentSummary = typeof json.intentSummary === 'string' && json.intentSummary.trim()
      ? json.intentSummary.trim()
      : `Prompt: ${prompt}.`;
    const styleKeywords = Array.isArray(json.styleKeywords)
      ? json.styleKeywords.map((k: unknown) => String(k).trim()).filter(Boolean)
      : [];
    return { intentSummary, styleKeywords };
  } catch {
    const timing = /day|morning|sunny/i.test(prompt) ? 'daytime' : /night|evening|party/i.test(prompt) ? 'night-out' : 'all-day';
    return { intentSummary: `Prompt: ${prompt}. Intent: ${timing} outfit near ${location}.`, styleKeywords: [] };
  }
};

const toUserOwnedItem = (upload: UploadedWardrobeItem, location: string): CuratedOutfitItem => ({
  id: `wardrobe-${upload.id}`,
  category: upload.category,
  name: `Your ${upload.category}`,
  brand: 'Your Closet',
  price: 0,
  storeId: 'wardrobe',
  bgGradient: 'linear-gradient(135deg,#16213E,#1A1A2E)',
  emoji: CATEGORY_EMOJI[upload.category],
  textLight: true,
  sizes: ['Owned'],
  sku: `OWN-${upload.id.slice(-5).toUpperCase()}`,
  vibes: ['Streetwear', 'Y2K', 'Minimalist', 'Cottagecore', 'Dark Academia'],
  distanceKm: 0,
  stockLeft: 1,
  storeName: 'Your Closet',
  storeAddress: location,
  storeLocationLink: '#',
  externalLink: '#',
  source: 'user-wardrobe',
  isUserOwned: true,
  imageUrl: upload.previewUrl,
});

export const findOutfits = async ({
  prompt,
  budget,
  location,
  uploadedWardrobe,
  userLat,
  userLng,
}: OutfitSearchInput): Promise<OutfitSearchResult> => {
  const geo = (Number.isFinite(userLat) && Number.isFinite(userLng))
    ? { lat: userLat as number, lng: userLng as number, displayName: location }
    : (await geocodeLocation(location)) || { lat: -33.8688, lng: 151.2093, displayName: location || 'Sydney NSW' };

  const fixedStores: NearbyStore[] = KNOWN_STORES
    .map(store => ({
      ...store,
      distanceKm: Number(haversineKm(geo.lat, geo.lng, store.lat, store.lng).toFixed(1)),
      source: 'known' as const,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const discoveredStores = await discoverSydneyStores(geo.lat, geo.lng);
  const mergedStores: NearbyStore[] = [];
  const seenStoreKey = new Set<string>();
  for (const store of [...fixedStores, ...discoveredStores]) {
    const key = `${normalize(store.name)}|${store.lat.toFixed(3)}|${store.lng.toFixed(3)}`;
    if (seenStoreKey.has(key)) continue;
    seenStoreKey.add(key);
    mergedStores.push(store);
  }

  const intent = await analyzeIntentDetailed(prompt, budget, geo.displayName, uploadedWardrobe);
  const rankingTokens = [
    ...tokenize(prompt),
    ...tokenize(intent.intentSummary),
    ...intent.styleKeywords.flatMap(tokenize),
  ];

  const items: CuratedOutfitItem[] = [];
  for (const store of mergedStores.slice(0, 30)) {
    const scraped = await scrapeStoreProducts(store);
    for (const p of scraped) {
      const category = inferCategory(p);
      if (!category) continue;
      if (!p.imageUrl) continue;

      const price = parsePrice(p.price);
      const perItemBudget = Math.max(40, budget / 4);
      if (!price || price > Math.max(120, perItemBudget * 2.2)) continue;

      const tags = normalizeTagList(p.tags).join(' ');
      const haystack = `${normalize(p.title)} ${normalize(p.productType)} ${normalize(tags)}`;
      let score = 0;
      for (const token of rankingTokens) if (haystack.includes(token)) score += 2;
      if (category === 'top' && /(shirt|tee|t-shirt|blouse|polo)/i.test(haystack)) score += 7;
      if (category === 'shoes' && /(shoe|sneaker|boot|loafer|sandal)/i.test(haystack)) score += 5;
      if (price <= perItemBudget) score += 3;
      if (p.available !== false) score += 1;
      if (NON_OUTFIT_TERMS.some(term => haystack.includes(term))) score -= 10;

      items.push({
        id: `${store.id}-${normalize(p.title).replace(/[^a-z0-9]/g, '').slice(0, 20)}`,
        name: p.title,
        brand: store.name,
        price,
        storeId: store.id,
        bgGradient: 'linear-gradient(135deg,#3f1d68,#64288c)',
        emoji: CATEGORY_EMOJI[category],
        textLight: true,
        sizes: p.sizes?.length ? p.sizes : ['One Size'],
        sku: `${store.id}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        vibes: ['Streetwear', 'Y2K', 'Minimalist', 'Cottagecore', 'Dark Academia'],
        category,
        distanceKm: store.distanceKm,
        stockLeft: p.available === false ? 1 : 3,
        storeName: store.name,
        storeAddress: store.address,
        storeLocationLink: store.locationLink,
        storeLat: store.lat,
        storeLng: store.lng,
        externalLink: p.url,
        source: store.source === 'discovered' ? 'sydney-discovered-store-scrape' : 'fixed-store-scrape',
        imageUrl: p.imageUrl,
        _score: score,
      } as CuratedOutfitItem);
    }
  }

  const byCategory: Record<string, CuratedOutfitItem[]> = {};
  for (const category of CATEGORY_ORDER) {
    byCategory[category] = items
      .filter(i => i.category === category)
      .sort((a: any, b: any) => (b._score || 0) - (a._score || 0) || a.price - b.price)
      .slice(0, 4)
      .map(({ _score, ...rest }: any) => rest);
  }

  for (const upload of uploadedWardrobe) {
    byCategory[upload.category] = [toUserOwnedItem(upload, geo.displayName), ...(byCategory[upload.category] || [])].slice(0, 4);
  }

  const meta: OutfitSearchMeta = {
    analysedBy: 'claude-intent + sydney-wide-store-scrape',
    provider: 'known 4 stores + discovered Sydney stores (shopify/feed + website search)',
    intentSummary: intent.intentSummary,
    query: `${prompt} | ${geo.displayName} | ${budget}`,
    generatedAt: new Date().toISOString(),
    storeMarkers: mergedStores.slice(0, 80).map((store): SearchStoreMarker => ({
      id: store.id,
      name: store.name,
      address: store.address,
      lat: store.lat,
      lng: store.lng,
      locationLink: store.locationLink,
      distanceKm: store.distanceKm,
    })),
  };

  return { itemsByCategory: byCategory, meta };
};

export const analyzeIntent = async (prompt: string, budget: number, location: string, uploads: UploadedWardrobeItem[]) => {
  const intent = await analyzeIntentDetailed(prompt, budget, location, uploads);
  const keywords = intent.styleKeywords.length ? ` Keywords: ${intent.styleKeywords.join(', ')}.` : '';
  return `Prompt: ${prompt}. ${intent.intentSummary}${keywords}`;
};
