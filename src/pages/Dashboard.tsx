import { useState, useEffect, useCallback } from 'react';
import { TerminalCard } from '@/components/TerminalCard';
import { KIStatusBar } from '@/components/KIStatusBar';
import { VerdictPanel } from '@/components/VerdictPanel';
import { SignalStrengthMeter } from '@/components/SignalStrengthMeter';
import { SessionClock } from '@/components/SessionClock';
import { AlertsFeed } from '@/components/AlertsFeed';
import { PerformanceCard } from '@/components/PerformanceCard';
import { MarketHeatmap } from '@/components/MarketHeatmap';
import { StatusDot } from '@/components/StatusDot';
import { NoTradePanel } from '@/components/NoTradePanel';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchCryptoData } from '@/lib/konsmia/market-data';
import { generateSignal } from '@/lib/konsmia/signal-engine';
import { generateAlerts, generatePerformanceMetrics } from '@/lib/konsmia/mock-data';
import type { WaidesSignal, MarketData, KIMode } from '@/lib/konsmia/types';

export default function Dashboard() {
  const [signals, setSignals] = useState<WaidesSignal[]>([]);
  const [cryptoData, setCryptoData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [mode] = useState<KIMode>('balanced');
  const alerts = generateAlerts();
  const metrics = generatePerformanceMetrics();

  const loadData = useCallback(async () => {
    setLoading(true);
    const crypto = await fetchCryptoData();
    setCryptoData(crypto);
    const assets = ['BTC/USD', 'ETH/USD', 'EUR/USD', 'SOL/USD'];
    const newSignals = assets.map(a => generateSignal(a, mode)).filter(Boolean) as WaidesSignal[];
    setSignals(newSignals);
    setLastUpdate(new Date());
    setLoading(false);
  }, [mode]);

  useEffect(() => { loadData(); }, [loadData]);

  const globalBias = signals.length > 0
    ? signals.filter(s => s.bias === 'bullish').length > signals.filter(s => s.bias === 'bearish').length ? 'bullish' : signals.filter(s => s.bias === 'bearish').length > 0 ? 'bearish' : 'neutral'
    : 'observing';

  const kiStatus = loading ? 'waiting' : signals.some(s => s.bias !== 'no_trade') ? 'active' : 'observing';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">Command Center</h1>
          <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
            <StatusDot status="online" /> System Online • Last: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="font-mono text-[10px] border-border h-7 px-2">
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* KI Status */}
      <KIStatusBar
        status={kiStatus as 'active' | 'observing' | 'waiting'}
        globalBias={globalBias}
        signalsCount={signals.filter(s => s.bias !== 'no_trade').length}
        alertsCount={alerts.filter(a => !a.read).length}
      />

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {metrics.map(m => <PerformanceCard key={m.label} metric={m} />)}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Primary Signal */}
        <div className="lg:col-span-2 space-y-4">
          {signals.length > 0 && signals[0].bias === 'no_trade' ? (
            <NoTradePanel signal={signals[0]} />
          ) : signals.length > 0 ? (
            <TerminalCard title={`KI VERDICT: ${signals[0].asset}`} subtitle="Primary Signal">
              <VerdictPanel verdict={signals[0].verdict} />
            </TerminalCard>
          ) : !loading ? (
            <TerminalCard title="SIGNAL ENGINE">
              <p className="text-sm text-muted-foreground">No signals — Shavoka KI filtered for ethical alignment.</p>
            </TerminalCard>
          ) : null}

          {/* Additional signals */}
          {signals.slice(1, 3).map(signal => (
            <TerminalCard key={signal.id} title={`${signal.asset} — ${signal.bias.toUpperCase()}`} subtitle={`${signal.confidencePercent}% confidence`}>
              <div className="space-y-2">
                <p className="text-xs text-foreground/90 italic">"{signal.verdict.soulVoice.slice(0, 200)}..."</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${signal.bias === 'bullish' ? 'bg-success/10 text-success' : signal.bias === 'bearish' ? 'bg-danger/10 text-danger' : 'bg-muted text-muted-foreground'}`}>
                    {signal.verdict.action.toUpperCase()}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">Risk: {signal.verdict.riskLevel}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">Score: {signal.overallScore}</span>
                </div>
              </div>
            </TerminalCard>
          ))}

          <TerminalCard title="MARKET HEATMAP" subtitle="24h Price Change">
            <MarketHeatmap data={cryptoData} />
          </TerminalCard>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <TerminalCard title="SESSION CLOCK">
            <SessionClock />
          </TerminalCard>

          <TerminalCard title="SIGNAL STRENGTH">
            <SignalStrengthMeter score={signals[0]?.overallScore ?? 0} label="Primary Signal" />
          </TerminalCard>

          <TerminalCard title="ALERTS">
            <AlertsFeed alerts={alerts} />
          </TerminalCard>
        </div>
      </div>
    </div>
  );
}
