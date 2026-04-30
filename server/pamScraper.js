const STORES = [
  {
    id: 'pamsyd',
    name: 'P.A.M. Store Sydney',
    address: '304 Palmer St, Darlinghurst NSW 2010',
    lat: -33.8785,
    lng: 151.2135,
    type: 'boutique',
    dotColor: '#64288c',
    feedUrl: 'https://perksandmini.com/products.json',
    productUrlPrefix: 'https://perksandmini.com/products/',
  },
  {
    id: 'goeliasyd',
    name: 'GOELIA Fashion Sydney',
    address: 'Dymocks building, Suite2, Level 6/428 George St, Sydney NSW 2000',
    lat: -33.8736,
    lng: 151.2069,
    type: 'boutique',
    dotColor: '#213547',
    feedUrl: 'https://www.goelia1995.com/en-au/products.json',
    productUrlPrefix: 'https://www.goelia1995.com/en-au/products/',
  },
  {
    id: 'stilysyd',
    name: 'Sorry Thanks I Love You',
    address: 'Westfield Sydney, Cnr Pitt St Mall &, Market St, Sydney NSW 2000',
    lat: -33.8707,
    lng: 151.2072,
    type: 'boutique',
    dotColor: '#1e1e1e',
    feedUrl: 'https://sorrythanksiloveyou.com/products.json',
    productUrlPrefix: 'https://sorrythanksiloveyou.com/products/',
  },
  {
    id: 'socialoutfit',
    name: 'The Social Outfit',
    address: '188 King St, Newtown NSW 2042',
    lat: -33.8969,
    lng: 151.1798,
    type: 'boutique',
    dotColor: '#0f766e',
    feedUrl: 'https://thesocialoutfit.org/products.json',
    productUrlPrefix: 'https://thesocialoutfit.org/products/',
  },
];

const CATEGORY_ORDER = ['headgear', 'top', 'belt', 'bottom', 'shoes'];

const CATEGORY_EMOJI = {
  headgear: '🧢',
  top: '👕',
  belt: '🔗',
  bottom: '👖',
  shoes: '👟',
};

const NON_OUTFIT_TERMS = [
  'gift card',
  'incense',
  'fragrance',
  'perfume',
  'candle',
  'book',
  'magazine',
  'zine',
  'vinyl',
  'record',
  'poster',
  'sticker',
  'mug',
  'cup',
  'soap',
  'sock',
  'socks',
];

const normalize = text => String(text || '').toLowerCase();

const haversineKm = (aLat, aLng, bLat, bLng) => {
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const sa = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(sa), Math.sqrt(1 - sa));
};

const hashNumber = (seed, mod) => {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % mod;
};

const isWearableProduct = product => {
  const haystack = [
    normalize(product.title),
    normalize(product.product_type),
    ...(product.tags || []).map(t => normalize(t)),
  ].join(' ');
  return !NON_OUTFIT_TERMS.some(term => haystack.includes(term));
};

const inferCategory = product => {
  const haystack = [
    normalize(product.title),
    normalize(product.product_type),
    ...(product.tags || []).map(t => normalize(t)),
  ].join(' ');

  // top must be shirt-like products
  if (/(tee|t-shirt|shirt|blouse|polo|button[- ]?down|long sleeve shirt|short sleeve shirt)/i.test(haystack)) return 'top';
  if (/(hat|cap|beanie|beret|bucket)/i.test(haystack)) return 'headgear';
  if (/(belt)/i.test(haystack)) return 'belt';
  if (/(pant|pants|jeans|trouser|shorts?|skirt|denim)/i.test(haystack)) return 'bottom';
  if (/(shoe|shoes|sneaker|sneakers|boot|boots|loafer|runner|heel|sandals|footwear)/i.test(haystack) && !/(sock|socks)/i.test(haystack)) return 'shoes';

  return null;
};

const parseSizes = product => {
  const options = product.options || [];
  const sizeOption = options.find(opt => normalize(opt.name).includes('size'));
  if (sizeOption?.values?.length) return sizeOption.values;

  const variantTitles = [...new Set((product.variants || []).map(v => String(v.title || '').trim()))]
    .filter(v => v && normalize(v) !== 'default title');
  return variantTitles.length ? variantTitles : ['One Size'];
};

const parsePrice = product => {
  const prices = (product.variants || [])
    .map(v => Number.parseFloat(v.price))
    .filter(v => Number.isFinite(v) && v > 0);
  if (!prices.length) return 0;
  return Math.round(Math.min(...prices));
};

const computeStockLeft = product => {
  const variants = product.variants || [];
  const available = variants.filter(v => Boolean(v.available)).length;
  return Math.max(available, 1);
};

const buildCuratedItem = (product, store, location, userLat, userLng) => {
  const category = inferCategory(product);
  if (!category) return null;
  const price = parsePrice(product);
  if (!price) return null;
  const imageUrl = product.images && product.images[0] ? product.images[0].src : undefined;
  if (!imageUrl) return null;

  const fallbackSeed = `${product.id}-${location}-${store.id}`;
  const fallbackDistance = Number((0.6 + hashNumber(fallbackSeed, 95) / 10).toFixed(1));
  const distanceKm = Number.isFinite(userLat) && Number.isFinite(userLng)
    ? Number(haversineKm(userLat, userLng, store.lat, store.lng).toFixed(1))
    : fallbackDistance;

  return {
    id: `${store.id}-${product.id}`,
    name: product.title,
    brand: product.vendor || store.name,
    price,
    storeId: store.id,
    bgGradient: 'linear-gradient(135deg,#3f1d68,#64288c)',
    emoji: CATEGORY_EMOJI[category],
    textLight: true,
    sizes: parseSizes(product),
    sku: (product.variants && product.variants[0] && product.variants[0].sku) || `${store.id}-${product.id}`,
    vibes: ['Streetwear', 'Y2K', 'Minimalist', 'Cottagecore', 'Dark Academia'],
    category,
    distanceKm,
    stockLeft: computeStockLeft(product),
    storeName: store.name,
    storeAddress: store.address,
    storeLat: store.lat,
    storeLng: store.lng,
    externalLink: `${store.productUrlPrefix}${product.handle}`,
    source: 'sydney-multi-store-scrape',
    imageUrl,
  };
};

const scoreProduct = (item, intentText, promptText, budgetPerItem, category) => {
  const haystack = `${normalize(item.name)} ${normalize(item.brand)} ${normalize(item.category)}`;
  const query = `${normalize(intentText)} ${normalize(promptText)}`.trim();
  const queryTokens = query.split(/\s+/).filter(token => token.length > 2);

  let score = 0;
  for (const token of queryTokens) {
    if (haystack.includes(token)) score += 2;
  }
  if (category === 'top' && /(shirt|tee|t-shirt|blouse)/i.test(haystack)) score += 5;
  if (category === 'shoes' && /(shoe|sneaker|boot|loafer|sandals)/i.test(haystack)) score += 4;
  if (item.price > 0 && item.price <= budgetPerItem) score += 5;
  if (item.price > budgetPerItem * 1.6) score -= 3;
  if (item.stockLeft > 1) score += 1;
  return score;
};

const fetchStoreProducts = async store => {
  const all = [];
  for (let page = 1; page <= 10; page += 1) {
    const glue = store.feedUrl.includes('?') ? '&' : '?';
    const url = `${store.feedUrl}${glue}limit=250&page=${page}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${store.name} scrape failed: ${response.status}`);
    const json = await response.json();
    const products = json.products || [];
    all.push(...products);
    if (products.length < 250) break;
  }
  return all;
};

const fallbackItem = (category, store) => ({
  id: `default-${category}-${store.id}`,
  name: category === 'top' ? 'Classic Shirt' : category === 'shoes' ? 'Classic Sneakers' : `Recommended ${category}`,
  brand: store.name,
  price: 90,
  storeId: store.id,
  bgGradient: 'linear-gradient(135deg,#3f1d68,#64288c)',
  emoji: CATEGORY_EMOJI[category],
  textLight: true,
  sizes: ['S', 'M', 'L'],
  sku: `DEFAULT-${category.toUpperCase()}`,
  vibes: ['Streetwear', 'Y2K', 'Minimalist', 'Cottagecore', 'Dark Academia'],
  category,
  distanceKm: 3.2,
  stockLeft: 2,
  storeName: store.name,
  storeAddress: store.address,
  storeLat: store.lat,
  storeLng: store.lng,
  externalLink: store.productUrlPrefix,
  source: 'default-fallback',
  imageUrl: undefined,
})

const buildGroupedResults = (allItems, intentSummary, prompt, budget) => {
  const budgetPerItem = Math.max(40, Math.floor((Number(budget) || 240) / 4));
  const grouped = {};

  for (const category of CATEGORY_ORDER) {
    const candidates = allItems
      .filter(item => item.category === category)
      .map(item => ({ item, score: scoreProduct(item, intentSummary, prompt, budgetPerItem, category) }))
      .sort((a, b) => b.score - a.score || a.item.price - b.item.price)
      .slice(0, 4)
      .map(row => row.item);

    grouped[category] = candidates.length ? candidates : [fallbackItem(category, STORES[0])];
  }
  return grouped;
};

const recommendSydneyProducts = async ({ prompt, intentSummary, budget = 220, location = 'Sydney, NSW', userLat, userLng }) => {
  const productBatches = await Promise.all(STORES.map(store => fetchStoreProducts(store)));
  const allItems = [];

  productBatches.forEach((products, index) => {
    const store = STORES[index];
    for (const product of products) {
      if (!isWearableProduct(product)) continue;
      const item = buildCuratedItem(product, store, location, userLat, userLng);
      if (item) allItems.push(item);
    }
  });

  return {
    stores: STORES,
    totalScraped: allItems.length,
    itemsByCategory: buildGroupedResults(allItems, intentSummary, prompt, budget),
  };
};

module.exports = {
  STORES,
  recommendSydneyProducts,
};
