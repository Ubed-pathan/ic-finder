import { create } from 'zustand';

export type SearchResult = {
  ic: string;
  model?: string;
  manufacturer?: string;
  releaseDate?: string;
  ram?: string;
  storage?: string;
  chipset?: string;
  models?: string[];
  releaseYear?: string;
  dramType?: string; // e.g., LPDDR3/LPDDR4X
  productType?: string;
  componentCategory?: 'storage-only' | 'ram-only' | 'ram+storage';
  interfaceType?: string;
  storageCapacityGB?: string;
  storageCapacityGbit?: string;
  ramCapacityGB?: string;
  dramTypeCapacity?: string;
  estorageTypeCapacity?: string;
  totalEmcpCapacity?: string;
  dramSpeed?: string;
  packageType?: string;
  status?: string;
  specs?: Record<string, string>;
  text?: string; // raw text response for reuse
};

export type StoreState = {
  history: SearchResult[];
  loading: boolean;
  error?: string;
  addResult: (r: SearchResult) => void;
  removeResult: (ic: string) => void;
  clearHistory: () => void;
  setLoading: (v: boolean) => void;
  setError: (e?: string) => void;
};

export const useAppStore = create<StoreState>((set) => ({
  history: [],
  loading: false,
  error: undefined,
  addResult: (r: SearchResult) => set((s: StoreState) => {
    // de-duplicate by IC, put newest on top
    const filtered = s.history.filter(h => h.ic.toLowerCase() !== r.ic.toLowerCase());
    return { history: [r, ...filtered].slice(0, 25) };
  }),
  removeResult: (ic: string) => set((s: StoreState) => ({ history: s.history.filter(h => h.ic.toLowerCase() !== ic.toLowerCase()) })),
  clearHistory: () => set(() => ({ history: [] })),
  setLoading: (v: boolean) => set(() => ({ loading: v })),
  setError: (e?: string) => set(() => ({ error: e }))
}));
