// Real technical indicators computed from OHLCV candle arrays.
// All functions are pure and deterministic — same candles in, same numbers out.

export interface Candle {
  t: number;   // open time ms
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

/** Exponential Moving Average over the closes of `candles`. */
export function ema(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const k = 2 / (period + 1);
  const out: number[] = [];
  let prev = values[0];
  out.push(prev);
  for (let i = 1; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out.push(prev);
  }
  return out;
}

/** Simple Moving Average. */
export function sma(values: number[], period: number): number[] {
  const out: number[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    out.push(i >= period - 1 ? sum / period : NaN);
  }
  return out;
}

/** Wilder RSI (0-100). */
export function rsi(values: number[], period = 14): number {
  if (values.length <= period) return 50;
  let gain = 0, loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = values[i] - values[i - 1];
    if (d >= 0) gain += d; else loss -= d;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;
  for (let i = period + 1; i < values.length; i++) {
    const d = values[i] - values[i - 1];
    const g = d > 0 ? d : 0;
    const l = d < 0 ? -d : 0;
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/** True Range (single bar). */
function tr(c: Candle, prev?: Candle): number {
  if (!prev) return c.h - c.l;
  return Math.max(c.h - c.l, Math.abs(c.h - prev.c), Math.abs(c.l - prev.c));
}

/** Wilder ATR over the last `period` candles. Returns ATR in price units. */
export function atr(candles: Candle[], period = 14): number {
  if (candles.length < period + 1) {
    // Fallback: average range
    if (!candles.length) return 0;
    const avg = candles.reduce((s, c) => s + (c.h - c.l), 0) / candles.length;
    return avg || candles[candles.length - 1].c * 0.01;
  }
  let sum = 0;
  for (let i = 1; i <= period; i++) sum += tr(candles[i], candles[i - 1]);
  let v = sum / period;
  for (let i = period + 1; i < candles.length; i++) {
    v = (v * (period - 1) + tr(candles[i], candles[i - 1])) / period;
  }
  return v;
}

/** Directional movement / ADX (trend strength 0-100). */
export function adx(candles: Candle[], period = 14): number {
  if (candles.length < period * 2) return 0;
  const plusDM: number[] = [0];
  const minusDM: number[] = [0];
  const trs: number[] = [0];
  for (let i = 1; i < candles.length; i++) {
    const up = candles[i].h - candles[i - 1].h;
    const dn = candles[i - 1].l - candles[i].l;
    plusDM.push(up > dn && up > 0 ? up : 0);
    minusDM.push(dn > up && dn > 0 ? dn : 0);
    trs.push(tr(candles[i], candles[i - 1]));
  }
  // Wilder smoothing
  let smPlus = 0, smMinus = 0, smTr = 0;
  for (let i = 1; i <= period; i++) { smPlus += plusDM[i]; smMinus += minusDM[i]; smTr += trs[i]; }
  const dxs: number[] = [];
  const pushDx = () => {
    const pdi = (smPlus / smTr) * 100;
    const mdi = (smMinus / smTr) * 100;
    const dx = (Math.abs(pdi - mdi) / Math.max(pdi + mdi, 1e-9)) * 100;
    dxs.push(dx);
  };
  pushDx();
  for (let i = period + 1; i < candles.length; i++) {
    smPlus = smPlus - smPlus / period + plusDM[i];
    smMinus = smMinus - smMinus / period + minusDM[i];
    smTr = smTr - smTr / period + trs[i];
    if (smTr > 0) pushDx();
  }
  if (dxs.length < period) return dxs[dxs.length - 1] ?? 0;
  const last = dxs.slice(-period);
  return last.reduce((s, v) => s + v, 0) / last.length;
}

/** MACD line + signal + histogram (returns latest values). */
export function macd(values: number[], fast = 12, slow = 26, signal = 9) {
  const eFast = ema(values, fast);
  const eSlow = ema(values, slow);
  const line: number[] = values.map((_, i) => eFast[i] - eSlow[i]);
  const sig = ema(line, signal);
  const hist = line.map((v, i) => v - sig[i]);
  return { line: line[line.length - 1], signal: sig[sig.length - 1], hist: hist[hist.length - 1] };
}

/** Detect swing highs and lows using fractal logic (N bars on each side). */
export function swings(candles: Candle[], lookback = 3): { highs: number[]; lows: number[] } {
  const highs: number[] = [];
  const lows: number[] = [];
  for (let i = lookback; i < candles.length - lookback; i++) {
    let isHigh = true, isLow = true;
    for (let j = 1; j <= lookback; j++) {
      if (candles[i - j].h >= candles[i].h || candles[i + j].h >= candles[i].h) isHigh = false;
      if (candles[i - j].l <= candles[i].l || candles[i + j].l <= candles[i].l) isLow = false;
    }
    if (isHigh) highs.push(candles[i].h);
    if (isLow) lows.push(candles[i].l);
  }
  return { highs, lows };
}

/** Nearest support below price, nearest resistance above. Returns up to 2 of each. */
export function nearestLevels(candles: Candle[], price: number): { support: number[]; resistance: number[] } {
  const { highs, lows } = swings(candles, 3);
  const support = lows.filter(l => l < price).sort((a, b) => b - a).slice(0, 2);
  const resistance = highs.filter(h => h > price).sort((a, b) => a - b).slice(0, 2);
  // Fallback if no swings detected
  if (!support.length) support.push(price * 0.99, price * 0.97);
  if (!resistance.length) resistance.push(price * 1.01, price * 1.03);
  return { support, resistance };
}

/** Trend direction from EMA crossover and slope. Returns -100..100. */
export function trendScore(closes: number[]): number {
  if (closes.length < 50) return 0;
  const e20 = ema(closes, 20);
  const e50 = ema(closes, 50);
  const last20 = e20[e20.length - 1];
  const last50 = e50[e50.length - 1];
  const prev20 = e20[e20.length - 6] ?? last20;
  const slope = ((last20 - prev20) / prev20) * 100;
  const sep = ((last20 - last50) / last50) * 100;
  // Combine: cross direction (+/-) weighted by slope and separation
  const raw = Math.sign(sep) * Math.min(100, Math.abs(sep) * 30 + Math.abs(slope) * 20);
  return Math.max(-100, Math.min(100, raw));
}

/** Momentum from RSI (0-100 → -100..100). */
export function momentumScore(closes: number[]): { score: number; rsi: number } {
  const r = rsi(closes, 14);
  return { rsi: r, score: Math.round((r - 50) * 2) };
}

/** Volume confirmation: latest vs SMA(20). Returns -100..100. */
export function volumeScore(candles: Candle[]): number {
  if (candles.length < 20) return 0;
  const vols = candles.map(c => c.v);
  const avg = sma(vols, 20).pop() ?? 0;
  if (avg <= 0) return 0;
  const last = vols[vols.length - 1];
  const ratio = last / avg;
  const closeUp = candles[candles.length - 1].c >= candles[candles.length - 1].o;
  // Higher volume + green = bullish, higher volume + red = bearish
  const mag = Math.min(100, (ratio - 1) * 100);
  return Math.round((closeUp ? 1 : -1) * Math.max(-100, mag));
}

/** Volatility regime: ATR % of price → 0..100 (higher = more volatile). */
export function volatilityPct(candles: Candle[]): number {
  if (!candles.length) return 0;
  const a = atr(candles, 14);
  const price = candles[candles.length - 1].c;
  return (a / price) * 100;
}

/** Liquidity proxy: depth of recent range vs ATR. Higher = more liquidity. */
export function liquidityScore(candles: Candle[]): number {
  if (candles.length < 20) return 50;
  const recent = candles.slice(-20);
  const range = Math.max(...recent.map(c => c.h)) - Math.min(...recent.map(c => c.l));
  const a = atr(candles, 14);
  if (a <= 0) return 50;
  const ratio = range / a;
  return Math.max(0, Math.min(100, Math.round(ratio * 8)));
}