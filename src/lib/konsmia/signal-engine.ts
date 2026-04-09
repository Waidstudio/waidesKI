import type {
  WaidesSignal, MarketBias, Confidence, KIVerdict,
  MacroAnalysis, MicroAnalysis, PsychologicalAnalysis, TemporalAnalysis,
  LiquidityAnalysis, CorrelationAnalysis, TimeWindow, EntryPrecision,
  Tredbeing, NiuzArticle, Sentiment, SessionType, KIMode,
} from './types';
import { checkEthicalAlignment, checkGovernance } from './modules';

function getCurrentSession(): SessionType {
  const h = new Date().getUTCHours();
  if (h >= 0 && h < 8) return 'asia';
  if (h >= 7 && h < 9) return 'overlap';
  if (h >= 8 && h < 16) return 'london';
  if (h >= 13 && h < 15) return 'overlap';
  if (h >= 13 && h < 22) return 'new_york';
  return 'asia';
}

function randomSentiment(): Sentiment {
  const sentiments: Sentiment[] = ['extreme_fear', 'fear', 'neutral', 'greed', 'extreme_greed'];
  return sentiments[Math.floor(Math.random() * sentiments.length)];
}

function generateMacro(): MacroAnalysis {
  const score = Math.round((Math.random() - 0.5) * 100);
  return {
    globalTrend: score > 20 ? 'Risk-on environment — global markets favoring upside' : score < -20 ? 'Risk-off environment — capital flowing to safety' : 'Mixed signals across global markets',
    interestRates: 'Fed holds steady at current levels, ECB signaling potential easing in next quarter',
    inflation: 'CPI trending lower at 3.1%, but core inflation remains sticky above target',
    geopolitics: 'Moderate geopolitical tension — trade negotiations ongoing, no escalation expected',
    institutionalBehavior: score > 0 ? 'Institutions accumulating on dips — net buyers detected' : 'Smart money reducing exposure — hedging activity increasing',
    score,
  };
}

function generateMicro(asset: string): MicroAnalysis {
  const score = Math.round((Math.random() - 0.5) * 100);
  const basePrice = asset.includes('BTC') ? 67000 : asset.includes('ETH') ? 3500 : asset.includes('SOL') ? 145 : 1.08;
  return {
    priceAction: score > 20 ? 'Higher highs and higher lows forming — bullish structure intact' : score < -20 ? 'Lower highs and lower lows — bearish structure developing' : 'Range-bound consolidation — no clear direction',
    liquidityZones: ['Previous daily high', 'Weekly open level', 'Prior session low', 'Monthly pivot'],
    orderFlow: score > 0 ? 'Aggressive buyers stepping in at support — absorption visible' : 'Sellers absorbing buying pressure at resistance',
    keyLevels: {
      support: [basePrice * 0.97, basePrice * 0.95],
      resistance: [basePrice * 1.03, basePrice * 1.05],
    },
    marketStructure: score > 20 ? 'HH/HL — Bullish' : score < -20 ? 'LH/LL — Bearish' : 'Consolidation',
    score,
  };
}

function generatePsychological(): PsychologicalAnalysis {
  const fearGreedIndex = Math.round(Math.random() * 100);
  const score = fearGreedIndex - 50;
  return {
    crowdEmotion: randomSentiment(),
    retailVsInstitutional: fearGreedIndex > 60
      ? 'Retail traders showing euphoria — institutions quietly hedging their exposure'
      : 'Retail fear dominant — smart money accumulating while most are selling',
    sentimentShift: Math.abs(score) > 30 ? 'Significant sentiment shift detected — crowd behavior changing rapidly' : 'Gradual sentiment transition — no abrupt changes',
    fearGreedIndex,
    score,
  };
}

function generateTemporal(): TemporalAnalysis {
  const session = getCurrentSession();
  const score = Math.round((Math.random() - 0.5) * 60);
  return {
    currentSession: session,
    marketCycle: 'Mid-cycle expansion phase — trend continuation likely',
    shortTermStructure: score > 10 ? 'Bullish 4H structure with momentum' : score < -10 ? 'Bearish 4H structure building' : 'Consolidation on lower timeframes',
    longTermStructure: 'Weekly uptrend structure remains intact — no reversal signals yet',
    nextKeyTime: `${String((new Date().getUTCHours() + 4) % 24).padStart(2, '0')}:00 UTC`,
    score,
  };
}

function generateLiquidity(asset: string): LiquidityAnalysis {
  const score = Math.round((Math.random() - 0.5) * 100);
  const basePrice = asset.includes('BTC') ? 67000 : asset.includes('ETH') ? 3500 : asset.includes('SOL') ? 145 : 1.08;
  return {
    stopHuntZones: [
      `Below ${(basePrice * 0.985).toFixed(2)} — cluster of retail stops`,
      `Above ${(basePrice * 1.015).toFixed(2)} — short squeeze territory`,
    ],
    liquidityPools: [
      `${(basePrice * 0.96).toFixed(2)} — deep liquidity pool`,
      `${(basePrice * 1.04).toFixed(2)} — sell-side liquidity`,
    ],
    trapZones: [
      `${(basePrice * 0.99).toFixed(2)}-${(basePrice * 1.01).toFixed(2)} — false breakout zone`,
    ],
    liquidityScore: Math.abs(score),
    score,
  };
}

function generateCorrelationAnalysis(): CorrelationAnalysis {
  const score = Math.round((Math.random() - 0.5) * 60);
  return {
    pairs: [
      { assetA: 'BTC', assetB: 'ETH', correlation: 0.85 + Math.random() * 0.1, interpretation: 'Strong positive — ETH follows BTC' },
      { assetA: 'BTC', assetB: 'EUR/USD', correlation: -0.3 + Math.random() * 0.2, interpretation: 'Weak inverse — dollar strength impacts both' },
      { assetA: 'BTC', assetB: 'SOL', correlation: 0.7 + Math.random() * 0.15, interpretation: 'Moderate positive — alt follows major' },
    ],
    crossAssetBehavior: score > 10 ? 'Cross-asset alignment supports directional move' : 'Divergence detected — proceed with caution',
    score,
  };
}

function calculateWeightedScore(
  macro: number, micro: number, psychological: number,
  temporal: number, liquidity: number, correlation: number
): number {
  return Math.round(
    micro * 0.25 +
    liquidity * 0.20 +
    temporal * 0.15 +
    psychological * 0.15 +
    macro * 0.15 +
    correlation * 0.10
  );
}

function calculateConfidence(
  macro: MacroAnalysis, micro: MicroAnalysis, psychological: PsychologicalAnalysis,
  temporal: TemporalAnalysis, liquidity: LiquidityAnalysis, correlation: CorrelationAnalysis
): number {
  const scores = [macro.score, micro.score, psychological.score, temporal.score, liquidity.score, correlation.score];
  const signs = scores.map(s => Math.sign(s));
  const agreeing = signs.filter(s => s === Math.sign(scores.reduce((a, b) => a + b, 0))).length;
  const alignmentScore = (agreeing / scores.length) * 100;

  const allPositive = scores.every(s => s > 0);
  const allNegative = scores.every(s => s < 0);
  const timeframeAgreement = (allPositive || allNegative) ? 100 : agreeing >= 4 ? 75 : 50;

  const avgMagnitude = scores.reduce((a, b) => a + Math.abs(b), 0) / scores.length;
  const volatilityStability = Math.min(100, avgMagnitude * 1.5);

  const liquidityConfirmation = liquidity.liquidityScore > 50 ? 100 : liquidity.liquidityScore > 25 ? 70 : 40;

  return Math.round(
    alignmentScore * 0.4 +
    timeframeAgreement * 0.3 +
    volatilityStability * 0.2 +
    liquidityConfirmation * 0.1
  );
}

function generateTimeWindow(temporal: TemporalAnalysis, confidence: number): TimeWindow | undefined {
  if (confidence < 75) return undefined;
  const now = new Date();
  const sessionOffsets: Record<string, number> = { london: 2, new_york: 3, asia: 4, overlap: 1 };
  const offset = sessionOffsets[temporal.currentSession] || 2;
  const startTime = new Date(now.getTime() + offset * 3600000);
  const duration = confidence > 85 ? 3 : 2;
  const endTime = new Date(startTime.getTime() + duration * 3600000);

  return {
    startTime: startTime.toISOString().slice(11, 16) + ' UTC',
    endTime: endTime.toISOString().slice(11, 16) + ' UTC',
    expectedDuration: `${duration}-${duration + 1} hours`,
    breakoutTime: `~${startTime.toISOString().slice(11, 16)} UTC`,
    timingStrength: confidence > 85 ? 'strong' : confidence > 75 ? 'moderate' : 'weak',
  };
}

function generateEntryPrecision(micro: MicroAnalysis, bias: MarketBias): EntryPrecision | undefined {
  if (bias === 'no_trade' || bias === 'neutral') return undefined;
  const support = micro.keyLevels.support[0];
  const resistance = micro.keyLevels.resistance[0];
  if (bias === 'bullish') {
    return {
      entryZone: [support * 1.002, support * 1.008],
      invalidationLevel: support * 0.99,
      confirmationTrigger: 'Break of structure above recent swing high',
    };
  }
  return {
    entryZone: [resistance * 0.998, resistance * 0.992],
    invalidationLevel: resistance * 1.01,
    confirmationTrigger: 'Break of structure below recent swing low',
  };
}

function generateSoulVoice(bias: MarketBias, confidence: number, macro: MacroAnalysis, micro: MicroAnalysis, psychological: PsychologicalAnalysis, temporal: TemporalAnalysis): string {
  if (bias === 'no_trade') {
    return "I do not see a clear opportunity right now. The market is sending mixed messages, and acting on uncertainty would be reckless. Staying out is the best position. Patience is not passive — it is strategic.";
  }
  if (confidence < 70) {
    return `There are hints of a ${bias} lean, but I would not act on this with conviction. The layers are not fully aligned, and I'd rather protect your capital than chase a mediocre setup. Let's wait for clarity.`;
  }
  const direction = bias === 'bullish' ? 'upward' : 'downward';
  const strength = confidence > 85 ? 'with strong conviction' : 'with moderate conviction';
  return `The market is leaning ${direction} ${strength}. ${micro.priceAction}. ${psychological.retailVsInstitutional}. ${temporal.shortTermStructure}. This is not a moment for hesitation — but it is a moment for discipline. Enter with precision, manage your risk, and let the market come to you.`;
}

function generateConfluenceSummary(macro: MacroAnalysis, micro: MicroAnalysis, psychological: PsychologicalAnalysis, temporal: TemporalAnalysis, liquidity: LiquidityAnalysis, correlation: CorrelationAnalysis): string {
  const parts = [];
  parts.push(`Macro conditions are ${macro.score > 15 ? 'supportive' : macro.score < -15 ? 'challenging' : 'neutral'}`);
  parts.push(`micro structure is ${micro.score > 15 ? 'clearly bullish' : micro.score < -15 ? 'clearly bearish' : 'indecisive'}`);
  parts.push(`Psychological data shows ${psychological.crowdEmotion} without ${Math.abs(psychological.score) > 30 ? 'signs of reversal' : 'extreme positioning'}`);
  parts.push(`temporal alignment ${Math.abs(temporal.score) > 15 ? 'supports directional continuation' : 'remains unclear'}`);
  parts.push(`Liquidity ${liquidity.score > 20 ? 'favors the expected move' : 'presents some risk'}`);
  parts.push(`Cross-asset correlation ${Math.abs(correlation.score) > 15 ? 'confirms the thesis' : 'is inconclusive'}`);
  return parts.join('. ') + '.';
}

function checkMultiTimeframeAlignment(micro: MicroAnalysis, temporal: TemporalAnalysis, liquidity: LiquidityAnalysis): boolean {
  const signs = [Math.sign(micro.score), Math.sign(temporal.score), Math.sign(liquidity.score)];
  const allSame = signs.every(s => s === signs[0]) && signs[0] !== 0;
  return allSame;
}

export function getConfidenceThreshold(mode: KIMode): number {
  switch (mode) {
    case 'conservative': return 90;
    case 'balanced': return 85;
    case 'aggressive': return 75;
  }
}

export function generateSignal(asset: string, mode: KIMode = 'balanced'): WaidesSignal | null {
  if (!checkGovernance('generate_signal')) return null;

  const macro = generateMacro();
  const micro = generateMicro(asset);
  const psychological = generatePsychological();
  const temporal = generateTemporal();
  const liquidity = generateLiquidity(asset);
  const correlation = generateCorrelationAnalysis();

  const overallScore = calculateWeightedScore(
    macro.score, micro.score, psychological.score,
    temporal.score, liquidity.score, correlation.score
  );
  const confidencePercent = calculateConfidence(macro, micro, psychological, temporal, liquidity, correlation);
  const ethicalAlignment = checkEthicalAlignment(overallScore);
  if (!ethicalAlignment) return null;

  const mtfAligned = checkMultiTimeframeAlignment(micro, temporal, liquidity);
  const threshold = getConfidenceThreshold(mode);

  let bias: MarketBias;
  if (Math.abs(overallScore) < 20 || confidencePercent < threshold || !mtfAligned) {
    bias = 'no_trade';
  } else if (overallScore > 0) {
    bias = 'bullish';
  } else {
    bias = 'bearish';
  }

  let confidence: Confidence;
  if (confidencePercent > 85) confidence = 'high';
  else if (confidencePercent > 70) confidence = 'medium';
  else confidence = 'low';

  const soulVoice = generateSoulVoice(bias, confidencePercent, macro, micro, psychological, temporal);
  const confluenceSummary = generateConfluenceSummary(macro, micro, psychological, temporal, liquidity, correlation);

  const noTradeReasons: string[] = [];
  if (Math.abs(overallScore) < 20) noTradeReasons.push('Score too weak — no clear directional bias');
  if (confidencePercent < threshold) noTradeReasons.push(`Confidence ${confidencePercent}% below ${threshold}% threshold`);
  if (!mtfAligned) noTradeReasons.push('Multi-timeframe analysis not aligned');

  const verdict: KIVerdict = {
    direction: bias,
    confidencePercent,
    action: bias === 'bullish' ? 'buy' : bias === 'bearish' ? 'sell' : confidencePercent > 60 ? 'wait' : 'no_trade',
    riskLevel: confidencePercent > 85 ? 'low' : confidencePercent > 70 ? 'medium' : 'high',
    signalStrength: Math.abs(overallScore),
    reasoning: bias === 'no_trade'
      ? `Market conditions for ${asset} are unclear. Multiple intelligence layers are in conflict. Discipline over impulse — no trade recommended.`
      : `${asset} shows ${bias} bias at ${confidencePercent}% confidence. Weighted score: ${overallScore}. All conditions met for entry consideration.`,
    soulVoice,
    confluenceSummary,
    noTradeReason: noTradeReasons.length > 0 ? noTradeReasons.join('. ') : undefined,
    noTradeMissing: noTradeReasons.length > 0 ? noTradeReasons : undefined,
  };

  const now = new Date();
  const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const timeWindow = generateTimeWindow(temporal, confidencePercent);
  const entryPrecision = generateEntryPrecision(micro, bias);

  return {
    id: `SIG-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    timestamp: now.toISOString(),
    asset,
    bias,
    confidence,
    confidencePercent,
    timeframe: `Next 24h: ${now.toISOString().slice(11, 16)}-${end.toISOString().slice(11, 16)} UTC`,
    macro,
    micro,
    psychological,
    temporal,
    liquidity,
    correlation,
    overallScore,
    reasoning: verdict.reasoning,
    ethicalAlignment,
    shavokaApproved: true,
    verdict,
    timeWindow,
    entryPrecision,
    multiTimeframeAligned: mtfAligned,
  };
}

export function generateTredbeings(): Tredbeing[] {
  return [
    { id: 'TB-001', name: 'Alpha Hunter', status: 'active', asset: 'BTC/USD', currentPosition: 'long', pnl: 2340, winRate: 67, tradesExecuted: 142 },
    { id: 'TB-002', name: 'Sentinel Flow', status: 'active', asset: 'ETH/USD', currentPosition: 'flat', pnl: 1856, winRate: 62, tradesExecuted: 98 },
    { id: 'TB-003', name: 'Tide Walker', status: 'learning', asset: 'EUR/USD', currentPosition: 'short', pnl: -320, winRate: 48, tradesExecuted: 34 },
    { id: 'TB-004', name: 'Phantom Grid', status: 'paused', asset: 'SOL/USD', currentPosition: 'flat', pnl: 890, winRate: 71, tradesExecuted: 56 },
  ];
}

export function generateNiuzArticles(signals: WaidesSignal[]): NiuzArticle[] {
  return signals.filter(Boolean).map(signal => ({
    id: `NIUZ-${Date.now()}-${signal.asset}`,
    title: signal.bias === 'no_trade'
      ? `Waides KI: No Trade for ${signal.asset} — Discipline Prevails`
      : `Waides KI: ${signal.bias.charAt(0).toUpperCase() + signal.bias.slice(1)} Bias on ${signal.asset} (${signal.confidencePercent}% confidence)`,
    content: signal.verdict.soulVoice,
    timestamp: signal.timestamp,
    category: signal.bias === 'no_trade' ? 'insight' : 'signal',
    asset: signal.asset,
    bias: signal.bias,
  }));
}
