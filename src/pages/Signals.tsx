import { useState, useMemo } from 'react';
import { TerminalCard } from '@/components/TerminalCard';
import { SignalCard } from '@/components/SignalCard';
import { VerdictPanel } from '@/components/VerdictPanel';
import { TimePrediction } from '@/components/TimePrediction';
import { EntryPrecisionCard } from '@/components/EntryPrecisionCard';
import { ConfluenceSummaryCard } from '@/components/ConfluenceSummaryCard';
import { RiskNoteCard } from '@/components/RiskNoteCard';
import { NoTradePanel } from '@/components/NoTradePanel';
import { generateSignal, getConfidenceThreshold } from '@/lib/konsmia/signal-engine';
import type { WaidesSignal, KIMode } from '@/lib/konsmia/types';

export default function Signals() {
  const [mode, setMode] = useState<KIMode>('balanced');
  const [selectedSignal, setSelectedSignal] = useState<WaidesSignal | null>(null);

  const assets = ['BTC/USD', 'ETH/USD', 'EUR/USD', 'SOL/USD', 'GBP/USD'];
  const signals = useMemo(() => {
    return assets.map(a => generateSignal(a, mode)).filter(Boolean) as WaidesSignal[];
  }, [mode]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">Signal Intelligence</h1>
          <p className="text-xs text-muted-foreground font-mono">
            Active signals • Threshold: {getConfidenceThreshold(mode)}% • {signals.filter(s => s.bias !== 'no_trade').length} actionable
          </p>
        </div>
        <div className="flex gap-2">
          {(['conservative', 'balanced', 'aggressive'] as KIMode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setSelectedSignal(null); }}
              className={`px-3 py-1.5 rounded text-[10px] font-mono border transition-colors capitalize ${
                mode === m ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
              }`}>{m}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Signal Cards */}
        <div className="lg:col-span-1 space-y-3">
          {signals.map(signal => (
            <SignalCard key={signal.id} signal={signal} onClick={() => setSelectedSignal(signal)} />
          ))}
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2 space-y-4">
          {selectedSignal ? (
            <>
              {selectedSignal.bias === 'no_trade' ? (
                <NoTradePanel signal={selectedSignal} />
              ) : (
                <TerminalCard title={`KI VERDICT: ${selectedSignal.asset}`} subtitle={`${selectedSignal.confidencePercent}% confidence`}>
                  <VerdictPanel verdict={selectedSignal.verdict} />
                </TerminalCard>
              )}

              <TerminalCard title="CONFLUENCE">
                <ConfluenceSummaryCard signal={selectedSignal} />
              </TerminalCard>

              {selectedSignal.bias !== 'no_trade' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedSignal.timeWindow && (
                    <TerminalCard title="TIME PREDICTION">
                      <TimePrediction timeWindow={selectedSignal.timeWindow} />
                    </TerminalCard>
                  )}
                  {selectedSignal.entryPrecision && (
                    <TerminalCard title="ENTRY PRECISION">
                      <EntryPrecisionCard entry={selectedSignal.entryPrecision} bias={selectedSignal.bias} />
                    </TerminalCard>
                  )}
                </div>
              )}

              <TerminalCard title="RISK ASSESSMENT">
                <RiskNoteCard
                  riskLevel={selectedSignal.verdict.riskLevel}
                  confidencePercent={selectedSignal.confidencePercent}
                  noTradeReasons={selectedSignal.verdict.noTradeMissing}
                />
              </TerminalCard>
            </>
          ) : (
            <TerminalCard title="SELECT A SIGNAL">
              <div className="text-center py-12">
                <p className="text-2xl mb-2">📡</p>
                <p className="text-sm text-foreground font-semibold">Select a signal to view full analysis</p>
                <p className="text-xs text-muted-foreground mt-1">Click any signal card on the left to see the complete KI verdict, timing, and risk assessment.</p>
              </div>
            </TerminalCard>
          )}
        </div>
      </div>
    </div>
  );
}
