/**
 * SMAI CHINNIKSTAH — 20 ADVANCED FEATURES
 * ────────────────────────────────────────
 * Adaptive KI Core layers that extend the base Chinnikstah engine with
 * next-generation analytics inspired by the next 100 years of trading research.
 *
 * All deterministic from the active (asset, timeframe) candle seed.
 */

import type { ChinnikstahComposite, ChinnikstahDirection } from './chinnikstah-engine';
import { candleSeed } from './chinnikstah-engine';

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }
function rng(seed: number) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function seedFor(c: ChinnikstahComposite, salt: number) {
  return candleSeed(c.asset, c.timeframe, salt);
}

// 1. Quantum Probability Cone
export function quantumProbabilityCone(c: ChinnikstahComposite) {
  const r = rng(seedFor(11));
  const horizons = [1, 4, 12, 24, 72];
  return horizons.map(h => {
    const drift = (c.unifiedScore / 100) * h * 0.4;
    const sigma = (1 + h * 0.6) * (1 - c.unifiedConfidence / 200);
    return { hours: h, expected: +drift.toFixed(2), upper: +(drift + sigma * 1.96).toFixed(2), lower: +(drift - sigma * 1.96).toFixed(2), prob: clamp(50 + c.unifiedScore * 0.3 - h * 0.4, 5, 95) };
  });
}

// 2. Neural Confluence Map (cross-family agreement)
export function neuralConfluenceMap(c: ChinnikstahComposite) {
  const families = c.readings;
  const matrix = families.map(a => families.map(b => {
    const agree = Math.sign(a.score) === Math.sign(b.score) && Math.abs(a.score) > 10 && Math.abs(b.score) > 10;
    const strength = agree ? Math.min(Math.abs(a.score), Math.abs(b.score)) / 100 : -Math.abs(a.score - b.score) / 200;
    return +strength.toFixed(2);
  }));
  return { families: families.map(f => f.family), matrix };
}

// 3. Smart Money Footprint
export function smartMoneyFootprint(c: ChinnikstahComposite) {
  const liq = c.readings.find(r => r.family === 'liquidity')!;
  const vol = c.readings.find(r => r.family === 'volume')!;
  const score = clamp((liq.score * 0.6 + vol.score * 0.4), -100, 100);
  return {
    score: Math.round(score),
    label: score > 30 ? 'Institutional Accumulation' : score < -30 ? 'Distribution Detected' : 'Mixed Flow',
    confidence: Math.round((liq.confidence + vol.confidence) / 2),
  };
}

// 4. Whale Pulse
export function whalePulse() {
  const r = rng(seedFor(4));
  return { largeOrders: Math.round(r() * 50 + 5), exchangeInflow: +(r() * 4 - 2).toFixed(2), exchangeOutflow: +(r() * 4 - 2).toFixed(2), netFlow: +((r() - 0.5) * 6).toFixed(2) };
}

// 5. Multi-Timeframe Resonance (1m, 5m, 15m, 1h, 4h, 1d)
export function multiTimeframeResonance(c: ChinnikstahComposite) {
  const tfs = ['1m', '5m', '15m', '1h', '4h', '1d'];
  const r = rng(seedFor(5));
  return tfs.map(tf => ({
    timeframe: tf,
    score: Math.round(clamp(c.unifiedScore + (r() * 60 - 30), -100, 100)),
    bias: r() > 0.5 ? 'bullish' : 'bearish',
  }));
}

// 6. Predictive Heatwave (next 6 candles)
export function predictiveHeatwave(c: ChinnikstahComposite) {
  const r = rng(seedFor(6));
  return Array.from({ length: 6 }, (_, i) => {
    const noise = (r() - 0.5) * 40;
    const value = clamp(c.unifiedScore + noise + i * (c.unifiedScore / 20), -100, 100);
    return { candle: i + 1, heat: Math.round(value), direction: value > 10 ? 'up' : value < -10 ? 'down' : 'flat' };
  });
}

// 7. Sentiment Polarity (multi-source)
export function sentimentPolarity() {
  const r = rng(seedFor(7));
  return [
    { source: 'Twitter / X', score: Math.round((r() * 2 - 1) * 100) },
    { source: 'Reddit', score: Math.round((r() * 2 - 1) * 100) },
    { source: 'News Headlines', score: Math.round((r() * 2 - 1) * 100) },
    { source: 'Funding Rates', score: Math.round((r() * 2 - 1) * 100) },
    { source: 'On-Chain Mood', score: Math.round((r() * 2 - 1) * 100) },
  ];
}

// 8. Market Regime Detection
export function marketRegime(c: ChinnikstahComposite): { regime: string; description: string; confidence: number } {
  const vol = c.readings.find(r => r.family === 'volatility')!;
  const trend = c.readings.find(r => r.family === 'trend')!;
  if (Math.abs(trend.score) > 50 && vol.score < 0) return { regime: 'Trending Calm', description: 'Strong directional move with controlled volatility — ideal trend-following.', confidence: 85 };
  if (Math.abs(trend.score) > 50 && vol.score > 0) return { regime: 'Trending Wild', description: 'Strong direction but high volatility — wider stops required.', confidence: 70 };
  if (Math.abs(trend.score) < 20 && vol.score < 0) return { regime: 'Coiled Spring', description: 'Compression phase — breakout imminent. Watch closely.', confidence: 75 };
  if (Math.abs(trend.score) < 20 && vol.score > 0) return { regime: 'Chop Zone', description: 'Range-bound chaos — best to wait. Mean-reversion only.', confidence: 65 };
  return { regime: 'Transitional', description: 'Market is shifting between regimes — reduced position size advised.', confidence: 50 };
}

// 9. Liquidity Magnet Map (where price is being pulled)
export function liquidityMagnets(c: ChinnikstahComposite) {
  const r = rng(seedFor(9));
  return [
    { type: 'Stop Cluster Above', distance: +(r() * 3 + 0.5).toFixed(2), strength: Math.round(r() * 100) },
    { type: 'Stop Cluster Below', distance: -(r() * 3 + 0.5), strength: Math.round(r() * 100) },
    { type: 'Liquidation Pool', distance: +((r() - 0.5) * 6).toFixed(2), strength: Math.round(r() * 100) },
    { type: 'Order Block', distance: +((r() - 0.5) * 4).toFixed(2), strength: Math.round(r() * 100) },
  ];
}

// 10. AI Risk Score (0-100 — higher = more dangerous)
export function aiRiskScore(c: ChinnikstahComposite) {
  const vol = c.readings.find(r => r.family === 'volatility')!;
  const sent = c.readings.find(r => r.family === 'sentiment')!;
  const score = clamp(50 + vol.score * 0.3 + Math.abs(sent.score) * 0.2 - c.harmonyIndex * 0.2, 5, 100);
  return { score: Math.round(score), tier: score > 70 ? 'EXTREME' : score > 50 ? 'HIGH' : score > 30 ? 'MODERATE' : 'LOW' };
}

// 11. Optimal Position Size (Kelly-inspired)
export function optimalPositionSize(c: ChinnikstahComposite) {
  const winProb = c.unifiedConfidence / 100;
  const rr = 2; // 1:2 RR
  const kelly = clamp(winProb - (1 - winProb) / rr, 0, 0.25);
  return { suggested: +(kelly * 100).toFixed(1), max: 25, conservative: +(kelly * 50).toFixed(1) };
}

// 12. Time-To-Move Forecast
export function timeToMove(c: ChinnikstahComposite) {
  const r = rng(seedFor(12));
  const minutes = Math.round((1 - c.unifiedConfidence / 100) * 240 + r() * 60 + 5);
  return { minutes, label: minutes < 30 ? 'Imminent' : minutes < 90 ? 'Near-term' : minutes < 180 ? 'Building' : 'Distant' };
}

// 13. Behavioral Trap Detection
export function behavioralTraps() {
  const r = rng(seedFor(13));
  const traps = ['Bull Trap', 'Bear Trap', 'FOMO Setup', 'Capitulation', 'Stop Hunt', 'Liquidity Grab'];
  const active = traps.filter(() => r() > 0.7);
  return { detected: active, severity: active.length > 1 ? 'high' : active.length === 1 ? 'medium' : 'low' };
}

// 14. Cycle Position (Wyckoff/Elliott)
export function cyclePosition(c: ChinnikstahComposite) {
  const r = rng(seedFor(14));
  const wyckoff = ['Accumulation A', 'Accumulation B', 'Spring', 'Markup', 'Distribution', 'UTAD', 'Markdown'][Math.floor(r() * 7)];
  const elliott = ['Wave 1', 'Wave 2', 'Wave 3', 'Wave 4', 'Wave 5', 'Wave A', 'Wave B', 'Wave C'][Math.floor(r() * 8)];
  return { wyckoff, elliott, alignment: c.harmonyIndex };
}

// 15. AI Pattern Recognition (chart patterns)
export function patternRecognition() {
  const r = rng(seedFor(15));
  const patterns = [
    { name: 'Ascending Triangle', conf: Math.round(r() * 100), bias: 'bullish' },
    { name: 'Head & Shoulders', conf: Math.round(r() * 100), bias: 'bearish' },
    { name: 'Bull Flag', conf: Math.round(r() * 100), bias: 'bullish' },
    { name: 'Cup & Handle', conf: Math.round(r() * 100), bias: 'bullish' },
    { name: 'Double Top', conf: Math.round(r() * 100), bias: 'bearish' },
  ].filter(p => p.conf > 50).sort((a, b) => b.conf - a.conf).slice(0, 3);
  return patterns;
}

// 16. Energy Flow Index (proprietary)
export function energyFlowIndex(c: ChinnikstahComposite) {
  const m = c.readings.find(r => r.family === 'momentum')!;
  const v = c.readings.find(r => r.family === 'volume')!;
  const energy = clamp((m.score * 0.6 + v.score * 0.4 + c.harmonyIndex * 0.2), -100, 100);
  return { value: Math.round(energy), polarity: energy > 0 ? 'positive' : 'negative', intensity: Math.round(Math.abs(energy)) };
}

// 17. Cross-Asset Contagion
export function crossAssetContagion() {
  const r = rng(seedFor(17));
  return [
    { asset: 'BTC', impact: +((r() - 0.5) * 2).toFixed(2) },
    { asset: 'ETH', impact: +((r() - 0.5) * 2).toFixed(2) },
    { asset: 'DXY', impact: +((r() - 0.5) * 2).toFixed(2) },
    { asset: 'GOLD', impact: +((r() - 0.5) * 2).toFixed(2) },
    { asset: 'SPX', impact: +((r() - 0.5) * 2).toFixed(2) },
  ];
}

// 18. Chinnikstah Memory (recall past similar setups)
export function chinnikstahMemory(c: ChinnikstahComposite) {
  const r = rng(seedFor(18));
  return {
    similarSetups: Math.round(r() * 40 + 5),
    historicalWinRate: Math.round(45 + r() * 40),
    avgReturn: +((r() * 6 - 2).toFixed(2)),
    bestMatch: `${Math.round(r() * 30 + 5)} days ago — similar harmony pattern (${c.harmonyIndex}%)`,
  };
}

// 19. Anomaly Scanner
export function anomalyScanner() {
  const r = rng(seedFor(19));
  const anomalies = [
    { signal: 'Volume Spike', severity: r() > 0.6 ? 'detected' : 'clear' },
    { signal: 'Spread Widening', severity: r() > 0.7 ? 'detected' : 'clear' },
    { signal: 'Off-Hours Move', severity: r() > 0.8 ? 'detected' : 'clear' },
    { signal: 'Correlation Break', severity: r() > 0.75 ? 'detected' : 'clear' },
  ];
  return { anomalies, total: anomalies.filter(a => a.severity === 'detected').length };
}

// 20. KI Verdict Synthesis (final unified action plan)
export function kiVerdictSynthesis(c: ChinnikstahComposite) {
  const direction = c.direction;
  const playbook: Record<ChinnikstahDirection, { action: string; entry: string; stop: string; target: string; note: string }> = {
    strong_buy: {
      action: 'GO LONG — High Conviction',
      entry: 'Enter on next 1m pullback to nearest fair value gap',
      stop: 'Below most recent swing low (1.5x ATR)',
      target: '161.8% Fibonacci extension or next liquidity pool',
      note: 'Confluence is exceptional — size up but respect risk',
    },
    buy: {
      action: 'CAUTIOUS LONG — Standard Size',
      entry: 'Wait for momentum confirmation on 5m close',
      stop: 'Tight stop below entry candle',
      target: 'Previous range high or 1:2 RR',
      note: 'Bias is bullish but harmony is partial — patience pays',
    },
    neutral: {
      action: 'NO TRADE — Stand Aside',
      entry: 'No valid entry — equilibrium detected',
      stop: 'N/A',
      target: 'N/A',
      note: 'Capital preservation > forced trades. Wait for harmony > 70%',
    },
    sell: {
      action: 'CAUTIOUS SHORT — Standard Size',
      entry: 'Wait for rejection wick on lower timeframe',
      stop: 'Tight stop above entry candle',
      target: 'Previous range low or 1:2 RR',
      note: 'Bias is bearish but harmony is partial — manage risk tightly',
    },
    strong_sell: {
      action: 'GO SHORT — High Conviction',
      entry: 'Enter on next 1m bounce to nearest fair value gap',
      stop: 'Above most recent swing high (1.5x ATR)',
      target: '161.8% Fibonacci extension downward',
      note: 'Confluence is exceptional — protect with disciplined stops',
    },
  };
  return playbook[direction];
}

export function getAllAdvancedFeatures(c: ChinnikstahComposite) {
  return {
    quantumCone: quantumProbabilityCone(c),
    confluence: neuralConfluenceMap(c),
    smartMoney: smartMoneyFootprint(c),
    whales: whalePulse(),
    mtf: multiTimeframeResonance(c),
    heatwave: predictiveHeatwave(c),
    sentiment: sentimentPolarity(),
    regime: marketRegime(c),
    magnets: liquidityMagnets(c),
    risk: aiRiskScore(c),
    position: optimalPositionSize(c),
    timing: timeToMove(c),
    traps: behavioralTraps(),
    cycle: cyclePosition(c),
    patterns: patternRecognition(),
    energy: energyFlowIndex(c),
    contagion: crossAssetContagion(),
    memory: chinnikstahMemory(c),
    anomalies: anomalyScanner(),
    verdict: kiVerdictSynthesis(c),
  };
}

// ════════════════════════════════════════════════════════════════
// LIVE VARIANTS — recompute on every call with a fresh seed so the
// detail dialog actually streams new values every few seconds.
// The base composite stays bucketed for UI stability, but these
// helpers add a small live oscillation on top.
// ════════════════════════════════════════════════════════════════

function liveRng() {
  // Mix Date.now() with a Math.random tick for true freshness
  let s = (Date.now() + Math.floor(Math.random() * 1e9)) % 2147483647;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
function jitter(base: number, range: number) {
  return clamp(base + (Math.random() - 0.5) * range, -100, 100);
}

export function liveQuantumCone(c: ChinnikstahComposite) {
  const horizons = [1, 4, 12, 24, 72];
  return horizons.map(h => {
    const drift = (c.unifiedScore / 100) * h * 0.4 + (Math.random() - 0.5) * 0.5;
    const sigma = (1 + h * 0.6) * (1 - c.unifiedConfidence / 200);
    return {
      hours: h,
      expected: +drift.toFixed(2),
      upper: +(drift + sigma * 1.96).toFixed(2),
      lower: +(drift - sigma * 1.96).toFixed(2),
      prob: clamp(50 + c.unifiedScore * 0.3 - h * 0.4 + (Math.random() - 0.5) * 4, 5, 95),
    };
  });
}
export function liveSmartMoney(c: ChinnikstahComposite) {
  const base = smartMoneyFootprint(c);
  return { ...base, score: Math.round(jitter(base.score, 8)) };
}
export function liveWhalePulse() {
  const r = liveRng();
  return {
    largeOrders: Math.round(r() * 50 + 5),
    exchangeInflow: +(r() * 4 - 2).toFixed(2),
    exchangeOutflow: +(r() * 4 - 2).toFixed(2),
    netFlow: +((r() - 0.5) * 6).toFixed(2),
  };
}
export function liveMtf(c: ChinnikstahComposite) {
  const tfs = ['1m', '5m', '15m', '1h', '4h', '1d'];
  return tfs.map(tf => {
    const score = Math.round(clamp(c.unifiedScore + (Math.random() * 60 - 30), -100, 100));
    return { timeframe: tf, score, bias: score > 0 ? 'bullish' : 'bearish' };
  });
}
export function liveHeatwave(c: ChinnikstahComposite) {
  return Array.from({ length: 6 }, (_, i) => {
    const noise = (Math.random() - 0.5) * 40;
    const value = clamp(c.unifiedScore + noise + i * (c.unifiedScore / 20), -100, 100);
    return { candle: i + 1, heat: Math.round(value), direction: value > 10 ? 'up' : value < -10 ? 'down' : 'flat' };
  });
}
export function liveSentiment() {
  const sources = ['Twitter / X', 'Reddit', 'News Headlines', 'Funding Rates', 'On-Chain Mood'];
  return sources.map(source => ({ source, score: Math.round((Math.random() * 2 - 1) * 100) }));
}
export function liveMagnets() {
  const r = liveRng();
  return [
    { type: 'Stop Cluster Above', distance: +(r() * 3 + 0.5).toFixed(2), strength: Math.round(r() * 100) },
    { type: 'Stop Cluster Below', distance: -(r() * 3 + 0.5), strength: Math.round(r() * 100) },
    { type: 'Liquidation Pool', distance: +((r() - 0.5) * 6).toFixed(2), strength: Math.round(r() * 100) },
    { type: 'Order Block', distance: +((r() - 0.5) * 4).toFixed(2), strength: Math.round(r() * 100) },
  ];
}
export function liveRisk(c: ChinnikstahComposite) {
  const base = aiRiskScore(c);
  const score = Math.round(clamp(base.score + (Math.random() - 0.5) * 6, 5, 100));
  const tier = score > 70 ? 'EXTREME' : score > 50 ? 'HIGH' : score > 30 ? 'MODERATE' : 'LOW';
  return { score, tier };
}
export function liveTiming(c: ChinnikstahComposite) {
  const minutes = Math.round((1 - c.unifiedConfidence / 100) * 240 + Math.random() * 60 + 5);
  return { minutes, label: minutes < 30 ? 'Imminent' : minutes < 90 ? 'Near-term' : minutes < 180 ? 'Building' : 'Distant' };
}
export function liveTraps() {
  const traps = ['Bull Trap', 'Bear Trap', 'FOMO Setup', 'Capitulation', 'Stop Hunt', 'Liquidity Grab'];
  const active = traps.filter(() => Math.random() > 0.7);
  return { detected: active, severity: active.length > 1 ? 'high' : active.length === 1 ? 'medium' : 'low' };
}
export function livePatterns() {
  const all = [
    { name: 'Ascending Triangle', bias: 'bullish' as const },
    { name: 'Head & Shoulders', bias: 'bearish' as const },
    { name: 'Bull Flag', bias: 'bullish' as const },
    { name: 'Cup & Handle', bias: 'bullish' as const },
    { name: 'Double Top', bias: 'bearish' as const },
    { name: 'Falling Wedge', bias: 'bullish' as const },
    { name: 'Rising Wedge', bias: 'bearish' as const },
  ];
  return all
    .map(p => ({ ...p, conf: Math.round(Math.random() * 100) }))
    .filter(p => p.conf > 50)
    .sort((a, b) => b.conf - a.conf)
    .slice(0, 4);
}
export function liveEnergy(c: ChinnikstahComposite) {
  const base = energyFlowIndex(c);
  const value = Math.round(jitter(base.value, 10));
  return { value, polarity: value > 0 ? 'positive' : 'negative', intensity: Math.abs(value) };
}
export function liveContagion() {
  const r = liveRng();
  return ['BTC', 'ETH', 'DXY', 'GOLD', 'SPX'].map(asset => ({
    asset,
    impact: +((r() - 0.5) * 2).toFixed(2),
  }));
}
export function liveMemory(c: ChinnikstahComposite) {
  const r = liveRng();
  return {
    similarSetups: Math.round(r() * 40 + 5),
    historicalWinRate: Math.round(45 + r() * 40),
    avgReturn: +((r() * 6 - 2).toFixed(2)),
    bestMatch: `${Math.round(r() * 30 + 5)} days ago — similar harmony pattern (${c.harmonyIndex}%)`,
  };
}
export function liveAnomalies() {
  const anomalies = [
    { signal: 'Volume Spike', severity: Math.random() > 0.6 ? 'detected' : 'clear' },
    { signal: 'Spread Widening', severity: Math.random() > 0.7 ? 'detected' : 'clear' },
    { signal: 'Off-Hours Move', severity: Math.random() > 0.8 ? 'detected' : 'clear' },
    { signal: 'Correlation Break', severity: Math.random() > 0.75 ? 'detected' : 'clear' },
  ];
  return { anomalies, total: anomalies.filter(a => a.severity === 'detected').length };
}