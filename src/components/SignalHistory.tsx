import type { SignalMemory } from '@/lib/konsmia/types';
import { Brain, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface Props {
  memories: SignalMemory[];
}

export function SignalHistory({ memories }: Props) {
  const accuracy = memories.filter(m => m.outcome === 'correct').length / memories.filter(m => m.outcome !== 'pending').length * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-accent" />
          <p className="font-mono text-xs font-bold text-foreground">SIGNAL MEMORY</p>
        </div>
        <span className="font-mono text-xs text-primary font-bold">{accuracy.toFixed(0)}% accuracy</span>
      </div>

      <div className="space-y-2">
        {memories.map(m => (
          <div key={m.signalId} className="bg-secondary/20 rounded p-3 flex items-start gap-3">
            <div className="mt-0.5">
              {m.outcome === 'correct' ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : m.outcome === 'incorrect' ? (
                <XCircle className="h-4 w-4 text-danger" />
              ) : (
                <Clock className="h-4 w-4 text-warning" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs font-bold text-foreground">{m.asset}</p>
                <span className={`font-mono text-[10px] uppercase ${m.prediction === 'bullish' ? 'text-success' : m.prediction === 'bearish' ? 'text-danger' : 'text-muted-foreground'}`}>
                  {m.prediction}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {m.confidencePercent}% confidence • {m.actualResult || 'Pending'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(m.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
