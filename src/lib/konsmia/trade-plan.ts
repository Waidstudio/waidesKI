import type { TradePlan, Timeframe, MicroAnalysis } from './types';

const TF_CONFIG: Record<Timeframe, { atrMult: number; tpMult: number; durationH: number; label: string }> = {
  '3m':  { atrMult: 0.0025, tpMult: 1.6, durationH: 0.25, label: '15-30 min' },
  '15m': { atrMult: 0.005,  tpMult: 1.8, durationH: 1,    label: '1-2 hours' },
  '1h':  { atrMult: 0.012,  tpMult: 2.0, durationH: 4,    label: '4-8 hours' },
  '4h':  { atrMult: 0.025,  tpMult: 2.5, durationH: 16,   label: '12-24 hours' },
  '1d':  { atrMult: 0.05,   tpMult: 3.0, durationH: 72,   label: '2-5 days' },
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
    const atr = livePrice * cfg.atrMult;
    const entry = direction === 'long' ? livePrice - atr * 0.25 : livePrice + atr * 0.25;
    const stopLoss = direction === 'long' ? entry - atr : entry + atr;
    const tp1 = direction === 'long' ? entry + atr * cfg.tpMult : entry - atr * cfg.tpMult;
    const tp2 = direction === 'long' ? entry + atr * cfg.tpMult * 1.6 : entry - atr * cfg.tpMult * 1.6;
    const rr = Math.round(((Math.abs(tp1 - entry) / Math.abs(entry - stopLoss))) * 10) / 10;
    const start = nextSessionStartUTC(cfg.durationH);
    const invalidation = direction === 'long' ? micro.keyLevels.support[1] ?? stopLoss : micro.keyLevels.resistance[1] ?? stopLoss;

    const sizing = confidencePercent >= 85
      ? 'Risk 1.5% of capital — high confidence'
      : confidencePercent >= 70
        ? 'Risk 1% of capital — moderate'
        : 'Risk 0.5% of capital — exploratory';

    return {
      timeframe: tf,
      direction,
      entry,
      stopLoss,
      takeProfit1: tp1,
      takeProfit2: tp2,
      riskRewardRatio: rr,
      startTimeUTC: start,
      expectedDuration: `${cfg.label} • window closes ~${endTimeUTC(cfg.durationH, start)}`,
      invalidationPrice: invalidation,
      positionSizingHint: sizing,
      notes: `${asset} ${direction.toUpperCase()} on ${tf}: enter near ${entry.toFixed(entry < 10 ? 4 : 2)}, invalidate below ${stopLoss.toFixed(stopLoss < 10 ? 4 : 2)}.`,
    };
  });
}