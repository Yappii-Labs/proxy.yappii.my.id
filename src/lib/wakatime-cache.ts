import { createHash } from 'node:crypto';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const STALE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const FETCH_TIMEOUT_MS = 10_000;

type CacheEntry<T = unknown> = {
  value: T;
  createdAt: number;
  expiresAt: number;
  staleAt: number;
};

const responseCache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<unknown>>();

function getCacheKey(url: string, token: string): string {
  return createHash('sha256')
    .update(token)
    .update('\0')
    .update(url)
    .digest('hex');
}

function cleanupCache() {
  const now = Date.now();

  for (const [key, entry] of responseCache) {
    if (entry.staleAt <= now) {
      responseCache.delete(key);
    }
  }

  while (responseCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;

    if (!oldestKey) break;

    responseCache.delete(oldestKey);
  }
}

function setCache<T>(key: string, value: T) {
  const now = Date.now();

  responseCache.delete(key);

  responseCache.set(key, {
    value,
    createdAt: now,
    expiresAt: now + CACHE_TTL_MS,
    staleAt: now + STALE_TTL_MS,
  });

  cleanupCache();
}

async function fetchFromWakaTime<T>(
  url: string,
  token: string,
  cacheKey: string,
): Promise<T> {
  const existingRequest = pendingRequests.get(cacheKey);

  if (existingRequest) {
    return existingRequest as Promise<T>;
  }

  const request = fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `WakaTime API returned ${response.status} ${response.statusText}`,
        );
      }

      const value = (await response.json()) as T;

      setCache(cacheKey, value);

      return value;
    })
    .finally(() => {
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, request);

  return request;
}

export async function fetchWakaTimeJson<T>(
  url: string,
  token: string,
): Promise<T> {
  const cacheKey = getCacheKey(url, token);
  const cached = responseCache.get(cacheKey);

  if (cached) {
    const now = Date.now();

    // Cache masih fresh
    if (cached.expiresAt > now) {
      return cached.value as T;
    }

    if (cached.staleAt > now) {
      void fetchFromWakaTime<T>(url, token, cacheKey).catch(() => {
      });

      return cached.value as T;
    }

    responseCache.delete(cacheKey);
  }

  return fetchFromWakaTime<T>(url, token, cacheKey);
}

export function clearWakaTimeCache() {
  responseCache.clear();
  pendingRequests.clear();
}