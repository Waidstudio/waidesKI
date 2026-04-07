import type { WaidesSignal, MarketBias, Confidence, MacroAnalysis, MicroAnalysis, PsychologicalAnalysis, TemporalAnalysis, Tredbeing, NiuzArticle, Sentiment, SessionType } from './types';
import { checkEthicalAlignment, checkGovernance, checkRiskBudget } from './modules';

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
    globalTrend: score > 20 ? 'Risk-on environment' : score < -20 ? 'Risk-off environment' : 'Mixed signals',
    interestRates: 'Fed holds steady, ECB hinting at cuts',
    inflation: 'CPI trending lower, core sticky',
    geopolitics: 'Moderate tension in Middle East, trade talks ongoing',
    institutionalBehavior: score > 0 ? 'Net buyers on dips' : 'Reducing exposure gradually',
    score,
  };
}

function generateMicro(asset: string): MicroAnalysis {
  const score = Math.round((Math.random() - 0.5) * 100);
  return {
    priceAction: score > 20 ? 'Higher highs, higher lows forming' : score < -20 ? 'Lower highs, lower lows' : 'Range-bound',
    liquidityZones: ['Previous daily high', 'Weekly open', 'Prior session low'],
    orderFlow: score > 0 ? 'Aggressive buyers at support' : 'Sellers absorbing at resistance',
    keyLevels: {
      support: [Math.random() * 1000 + 60000, Math.random() * 1000 + 59000],
      resistance: [Math.random() * 1000 + 69000, Math.random() * 1000 + 70000],
    },
    score,
  };
}

function generatePsychological(): PsychologicalAnalysis {
  const fearGreedIndex = Math.round(Math.random() * 100);
  const score = fearGreedIndex - 50;
  return {
    crowdEmotion: randomSentiment(),
    retailVsInstitutional: fearGreedIndex > 60 ? 'Retail euphoria, institutions hedging' : 'Retail fearful, smart money accumulating',
    sentimentShift: Math.abs(score) > 30 ? 'Significant shift detected' : 'Gradual change',
    fearGreedIndex,
    score,
  };
}

function generateTemporal(): TemporalAnalysis {
  const session = getCurrentSession();
  const score = Math.round((Math.random() - 0.5) * 60);
  return {
    currentSession: session,
    marketCycle: 'Mid-cycle expansion',
    shortTermStructure: score > 10 ? 'Bullish 4H structure' : score < -10 ? 'Bearish 4H structure' : 'Consolidation',
    longTermStructure: 'Weekly uptrend intact',
    nextKeyTime: `${String((new Date().getUTCHours() + 4) % 24).padStart(2, '0')}:00 UTC`,
    score,
  };
}

export function generateSignal(asset: string): WaidesSignal | null {
  if (!checkGovernance('generate_signal')) return null;

  const macro = generateMacro();
  const micro = generateMicro(asset);
  const psychological = generatePsychological();
  const temporal = generateTemporal();

  const overallScore = Math.round((macro.score + micro.score + psychological.score + temporal.score) / 4);
  const ethicalAlignment = checkEthicalAlignment(overallScore);
  
  if (!ethicalAlignment) return null;

  let bias: MarketBias;
  if (Math.abs(overallScore) < 15) bias = 'no_trade';
  else if (overallScore > 0) bias = 'bullish';
  else bias = 'bearish';

  let confidence: Confidence;
  if (Math.abs(overallScore) > 40) confidence = 'high';
  else if (Math.abs(overallScore) > 20) confidence = 'medium';
  else confidence = 'low';

  const now = new Date();
  const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    id: `SIG-${Date.now()}`,
    timestamp: now.toISOString(),
    asset,
    bias,
    confidence,
    timeframe: `Next 24h: ${now.toISOString().slice(11, 16)}-${end.toISOString().slice(11, 16)} UTC`,
    macro,
    micro,
    psychological,
    temporal,
    overallScore,
    reasoning: bias === 'no_trade'
      ? `Market conditions for ${asset} are unclear. Macro and micro layers conflict. Discipline over impulse — no trade recommended.`
      : `${asset} shows ${bias} bias with ${confidence} confidence. ${macro.globalTrend}. ${micro.priceAction}. ${psychological.crowdEmotion} sentiment detected. ${temporal.shortTermStructure}. Next key window: ${temporal.nextKeyTime}.`,
    ethicalAlignment,
    shavokaApproved: true,
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
      : `Waides KI: ${signal.bias.charAt(0).toUpperCase() + signal.bias.slice(1)} Bias on ${signal.asset} (${signal.confidence} confidence)`,
    content: signal.reasoning,
    timestamp: signal.timestamp,
    category: signal.bias === 'no_trade' ? 'insight' : 'signal',
    asset: signal.asset,
    bias: signal.bias,
  }));
}
