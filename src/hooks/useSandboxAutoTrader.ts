import { useEffect, useRef } from 'react';
import { hasTradeForSignal, openSandboxTrade, reconcileSandboxTrades } from '@/lib/konsmia/sandbox-engine';
import type { WaidesSignal } from '@/lib/konsmia/types';

/**
 * Background trader: when high-confidence signals appear, KI opens a paper trade.
 * Reconciles open trades against live prices every 20s.
 */
export function useSandboxAutoTrader(signals: WaidesSignal[], enabled = true) {
  const seenRef = useRef<Set<string>>(new Set());

  // Open trades for new high-confidence signals
  useEffect(() => {
    if (!enabled || !signals?.length) return;
    (async () => {
      for (const sig of signals) {
        if (seenRef.current.has(sig.id)) continue;
        if (!sig.tradePlans?.length) continue;
        if (sig.confidencePercent < 70) continue;
        if (sig.verdict.action === 'no_trade' || sig.verdict.action === 'wait') continue;
        const exists = await hasTradeForSignal(sig.id);
        if (exists) { seenRef.current.add(sig.id); continue; }
        // Pick the 1h plan (or first available) as the canonical entry
        const plan = sig.tradePlans.find(p => p.timeframe === '1h') ?? sig.tradePlans[0];
        await openSandboxTrade({ signal: sig, plan, mode: 'long' });
        seenRef.current.add(sig.id);
      }
    })();
  }, [signals, enabled]);

  // Reconcile open trades on a tick
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => { reconcileSandboxTrades().catch(() => {}); }, 20_000);
    reconcileSandboxTrades().catch(() => {});
    return () => clearInterval(id);
  }, [enabled]);
}