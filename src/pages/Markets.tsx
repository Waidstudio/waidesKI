import { useMemo } from 'react';
import { TerminalCard } from '@/components/TerminalCard';
import { MarketTicker } from '@/components/MarketTicker';
import { MarketHeatmap } from '@/components/MarketHeatmap';
import { MarketPulseList } from '@/components/MarketPulseList';
import { EconomicCalendar } from '@/components/EconomicCalendar';
import { SessionClock } from '@/components/SessionClock';
import { DataFreshness } from '@/components/DataFreshness';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMarketData } from '@/hooks/useMarketData';
import { generateEconomicCalendar } from '@/lib/konsmia/mock-data';

export default function Markets() {
  const { cryptoData, forexData, loading, dataAge, isStale, source, refresh } = useMarketData({ includeFx: true });
  const calendar = useMemo(() => generateEconomicCalendar(), []);

  // Assign KI tags
  const taggedCrypto = useMemo(() => cryptoData.map(c => ({
    ...c,
    kiTag: Math.abs(c.change24h) > 5 ? 'high_opportunity' as const
      : Math.abs(c.change24h) > 3 ? 'watching' as const
      : c.change24h < -4 ? 'avoid' as const : null,
  })), [cryptoData]);

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 sm:pb-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">Market Pulse</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">Live markets with KI intelligence tags</span>
            <DataFreshness ageMs={dataAge} isStale={isStale} source={source} />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading} className="font-mono text-[10px] border-border h-7 px-2">
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* KI Tagged Markets */}
      {loading ? <LoadingSkeleton variant="card" lines={4} /> : (
        <TerminalCard title="KI INTELLIGENCE TAGS" subtitle="Assets flagged by Waides KI"
          headerRight={<DataFreshness ageMs={dataAge} isStale={isStale} />}>
          <MarketPulseList data={taggedCrypto.filter(c => c.kiTag)} />
        </TerminalCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <>
              <LoadingSkeleton variant="card" lines={5} />
              <LoadingSkeleton variant="card" lines={5} />
            </>
          ) : (
            <>
              <TerminalCard title="CRYPTO MARKETS" subtitle="via CoinGecko + KonsNet"
                headerRight={<DataFreshness ageMs={dataAge} isStale={isStale} />}>
                <MarketTicker data={cryptoData} />
              </TerminalCard>
              <TerminalCard title="FOREX MARKETS" subtitle="Simulated via KonsNet">
                <MarketTicker data={forexData} />
              </TerminalCard>
            </>
          )}
          <TerminalCard title="HEATMAP" subtitle="24h Change">
            {loading ? <LoadingSkeleton variant="chart" /> : <MarketHeatmap data={[...cryptoData, ...forexData]} />}
          </TerminalCard>
        </div>
        <div className="space-y-4">
          <TerminalCard title="SESSION CLOCK">
            <SessionClock />
          </TerminalCard>
          <TerminalCard title="ECONOMIC CALENDAR" subtitle="Upcoming Events">
            <EconomicCalendar events={calendar} />
          </TerminalCard>
        </div>
      </div>
    </div>
  );
}
