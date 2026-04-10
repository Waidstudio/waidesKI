import { useState, useMemo } from 'react';
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

  const quantum = useMemo(() => generateQuantumState(selectedAsset), [selectedAsset]);
  const overview = useMemo(() => generateMarketOverview(selectedAsset), [selectedAsset]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">Quantum Predictions</h1>
        <p className="text-xs text-muted-foreground font-mono">Probability field mapping • Timeline projection • Signal collapse mechanism</p>
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
