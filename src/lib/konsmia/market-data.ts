import type { MarketData } from './types';
import { supabase } from '@/integrations/supabase/client';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Price state for continuity between refreshes
let priceState: Record<string, { price: number; sparkline: number[] }> = {};
let lastFetchTime = 0;
const MIN_FETCH_INTERVAL = 30_000; // 30 seconds minimum between fetches

export async function fetchCryptoData(): Promise<MarketData[]> {
  const now = Date.now();

  // Try edge function first (server-side cached)
  try {
    const { data, error } = await supabase.functions.invoke('market-data');
    if (!error && data?.data?.length > 0) {
      const mapped = data.data.map((item: any) => ({
        symbol: item.symbol,
        name: item.name,
        price: Number(item.price),
        change24h: Number(item.change_24h ?? item.change24h ?? 0),
        volume24h: Number(item.volume_24h ?? item.volume24h ?? 0),
        high24h: Number(item.high_24h ?? item.high24h ?? 0),
        low24h: Number(item.low_24h ?? item.low24h ?? 0),
        marketCap: Number(item.market_cap ?? item.marketCap ?? 0),
        sparkline: Array.isArray(item.sparkline) ? item.sparkline : [],
      }));
      // Update price state
      mapped.forEach((m: MarketData) => {
        priceState[m.symbol] = { price: m.price, sparkline: m.sparkline ?? [] };
      });
      lastFetchTime = now;
      return mapped;
    }
  } catch (e) {
    console.warn('Edge function unavailable, falling back to direct API:', e);
  }

  // Rate limit client-side fetches
  if (now - lastFetchTime < MIN_FETCH_INTERVAL && Object.keys(priceState).length > 0) {
    return getSimulatedCryptoData(); // Return evolved prices
  }

  // Direct CoinGecko fallback
  try {
    const res = await fetch(
      `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`
    );
    if (!res.ok) throw new Error(`CoinGecko: ${res.status}`);
    const data = await res.json();
    const mapped = data.map((coin: any) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h ?? 0,
      volume24h: coin.total_volume,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
      marketCap: coin.market_cap,
      sparkline: coin.sparkline_in_7d?.price?.slice(-24) ?? [],
    }));
    mapped.forEach((m: MarketData) => {
      priceState[m.symbol] = { price: m.price, sparkline: m.sparkline ?? [] };
    });
    lastFetchTime = now;
    return mapped;
  } catch (err) {
    console.error('CoinGecko fetch failed:', err);
    return getSimulatedCryptoData();
  }
}

// Evolving simulated data — maintains continuity between calls
export function getSimulatedCryptoData(): MarketData[] {
  const assets = [
    { symbol: 'BTC', name: 'Bitcoin', base: 67500 },
    { symbol: 'ETH', name: 'Ethereum', base: 3450 },
    { symbol: 'SOL', name: 'Solana', base: 178 },
    { symbol: 'XRP', name: 'Ripple', base: 0.62 },
    { symbol: 'ADA', name: 'Cardano', base: 0.45 },
  ];
  return assets.map(a => {
    const prev = priceState[a.symbol];
    const basePrice = prev?.price ?? a.base;
    // Small random walk — ±0.3% per tick for continuity
    const drift = (Math.random() - 0.5) * 0.006;
    const price = basePrice * (1 + drift);
    const change = prev ? ((price - a.base) / a.base) * 100 : (Math.random() - 0.5) * 5;

    // Evolve sparkline
    const prevSparkline = prev?.sparkline ?? Array.from({ length: 24 }, () => a.base);
    const sparkline = [...prevSparkline.slice(1), price];

    priceState[a.symbol] = { price, sparkline };

    return {
      symbol: a.symbol,
      name: a.name,
      price,
      change24h: change,
      volume24h: Math.random() * 5e9,
      high24h: Math.max(price, ...sparkline),
      low24h: Math.min(price, ...sparkline),
      marketCap: price * 1e7,
      sparkline,
    };
  });
}

// Forex data with price continuity
let forexState: Record<string, { price: number; sparkline: number[] }> = {};

export function getSimulatedForexData(): MarketData[] {
  const pairs = [
    { symbol: 'EUR/USD', name: 'Euro / US Dollar', base: 1.0856 },
    { symbol: 'GBP/USD', name: 'British Pound / US Dollar', base: 1.2674 },
    { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', base: 151.32 },
    { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', base: 0.6542 },
    { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', base: 0.8892 },
  ];
  return pairs.map(p => {
    const prev = forexState[p.symbol];
    const basePrice = prev?.price ?? p.base;
    const drift = (Math.random() - 0.5) * 0.002; // Forex moves less
    const price = basePrice * (1 + drift);
    const change = prev ? ((price - p.base) / p.base) * 100 : (Math.random() - 0.5) * 1;

    const prevSparkline = prev?.sparkline ?? Array.from({ length: 24 }, () => p.base);
    const sparkline = [...prevSparkline.slice(1), price];

    forexState[p.symbol] = { price, sparkline };

    return {
      symbol: p.symbol,
      name: p.name,
      price,
      change24h: change,
      volume24h: Math.random() * 1e10,
      high24h: Math.max(price, ...sparkline),
      low24h: Math.min(price, ...sparkline),
      sparkline,
    };
  });
}

export function getDataFreshness(): { lastFetch: number; ageMs: number; isStale: boolean } {
  const age = Date.now() - lastFetchTime;
  return { lastFetch: lastFetchTime, ageMs: age, isStale: age > 120_000 };
}
