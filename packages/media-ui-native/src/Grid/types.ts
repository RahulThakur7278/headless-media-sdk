// ─────────────────────────────────────────────────────────
// media-ui-native/src/Grid/types.ts
// React Native Grid types — uses FlatList-style patterns
// ─────────────────────────────────────────────────────────

export interface UseGridOptions<T> {
  items: T[];
  hasMore: boolean;
  onLoadMore: () => void;
  numColumns?: number;
  /** Called to extract a unique key from each item */
  keyExtractor?: (item: T, index: number) => string;
}

export interface UseGridReturn<T> {
  /** Props compatible with React Native FlatList */
  getFlatListProps: () => {
    data: T[];
    numColumns: number;
    onEndReached: () => void;
    onEndReachedThreshold: number;
    keyExtractor: (item: T, index: number) => string;
  };
  items: T[];
}
