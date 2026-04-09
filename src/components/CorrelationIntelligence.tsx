import type { CorrelationAnalysis } from '@/lib/konsmia/types';
import { GitBranch } from 'lucide-react';

interface Props {
  correlation: CorrelationAnalysis;
}

export function CorrelationIntelligence({ correlation }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-accent" />
        <p className="font-mono text-xs font-bold text-foreground">CORRELATION INTELLIGENCE</p>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">Score: {correlation.score}</span>
      </div>

      <div className="space-y-2">
        {correlation.pairs.map((pair, i) => (
          <div key={i} className="bg-secondary/20 rounded p-3 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs font-bold text-foreground">{pair.assetA} / {pair.assetB}</p>
              <p className="text-[10px] text-muted-foreground">{pair.interpretation}</p>
            </div>
            <span className={`font-mono text-sm font-bold ${pair.correlation > 0.5 ? 'text-success' : pair.correlation < -0.3 ? 'text-danger' : 'text-warning'}`}>
              {pair.correlation.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-secondary/10 rounded p-2">
        <p className="text-xs text-muted-foreground">{correlation.crossAssetBehavior}</p>
      </div>
    </div>
  );
}
