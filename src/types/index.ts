export type ParsedIcSpec = {
  manufacturer?: string;
  productType?: string;
  componentCategory?: 'storage-only' | 'ram-only' | 'ram+storage';
  interfaceType?: string; // e.g., eMMC, UFS, LPDDR4X
  storageCapacityGB?: string; // optional explicit capacity
  storageCapacityGbit?: string; // optional explicit capacity in Gbit
  ramCapacityGB?: string; // optional explicit RAM capacity
  dramTypeCapacity?: string;
  estorageTypeCapacity?: string;
  totalEmcpCapacity?: string;
  dramSpeed?: string;
  packageType?: string;
  status?: string;
  models?: string[];
  ram?: string;
  storage?: string;
  chipset?: string;
  dramType?: string;
  releaseYear?: string;
};

export type GeminiRawResponse = unknown;

export type RootStackParamList = {
  Search: { icFromCamera?: string; lastImageUri?: string } | undefined;
  Results: { ic: string; parsed: ParsedIcSpec; text: string };
  Camera: undefined;
};
