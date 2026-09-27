import { createHash } from 'node:crypto';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 500;

type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

const responseCache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<unknown>>();

export function clearWakaTimeCache() {
  responseCache.clear();
  pendingRequests.clear();
}

export async function fetchWakaTimeJson<T>(url: string, token: string): Promise<T> {
  const cacheKey = createHash('sha256')
    .update(token)
    .update('\0')
    .update(url)
    .digest('hex');
  const cached = responseCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T;
  }
  if (cached) responseCache.delete(cacheKey);

  const pending = pendingRequests.get(cacheKey);
  if (pending) return pending as Promise<T>;

  const request = fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(token).toString('base64')}`,
    },
  })
    .then(async (response) => {
      const value = (await response.json()) as T;

      if (response.ok) {
        for (const [key, entry] of responseCache) {
          if (entry.expiresAt <= Date.now()) responseCache.delete(key);
        }
        if (responseCache.size >= MAX_CACHE_ENTRIES) {
          const oldestKey = responseCache.keys().next().value;
          if (oldestKey) responseCache.delete(oldestKey);
        }
        responseCache.set(cacheKey, {
          value,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });
      }

      return value;
    })
    .finally(() => pendingRequests.delete(cacheKey));

  pendingRequests.set(cacheKey, request);
  return request;
}