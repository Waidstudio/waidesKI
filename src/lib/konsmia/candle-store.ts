// In-memory candle store backed by the `market-data-candles` edge function.
// Components / engines call `getCandles(asset, tf)` synchronously; if cold,
// returns [] and triggers a background fetch that broadcasts to listeners.

import { supabase } from '@/integrations/supabase/client';
import type { Candle } from './indicators';

type Key = string; // `${asset}|${tf}`
const cache = new Map<Key, { candles: Candle[]; fetchedAt: number }>();
const pending = new Set<Key>();
const listeners = new Set<() => void>();
const TTL_MS = 60_000;

function key(asset: string, tf: string): Key { return `${asset}|${tf}`; }

function notify() { listeners.forEach(l => { try { l(); } catch {} }); }

export function subscribeCandles(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getCandles(asset: string, tf: string = '1h'): Candle[] {
  const k = key(asset, tf);
  const hit = cache.get(k);
  if (!hit || Date.now() - hit.fetchedAt > TTL_MS) {
    fetchCandlesAsync(asset, tf);
  }
  return hit?.candles ?? [];
}

export async function fetchCandlesAsync(asset: string, tf: string = '1h'): Promise<Candle[]> {
  const k = key(asset, tf);
  if (pending.has(k)) return cache.get(k)?.candles ?? [];
  pending.add(k);
  try {
    const { data, error } = await supabase.functions.invoke('market-data-candles', {
      body: { asset, timeframe: tf },
    });
    if (error) throw error;
    const candles: Candle[] = Array.isArray(data?.candles) ? data.candles : [];
    cache.set(k, { candles, fetchedAt: Date.now() });
    notify();
    return candles;
  } catch (e) {
    console.warn('candle fetch failed', asset, tf, e);
    return cache.get(k)?.candles ?? [];
  } finally {
    pending.delete(k);
  }
}

/** Warm multiple assets at once. */
export async function warmCandles(assets: string[], tf: string = '1h') {
  await Promise.all(assets.map(a => fetchCandlesAsync(a, tf)));
}