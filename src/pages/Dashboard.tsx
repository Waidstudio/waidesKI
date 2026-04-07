import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Zap, RefreshCw, BarChart3, Users, Newspaper, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TerminalCard } from '@/components/TerminalCard';
import { MarketTicker } from '@/components/MarketTicker';
import { KonsmiaMap } from '@/components/KonsmiaMap';
import { TredbeingPanel } from '@/components/TredbeingPanel';
import { SignalDetail } from '@/components/SignalDetail';
import { NiuzFeed } from '@/components/NiuzFeed';
import { StatusDot } from '@/components/StatusDot';
import { fetchCryptoData, getSimulatedForexData } from '@/lib/konsmia/market-data';
import { generateSignal, generateTredbeings, generateNiuzArticles } from '@/lib/konsmia/signal-engine';
import { allModules } from '@/lib/konsmia/modules';
import type { MarketData, WaidesSignal, Tredbeing, NiuzArticle } from '@/lib/konsmia/types';

export default function Dashboard() {
  const [cryptoData, setCryptoData] = useState<MarketData[]>([]);
  const [forexData, setForexData] = useState<MarketData[]>([]);
  const [signals, setSignals] = useState<WaidesSignal[]>([]);
  const [tredbeings] = useState<Tredbeing[]>(generateTredbeings());
  const [articles, setArticles] = useState<NiuzArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    setLoading(true);
    const crypto = await fetchCryptoData();
    const forex = getSimulatedForexData();
    setCryptoData(crypto);
    setForexData(forex);

    const assets = ['BTC/USD', 'ETH/USD', 'EUR/USD', 'SOL/USD'];
    const newSignals = assets.map(a => generateSignal(a)).filter(Boolean) as WaidesSignal[];
    setSignals(newSignals);
    setArticles(generateNiuzArticles(newSignals));
    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="min-h-screen bg-gradient-dark relative">
      <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-mono text-xs font-bold text-foreground tracking-wider">WAIDES KI</span>
            <StatusDot status="online" className="ml-1" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-muted-foreground hidden sm:block">
              Last: {lastUpdate.toLocaleTimeString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="font-mono text-[10px] border-border h-7 px-2"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-4">
        <Tabs defaultValue="signals" className="space-y-4">
          <TabsList className="bg-secondary/50 border border-border">
            <TabsTrigger value="signals" className="font-mono text-[10px] data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <BarChart3 className="h-3 w-3 mr-1" /> Signals
            </TabsTrigger>
            <TabsTrigger value="markets" className="font-mono text-[10px] data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <TrendingUpIcon className="h-3 w-3 mr-1" /> Markets
            </TabsTrigger>
            <TabsTrigger value="tredbeings" className="font-mono text-[10px] data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Users className="h-3 w-3 mr-1" /> Tredbeings
            </TabsTrigger>
            <TabsTrigger value="niuz" className="font-mono text-[10px] data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Newspaper className="h-3 w-3 mr-1" /> Niuz
            </TabsTrigger>
            <TabsTrigger value="konsmia" className="font-mono text-[10px] data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Map className="h-3 w-3 mr-1" /> Konsmia
            </TabsTrigger>
          </TabsList>

          {/* Signals Tab */}
          <TabsContent value="signals" className="space-y-4">
            {signals.length === 0 && !loading ? (
              <TerminalCard title="SIGNAL ENGINE">
                <p className="text-sm text-muted-foreground">No signals generated — Shavoka KI may have filtered them for ethical alignment.</p>
              </TerminalCard>
            ) : (
              signals.map(signal => (
                <TerminalCard key={signal.id} title={`SIGNAL: ${signal.id}`} subtitle={`Kabinet System | Oracle Verified`}>
                  <SignalDetail signal={signal} />
                </TerminalCard>
              ))
            )}
          </TabsContent>

          {/* Markets Tab */}
          <TabsContent value="markets" className="space-y-4">
            <TerminalCard title="CRYPTO MARKETS" subtitle="via CoinGecko + KonsNet">
              <MarketTicker data={cryptoData} />
            </TerminalCard>
            <TerminalCard title="FOREX MARKETS" subtitle="Simulated via KonsNet">
              <MarketTicker data={forexData} />
            </TerminalCard>
          </TabsContent>

          {/* Tredbeings Tab */}
          <TabsContent value="tredbeings">
            <TerminalCard title="TREDBEINGS" subtitle="Autonomous Trading Entities — Execution Layer">
              <TredbeingPanel tredbeings={tredbeings} />
            </TerminalCard>
          </TabsContent>

          {/* Niuz Tab */}
          <TabsContent value="niuz">
            <TerminalCard title="WAIDES NIUZ" subtitle="Human-Readable Intelligence Feed">
              <NiuzFeed articles={articles} />
            </TerminalCard>
          </TabsContent>

          {/* Konsmia Tab */}
          <TabsContent value="konsmia">
            <TerminalCard title="KONSMIA SYSTEM MAP" subtitle="All modules synchronized with Waides KI">
              <KonsmiaMap modules={allModules} />
            </TerminalCard>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
