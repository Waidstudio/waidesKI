// Konsmia System Types

export type MarketBias = 'bullish' | 'bearish' | 'neutral' | 'no_trade';
export type Confidence = 'high' | 'medium' | 'low';
export type SessionType = 'london' | 'new_york' | 'asia' | 'overlap';
export type Sentiment = 'extreme_fear' | 'fear' | 'neutral' | 'greed' | 'extreme_greed';

export interface MacroAnalysis {
  globalTrend: string;
  interestRates: string;
  inflation: string;
  geopolitics: string;
  institutionalBehavior: string;
  score: number;
}

export interface MicroAnalysis {
  priceAction: string;
  liquidityZones: string[];
  orderFlow: string;
  keyLevels: { support: number[]; resistance: number[] };
  score: number;
}

export interface PsychologicalAnalysis {
  crowdEmotion: Sentiment;
  retailVsInstitutional: string;
  sentimentShift: string;
  fearGreedIndex: number;
  score: number;
}

export interface TemporalAnalysis {
  currentSession: SessionType;
  marketCycle: string;
  shortTermStructure: string;
  longTermStructure: string;
  nextKeyTime: string;
  score: number;
}

export interface WaidesSignal {
  id: string;
  timestamp: string;
  asset: string;
  bias: MarketBias;
  confidence: Confidence;
  timeframe: string;
  macro: MacroAnalysis;
  micro: MicroAnalysis;
  psychological: PsychologicalAnalysis;
  temporal: TemporalAnalysis;
  overallScore: number;
  reasoning: string;
  ethicalAlignment: boolean;
  shavokaApproved: boolean;
}

export interface Tredbeing {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'learning';
  asset: string;
  currentPosition: 'long' | 'short' | 'flat';
  pnl: number;
  winRate: number;
  tradesExecuted: number;
}

export interface KonsmiaModule {
  id: string;
  name: string;
  description: string;
  status: 'online' | 'syncing' | 'offline';
  lastSync: string;
  integrity: number;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  marketCap?: number;
  sparkline?: number[];
}

export interface NiuzArticle {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  category: 'analysis' | 'signal' | 'insight' | 'alert';
  asset?: string;
  bias?: MarketBias;
}

// New types for expanded features

export interface TradeJournalEntry {
  id: string;
  timestamp: string;
  asset: string;
  direction: 'long' | 'short';
  entry: number;
  exit: number;
  pnl: number;
  pnlPercent: number;
  confidence: Confidence;
  notes: string;
  tredbeingId?: string;
}

export interface PortfolioAsset {
  symbol: string;
  name: string;
  allocation: number;
  value: number;
  pnl: number;
  pnlPercent: number;
}

export interface AlertItem {
  id: string;
  timestamp: string;
  type: 'price' | 'signal' | 'system' | 'risk';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  read: boolean;
}

export interface CorrelationPair {
  assetA: string;
  assetB: string;
  correlation: number;
}

export interface EconomicEvent {
  id: string;
  timestamp: string;
  title: string;
  country: string;
  impact: 'high' | 'medium' | 'low';
  forecast?: string;
  previous?: string;
  actual?: string;
}

export interface PerformanceMetric {
  label: string;
  value: number;
  change: number;
  unit: string;
}
