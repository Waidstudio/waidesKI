// Sandbox paper-trading engine — Waides KI's training ground.
// Opens trades from signals, monitors live prices, closes on SL/TP,
// and writes outcomes to ki_accuracy_log so the win-rate is visible.

import { supabase } from '@/integrations/supabase/client';
import { getLivePrice } from './live-prices';
import type { WaidesSignal, TradePlan } from './types';

export type AssetClass = 'crypto' | 'forex' | 'stock';

export function classifyAsset(asset: string): AssetClass {
  const a = asset.toUpperCase();
  const fx = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'USD/CHF'];
  if (fx.includes(a)) return 'forex';
  if (/^[A-Z]{1,5}$/.test(a)) return 'stock';
  return 'crypto';
}

export interface OpenTradeArgs {
  signal: WaidesSignal;
  plan: TradePlan;
  mode?: 'long' | 'spot' | 'short';
  positionSize?: number;
  leverage?: number;
  openedBy?: string;
}

export async function openSandboxTrade({
  signal, plan, mode = 'long', positionSize = 1000, leverage = 1, openedBy = 'waides_ki',
}: OpenTradeArgs) {
  const cls = classifyAsset(signal.asset);
  const { data, error } = await supabase
    .from('sandbox_trades')
    .insert({
      signal_id: signal.id,
      asset: signal.asset,
      asset_class: cls,
      direction: plan.direction,
      timeframe: plan.timeframe,
      entry_price: plan.entry,
      stop_loss: plan.stopLoss,
      take_profit_1: plan.takeProfit1,
      take_profit_2: plan.takeProfit2,
      current_price: signal.livePrice ?? plan.entry,
      position_size: positionSize,
      leverage,
      mode,
      status: 'open',
      confidence_percent: signal.confidencePercent,
      opened_by: openedBy,
      reasoning: signal.verdict.confluenceSummary,
    })
    .select()
    .single();
  if (error) console.warn('openSandboxTrade error:', error);
  return data;
}

/**
 * Walk all open trades, mark-to-market against live prices,
 * close any that hit SL or TP, log accuracy.
 */
export async function reconcileSandboxTrades() {
  const { data: open, error } = await supabase
    .from('sandbox_trades')
    .select('*')
    .eq('status', 'open')
    .limit(200);
  if (error || !open) return { closed: 0, updated: 0 };

  let closed = 0;
  let updated = 0;

  for (const t of open) {
    const live = getLivePrice(t.asset);
    if (!live) continue;
    const entry = Number(t.entry_price);
    const sl = Number(t.stop_loss);
    const tp1 = Number(t.take_profit_1);
    const tp2 = t.take_profit_2 ? Number(t.take_profit_2) : null;
    const dir: 'long' | 'short' = t.direction === 'short' ? 'short' : 'long';
    const size = Number(t.position_size) || 1000;
    const lev = Number(t.leverage) || 1;

    let outcome: 'win' | 'loss' | null = null;
    let exitPrice: number | null = null;

    if (dir === 'long') {
      if (live <= sl) { outcome = 'loss'; exitPrice = sl; }
      else if (tp2 && live >= tp2) { outcome = 'win'; exitPrice = tp2; }
      else if (live >= tp1) { outcome = 'win'; exitPrice = tp1; }
    } else {
      if (live >= sl) { outcome = 'loss'; exitPrice = sl; }
      else if (tp2 && live <= tp2) { outcome = 'win'; exitPrice = tp2; }
      else if (live <= tp1) { outcome = 'win'; exitPrice = tp1; }
    }

    const refPrice = exitPrice ?? live;
    const moveFrac = dir === 'long' ? (refPrice - entry) / entry : (entry - refPrice) / entry;
    const pnlPercent = moveFrac * 100 * lev;
    const pnl = (size * moveFrac) * lev;

    if (outcome) {
      await supabase.from('sandbox_trades').update({
        status: 'closed', outcome, current_price: refPrice,
        pnl, pnl_percent: pnlPercent, closed_at: new Date().toISOString(),
      }).eq('id', t.id);
      await supabase.from('ki_accuracy_log').insert({
        asset: t.asset, asset_class: t.asset_class,
        signal_id: t.signal_id, trade_id: t.id,
        predicted_direction: dir,
        confidence_percent: t.confidence_percent ?? 70,
        outcome, pnl_percent: pnlPercent,
      });
      closed++;
    } else {
      await supabase.from('sandbox_trades').update({
        current_price: live, pnl, pnl_percent: pnlPercent,
      }).eq('id', t.id);
      updated++;
    }
  }
  return { closed, updated };
}

export async function fetchAccuracyStats() {
  const { data } = await supabase
    .from('ki_accuracy_log')
    .select('*')
    .order('resolved_at', { ascending: false })
    .limit(500);
  const rows = data ?? [];
  const total = rows.length;
  const wins = rows.filter(r => r.outcome === 'win').length;
  const winRate = total ? Math.round((wins / total) * 1000) / 10 : 0;
  const avgPnl = total ? rows.reduce((s, r) => s + Number(r.pnl_percent || 0), 0) / total : 0;
  return { total, wins, losses: total - wins, winRate, avgPnl, recent: rows.slice(0, 30) };
}

export async function listSandboxTrades(status?: 'open' | 'closed') {
  let q = supabase.from('sandbox_trades').select('*').order('opened_at', { ascending: false }).limit(200);
  if (status) q = q.eq('status', status);
  const { data } = await q;
  return data ?? [];
}

/** Has KI already opened a trade for this signal? */
export async function hasTradeForSignal(signalId: string): Promise<boolean> {
  const { data } = await supabase
    .from('sandbox_trades').select('id').eq('signal_id', signalId).limit(1);
  return !!(data && data.length);
}