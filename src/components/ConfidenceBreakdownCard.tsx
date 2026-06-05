import type { ConfidenceBreakdown } from '@/lib/konsmia/types';
import { Brain } from 'lucide-react';

interface Props { breakdown: ConfidenceBreakdown; source?: string }

export function ConfidenceBreakdownCard({ breakdown, source }: Props) {
  const rows: { label: string; value: number; weight: string }[] = [
    { label: 'Trend',      value: breakdown.trend,      weight: '0.25' },
    { label: 'Momentum',   value: breakdown.momentum,   weight: '0.20' },
    { label: 'Volume',     value: breakdown.volume,     weight: '0.15' },
    { label: 'Liquidity',  value: breakdown.liquidity,  weight: '0.15' },
    { label: 'Historical', value: breakdown.historical, weight: '0.15' },
    { label: 'Alignment',  value: breakdown.alignment,  weight: '0.10' },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-primary" />
        <p className="font-mono text-xs font-bold text-foreground">CONFIDENCE BREAKDOWN</p>
        {source && <span className="ml-auto text-[10px] font-mono text-muted-foreground uppercase">{source.replace('_', ' ')}</span>}
      </div>
      <div className="space-y-1.5">
        {rows.map(r => (
          <div key={r.label} className="flex items-center gap-2 text-xs">
            <span className="font-mono text-muted-foreground w-20">{r.label}</span>
            <div className="flex-1 h-1.5 rounded bg-secondary/40 overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.abs(r.value))}%` }} />
            </div>
            <span className="font-mono text-foreground w-10 text-right">{r.value}</span>
            <span className="font-mono text-muted-foreground text-[10px] w-10 text-right">×{r.weight}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-2 flex items-center justify-between">
        <span className="font-mono text-[10px] text-muted-foreground">Final</span>
        <span className="font-mono text-sm font-bold text-primary">{breakdown.final}%</span>
      </div>
      <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">{breakdown.formula}</p>
    </div>
  );
}