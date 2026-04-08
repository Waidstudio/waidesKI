import { useState, useMemo } from 'react';
import { TerminalCard } from '@/components/TerminalCard';
import { SignalDetail } from '@/components/SignalDetail';
import { SignalStrengthMeter } from '@/components/SignalStrengthMeter';
import { CorrelationMatrix } from '@/components/CorrelationMatrix';
import { LiquidityDepthCard } from '@/components/LiquidityDepthCard';
import { VolatilityGauge } from '@/components/VolatilityGauge';
import { SentimentRadar } from '@/components/SentimentRadar';
import { generateSignal } from '@/lib/konsmia/signal-engine';
import { generateCorrelations } from '@/lib/konsmia/mock-data';
import type { WaidesSignal } from '@/lib/konsmia/types';

export default function Analysis() {
  const [selectedAsset, setSelectedAsset] = useState('BTC/USD');
  const assets = ['BTC/USD', 'ETH/USD', 'EUR/USD', 'SOL/USD', 'GBP/USD'];

  const signal = useMemo(() => generateSignal(selectedAsset), [selectedAsset]);
  const correlations = useMemo(() => generateCorrelations(), []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">Deep Analysis</h1>
        <p className="text-xs text-muted-foreground font-mono">Multi-layer intelligence breakdown</p>
      </div>

      {/* Asset selector */}
      <div className="flex flex-wrap gap-2">
        {assets.map(a => (
          <button
            key={a}
            onClick={() => setSelectedAsset(a)}
            className={`px-3 py-1.5 rounded text-xs font-mono border transition-colors ${
              selectedAsset === a ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {signal ? (
        <>
          {/* Signal Overview */}
          <TerminalCard title={`ANALYSIS: ${selectedAsset}`} subtitle="Full Multi-Layer Breakdown">
            <SignalDetail signal={signal} />
          </TerminalCard>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TerminalCard title="SIGNAL STRENGTH METER">
              <SignalStrengthMeter score={signal.overallScore} label="Overall Score" />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <SignalStrengthMeter score={signal.macro.score} label="Macro" />
                <SignalStrengthMeter score={signal.micro.score} label="Micro" />
                <SignalStrengthMeter score={signal.psychological.score} label="Psych" />
                <SignalStrengthMeter score={signal.temporal.score} label="Temporal" />
              </div>
            </TerminalCard>

            <TerminalCard title="LIQUIDITY DEPTH" subtitle={selectedAsset}>
              <LiquidityDepthCard asset={selectedAsset} />
            </TerminalCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TerminalCard title="VOLATILITY ANALYSIS">
              <div className="flex flex-col items-center gap-4">
                <VolatilityGauge value={Math.abs(signal.overallScore)} label="Signal Volatility" />
                <VolatilityGauge value={signal.psychological.fearGreedIndex} label="Fear/Greed" />
              </div>
            </TerminalCard>

            <TerminalCard title="SENTIMENT BREAKDOWN">
              <SentimentRadar
                fearGreed={signal.psychological.fearGreedIndex}
                retailSentiment={Math.round(50 + signal.psychological.score / 2)}
                socialVolume={Math.round(50 + signal.macro.score / 2)}
                newsImpact={Math.round(50 + signal.micro.score / 2)}
              />
            </TerminalCard>
          </div>

          <TerminalCard title="CORRELATION MATRIX" subtitle="Cross-asset relationships">
            <CorrelationMatrix pairs={correlations} />
          </TerminalCard>

          {/* Inner Analysis Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TerminalCard title="MACRO DEEP DIVE">
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="bg-secondary/20 rounded p-3">
                  <p className="font-semibold text-foreground mb-1">Global Trend</p>
                  <p>{signal.macro.globalTrend}</p>
                </div>
                <div className="bg-secondary/20 rounded p-3">
                  <p className="font-semibold text-foreground mb-1">Interest Rates</p>
                  <p>{signal.macro.interestRates}</p>
                </div>
                <div className="bg-secondary/20 rounded p-3">
                  <p className="font-semibold text-foreground mb-1">Inflation</p>
                  <p>{signal.macro.inflation}</p>
                </div>
                <div className="bg-secondary/20 rounded p-3">
                  <p className="font-semibold text-foreground mb-1">Geopolitics</p>
                  <p>{signal.macro.geopolitics}</p>
                </div>
              </div>
            </TerminalCard>

            <TerminalCard title="MICRO DEEP DIVE">
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="bg-secondary/20 rounded p-3">
                  <p className="font-semibold text-foreground mb-1">Price Action</p>
                  <p>{signal.micro.priceAction}</p>
                </div>
                <div className="bg-secondary/20 rounded p-3">
                  <p className="font-semibold text-foreground mb-1">Order Flow</p>
                  <p>{signal.micro.orderFlow}</p>
                </div>
                <div className="bg-secondary/20 rounded p-3">
                  <p className="font-semibold text-foreground mb-1">Key Support</p>
                  <p>{signal.micro.keyLevels.support.map(s => s.toFixed(2)).join(', ')}</p>
                </div>
                <div className="bg-secondary/20 rounded p-3">
                  <p className="font-semibold text-foreground mb-1">Key Resistance</p>
                  <p>{signal.micro.keyLevels.resistance.map(r => r.toFixed(2)).join(', ')}</p>
                </div>
              </div>
            </TerminalCard>
          </div>
        </>
      ) : (
        <TerminalCard title="NO SIGNAL">
          <p className="text-sm text-muted-foreground">Shavoka KI blocked this signal for ethical reasons.</p>
        </TerminalCard>
      )}
    </div>
  );
}
