import type { TradePlan, Timeframe, MicroAnalysis } from './types';
import { getCandles } from './candle-store';
import { atr as atrFn, nearestLevels } from './indicators';

const TF_CONFIG: Record<Timeframe, { atrMult: number; tpMult: number; durationH: number; label: string }> = {
  '3m':  { atrMult: 0.0025, tpMult: 1.6, durationH: 0.25, label: '15-30 min' },
  '15m': { atrMult: 0.005,  tpMult: 1.8, durationH: 1,    label: '1-2 hours' },
  '1h':  { atrMult: 0.012,  tpMult: 2.0, durationH: 4,    label: '4-8 hours' },
  '4h':  { atrMult: 0.025,  tpMult: 2.5, durationH: 16,   label: '12-24 hours' },
  '1d':  { atrMult: 0.05,   tpMult: 3.0, durationH: 72,   label: '2-5 days' },
};

const TF_TO_CANDLE: Record<Timeframe, string> = {
  '3m': '15m', '15m': '15m', '1h': '1h', '4h': '4h', '1d': '1d',
};

function nextSessionStartUTC(tfHours: number): string {
  const now = new Date();
  // Round to next quarter-hour for short TFs, next hour for long TFs
  const rounded = new Date(now);
  if (tfHours <= 1) {
    const m = rounded.getUTCMinutes();
    rounded.setUTCMinutes(Math.ceil((m + 1) / 15) * 15, 0, 0);
  } else {
    rounded.setUTCHours(rounded.getUTCHours() + 1, 0, 0, 0);
  }
  return rounded.toISOString().slice(11, 16) + ' UTC';
}

function endTimeUTC(tfHours: number, startISO: string): string {
  const [hh, mm] = startISO.replace(' UTC', '').split(':').map(Number);
  const d = new Date();
  d.setUTCHours(hh, mm, 0, 0);
  d.setUTCMinutes(d.getUTCMinutes() + Math.round(tfHours * 60));
  return d.toISOString().slice(11, 16) + ' UTC';
}

/**
 * Build a tradeable plan for every timeframe so users always have something
 * actionable: entry zone midpoint, stop loss, two take-profit targets,
 * and a UTC start window. Direction is taken from the dominant bias score.
 */
export function buildTradePlans(
  asset: string,
  livePrice: number,
  micro: MicroAnalysis,
  overallScore: number,
  confidencePercent: number,
): TradePlan[] {
  const direction: 'long' | 'short' = overallScore >= 0 ? 'long' : 'short';
  const timeframes: Timeframe[] = ['3m', '15m', '1h', '4h'];

  return timeframes.map((tf) => {
    const cfg = TF_CONFIG[tf];
    // Real ATR + structural levels when candles available; fall back to %-multiplier.
    const candles = getCandles(asset, TF_TO_CANDLE[tf]);
    const realAtr = candles.length >= 20 ? atrFn(candles, 14) : 0;
    const a = realAtr > 0 ? realAtr : livePrice * cfg.atrMult;
    const levels = candles.length >= 20
      ? nearestLevels(candles, livePrice)
      : { support: micro.keyLevels.support, resistance: micro.keyLevels.resistance };

    // Entry: pullback into structure (0.25 ATR off live), capped by nearest level.
    let entry = direction === 'long' ? livePrice - a * 0.25 : livePrice + a * 0.25;
    if (direction === 'long' && levels.support[0]) {
      entry = Math.max(entry, levels.support[0] * 1.001);
    } else if (direction === 'short' && levels.resistance[0]) {
      entry = Math.min(entry, levels.resistance[0] * 0.999);
    }

    // Stop loss: 1 ATR beyond structural invalidation.
    const structSL = direction === 'long'
      ? (levels.support[1] ?? levels.support[0] ?? entry) - a * 0.5
      : (levels.resistance[1] ?? levels.resistance[0] ?? entry) + a * 0.5;
    const stopLoss = direction === 'long'
      ? Math.min(entry - a, structSL)
      : Math.max(entry + a, structSL);

    // Take profits: structural targets when present, else ATR multiples.
    const risk = Math.abs(entry - stopLoss);
    const tp1 = direction === 'long' ? entry + risk * cfg.tpMult : entry - risk * cfg.tpMult;
    const tp2 = direction === 'long' ? entry + risk * cfg.tpMult * 1.6 : entry - risk * cfg.tpMult * 1.6;
    const tp3 = direction === 'long' ? entry + risk * cfg.tpMult * 2.4 : entry - risk * cfg.tpMult * 2.4;
    const rr = Math.round((risk > 0 ? Math.abs(tp1 - entry) / risk : 0) * 10) / 10;
    const start = nextSessionStartUTC(cfg.durationH);
    const invalidation = direction === 'long' ? micro.keyLevels.support[1] ?? stopLoss : micro.keyLevels.resistance[1] ?? stopLoss;

    const sizing = confidencePercent >= 85
      ? 'Risk 1.5% of capital — high confidence'
      : confidencePercent >= 70
        ? 'Risk 1% of capital — moderate'
        : 'Risk 0.5% of capital — exploratory';

    const fmt = (n: number) => n.toFixed(n < 10 ? 5 : 2);
    const rationale = candles.length >= 20
      ? `ATR(14)=${fmt(a)} on ${TF_TO_CANDLE[tf]}. Entry pulled to nearest swing ${direction === 'long' ? 'support' : 'resistance'} at ${fmt(direction === 'long' ? levels.support[0] : levels.resistance[0])}. SL placed 1 ATR beyond structural invalidation (${fmt(structSL)}). TP1/2/3 at ${cfg.tpMult}/${(cfg.tpMult*1.6).toFixed(1)}/${(cfg.tpMult*2.4).toFixed(1)}× risk.`
      : `No live candles yet for ${asset} ${TF_TO_CANDLE[tf]} — using ATR proxy ${(cfg.atrMult*100).toFixed(2)}%.`;

    return {
      timeframe: tf,
      direction,
      entry,
      stopLoss,
      takeProfit1: tp1,
      takeProfit2: tp2,
      takeProfit3: tp3,
      riskRewardRatio: rr,
      startTimeUTC: start,
      expectedDuration: `${cfg.label} • window closes ~${endTimeUTC(cfg.durationH, start)}`,
      invalidationPrice: invalidation,
      positionSizingHint: sizing,
      notes: `${asset} ${direction.toUpperCase()} on ${tf}: enter near ${fmt(entry)}, invalidate at ${fmt(stopLoss)}.`,
      rationale,
    };
  });
}