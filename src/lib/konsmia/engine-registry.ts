// Engine Connector Registry
// Maps each Tredbeing engine to its exact asset universe, timeframes,
// upstream market-data feed, and the sandbox endpoint that executes its plans.
// This is the single source of truth for "what an engine is wired to".

import { supabase } from '@/integrations/supabase/client';
import type { TredEngine, TredTimeframe } from './tredbeings';

export type FeedSource = 'coingecko' | 'fx-sim' | 'stock-sim';

export interface EngineConnector {
  engine: TredEngine;
  assetClass: 'crypto' | 'forex' | 'stock';
  assets: string[];
  timeframes: TredTimeframe[];
  feed: FeedSource;
  /** Symbols expected to appear in market_data_cache.symbol */
  feedSymbols: string[];
  /** Edge function / table the sandbox uses to record execution */
  sandboxEndpoint: string;
  /** Realtime tables this engine reacts to */
  realtimeTables: string[];
}

export const CRYPTO_ASSETS = ['BTC/USD', 'ETH/USD', 'SOL/USD'];
export const FX_ASSETS = ['EUR/USD', 'GBP/USD', 'USD/JPY'];
export const STOCK_ASSETS = ['AAPL', 'TSLA', 'NVDA'];

const CRYPTO_TFS: TredTimeframe[] = ['5m','15m','30m','1H','4H','12H','1D','3D','1W'];
const FX_TFS:     TredTimeframe[] = ['5m','15m','30m','1H','4H','1D','1W','2W'];
const STOCK_TFS:  TredTimeframe[] = ['15m','30m','1H','4H','1D','1W','1M'];

export const ENGINE_REGISTRY: Record<TredEngine, EngineConnector> = {
  'WaidBot':     { engine: 'WaidBot',     assetClass: 'crypto', assets: CRYPTO_ASSETS, timeframes: CRYPTO_TFS, feed: 'coingecko', feedSymbols: ['BTC','ETH','SOL'], sandboxEndpoint: 'sandbox_trades', realtimeTables: ['market_data_cache','sandbox_trades'] },
  'WaidBot Pro': { engine: 'WaidBot Pro', assetClass: 'crypto', assets: CRYPTO_ASSETS, timeframes: ['1H','4H','12H','1D','3D','1W','2W','1M','3M'], feed: 'coingecko', feedSymbols: ['BTC','ETH','SOL'], sandboxEndpoint: 'sandbox_trades', realtimeTables: ['market_data_cache','sandbox_trades'] },
  'TredFlux':    { engine: 'TredFlux',    assetClass: 'crypto', assets: CRYPTO_ASSETS, timeframes: CRYPTO_TFS, feed: 'coingecko', feedSymbols: ['BTC','ETH','SOL'], sandboxEndpoint: 'sandbox_trades', realtimeTables: ['market_data_cache','sandbox_trades'] },
  'TredSpot':    { engine: 'TredSpot',    assetClass: 'crypto', assets: CRYPTO_ASSETS, timeframes: ['30m','1H','4H','1D','3D','1W'], feed: 'coingecko', feedSymbols: ['BTC','ETH','SOL'], sandboxEndpoint: 'sandbox_trades', realtimeTables: ['market_data_cache','sandbox_trades'] },
  'TredGem':     { engine: 'TredGem',     assetClass: 'forex',  assets: FX_ASSETS,     timeframes: FX_TFS,     feed: 'fx-sim',    feedSymbols: ['EURUSD','GBPUSD','USDJPY'], sandboxEndpoint: 'sandbox_trades', realtimeTables: ['sandbox_trades'] },
  'TredGaze':    { engine: 'TredGaze',    assetClass: 'stock',  assets: STOCK_ASSETS,  timeframes: STOCK_TFS,  feed: 'stock-sim', feedSymbols: ['AAPL','TSLA','NVDA'], sandboxEndpoint: 'sandbox_trades', realtimeTables: ['sandbox_trades'] },
};

export function connectorFor(engine: TredEngine): EngineConnector {
  return ENGINE_REGISTRY[engine];
}

/** Bucket boundary for a given timeframe (ms since epoch, floored to TF). */
const TF_MS: Record<TredTimeframe, number> = {
  '5m': 5*60_000, '15m': 15*60_000, '30m': 30*60_000,
  '1H': 60*60_000, '4H': 4*60*60_000, '12H': 12*60*60_000,
  '1D': 24*60*60_000, '3D': 3*24*60*60_000, '1W': 7*24*60*60_000,
  '2W': 14*24*60*60_000, '1M': 30*24*60*60_000, '3M': 90*24*60*60_000, '6M': 180*24*60*60_000,
};
export function candleBucket(timeframe: TredTimeframe, at: number = Date.now()): number {
  const ms = TF_MS[timeframe];
  return Math.floor(at / ms);
}
export function nextCandleCloseAt(timeframe: TredTimeframe, at: number = Date.now()): number {
  const ms = TF_MS[timeframe];
  return (Math.floor(at / ms) + 1) * ms;
}

export interface FeedHealth {
  engine: TredEngine;
  feed: FeedSource;
  symbol: string;
  lastFetch: Date | null;
  ageMs: number;
  status: 'live' | 'stale' | 'offline';
}

/** Pull the latest updated_at per symbol the engine watches and classify it. */
export async function getEngineFeedHealth(engine: TredEngine): Promise<FeedHealth[]> {
  const conn = ENGINE_REGISTRY[engine];
  const now = Date.now();
  // Crypto: real DB rows. FX/stocks: simulated — use process tick.
  if (conn.feed === 'coingecko') {
    const { data } = await supabase
      .from('market_data_cache')
      .select('symbol, updated_at')
      .in('symbol', conn.feedSymbols);
    return conn.feedSymbols.map(sym => {
      const row = data?.find(r => r.symbol === sym);
      const lastFetch = row?.updated_at ? new Date(row.updated_at) : null;
      const ageMs = lastFetch ? now - lastFetch.getTime() : Infinity;
      const status: FeedHealth['status'] =
        !lastFetch ? 'offline' : ageMs < 90_000 ? 'live' : ageMs < 5*60_000 ? 'stale' : 'offline';
      return { engine, feed: conn.feed, symbol: sym, lastFetch, ageMs, status };
    });
  }
  // Simulated feeds — always considered live while the app is running
  return conn.feedSymbols.map(sym => ({
    engine, feed: conn.feed, symbol: sym,
    lastFetch: new Date(), ageMs: 0, status: 'live',
  }));
}