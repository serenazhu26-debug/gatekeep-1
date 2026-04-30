import { create } from 'zustand';
import { outfitItems, CATEGORY_ORDER } from '@/lib/data/outfitItems';
import { CuratedOutfitItem, OutfitSearchMeta, UploadedWardrobeItem } from '@/lib/types';

interface LayerState {
  currentIndex: number;
  locked: boolean;
}

interface AppStore {
  eventPrompt: string;
  budget: number;
  location: string;
  layers: Record<string, LayerState>;
  curatedOutfits: Record<string, CuratedOutfitItem[]>;
  searchMeta: OutfitSearchMeta | null;
  uploadedWardrobe: UploadedWardrobeItem[];

  setEventPrompt: (p: string) => void;
  setBudget: (b: number) => void;
  setBudgetFriendlyOutfit: (b: number) => void;
  setLocation: (l: string) => void;
  setCuratedOutfits: (items: Record<string, CuratedOutfitItem[]>) => void;
  setSearchMeta: (meta: OutfitSearchMeta | null) => void;
  setUploadedWardrobe: (items: UploadedWardrobeItem[]) => void;
  resetLayersForResults: () => void;
  setOutfitBySavedItemIds: (itemIds: string[]) => void;
  swipeLayer: (category: string, direction: 'left' | 'right') => void;
  toggleLock: (category: string) => void;
  getTotalCost: () => number;
}

const initialLayers = () => {
  const layers: Record<string, LayerState> = {};
  for (const cat of CATEGORY_ORDER) {
    layers[cat] = { currentIndex: 0, locked: false };
  }
  return layers;
};

const initialCuratedOutfits = () => {
  const curated: Record<string, CuratedOutfitItem[]> = {};
  for (const cat of CATEGORY_ORDER) {
    curated[cat] = [];
  }
  return curated;
};

const getItemsForCategory = (
  state: Pick<AppStore, 'curatedOutfits' | 'layers' | 'searchMeta'>,
  category: string
) => {
  if (state.searchMeta) return state.curatedOutfits[category] || [];
  if (state.curatedOutfits[category]?.length) return state.curatedOutfits[category];
  return outfitItems[category] || [];
};

const getBudgetFriendlyLayers = (budget: number) => {
  const combos = CATEGORY_ORDER.reduce(
    (acc, cat) => acc.flatMap(combo => (outfitItems[cat] || []).map((item, index) => ({
      indexes: { ...combo.indexes, [cat]: index },
      total: combo.total + item.price,
    }))),
    [{ indexes: {} as Record<string, number>, total: 0 }]
  );

  const affordable = combos.filter(combo => combo.total <= budget);
  const best = (affordable.length ? affordable : combos).reduce((winner, combo) => {
    if (affordable.length) return combo.total > winner.total ? combo : winner;
    return combo.total < winner.total ? combo : winner;
  });

  const layers: Record<string, LayerState> = {};
  for (const cat of CATEGORY_ORDER) {
    layers[cat] = { currentIndex: best.indexes[cat] ?? 0, locked: false };
  }
  return layers;
};

export const useAppStore = create<AppStore>((set, get) => ({
  eventPrompt: '',
  budget: 200,
  location: 'Sydney NSW',
  layers: initialLayers(),
  curatedOutfits: initialCuratedOutfits(),
  searchMeta: null,
  uploadedWardrobe: [],

  setEventPrompt: (p) => set({ eventPrompt: p }),
  setBudget: (b) => set({ budget: b }),
  setBudgetFriendlyOutfit: (b) => set({ budget: b, layers: getBudgetFriendlyLayers(b) }),
  setLocation: (l) => set({ location: l }),
  setCuratedOutfits: (items) => set({ curatedOutfits: items }),
  setSearchMeta: (meta) => set({ searchMeta: meta }),
  setUploadedWardrobe: (items) => set({ uploadedWardrobe: items }),
  resetLayersForResults: () => set({ layers: initialLayers() }),
  setOutfitBySavedItemIds: (itemIds) => {
    const state = get();
    const layers = { ...state.layers };
    for (const cat of CATEGORY_ORDER) {
      const items = getItemsForCategory(state, cat);
      const index = items.findIndex(item => itemIds.includes(item.id) || itemIds.includes(`${cat}-${item.id}`));
      if (index >= 0) layers[cat] = { ...layers[cat], currentIndex: index };
    }
    set({ layers });
  },

  swipeLayer: (category, direction) => {
    const state = get();
    const layer = state.layers[category];
    if (!layer || layer.locked) return;
    const items = getItemsForCategory(state, category);
    const len = items.length;
    if (len === 0) return;
    const next = direction === 'right'
      ? (layer.currentIndex + 1) % len
      : (layer.currentIndex - 1 + len) % len;
    set({ layers: { ...state.layers, [category]: { ...layer, currentIndex: next } } });
  },

  toggleLock: (category) => {
    const { layers } = get();
    const layer = layers[category];
    if (!layer) return;
    set({ layers: { ...layers, [category]: { ...layer, locked: !layer.locked } } });
  },

  getTotalCost: () => {
    const state = get();
    return CATEGORY_ORDER.reduce((sum, cat) => {
      const items = getItemsForCategory(state, cat);
      const item = items?.[state.layers[cat]?.currentIndex ?? 0];
      return sum + (item?.price ?? 0);
    }, 0);
  },
}));
