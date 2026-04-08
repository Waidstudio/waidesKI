import { useState, useEffect, useCallback } from 'react';
import { TerminalCard } from '@/components/TerminalCard';
import { SignalDetail } from '@/components/SignalDetail';
import { SignalStrengthMeter } from '@/components/SignalStrengthMeter';
import { SessionClock } from '@/components/SessionClock';
import { QuickTradePanel } from '@/components/QuickTradePanel';
import { VolatilityGauge } from '@/components/VolatilityGauge';
import { SentimentRadar } from '@/components/SentimentRadar';
import { AlertsFeed } from '@/components/AlertsFeed';
import { PerformanceCard } from '@/components/PerformanceCard';
import { MarketHeatmap } from '@/components/MarketHeatmap';
import { StatusDot } from '@/components/StatusDot';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchCryptoData, getSimulatedForexData } from '@/lib/konsmia/market-data';
import { generateSignal } from '@/lib/konsmia/signal-engine';
import { generateAlerts, generatePerformanceMetrics } from '@/lib/konsmia/mock-data';
import type { WaidesSignal, MarketData } from '@/lib/konsmia/types';

export default function Dashboard() {
  const [signals, setSignals] = useState<WaidesSignal[]>([]);
  const [cryptoData, setCryptoData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const alerts = generateAlerts();
  const metrics = generatePerformanceMetrics();

  const loadData = useCallback(async () => {
    setLoading(true);
    const crypto = await fetchCryptoData();
    setCryptoData(crypto);
    const assets = ['BTC/USD', 'ETH/USD', 'EUR/USD', 'SOL/USD'];
    const newSignals = assets.map(a => generateSignal(a)).filter(Boolean) as WaidesSignal[];
    setSignals(newSignals);
    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
            <StatusDot status="online" /> System Online • Last: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="font-mono text-[10px] border-border h-7 px-2">
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {metrics.map(m => <PerformanceCard key={m.label} metric={m} />)}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Signals */}
        <div className="lg:col-span-2 space-y-4">
          {signals.length === 0 && !loading ? (
            <TerminalCard title="SIGNAL ENGINE">
              <p className="text-sm text-muted-foreground">No signals — Shavoka KI filtered for ethical alignment.</p>
            </TerminalCard>
          ) : (
            signals.slice(0, 2).map(signal => (
              <TerminalCard key={signal.id} title={`SIGNAL: ${signal.id}`} subtitle="Kabinet System | Oracle Verified">
                <SignalDetail signal={signal} />
              </TerminalCard>
            ))
          )}

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

          <TerminalCard title="VOLATILITY">
            <VolatilityGauge value={Math.round(Math.random() * 100)} label="VIX Proxy" />
          </TerminalCard>

          <TerminalCard title="SENTIMENT">
            <SentimentRadar
              fearGreed={Math.round(Math.random() * 100)}
              retailSentiment={Math.round(Math.random() * 100)}
              socialVolume={Math.round(Math.random() * 100)}
              newsImpact={Math.round(Math.random() * 100)}
            />
          </TerminalCard>

          <TerminalCard title="QUICK TRADE">
            <QuickTradePanel />
          </TerminalCard>

          <TerminalCard title="ALERTS">
            <AlertsFeed alerts={alerts} />
          </TerminalCard>
        </div>
      </div>
    </div>
  );
}
