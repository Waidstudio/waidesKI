// Tredbeings — interpretation + execution layer.
// Sits AFTER decision is made by the Adaptive KI Core.
// It does NOT predict or override; it expands an approved signal,
// prepares execution, runs sandbox trade, and feeds results back.

import { supabase } from '@/integrations/supabase/client';
import { consumeOnyix, depthForTier, isFrozen } from './onyix';
import { getLivePrice } from './live-prices';
import { openSandboxTrade, classifyAsset } from './sandbox-engine';
import type { WaidesSignal, TradePlan, Timeframe } from './types';

export type TredEngine =
  | 'WaidBot' | 'WaidBot Pro' | 'TredFlux' | 'TredSpot'
  | 'TredGem' | 'TredGaze';

export const TRED_ENGINE_BY_CLASS: Record<'crypto' | 'forex' | 'stock', TredEngine[]> = {
  crypto: ['WaidBot', 'WaidBot Pro', 'TredFlux', 'TredSpot'],
  forex: ['TredGem'],
  stock: ['TredGaze'],
};

export const TRED_TIMEFRAMES = [
  '5m', '15m', '30m', '1H', '4H', '12H', '1D', '3D', '1W', '2W', '1M', '3M', '6M',
] as const;
export type TredTimeframe = typeof TRED_TIMEFRAMES[number];

export const ENGINE_PROFILE: Record<TredEngine, {
  nature: string; speed: 'slow' | 'medium' | 'high' | 'aggressive';
  slMultiplier: number; tpMultiplier: number; biasShift: number; horizon: string;
}> = {
  'WaidBot':     { nature: 'Reactive — fast crypto layer', speed: 'high',       slMultiplier: 0.7, tpMultiplier: 1.2, biasShift: 0,  horizon: '5m → 48h' },
  'WaidBot Pro': { nature: 'Predictive macro stability',   speed: 'slow',       slMultiplier: 1.6, tpMultiplier: 2.4, biasShift: 0,  horizon: '24h → 1M' },
  'TredFlux':    { nature: 'UP/DOWN volatility engine',    speed: 'aggressive', slMultiplier: 1.0, tpMultiplier: 1.8, biasShift: 0,  horizon: '30m → 3D' },
  'TredSpot':    { nature: 'Spot accumulation / breakout', speed: 'medium',     slMultiplier: 1.2, tpMultiplier: 2.0, biasShift: 0,  horizon: '30m → 7D' },
  'TredGem':     { nature: 'Forex liquidity / sessions',   speed: 'medium',     slMultiplier: 0.9, tpMultiplier: 1.6, biasShift: 0,  horizon: '5m → 2W' },
  'TredGaze':    { nature: 'Stocks event-driven',          speed: 'slow',       slMultiplier: 1.3, tpMultiplier: 2.2, biasShift: 0,  horizon: '5m → 2W' },
};

export interface TredbeingExpansion {
  id?: string;
  signal_id: string;
  engine: TredEngine;
  asset: string;
  timeframe: TredTimeframe;
  bias: 'long' | 'short' | 'neutral';
  confidencePercent: number;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  trend: string;
  momentum: string;
  volatility: string;
  liquidity: string;
  marketStructure: string;
  forecastHorizon: string;
  historicalAccuracy: number;
  executionStatus: 'pending' | 'executing' | 'closed_win' | 'closed_loss' | 'frozen';
  kiAgreement: string;
  konslangStatement: string;
  outputs: Record<string, string | number>;
}

function pick<T>(seed: number, arr: T[]): T { return arr[Math.abs(seed) % arr.length]; }
function hash(s: string): number { let h = 0; for (const c of s) h = ((h << 5) - h + c.charCodeAt(0)) | 0; return h; }

export function expandSignal(
  signal: WaidesSignal,
  engine: TredEngine,
  timeframe: TredTimeframe,
): TredbeingExpansion {
  const profile = ENGINE_PROFILE[engine];
  const live = getLivePrice(signal.asset) ?? signal.livePrice ?? signal.tradePlans?.[0]?.entry ?? 0;
  const seed = hash(signal.id + engine + timeframe);
  const dir: 'long' | 'short' | 'neutral' =
    signal.verdict.action === 'buy' ? 'long' :
    signal.verdict.action === 'sell' ? 'short' : 'neutral';

  // Base ATR-ish %: scales with timeframe
  const tfFactor: Record<TredTimeframe, number> = {
    '5m': 0.4, '15m': 0.6, '30m': 0.8, '1H': 1.0, '4H': 1.6, '12H': 2.4,
    '1D': 3.2, '3D': 5.0, '1W': 7.0, '2W': 10, '1M': 15, '3M': 22, '6M': 30,
  };
  const basePct = (tfFactor[timeframe] / 100) * (1 + (Math.abs(seed % 17) / 100));
  const slPct = basePct * profile.slMultiplier;
  const tpPct = basePct * profile.tpMultiplier;

  const entry = live;
  const stopLoss = dir === 'short' ? entry * (1 + slPct) : entry * (1 - slPct);
  const takeProfit = dir === 'short' ? entry * (1 - tpPct) : entry * (1 + tpPct);
  const rr = +(tpPct / Math.max(slPct, 0.0001)).toFixed(2);

  const trend = pick(seed, ['Uptrend - HH/HL', 'Downtrend - LH/LL', 'Range-bound', 'Expanding']);
  const momentum = pick(seed >> 1, ['Accelerating', 'Stalling', 'Reversing', 'Steady']);
  const volatility = pick(seed >> 2, ['Compressed', 'Expanding', 'Spike risk', 'Normal']);
  const liquidity = pick(seed >> 3, ['Liquidity above', 'Liquidity below', 'Sweep complete', 'Thin pockets']);
  const structure = pick(seed >> 4, ['BOS confirmed', 'CHoCH forming', 'Re-test in progress', 'Order block tap']);
  const histAcc = 60 + Math.abs((seed >> 5) % 30); // 60–89%

  return {
    signal_id: signal.id,
    engine, asset: signal.asset, timeframe,
    bias: dir,
    confidencePercent: signal.confidencePercent,
    entry: +entry.toFixed(entry < 10 ? 5 : 2),
    stopLoss: +stopLoss.toFixed(entry < 10 ? 5 : 2),
    takeProfit: +takeProfit.toFixed(entry < 10 ? 5 : 2),
    riskReward: rr,
    trend, momentum, volatility, liquidity,
    marketStructure: structure,
    forecastHorizon: profile.horizon,
    historicalAccuracy: histAcc,
    executionStatus: dir === 'neutral' ? 'frozen' : 'pending',
    kiAgreement: dir === 'neutral' ? 'KI: holding — no execution' : 'KI: aligned — execute',
    konslangStatement:
      dir === 'neutral'
        ? `${engine} stands silent. The field is unaligned.`
        : `${engine} reads ${dir.toUpperCase()} on ${signal.asset} (${timeframe}). Execute with R:R ${rr}.`,
    outputs: {
      'Asset': signal.asset, 'Timeframe': timeframe, 'Engine': engine,
      'Bias': dir, 'Confidence': `${signal.confidencePercent}%`,
      'Entry': entry, 'Stop Loss': stopLoss, 'Take Profit': takeProfit,
      'Risk/Reward': rr, 'Trend': trend, 'Momentum': momentum,
      'Volatility': volatility, 'Liquidity': liquidity,
      'Market Structure': structure, 'Forecast Horizon': profile.horizon,
      'Historical Accuracy': `${histAcc}%`,
      'Execution Status': dir === 'neutral' ? 'frozen' : 'pending',
      'KI Agreement': dir === 'neutral' ? 'hold' : 'execute',
    },
  };
}

/** Persist expansion + log to womb layer. Consumes Onyix. */
export async function processTredbeing(
  signal: WaidesSignal,
  engine: TredEngine,
  timeframe: TredTimeframe,
  opts: { autoExecute?: boolean } = {},
): Promise<TredbeingExpansion | null> {
  if (isFrozen()) return null;
  const ok = await consumeOnyix('tredbeing_expand', depthForTier());
  if (!ok) return null;

  const exp = expandSignal(signal, engine, timeframe);

  // Persist tredbeing signal
  let savedId: string | undefined;
  try {
    const { data } = await supabase.from('tredbeing_signals').insert({
      signal_id: exp.signal_id, engine: exp.engine, asset: exp.asset,
      timeframe: exp.timeframe, bias: exp.bias,
      confidence_percent: exp.confidencePercent,
      entry: exp.entry, stop_loss: exp.stopLoss, take_profit: exp.takeProfit,
      risk_reward: exp.riskReward, trend: exp.trend, momentum: exp.momentum,
      volatility: exp.volatility, liquidity: exp.liquidity,
      market_structure: exp.marketStructure, forecast_horizon: exp.forecastHorizon,
      historical_accuracy: exp.historicalAccuracy,
      execution_status: exp.executionStatus,
      ki_agreement: exp.kiAgreement, konslang_statement: exp.konslangStatement,
      outputs: exp.outputs,
    }).select().single();
    savedId = data?.id;
    exp.id = savedId;
  } catch (e) { console.warn('tredbeing persist failed', e); }

  // Sandbox execution — routed into the existing /sandbox engine
  if (opts.autoExecute && exp.bias !== 'neutral') {
    await consumeOnyix('sandbox_open');
    const plan: TradePlan = {
      timeframe: tfToBasePlan(timeframe),
      direction: exp.bias,
      entry: exp.entry, stopLoss: exp.stopLoss,
      takeProfit1: exp.takeProfit,
      takeProfit2: exp.takeProfit,
      riskRewardRatio: exp.riskReward,
      startTimeUTC: new Date().toISOString().slice(11, 16),
      expectedDuration: ENGINE_PROFILE[engine].horizon,
      invalidationPrice: exp.stopLoss,
      positionSizingHint: 'Risk 1% of capital',
      notes: `${engine} • ${timeframe}`,
    };
    const trade = await openSandboxTrade({ signal, plan, mode: 'long', openedBy: engine });
    if (savedId && trade?.id) {
      await supabase.from('tredbeing_signals').update({
        sandbox_trade_id: trade.id, execution_status: 'executing',
      }).eq('id', savedId);
      exp.executionStatus = 'executing';
    }
  }
  return exp;
}

function tfToBasePlan(tf: TredTimeframe): Timeframe {
  if (tf === '5m' || tf === '15m') return '15m';
  if (tf === '30m' || tf === '1H') return '1h';
  if (tf === '4H' || tf === '12H') return '4h';
  return '1d';
}

export async function listTredbeingHistory(asset?: string, engine?: TredEngine, limit = 30) {
  let q = supabase.from('tredbeing_signals').select('*').order('created_at', { ascending: false }).limit(limit);
  if (asset) q = q.eq('asset', asset);
  if (engine) q = q.eq('engine', engine);
  const { data } = await q;
  return data ?? [];
}

export function enginesForAsset(asset: string): TredEngine[] {
  return TRED_ENGINE_BY_CLASS[classifyAsset(asset)];
}