import { create } from 'zustand';
import { outfitItems, CATEGORY_ORDER } from '@/lib/data/outfitItems';

interface LayerState {
  currentIndex: number;
  locked: boolean;
}

interface AppStore {
  eventPrompt: string;
  budget: number;
  layers: Record<string, LayerState>;

  setEventPrompt: (p: string) => void;
  setBudget: (b: number) => void;
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

export const useAppStore = create<AppStore>((set, get) => ({
  eventPrompt: '',
  budget: 200,
  layers: initialLayers(),

  setEventPrompt: (p) => set({ eventPrompt: p }),
  setBudget: (b) => set({ budget: b }),

  swipeLayer: (category, direction) => {
    const { layers } = get();
    const layer = layers[category];
    if (layer.locked) return;
    const items = outfitItems[category] || [];
    const len = items.length;
    const next =
      direction === 'right'
        ? (layer.currentIndex + 1) % len
        : (layer.currentIndex - 1 + len) % len;
    set({ layers: { ...layers, [category]: { ...layer, currentIndex: next } } });
  },

  toggleLock: (category) => {
    const { layers } = get();
    const layer = layers[category];
    set({ layers: { ...layers, [category]: { ...layer, locked: !layer.locked } } });
  },

  getTotalCost: () => {
    const { layers } = get();
    return CATEGORY_ORDER.reduce((sum, cat) => {
      const item = outfitItems[cat]?.[layers[cat]?.currentIndex ?? 0];
      return sum + (item?.price ?? 0);
    }, 0);
  },
}));
