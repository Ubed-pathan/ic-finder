declare module 'expo-asset' {
  export class Asset {
    localUri?: string | null;
    static fromModule(moduleId: number): Asset;
    static fromURI(uri: string): Asset;
    downloadAsync(): Promise<void>;
  }
}
