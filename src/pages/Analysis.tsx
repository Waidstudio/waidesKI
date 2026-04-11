import { useState, useMemo } from 'react';
import { TerminalCard } from '@/components/TerminalCard';
import { VerdictPanel } from '@/components/VerdictPanel';
import { TimePrediction } from '@/components/TimePrediction';
import { EntryPrecisionCard } from '@/components/EntryPrecisionCard';
import { LiquidityIntelligence } from '@/components/LiquidityIntelligence';
import { CorrelationIntelligence } from '@/components/CorrelationIntelligence';
import { ConfidenceGauge } from '@/components/ConfidenceGauge';
import { SignalStrengthMeter } from '@/components/SignalStrengthMeter';
import { SentimentRadar } from '@/components/SentimentRadar';
import { NoTradePanel } from '@/components/NoTradePanel';
import { DataFreshness } from '@/components/DataFreshness';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useSignals } from '@/hooks/useSignals';
import { getConfidenceThreshold } from '@/lib/konsmia/signal-engine';
import type { KIMode } from '@/lib/konsmia/types';

export default function Analysis() {
  const [selectedAsset, setSelectedAsset] = useState('BTC/USD');
  const [mode, setMode] = useState<KIMode>('balanced');
  const assets = ['BTC/USD', 'ETH/USD', 'EUR/USD', 'SOL/USD', 'GBP/USD'];

  const { signals, loading, lastGenerated, refresh } = useSignals({
    assets: [selectedAsset],
    mode,
    autoRefresh: false,
  });

  const signal = signals[0] ?? null;
  const dataAge = Date.now() - lastGenerated.getTime();

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 sm:pb-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">KI Analysis</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">Confidence threshold: {getConfidenceThreshold(mode)}%</span>
            <DataFreshness ageMs={dataAge} isStale={dataAge > 120000} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
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
        <div className="flex gap-2">
          {(['conservative', 'balanced', 'aggressive'] as KIMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded text-[10px] font-mono border transition-colors capitalize ${
                mode === m ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <LoadingSkeleton variant="card" lines={6} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LoadingSkeleton variant="card" lines={4} />
            <LoadingSkeleton variant="card" lines={4} />
          </div>
        </div>
      ) : signal ? (
        <>
          {signal.bias === 'no_trade' ? (
            <NoTradePanel signal={signal} />
          ) : (
            <TerminalCard title={`KI VERDICT: ${selectedAsset}`} subtitle={`${signal.confidencePercent}% confidence • ${mode} mode`}>
              <VerdictPanel verdict={signal.verdict} />
            </TerminalCard>
          )}

          {signal.bias !== 'no_trade' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {signal.timeWindow && (
                <TerminalCard title="TIME PREDICTION" subtitle="Breakout timing analysis">
                  <TimePrediction timeWindow={signal.timeWindow} />
                </TerminalCard>
              )}
              {signal.entryPrecision && (
                <TerminalCard title="ENTRY PRECISION" subtitle="Optimal entry parameters">
                  <EntryPrecisionCard entry={signal.entryPrecision} bias={signal.bias} />
                </TerminalCard>
              )}
            </div>
          )}

          {/* Confidence + Signal Strength */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TerminalCard title="CONFIDENCE ANALYSIS"
              headerRight={
                <div className="flex items-center gap-1.5">
                  <div className={`h-2 w-16 rounded-full bg-muted overflow-hidden`}>
                    <div
                      className={`h-full rounded-full transition-all ${signal.confidencePercent >= getConfidenceThreshold(mode) ? 'bg-success' : 'bg-warning'}`}
                      style={{ width: `${signal.confidencePercent}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">{signal.confidencePercent}% / {getConfidenceThreshold(mode)}%</span>
                </div>
              }>
              <ConfidenceGauge
                score={signal.confidencePercent}
                layers={[
                  { name: 'Macro', score: signal.macro.score },
                  { name: 'Micro', score: signal.micro.score },
                  { name: 'Psych', score: signal.psychological.score },
                  { name: 'Time', score: signal.temporal.score },
                  { name: 'Liq', score: signal.liquidity.score },
                  { name: 'Corr', score: signal.correlation.score },
                ]}
              />
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

          {/* Liquidity + Correlation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TerminalCard title="LIQUIDITY INTELLIGENCE">
              <LiquidityIntelligence liquidity={signal.liquidity} />
            </TerminalCard>
            <TerminalCard title="CORRELATION INTELLIGENCE">
              <CorrelationIntelligence correlation={signal.correlation} />
            </TerminalCard>
          </div>

          {/* Deep Dive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TerminalCard title="MACRO DEEP DIVE">
              <div className="space-y-3 text-xs text-muted-foreground">
                {[
                  { label: 'Global Trend', value: signal.macro.globalTrend },
                  { label: 'Interest Rates', value: signal.macro.interestRates },
                  { label: 'Inflation', value: signal.macro.inflation },
                  { label: 'Geopolitics', value: signal.macro.geopolitics },
                  { label: 'Institutional', value: signal.macro.institutionalBehavior },
                ].map(item => (
                  <div key={item.label} className="bg-secondary/20 rounded p-3">
                    <p className="font-semibold text-foreground mb-1">{item.label}</p>
                    <p>{item.value}</p>
                  </div>
                ))}
              </div>
            </TerminalCard>
            <TerminalCard title="MICRO DEEP DIVE">
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="bg-secondary/20 rounded p-3">
                  <p className="font-semibold text-foreground mb-1">Price Action</p>
                  <p>{signal.micro.priceAction}</p>
                </div>
                <div className="bg-secondary/20 rounded p-3">
                  <p className="font-semibold text-foreground mb-1">Market Structure</p>
                  <p>{signal.micro.marketStructure}</p>
                </div>
                <div className="bg-secondary/20 rounded p-3">
                  <p className="font-semibold text-foreground mb-1">Order Flow</p>
                  <p>{signal.micro.orderFlow}</p>
                </div>
                <div className="bg-secondary/20 rounded p-3">
                  <p className="font-semibold text-foreground mb-1">Key Levels</p>
                  <p>Support: {signal.micro.keyLevels.support.map(s => s.toFixed(2)).join(', ')}</p>
                  <p>Resistance: {signal.micro.keyLevels.resistance.map(r => r.toFixed(2)).join(', ')}</p>
                </div>
              </div>
            </TerminalCard>
          </div>

          {/* MTF Alignment */}
          <TerminalCard title="MULTI-TIMEFRAME CONFIRMATION">
            <div className={`rounded-lg p-4 border text-center ${signal.multiTimeframeAligned ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'}`}>
              <p className={`font-mono text-sm font-bold ${signal.multiTimeframeAligned ? 'text-success' : 'text-danger'}`}>
                {signal.multiTimeframeAligned ? '✓ ALL TIMEFRAMES ALIGNED' : '✗ TIMEFRAME CONFLICT DETECTED'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {signal.multiTimeframeAligned
                  ? 'Micro, Temporal, and Liquidity layers are pointing in the same direction.'
                  : 'Warning: layers show conflicting signals. Trade with extreme caution or avoid.'}
              </p>
            </div>
          </TerminalCard>
        </>
      ) : (
        <TerminalCard title="SHAVOKA FILTER">
          <div className="text-center py-8">
            <p className="text-2xl mb-2">🛡️</p>
            <p className="text-sm text-foreground font-semibold">Signal Blocked by Ethical Firewall</p>
            <p className="text-xs text-muted-foreground mt-1">Shavoka KI determined conditions carry unacceptable risk patterns.</p>
          </div>
        </TerminalCard>
      )}
    </div>
  );
}
