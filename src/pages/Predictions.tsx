import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Radio } from 'lucide-react';
import { TerminalCard } from '@/components/TerminalCard';
import { QuantumAnalysisPanel } from '@/components/QuantumAnalysisPanel';
import { PredictionTimeline } from '@/components/PredictionTimeline';
import { MomentumGauge } from '@/components/MomentumGauge';
import { VolumeAnalysisCard } from '@/components/VolumeAnalysisCard';
import { MarketStructureCard } from '@/components/MarketStructureCard';
import { MarketOverviewPanel } from '@/components/MarketOverviewPanel';
import { generateQuantumState, generateMarketOverview } from '@/lib/konsmia/quantum-engine';

export default function Predictions() {
  const [selectedAsset, setSelectedAsset] = useState('BTC/USD');
  const assets = ['BTC/USD', 'ETH/USD', 'EUR/USD', 'SOL/USD', 'GBP/USD'];

  // Backend-driven recompute: bumps when signals/sandbox tables push new rows
  const [tick, setTick] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const quantum = useMemo(() => generateQuantumState(selectedAsset), [selectedAsset, tick]);
  const overview = useMemo(() => generateMarketOverview(selectedAsset), [selectedAsset, tick]);

  useEffect(() => {
    const flash = () => {
      setTick(t => t + 1);
      setLastUpdate(new Date());
      setPulse(true);
      setTimeout(() => setPulse(false), 1400);
    };
    const ch = supabase
      .channel('predictions-stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'signals' }, (p: any) => {
        const row = p.new ?? p.old;
        if (!row || row.asset === selectedAsset) flash();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tredbeing_signals' }, (p: any) => {
        const row = p.new ?? p.old;
        if (!row || row.asset === selectedAsset) flash();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selectedAsset]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">Quantum Predictions</h1>
          <p className="text-xs text-muted-foreground font-mono">Probability field mapping • Timeline projection • Signal collapse mechanism</p>
        </div>
        <Badge
          variant="outline"
          className={`font-mono text-[10px] gap-1.5 transition-colors ${pulse ? 'border-success text-success bg-success/10 animate-pulse' : 'border-border text-muted-foreground'}`}
          title="Updates pushed from backend — no polling"
        >
          <Radio className={`h-3 w-3 ${pulse ? 'text-success' : ''}`} />
          {pulse ? 'NEW UPDATE' : `LIVE · ${lastUpdate.toLocaleTimeString()}`}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {assets.map(a => (
          <button key={a} onClick={() => setSelectedAsset(a)}
            className={`px-3 py-1.5 rounded text-xs font-mono border transition-colors ${
              selectedAsset === a ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
            }`}>{a}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TerminalCard title="QUANTUM STATE" subtitle="Probability field analysis">
          <QuantumAnalysisPanel quantum={quantum} asset={selectedAsset} />
        </TerminalCard>

        <TerminalCard title="MARKET OVERVIEW" subtitle="Multi-dimensional analysis">
          <MarketOverviewPanel overview={overview} />
        </TerminalCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TerminalCard title="MOMENTUM">
          <MomentumGauge
            strength={overview.momentumAnalysis.strength}
            acceleration={overview.momentumAnalysis.acceleration}
            exhaustion={overview.momentumAnalysis.exhaustion}
          />
        </TerminalCard>

        <TerminalCard title="VOLUME ANALYSIS">
          <VolumeAnalysisCard
            institutional={overview.volumeAnalysis.institutional}
            fakeMove={overview.volumeAnalysis.fakeMove}
            conviction={overview.volumeAnalysis.conviction}
          />
        </TerminalCard>

        <TerminalCard title="MARKET STRUCTURE">
          <MarketStructureCard
            pattern={overview.structureAnalysis.pattern}
            keyZones={overview.structureAnalysis.keyZones}
            liquidityMap={overview.structureAnalysis.liquidityMap}
          />
        </TerminalCard>
      </div>

      <TerminalCard title="TIMELINE PROJECTIONS" subtitle="Most probable price paths">
        <PredictionTimeline projections={quantum.timelineProjections} />
      </TerminalCard>
    </div>
  );
}
