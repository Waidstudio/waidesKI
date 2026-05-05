import { useOnyix } from '@/hooks/useOnyix';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OnyixBadge({ compact = false }: { compact?: boolean }) {
  const { balance, max, tier, frozen, consumptionRate } = useOnyix();
  const pct = Math.round((balance / max) * 100);
  const tierColor =
    tier === 'high' ? 'text-success' :
    tier === 'medium' ? 'text-warning' : 'text-danger';
  const barColor =
    tier === 'high' ? 'bg-success' :
    tier === 'medium' ? 'bg-warning' : 'bg-danger';
  return (
    <div className={cn(
      'flex items-center gap-2 px-2 py-1 rounded border border-border/60 bg-card/60 font-mono text-[10px]',
      frozen && 'border-danger animate-pulse'
    )}>
      <Flame className={cn('h-3 w-3', tierColor)} />
      <span className="text-foreground">ONYIX</span>
      <div className="w-16 h-1.5 bg-secondary rounded overflow-hidden">
        <div className={cn('h-full transition-all', barColor)} style={{ width: `${pct}%` }} />
      </div>
      <span className={tierColor}>{pct}%</span>
      {!compact && (
        <>
          <span className="text-muted-foreground">·</span>
          <span className={tierColor}>{tier.toUpperCase()}</span>
          <span className="text-muted-foreground hidden sm:inline">· {consumptionRate}/min</span>
        </>
      )}
      {frozen && <span className="text-danger ml-1">FROZEN</span>}
    </div>
  );
}