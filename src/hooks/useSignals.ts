import { useState, useEffect, useCallback, useRef } from 'react';
import { generateSignal } from '@/lib/konsmia/signal-engine';
import { supabase } from '@/integrations/supabase/client';
import type { WaidesSignal, KIMode } from '@/lib/konsmia/types';

interface UseSignalsOptions {
  assets?: string[];
  mode?: KIMode;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface SignalState {
  signals: WaidesSignal[];
  loading: boolean;
  lastGenerated: Date;
  signalHistory: any[];
  refresh: () => void;
}

export function useSignals(options: UseSignalsOptions = {}): SignalState {
  const {
    assets = ['BTC/USD', 'ETH/USD', 'EUR/USD', 'SOL/USD'],
    mode = 'balanced',
    autoRefresh = true,
    refreshInterval = 60_000,
  } = options;

  const [signals, setSignals] = useState<WaidesSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastGenerated, setLastGenerated] = useState(new Date());
  const [signalHistory, setSignalHistory] = useState<any[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const generate = useCallback(() => {
    setLoading(true);
    const newSignals = assets
      .map(a => generateSignal(a, mode))
      .filter(Boolean) as WaidesSignal[];
    setSignals(newSignals);
    setLastGenerated(new Date());
    setLoading(false);

    // Persist to DB (fire and forget)
    newSignals.forEach(async (signal) => {
      try {
        await supabase.from('signals').upsert({
          signal_id: signal.id,
          asset: signal.asset,
          bias: signal.bias,
          confidence: signal.confidence,
          confidence_percent: signal.confidencePercent,
          overall_score: signal.overallScore,
          direction: signal.verdict.direction,
          action: signal.verdict.action,
          risk_level: signal.verdict.riskLevel,
          soul_voice: signal.verdict.soulVoice,
          confluence_summary: signal.verdict.confluenceSummary,
          reasoning: signal.reasoning,
          time_window: signal.timeWindow as any,
          entry_precision: signal.entryPrecision as any,
          macro: signal.macro as any,
          micro: signal.micro as any,
          psychological: signal.psychological as any,
          temporal: signal.temporal as any,
          liquidity: signal.liquidity as any,
          correlation: signal.correlation as any,
          multi_timeframe_aligned: signal.multiTimeframeAligned,
        }, { onConflict: 'signal_id' });
      } catch (e) {
        console.warn('Failed to persist signal:', e);
      }
    });
  }, [assets, mode]);

  // Load history
  useEffect(() => {
    async function loadHistory() {
      try {
        const { data } = await supabase
          .from('signals')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (data) setSignalHistory(data);
      } catch (e) {
        console.warn('Failed to load signal history:', e);
      }
    }
    loadHistory();
  }, []);

  useEffect(() => {
    generate();
  }, [generate]);

  useEffect(() => {
    if (!autoRefresh) return;
    intervalRef.current = setInterval(generate, refreshInterval);
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, refreshInterval, generate]);

  return { signals, loading, lastGenerated, signalHistory, refresh: generate };
}
