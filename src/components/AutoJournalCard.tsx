import { BookOpen, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { SignalMemory } from '@/lib/konsmia/types';

interface Props { memories: SignalMemory[] }

const outcomeConfig = {
  correct: { icon: CheckCircle, color: 'text-success', label: 'CORRECT' },
  incorrect: { icon: XCircle, color: 'text-danger', label: 'INCORRECT' },
  pending: { icon: Clock, color: 'text-warning', label: 'PENDING' },
};

export function AutoJournalCard({ memories }: Props) {
  const correct = memories.filter(m => m.outcome === 'correct').length;
  const total = memories.filter(m => m.outcome !== 'pending').length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" />
        <p className="font-mono text-xs font-bold text-foreground">AUTO JOURNAL</p>
        <span className="ml-auto font-mono text-[10px] text-primary">{accuracy}% accuracy</span>
      </div>

      {/* Accuracy Bar */}
      <div className="bg-secondary/20 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] text-muted-foreground">SIGNAL ACCURACY</span>
          <span className="font-mono text-sm font-bold text-foreground">{correct}/{total}</span>
        </div>
        <div className="w-full bg-secondary/40 rounded-full h-2">
          <div className="bg-success/60 rounded-full h-2 transition-all" style={{ width: `${accuracy}%` }} />
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-1.5">
        {memories.map(memory => {
          const config = outcomeConfig[memory.outcome || 'pending'];
          const Icon = config.icon;
          return (
            <div key={memory.signalId} className="bg-secondary/10 rounded p-2.5">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-3 w-3 ${config.color}`} />
                <span className="font-mono text-[10px] font-bold text-foreground">{memory.asset}</span>
                <span className={`font-mono text-[9px] uppercase ${config.color}`}>{config.label}</span>
                <span className="ml-auto font-mono text-[10px] text-primary">{memory.confidencePercent}%</span>
              </div>
              <div className="flex items-center justify-between pl-5">
                <span className="text-[10px] text-muted-foreground capitalize">{memory.prediction}</span>
                {memory.actualResult && <span className="text-[10px] text-muted-foreground">{memory.actualResult}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
