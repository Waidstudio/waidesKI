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
  score: number; // -100 to 100
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
  fearGreedIndex: number; // 0-100
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
  integrity: number; // 0-100
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
