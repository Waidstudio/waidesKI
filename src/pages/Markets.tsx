import { useState, useEffect, useCallback, useMemo } from 'react';
import { TerminalCard } from '@/components/TerminalCard';
import { MarketTicker } from '@/components/MarketTicker';
import { MarketHeatmap } from '@/components/MarketHeatmap';
import { MarketPulseList } from '@/components/MarketPulseList';
import { EconomicCalendar } from '@/components/EconomicCalendar';
import { SessionClock } from '@/components/SessionClock';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchCryptoData, getSimulatedForexData } from '@/lib/konsmia/market-data';
import { generateEconomicCalendar } from '@/lib/konsmia/mock-data';
import type { MarketData } from '@/lib/konsmia/types';

export default function Markets() {
  const [cryptoData, setCryptoData] = useState<MarketData[]>([]);
  const [forexData, setForexData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const calendar = useMemo(() => generateEconomicCalendar(), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [crypto, forex] = await Promise.all([fetchCryptoData(), Promise.resolve(getSimulatedForexData())]);
    // Assign KI tags
    const taggedCrypto = crypto.map(c => ({
      ...c,
      kiTag: Math.abs(c.change24h) > 5 ? 'high_opportunity' as const
        : Math.abs(c.change24h) > 3 ? 'watching' as const
        : c.change24h < -4 ? 'avoid' as const : null,
    }));
    setCryptoData(taggedCrypto);
    setForexData(forex);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">Market Pulse</h1>
          <p className="text-xs text-muted-foreground font-mono">Live markets with KI intelligence tags</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="font-mono text-[10px] border-border h-7 px-2">
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* KI Tagged Markets */}
      <TerminalCard title="KI INTELLIGENCE TAGS" subtitle="Assets flagged by Waides KI">
        <MarketPulseList data={cryptoData.filter(c => c.kiTag)} />
      </TerminalCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <TerminalCard title="CRYPTO MARKETS" subtitle="via CoinGecko + KonsNet">
            <MarketTicker data={cryptoData} />
          </TerminalCard>
          <TerminalCard title="FOREX MARKETS" subtitle="Simulated via KonsNet">
            <MarketTicker data={forexData} />
          </TerminalCard>
          <TerminalCard title="HEATMAP" subtitle="24h Change">
            <MarketHeatmap data={[...cryptoData, ...forexData]} />
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
