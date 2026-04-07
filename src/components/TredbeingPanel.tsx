import { cn } from '@/lib/utils';
import { StatusDot } from './StatusDot';
import type { Tredbeing } from '@/lib/konsmia/types';

interface TredbeingPanelProps {
  tredbeings: Tredbeing[];
  className?: string;
}

export function TredbeingPanel({ tredbeings, className }: TredbeingPanelProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {tredbeings.map(tb => (
        <div key={tb.id} className="flex items-center justify-between py-2.5 px-3 rounded bg-secondary/30">
          <div className="flex items-center gap-3">
            <StatusDot status={tb.status} />
            <div>
              <span className="font-mono text-xs font-bold text-foreground">{tb.name}</span>
              <span className="text-[10px] text-muted-foreground ml-2">{tb.asset}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className={cn('font-mono text-xs font-semibold', tb.pnl >= 0 ? 'text-success' : 'text-danger')}>
                {tb.pnl >= 0 ? '+' : ''}{tb.pnl.toLocaleString()} USD
              </span>
            </div>
            <div className="text-right hidden sm:block">
              <span className="font-mono text-[10px] text-muted-foreground">{tb.winRate}% WR</span>
            </div>
            <div className={cn(
              'px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase',
              tb.currentPosition === 'long' && 'bg-success/10 text-success',
              tb.currentPosition === 'short' && 'bg-danger/10 text-danger',
              tb.currentPosition === 'flat' && 'bg-muted text-muted-foreground',
            )}>
              {tb.currentPosition}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
