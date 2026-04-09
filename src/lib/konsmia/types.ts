// Konsmia System Types

export type MarketBias = 'bullish' | 'bearish' | 'neutral' | 'no_trade';
export type Confidence = 'high' | 'medium' | 'low';
export type SessionType = 'london' | 'new_york' | 'asia' | 'overlap';
export type Sentiment = 'extreme_fear' | 'fear' | 'neutral' | 'greed' | 'extreme_greed';
export type KIMode = 'conservative' | 'balanced' | 'aggressive';

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
  marketStructure: string;
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

export interface LiquidityAnalysis {
  stopHuntZones: string[];
  liquidityPools: string[];
  trapZones: string[];
  liquidityScore: number;
  score: number;
}

export interface CorrelationAnalysis {
  pairs: { assetA: string; assetB: string; correlation: number; interpretation: string }[];
  crossAssetBehavior: string;
  score: number;
}

export interface TimeWindow {
  startTime: string;
  endTime: string;
  expectedDuration: string;
  breakoutTime: string;
  timingStrength: 'weak' | 'moderate' | 'strong';
}

export interface EntryPrecision {
  entryZone: [number, number];
  invalidationLevel: number;
  confirmationTrigger: string;
}

export interface KIVerdict {
  direction: MarketBias;
  confidencePercent: number;
  action: 'buy' | 'sell' | 'wait' | 'no_trade';
  riskLevel: 'low' | 'medium' | 'high';
  signalStrength: number;
  reasoning: string;
  soulVoice: string;
  confluenceSummary: string;
  noTradeReason?: string;
  noTradeMissing?: string[];
}

export interface WaidesSignal {
  id: string;
  timestamp: string;
  asset: string;
  bias: MarketBias;
  confidence: Confidence;
  confidencePercent: number;
  timeframe: string;
  macro: MacroAnalysis;
  micro: MicroAnalysis;
  psychological: PsychologicalAnalysis;
  temporal: TemporalAnalysis;
  liquidity: LiquidityAnalysis;
  correlation: CorrelationAnalysis;
  overallScore: number;
  reasoning: string;
  ethicalAlignment: boolean;
  shavokaApproved: boolean;
  verdict: KIVerdict;
  timeWindow?: TimeWindow;
  entryPrecision?: EntryPrecision;
  multiTimeframeAligned: boolean;
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
  kiTag?: 'watching' | 'high_opportunity' | 'avoid' | null;
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
  outcome?: 'win' | 'loss' | 'pending';
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

export interface AssetVaultData {
  totalBalance: number;
  lockedFunds: number;
  availableFunds: number;
  growthPercent: number;
  lockRules: LockRule[];
}

export interface LockRule {
  id: string;
  name: string;
  type: 'time_lock' | 'loss_limit' | 'daily_cap';
  value: number;
  active: boolean;
  description: string;
}

export interface SignalMemory {
  signalId: string;
  asset: string;
  prediction: MarketBias;
  confidencePercent: number;
  timestamp: string;
  outcome?: 'correct' | 'incorrect' | 'pending';
  userFeedback?: string;
  actualResult?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ki';
  content: string;
  timestamp: string;
  signal?: WaidesSignal;
}
