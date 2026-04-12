import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCryptoData, getSimulatedForexData, getDataFreshness } from '@/lib/konsmia/market-data';
import type { MarketData } from '@/lib/konsmia/types';

interface UseMarketDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // ms
  includeFx?: boolean;
}

interface MarketDataState {
  cryptoData: MarketData[];
  forexData: MarketData[];
  loading: boolean;
  lastUpdate: Date;
  dataAge: number; // ms since last fetch
  isStale: boolean;
  source: string;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMarketData(options: UseMarketDataOptions = {}): MarketDataState {
  const { autoRefresh = true, refreshInterval = 30_000, includeFx = true } = options;
  const [cryptoData, setCryptoData] = useState<MarketData[]>([]);
  const [forexData, setForexData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [dataAge, setDataAge] = useState(0);
  const [isStale, setIsStale] = useState(false);
  const [source, setSource] = useState('initializing');
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const ageIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const crypto = await fetchCryptoData();
      setCryptoData(crypto);
      if (includeFx) {
        setForexData(getSimulatedForexData());
      }
      setLastUpdate(new Date());
      const freshness = getDataFreshness();
      setIsStale(freshness.isStale);
      setDataAge(freshness.ageMs);
      setSource(freshness.ageMs < 5000 ? 'live' : 'cached');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  }, [includeFx]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    intervalRef.current = setInterval(refresh, refreshInterval);
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, refreshInterval, refresh]);

  // Age tracker — only update state when the displayed bucket changes (every 10s)
  useEffect(() => {
    ageIntervalRef.current = setInterval(() => {
      const freshness = getDataFreshness();
      // Only trigger re-render when the 10-second bucket changes or stale status flips
      setDataAge(prev => {
        const prevBucket = Math.floor(prev / 10_000);
        const newBucket = Math.floor(freshness.ageMs / 10_000);
        return prevBucket !== newBucket ? freshness.ageMs : prev;
      });
      setIsStale(prev => prev !== freshness.isStale ? freshness.isStale : prev);
    }, 5000);
    return () => clearInterval(ageIntervalRef.current);
  }, []);

  return { cryptoData, forexData, loading, lastUpdate, dataAge, isStale, source, error, refresh };
}
