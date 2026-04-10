import { TerminalCard } from '@/components/TerminalCard';
import { TradingHistoryPanel } from '@/components/TradingHistoryPanel';
import { AutoJournalCard } from '@/components/AutoJournalCard';
import { TradeJournal } from '@/components/TradeJournal';
import { generateTradeJournal, generateSignalMemory } from '@/lib/konsmia/mock-data';
import { useMemo } from 'react';

export default function Journal() {
  const entries = useMemo(() => generateTradeJournal(), []);
  const memories = useMemo(() => generateSignalMemory(), []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">Trading Journal</h1>
        <p className="text-xs text-muted-foreground font-mono">Auto-journaling • Signal memory • Self-correction system</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <TerminalCard title="TRADING PERFORMANCE" subtitle="Overall statistics">
            <TradingHistoryPanel entries={entries} />
          </TerminalCard>

          <TerminalCard title="TRADE LOG" subtitle="Full trade history">
            <TradeJournal entries={entries} />
          </TerminalCard>
        </div>

        <div className="space-y-4">
          <TerminalCard title="SIGNAL MEMORY" subtitle="KI learning system">
            <AutoJournalCard memories={memories} />
          </TerminalCard>

          <TerminalCard title="KI SELF-CORRECTION">
            <div className="space-y-3">
              <div className="bg-secondary/20 rounded p-3 text-center">
                <p className="font-mono text-[10px] text-muted-foreground">LEARNING STATUS</p>
                <p className="font-mono text-sm font-bold text-success">ACTIVE</p>
              </div>
              <div className="space-y-2 text-[10px] text-muted-foreground">
                <p>• Last recalibration: {new Date(Date.now() - 3600000).toLocaleTimeString()}</p>
                <p>• Patterns identified: 12 new micro-patterns</p>
                <p>• Weight adjustment: Micro +2%, Temporal -1%</p>
                <p>• Error source analysis: 3 false breakouts logged</p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded p-3">
                <p className="text-[10px] text-foreground/80 italic">"Every prediction I make becomes training data. I evolve with every outcome. My accuracy today is built on yesterday's lessons."</p>
              </div>
            </div>
          </TerminalCard>
        </div>
      </div>
    </div>
  );
}
