import type { TradeJournalEntry, PortfolioAsset, AlertItem, CorrelationPair, EconomicEvent, PerformanceMetric, AssetVaultData, LockRule, SignalMemory } from './types';

export function generateTradeJournal(): TradeJournalEntry[] {
  const assets = ['BTC/USD', 'ETH/USD', 'EUR/USD', 'SOL/USD', 'GBP/USD'];
  return Array.from({ length: 20 }, (_, i) => {
    const dir = Math.random() > 0.5 ? 'long' : 'short' as const;
    const entry = Math.random() * 70000;
    const pnlPct = (Math.random() - 0.4) * 10;
    const exit = entry * (1 + pnlPct / 100);
    return {
      id: `TJ-${1000 + i}`,
      timestamp: new Date(Date.now() - i * 3600000 * Math.random() * 48).toISOString(),
      asset: assets[i % assets.length],
      direction: dir,
      entry: Math.round(entry * 100) / 100,
      exit: Math.round(exit * 100) / 100,
      pnl: Math.round((exit - entry) * (dir === 'long' ? 1 : -1) * 100) / 100,
      pnlPercent: Math.round(pnlPct * 100) / 100,
      confidence: Math.abs(pnlPct) > 3 ? 'high' : Math.abs(pnlPct) > 1 ? 'medium' : 'low',
      notes: pnlPct > 0 ? 'Clean entry at support, TP hit' : 'Stopped out on volatility spike',
      tredbeingId: i % 3 === 0 ? `TB-00${(i % 4) + 1}` : undefined,
      outcome: pnlPct > 0 ? 'win' : 'loss',
    } as TradeJournalEntry;
  });
}

export function generatePortfolio(): PortfolioAsset[] {
  return [
    { symbol: 'BTC', name: 'Bitcoin', allocation: 35, value: 23500, pnl: 2340, pnlPercent: 11.05 },
    { symbol: 'ETH', name: 'Ethereum', allocation: 25, value: 16800, pnl: 1200, pnlPercent: 7.69 },
    { symbol: 'SOL', name: 'Solana', allocation: 15, value: 10050, pnl: -320, pnlPercent: -3.08 },
    { symbol: 'USDT', name: 'Tether', allocation: 15, value: 10000, pnl: 0, pnlPercent: 0 },
    { symbol: 'EUR/USD', name: 'Euro FX', allocation: 10, value: 6700, pnl: 450, pnlPercent: 7.2 },
  ];
}

export function generateAlerts(): AlertItem[] {
  return [
    { id: 'A-001', timestamp: new Date().toISOString(), type: 'signal', severity: 'info', title: 'New Signal: BTC/USD', message: 'Waides KI generated a new signal — review the verdict panel', read: false },
    { id: 'A-002', timestamp: new Date(Date.now() - 300000).toISOString(), type: 'risk', severity: 'warning', title: 'Risk Budget 72%', message: 'Portfolio exposure approaching Webonyix risk threshold', read: false },
    { id: 'A-003', timestamp: new Date(Date.now() - 900000).toISOString(), type: 'system', severity: 'info', title: 'KonsNet Syncing', message: 'Data pipeline re-synchronizing with KonsNet node cluster', read: true },
    { id: 'A-004', timestamp: new Date(Date.now() - 1800000).toISOString(), type: 'price', severity: 'critical', title: 'ETH/USD Flash Move', message: 'ETH moved 3.2% in 5 minutes — liquidity sweep detected', read: true },
    { id: 'A-005', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'signal', severity: 'warning', title: 'Shavoka Blocked Signal', message: 'EUR/USD signal rejected by ethical firewall', read: true },
    { id: 'A-006', timestamp: new Date(Date.now() - 5400000).toISOString(), type: 'risk', severity: 'critical', title: 'Market Shift Detected', message: 'Rapid sentiment reversal — Waides KI recommends caution', read: false },
  ];
}

export function generateCorrelations(): CorrelationPair[] {
  const assets = ['BTC', 'ETH', 'SOL', 'XRP', 'EUR/USD'];
  const pairs: CorrelationPair[] = [];
  for (let i = 0; i < assets.length; i++) {
    for (let j = i + 1; j < assets.length; j++) {
      pairs.push({ assetA: assets[i], assetB: assets[j], correlation: Math.round((Math.random() * 2 - 1) * 100) / 100 });
    }
  }
  return pairs;
}

export function generateEconomicCalendar(): EconomicEvent[] {
  const now = Date.now();
  return [
    { id: 'EC-01', timestamp: new Date(now + 3600000).toISOString(), title: 'US CPI (YoY)', country: 'US', impact: 'high', forecast: '3.1%', previous: '3.2%' },
    { id: 'EC-02', timestamp: new Date(now + 7200000).toISOString(), title: 'ECB Interest Rate Decision', country: 'EU', impact: 'high', forecast: '4.25%', previous: '4.50%' },
    { id: 'EC-03', timestamp: new Date(now + 14400000).toISOString(), title: 'US Jobless Claims', country: 'US', impact: 'medium', forecast: '215K', previous: '211K' },
    { id: 'EC-04', timestamp: new Date(now + 28800000).toISOString(), title: 'UK GDP (QoQ)', country: 'UK', impact: 'medium', forecast: '0.3%', previous: '0.1%' },
    { id: 'EC-05', timestamp: new Date(now + 43200000).toISOString(), title: 'Japan BoJ Meeting', country: 'JP', impact: 'high', forecast: '-0.10%', previous: '-0.10%' },
    { id: 'EC-06', timestamp: new Date(now + 86400000).toISOString(), title: 'US Retail Sales (MoM)', country: 'US', impact: 'medium', forecast: '0.4%', previous: '0.6%' },
  ];
}

export function generatePerformanceMetrics(): PerformanceMetric[] {
  return [
    { label: 'Total P&L', value: 4766, change: 12.3, unit: 'USD' },
    { label: 'Win Rate', value: 64, change: 2.1, unit: '%' },
    { label: 'Sharpe Ratio', value: 1.82, change: 0.15, unit: '' },
    { label: 'Max Drawdown', value: -8.4, change: -1.2, unit: '%' },
    { label: 'Avg Trade', value: 127, change: 15, unit: 'USD' },
    { label: 'Active Signals', value: 4, change: 1, unit: '' },
  ];
}

export function generateAssetVault(): AssetVaultData {
  return {
    totalBalance: 67050,
    lockedFunds: 25000,
    availableFunds: 42050,
    growthPercent: 8.4,
    lockRules: [
      { id: 'LR-01', name: 'Time Lock', type: 'time_lock', value: 30, active: true, description: 'Funds locked for 30 days minimum' },
      { id: 'LR-02', name: 'Daily Loss Limit', type: 'loss_limit', value: 500, active: true, description: 'Maximum $500 daily loss allowed' },
      { id: 'LR-03', name: 'Daily Spending Cap', type: 'daily_cap', value: 2000, active: false, description: 'Maximum $2000 daily trading volume' },
    ],
  };
}

export function generateSignalMemory(): SignalMemory[] {
  return [
    { signalId: 'SIG-001', asset: 'BTC/USD', prediction: 'bullish', confidencePercent: 88, timestamp: new Date(Date.now() - 86400000).toISOString(), outcome: 'correct', actualResult: '+2.3% in 24h' },
    { signalId: 'SIG-002', asset: 'ETH/USD', prediction: 'bearish', confidencePercent: 82, timestamp: new Date(Date.now() - 172800000).toISOString(), outcome: 'correct', actualResult: '-1.8% in 24h' },
    { signalId: 'SIG-003', asset: 'SOL/USD', prediction: 'bullish', confidencePercent: 76, timestamp: new Date(Date.now() - 259200000).toISOString(), outcome: 'incorrect', actualResult: '-0.5% — weak momentum' },
    { signalId: 'SIG-004', asset: 'EUR/USD', prediction: 'no_trade', confidencePercent: 45, timestamp: new Date(Date.now() - 345600000).toISOString(), outcome: 'correct', actualResult: 'Market stayed flat' },
    { signalId: 'SIG-005', asset: 'BTC/USD', prediction: 'bearish', confidencePercent: 91, timestamp: new Date(Date.now() - 432000000).toISOString(), outcome: 'correct', actualResult: '-3.1% in 18h' },
  ];
}
