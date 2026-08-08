// ─────────────────────────────────────────────────────────
// media-core/src/cache.ts
// In-memory LRU-style cache with TTL + request deduplication
// ─────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class RequestCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private inflight = new Map<string, Promise<unknown>>();
  private readonly ttl: number;
  private readonly maxEntries: number;

  constructor(ttl = 300_000, maxEntries = 100) {
    this.ttl = ttl;
    this.maxEntries = maxEntries;
  }

  /**
   * Generate a deterministic cache key from endpoint + params.
   */
  static makeKey(endpoint: string, params?: Record<string, unknown>): string {
    const paramStr = params
      ? Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}=${v}`)
          .join('&')
      : '';
    return `${endpoint}${paramStr ? '?' + paramStr : ''}`;
  }

  /**
   * Get a cached value if it exists and hasn't expired.
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  /**
   * Store a value in the cache.
   */
  set<T>(key: string, data: T): void {
    // Evict oldest entry if at capacity
    if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + this.ttl,
    });
  }

  /**
   * Request deduplication — if the same request is already in-flight,
   * return the existing promise instead of firing a new one.
   */
  async dedupe<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;

    // Check if request is already in-flight
    const existing = this.inflight.get(key);
    if (existing) return existing as Promise<T>;

    // Fire new request
    const promise = fetcher()
      .then((data) => {
        this.set(key, data);
        return data;
      })
      .finally(() => {
        this.inflight.delete(key);
      });

    this.inflight.set(key, promise);
    return promise;
  }

  /**
   * Invalidate a specific cache entry.
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear the entire cache.
   */
  clear(): void {
    this.cache.clear();
    this.inflight.clear();
  }
}
