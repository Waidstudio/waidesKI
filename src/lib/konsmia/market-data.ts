import type { MarketData } from './types';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export async function fetchCryptoData(): Promise<MarketData[]> {
  try {
    const res = await fetch(
      `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`
    );
    if (!res.ok) throw new Error('CoinGecko API error');
    const data = await res.json();
    return data.map((coin: any) => ({
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
  } catch (err) {
    console.error('Failed to fetch crypto data:', err);
    return getSimulatedCryptoData();
  }
}

export function getSimulatedCryptoData(): MarketData[] {
  const assets = [
    { symbol: 'BTC', name: 'Bitcoin', base: 67500 },
    { symbol: 'ETH', name: 'Ethereum', base: 3450 },
    { symbol: 'SOL', name: 'Solana', base: 178 },
    { symbol: 'XRP', name: 'Ripple', base: 0.62 },
    { symbol: 'ADA', name: 'Cardano', base: 0.45 },
  ];
  return assets.map(a => {
    const change = (Math.random() - 0.5) * 10;
    const price = a.base * (1 + change / 100);
    return {
      symbol: a.symbol,
      name: a.name,
      price,
      change24h: change,
      volume24h: Math.random() * 5e9,
      high24h: price * 1.02,
      low24h: price * 0.98,
      marketCap: price * 1e7,
      sparkline: Array.from({ length: 24 }, (_, i) => a.base * (1 + Math.sin(i / 3) * 0.02 + (Math.random() - 0.5) * 0.01)),
    };
  });
}

export function getSimulatedForexData(): MarketData[] {
  const pairs = [
    { symbol: 'EUR/USD', name: 'Euro / US Dollar', base: 1.0856 },
    { symbol: 'GBP/USD', name: 'British Pound / US Dollar', base: 1.2674 },
    { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', base: 151.32 },
    { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', base: 0.6542 },
    { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', base: 0.8892 },
  ];
  return pairs.map(p => {
    const change = (Math.random() - 0.5) * 2;
    const price = p.base * (1 + change / 100);
    return {
      symbol: p.symbol,
      name: p.name,
      price,
      change24h: change,
      volume24h: Math.random() * 1e10,
      high24h: price * 1.005,
      low24h: price * 0.995,
      sparkline: Array.from({ length: 24 }, (_, i) => p.base * (1 + Math.sin(i / 4) * 0.003 + (Math.random() - 0.5) * 0.001)),
    };
  });
}
