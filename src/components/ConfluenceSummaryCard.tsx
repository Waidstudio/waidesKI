import { Sparkles } from 'lucide-react';
import type { WaidesSignal } from '@/lib/konsmia/types';

interface Props { signal: WaidesSignal }

export function ConfluenceSummaryCard({ signal }: Props) {
  const layers = [
    { name: 'Macro', score: signal.macro.score, weight: 15 },
    { name: 'Micro', score: signal.micro.score, weight: 25 },
    { name: 'Psychological', score: signal.psychological.score, weight: 15 },
    { name: 'Temporal', score: signal.temporal.score, weight: 15 },
    { name: 'Liquidity', score: signal.liquidity.score, weight: 20 },
    { name: 'Correlation', score: signal.correlation.score, weight: 10 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="font-mono text-xs font-bold text-foreground">CONFLUENCE SUMMARY</p>
      </div>

      <p className="text-xs text-foreground/80 italic leading-relaxed bg-secondary/20 rounded p-3">
        "{signal.verdict.confluenceSummary}"
      </p>

      <div className="space-y-2">
        {layers.map(layer => {
          const contribution = Math.round(layer.score * layer.weight / 100);
          const isPositive = layer.score > 0;
          return (
            <div key={layer.name} className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground w-20">{layer.name}</span>
              <div className="flex-1 flex items-center gap-1">
                <div className="flex-1 bg-secondary/30 rounded-full h-2 relative overflow-hidden">
                  <div
                    className={`absolute top-0 h-2 rounded-full transition-all ${isPositive ? 'bg-success/60 left-1/2' : 'bg-danger/60 right-1/2'}`}
                    style={{ width: `${Math.min(Math.abs(layer.score) / 2, 50)}%` }}
                  />
                </div>
              </div>
              <span className={`font-mono text-[10px] w-8 text-right ${isPositive ? 'text-success' : 'text-danger'}`}>
                {isPositive ? '+' : ''}{layer.score}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground w-6">{layer.weight}%</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded p-3">
        <span className="font-mono text-xs text-foreground">Weighted Score</span>
        <span className={`font-mono text-lg font-bold ${signal.overallScore > 0 ? 'text-success' : signal.overallScore < 0 ? 'text-danger' : 'text-foreground'}`}>
          {signal.overallScore > 0 ? '+' : ''}{signal.overallScore}
        </span>
      </div>
    </div>
  );
}
