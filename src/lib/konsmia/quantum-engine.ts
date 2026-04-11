// Quantum Analysis Layer — Probability Field Mapping, Timeline Projection, Signal Collapse
import type { MarketBias } from './types';
import { getCurrentSession, getSessionVolatilityMultiplier } from './signal-engine';

export interface QuantumState {
  probabilityFields: ProbabilityField[];
  timelineProjections: TimelineProjection[];
  signalCollapsed: boolean;
  collapseConfidence: number;
  dimensionalCorrelations: DimensionalCorrelation[];
  quantumScore: number;
}

export interface ProbabilityField {
  scenario: string;
  probability: number;
  direction: MarketBias;
  magnitude: 'small' | 'medium' | 'large';
  timeHorizon: string;
}

export interface TimelineProjection {
  id: string;
  path: string;
  probability: number;
  priceTarget: number;
  duration: string;
  selected: boolean;
}

export interface DimensionalCorrelation {
  dimension: string;
  assets: string[];
  strength: number;
  interpretation: string;
}

export interface UserIntelligenceProfile {
  id: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  tradingFrequency: 'low' | 'medium' | 'high';
  emotionalProfile: {
    fearTendency: number;
    greedTendency: number;
    impulsiveness: number;
    patience: number;
  };
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  preferredAssets: string[];
  totalTrades: number;
  winRate: number;
  avgHoldTime: string;
  lastActive: string;
  behaviorNotes: string[];
}

export interface MarketOverviewState {
  globalCondition: string;
  trendAnalysis: { direction: string; strength: number; alignment: string };
  momentumAnalysis: { strength: number; acceleration: boolean; exhaustion: boolean };
  volumeAnalysis: { institutional: boolean; fakeMove: boolean; conviction: number };
  volatilityAnalysis: { phase: 'expansion' | 'contraction'; breakoutPotential: number };
  structureAnalysis: { pattern: string; keyZones: string[]; liquidityMap: string[] };
  psychologicalState: { zone: string; retailVsSmart: string; imbalance: number };
}

export function generateQuantumState(asset: string): QuantumState {
  const session = getCurrentSession();
  const volMult = getSessionVolatilityMultiplier();

  // Session-aware probability fields
  const bullishProb = session === 'overlap' ? 35 + Math.random() * 25 : 25 + Math.random() * 20;
  const fields: ProbabilityField[] = [
    { scenario: 'Bullish continuation above resistance', probability: bullishProb, direction: 'bullish', magnitude: volMult > 1.2 ? 'large' : 'medium', timeHorizon: session === 'overlap' ? '2-4 hours' : '4-8 hours' },
    { scenario: 'Bearish reversal from supply zone', probability: 20 + Math.random() * 15, direction: 'bearish', magnitude: 'small', timeHorizon: '2-4 hours' },
    { scenario: 'Consolidation within range', probability: session === 'asia' ? 30 + Math.random() * 15 : 15 + Math.random() * 10, direction: 'neutral', magnitude: 'small', timeHorizon: '6-12 hours' },
    { scenario: 'Liquidity sweep then reversal', probability: 10 + Math.random() * 15, direction: 'bullish', magnitude: 'large', timeHorizon: '1-3 hours' },
  ];

  // Normalize to 100
  const total = fields.reduce((a, b) => a + b.probability, 0);
  const normalized = fields.map(f => ({ ...f, probability: Math.round((f.probability / total) * 100) }));
  // Fix rounding to sum exactly 100
  const diff = 100 - normalized.reduce((a, b) => a + b.probability, 0);
  normalized[0].probability += diff;

  const basePrice = asset.includes('BTC') ? 67000 : asset.includes('ETH') ? 3500 : asset.includes('SOL') ? 145 : 1.08;
  const projections: TimelineProjection[] = [
    { id: 'TL-1', path: 'Bullish breakout path', probability: Math.round(normalized[0].probability * 1.1), priceTarget: basePrice * (1 + 0.015 * volMult), duration: `${Math.round(4 / volMult)}h`, selected: normalized[0].probability > 35 },
    { id: 'TL-2', path: 'Bearish continuation', probability: normalized[1].probability, priceTarget: basePrice * (1 - 0.015 * volMult), duration: '4h', selected: normalized[1].probability > 35 },
    { id: 'TL-3', path: 'Range-bound oscillation', probability: normalized[2].probability, priceTarget: basePrice, duration: '12h', selected: normalized[2].probability > 35 },
  ];

  // Ensure one is selected
  if (!projections.some(p => p.selected)) {
    projections.reduce((max, p) => p.probability > max.probability ? p : max).selected = true;
  }

  const dimensions: DimensionalCorrelation[] = [
    { dimension: 'Crypto ↔ Forex', assets: ['BTC', 'EUR/USD'], strength: 0.3 + Math.random() * 0.3, interpretation: 'Moderate inverse correlation via dollar index' },
    { dimension: 'Crypto ↔ Indices', assets: ['BTC', 'S&P500'], strength: 0.5 + Math.random() * 0.25, interpretation: 'Risk-on correlation strengthening' },
    { dimension: 'News ↔ Price', assets: [asset], strength: 0.2 + Math.random() * 0.4, interpretation: 'News sentiment driving short-term volatility' },
  ];

  const collapseConf = Math.round(50 + Math.random() * 45);
  return {
    probabilityFields: normalized,
    timelineProjections: projections,
    signalCollapsed: collapseConf >= 85,
    collapseConfidence: collapseConf,
    dimensionalCorrelations: dimensions,
    quantumScore: Math.round((Math.random() - 0.3) * 80),
  };
}

export function generateUserProfile(): UserIntelligenceProfile {
  return {
    id: 'USR-001',
    riskTolerance: 'moderate',
    tradingFrequency: 'medium',
    emotionalProfile: {
      fearTendency: 35,
      greedTendency: 45,
      impulsiveness: 28,
      patience: 72,
    },
    experienceLevel: 'intermediate',
    preferredAssets: ['BTC/USD', 'ETH/USD', 'EUR/USD'],
    totalTrades: 142,
    winRate: 64,
    avgHoldTime: '4.2 hours',
    lastActive: new Date().toISOString(),
    behaviorNotes: [
      'Tends to exit winners too early — patience improving',
      'Good risk management — rarely exceeds 2% per trade',
      'Shows tendency to revenge trade after losses — flag for coaching',
      'Responds well to KI discipline reminders',
      'Prefers London session entries — highest win rate',
    ],
  };
}

export function generateMarketOverview(asset: string): MarketOverviewState {
  const session = getCurrentSession();
  const volMult = getSessionVolatilityMultiplier();
  const trendStr = session === 'overlap' ? 0.5 + Math.random() * 0.4 : Math.random();
  const momStr = Math.round((20 + Math.random() * 60) * volMult);

  return {
    globalCondition: trendStr > 0.6 ? 'Risk-on environment — capital flowing into risk assets' : trendStr < 0.3 ? 'Risk-off — defensive positioning dominant' : 'Mixed — no clear macro direction',
    trendAnalysis: {
      direction: trendStr > 0.5 ? 'Bullish' : 'Bearish',
      strength: Math.min(100, Math.round(trendStr * 100)),
      alignment: trendStr > 0.6 ? 'HTF and LTF aligned' : 'Timeframe divergence detected',
    },
    momentumAnalysis: {
      strength: Math.min(100, momStr),
      acceleration: momStr > 60,
      exhaustion: momStr > 85,
    },
    volumeAnalysis: {
      institutional: Math.random() > 0.4,
      fakeMove: Math.random() > 0.75,
      conviction: Math.round(30 + Math.random() * 50),
    },
    volatilityAnalysis: {
      phase: volMult > 1.1 ? 'expansion' : 'contraction',
      breakoutPotential: Math.min(100, Math.round(40 + Math.random() * 50 * volMult)),
    },
    structureAnalysis: {
      pattern: trendStr > 0.5 ? 'HH/HL — Bullish structure' : 'LH/LL — Bearish structure',
      keyZones: ['Previous daily high', 'Weekly open', 'Monthly pivot'],
      liquidityMap: ['Stops below recent low', 'Sell-side above range high'],
    },
    psychologicalState: {
      zone: Math.random() > 0.5 ? 'Greed building' : 'Fear present',
      retailVsSmart: 'Retail long-biased, institutions hedging',
      imbalance: Math.round(Math.random() * 40),
    },
  };
}
