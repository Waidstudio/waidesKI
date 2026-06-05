// Tredbeings — interpretation + execution layer.
// Sits AFTER decision is made by the Adaptive KI Core.
// It does NOT predict or override; it expands an approved signal,
// prepares execution, runs sandbox trade, and feeds results back.

import { supabase } from '@/integrations/supabase/client';
import { consumeOnyix, depthForTier, isFrozen } from './onyix';
import { getLivePrice } from './live-prices';
import { openSandboxTrade, classifyAsset } from './sandbox-engine';
import { generateChinnikstah, type ChinnikstahTimeframe } from './chinnikstah-engine';
import type { WaidesSignal, TradePlan, Timeframe } from './types';
import { getCandles } from './candle-store';
import { trendScore, momentumScore, volumeScore, atr as atrFn, adx, liquidityScore } from './indicators';

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

export interface EngineWeights {
  trend: number; momentum: number; volume: number; liquidity: number; adx: number;
}

export const ENGINE_PROFILE: Record<TredEngine, {
  nature: string; speed: 'slow' | 'medium' | 'high' | 'aggressive';
  slMultiplier: number; tpMultiplier: number; biasShift: number; horizon: string;
  weights: EngineWeights;  // each engine reads candles through its own lens
}> = {
  'WaidBot':     { nature: 'Reactive — fast crypto layer', speed: 'high',       slMultiplier: 0.7, tpMultiplier: 1.2, biasShift: 0,  horizon: '5m → 48h',
                   weights: { trend: 0.15, momentum: 0.40, volume: 0.25, liquidity: 0.10, adx: 0.10 } },
  'WaidBot Pro': { nature: 'Predictive macro stability',   speed: 'slow',       slMultiplier: 1.6, tpMultiplier: 2.4, biasShift: 0,  horizon: '24h → 1M',
                   weights: { trend: 0.45, momentum: 0.15, volume: 0.10, liquidity: 0.15, adx: 0.15 } },
  'TredFlux':    { nature: 'UP/DOWN volatility engine',    speed: 'aggressive', slMultiplier: 1.0, tpMultiplier: 1.8, biasShift: 0,  horizon: '30m → 3D',
                   weights: { trend: 0.20, momentum: 0.30, volume: 0.30, liquidity: 0.10, adx: 0.10 } },
  'TredSpot':    { nature: 'Spot accumulation / breakout', speed: 'medium',     slMultiplier: 1.2, tpMultiplier: 2.0, biasShift: 0,  horizon: '30m → 7D',
                   weights: { trend: 0.30, momentum: 0.20, volume: 0.25, liquidity: 0.20, adx: 0.05 } },
  'TredGem':     { nature: 'Forex liquidity / sessions',   speed: 'medium',     slMultiplier: 0.9, tpMultiplier: 1.6, biasShift: 0,  horizon: '5m → 2W',
                   weights: { trend: 0.25, momentum: 0.20, volume: 0.05, liquidity: 0.35, adx: 0.15 } },
  'TredGaze':    { nature: 'Stocks event-driven',          speed: 'slow',       slMultiplier: 1.3, tpMultiplier: 2.2, biasShift: 0,  horizon: '5m → 2W',
                   weights: { trend: 0.30, momentum: 0.25, volume: 0.25, liquidity: 0.10, adx: 0.10 } },
};

/** Score the asset through this engine's specific lens (−100..100). */
export function engineLensScore(engine: TredEngine, asset: string, timeframe: string = '1h'): number {
  const profile = ENGINE_PROFILE[engine];
  const w = profile.weights;
  const candles = getCandles(asset, timeframe);
  if (candles.length < 30) return 0;
  const closes = candles.map(c => c.c);
  const t = trendScore(closes);
  const m = momentumScore(closes).score;
  const v = volumeScore(candles);
  const l = liquidityScore(candles) - 50; // re-center to -50..50
  const a = adx(candles, 14);
  const aScaled = (a - 25) * 2; // ADX>25 trending bullish-flavoured signal
  return Math.round(t * w.trend + m * w.momentum + v * w.volume + l * w.liquidity + aScaled * w.adx);
}

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
  let dir: 'long' | 'short' | 'neutral' =
    signal.verdict.action === 'buy' ? 'long' :
    signal.verdict.action === 'sell' ? 'short' : 'neutral';

  // Engine's own lens may override the upstream KI direction when the engine
  // strongly disagrees AND the engine is reading real candle data.
  const lens = engineLensScore(engine, signal.asset, '1h');
  const lensDir: 'long' | 'short' | 'neutral' =
    lens > 25 ? 'long' : lens < -25 ? 'short' : 'neutral';
  if (lensDir !== 'neutral' && dir !== 'neutral' && lensDir !== dir && Math.abs(lens) > 40) {
    dir = 'neutral'; // engine veto — disagreement strong enough to freeze
  } else if (dir === 'neutral' && lensDir !== 'neutral' && Math.abs(lens) > 35) {
    dir = lensDir;   // engine surfaces a signal the upstream missed
  }

  // ───── Smai Chinnikstah = central intelligence layer for every TredBeing.
  // Tredbeings MUST align with Chinnikstah's market truth before generating a signal.
  const chinTf: ChinnikstahTimeframe =
    timeframe === '5m' || timeframe === '15m' ? '15m' :
    timeframe === '30m' || timeframe === '1H' ? '1H' :
    timeframe === '4H' || timeframe === '12H' ? '4H' : '1D';
  const chin = generateChinnikstah(signal.asset, chinTf);
  const chinDir: 'long' | 'short' | 'neutral' =
    chin.bias === 'buy' ? 'long' : chin.bias === 'sell' ? 'short' : 'neutral';
  // If TredBeing disagrees with Chinnikstah, freeze the trade (no contradictory signals)
  if (dir !== 'neutral' && chinDir !== 'neutral' && dir !== chinDir) {
    dir = 'neutral';
  } else if (dir === 'neutral' && chinDir !== 'neutral' && chin.unifiedConfidence >= 70) {
    dir = chinDir;
  }
  // Confidence blended: 60% Waides KI verdict + 40% Chinnikstah unified
  const blendedConfidence = Math.round(signal.confidencePercent * 0.6 + chin.unifiedConfidence * 0.4);

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

  // Real values derived from upstream Adaptive KI Core analysis (no random)
  const macroScore = signal.macro?.score ?? 0;
  const microScore = signal.micro?.score ?? 0;
  const psychScore = signal.psychological?.score ?? 0;
  const liqScore = signal.liquidity?.liquidityScore ?? signal.liquidity?.score ?? 0;
  const trend = macroScore > 25 ? 'Uptrend — HH/HL confirmed'
              : macroScore < -25 ? 'Downtrend — LH/LL confirmed'
              : Math.abs(macroScore) < 10 ? 'Range-bound — no clear bias'
              : 'Expanding — directional build-up';
  const momentum = signal.verdict.signalStrength > 75 ? 'Accelerating'
                 : signal.verdict.signalStrength > 50 ? 'Steady'
                 : signal.verdict.signalStrength > 25 ? 'Stalling' : 'Reversing';
  const volatility = basePct * 100 > 3 ? 'Spike risk'
                    : basePct * 100 > 1.5 ? 'Expanding'
                    : basePct * 100 < 0.5 ? 'Compressed' : 'Normal';
  const liquidity = liqScore > 60 ? 'Deep liquidity above'
                  : liqScore > 30 ? 'Liquidity pools nearby'
                  : liqScore < -30 ? 'Liquidity below — sweep risk' : 'Thin pockets';
  const structure = signal.micro?.marketStructure
                  || (microScore > 20 ? 'BOS confirmed' : microScore < -20 ? 'CHoCH forming' : 'Re-test in progress');
  // Historical accuracy from confidence + multi-TF alignment (deterministic)
  const histAcc = Math.min(95, Math.max(50,
    Math.round(signal.confidencePercent * 0.7 + (signal.multiTimeframeAligned ? 15 : 5) + (psychScore > 0 ? 5 : 0))
  ));

  return {
    signal_id: signal.id,
    engine, asset: signal.asset, timeframe,
    bias: dir,
    confidencePercent: blendedConfidence,
    entry: +entry.toFixed(entry < 10 ? 5 : 2),
    stopLoss: +stopLoss.toFixed(entry < 10 ? 5 : 2),
    takeProfit: +takeProfit.toFixed(entry < 10 ? 5 : 2),
    riskReward: rr,
    trend, momentum, volatility, liquidity,
    marketStructure: structure,
    forecastHorizon: profile.horizon,
    historicalAccuracy: histAcc,
    executionStatus: dir === 'neutral' ? 'frozen' : 'pending',
    kiAgreement:
      dir === 'neutral'
        ? `KI+Chinni hold — regime ${chin.state}, harmony ${chin.harmonyIndex}%`
        : `KI+Chinni aligned ${chinDir.toUpperCase()} — harmony ${chin.harmonyIndex}%`,
    konslangStatement:
      dir === 'neutral'
        ? `${engine} stands silent. Chinnikstah harmony ${chin.harmonyIndex}% — field unaligned.`
        : `${engine} reads ${dir.toUpperCase()} on ${signal.asset} (${timeframe}). Chinni ${chin.direction} • R:R ${rr}.`,
    outputs: {
      'Asset': signal.asset, 'Timeframe': timeframe, 'Engine': engine,
      'Bias': dir, 'Confidence': `${blendedConfidence}%`,
      'Entry': entry, 'Stop Loss': stopLoss, 'Take Profit': takeProfit,
      'Risk/Reward': rr, 'Trend': trend, 'Momentum': momentum,
      'Volatility': volatility, 'Liquidity': liquidity,
      'Market Structure': structure, 'Forecast Horizon': profile.horizon,
      'Historical Accuracy': `${histAcc}%`,
      'Execution Status': dir === 'neutral' ? 'frozen' : 'pending',
      'KI Agreement': dir === 'neutral' ? 'hold' : 'execute',
      'Chinnikstah Direction': chin.direction,
      'Chinnikstah Harmony': `${chin.harmonyIndex}%`,
      'Chinnikstah Regime': chin.state,
      'Chinnikstah Phase': chin.phase,
    },
  };
}

/** Persist expansion. Execution flows into /sandbox. Consumes Onyix. */
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

  // ───── Waides KI signal-verification gate.
  // Reject weak or contradictory expansions — only validated signals reach users.
  const MIN_CONFIDENCE = 65;
  if (exp.bias !== 'neutral' && exp.confidencePercent < MIN_CONFIDENCE) {
    exp.executionStatus = 'frozen';
    exp.bias = 'neutral';
    exp.kiAgreement = `KI rejected — confidence ${exp.confidencePercent}% < ${MIN_CONFIDENCE}%`;
  }

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