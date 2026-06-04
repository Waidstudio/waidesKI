// Shared in-memory live price store.
// Updated by useMarketData on every fetch; read by signal-engine so signals
// always reflect the latest CoinGecko / forex / stock price.

const livePrices = new Map<string, number>();
const listeners = new Set<(prices: Record<string, number>) => void>();

function notify() {
  const snap = Object.fromEntries(livePrices);
  listeners.forEach(l => { try { l(snap); } catch {} });
}

/** Subscribe to live price broadcasts. Returns unsubscribe. */
export function subscribeLivePrices(cb: (prices: Record<string, number>) => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

/** Force a broadcast to all listeners — called after each batch fetch completes. */
export function broadcastLivePrices() { notify(); }

function normalizeKey(asset: string): string {
  // Accept "BTC", "BTC/USD", "btc-usd" — collapse to canonical
  const a = asset.toUpperCase().replace(/[-_\s]/g, '/');
  if (a.includes('/')) return a;
  return `${a}/USD`;
}

export function setLivePrice(asset: string, price: number) {
  if (!Number.isFinite(price) || price <= 0) return;
  livePrices.set(normalizeKey(asset), price);
  // Also store the bare symbol for forex pairs without /USD
  livePrices.set(asset.toUpperCase(), price);
}

export function getLivePrice(asset: string): number | undefined {
  const k = normalizeKey(asset);
  return livePrices.get(k) ?? livePrices.get(asset.toUpperCase());
}

export function getAllLivePrices(): Record<string, number> {
  return Object.fromEntries(livePrices);
}