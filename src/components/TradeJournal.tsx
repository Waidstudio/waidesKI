import { cn } from '@/lib/utils';
import type { TradeJournalEntry } from '@/lib/konsmia/types';

interface TradeJournalProps {
  entries: TradeJournalEntry[];
  className?: string;
}

export function TradeJournal({ entries, className }: TradeJournalProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {/* Header */}
      <div className="hidden sm:grid grid-cols-7 gap-2 px-3 py-1.5 text-[10px] font-mono text-muted-foreground uppercase">
        <span>Time</span>
        <span>Asset</span>
        <span>Dir</span>
        <span>Entry</span>
        <span>Exit</span>
        <span className="text-right">P&L</span>
        <span className="text-right">Conf</span>
      </div>

      {entries.slice(0, 10).map(entry => (
        <div key={entry.id} className="grid grid-cols-3 sm:grid-cols-7 gap-2 px-3 py-2 rounded bg-secondary/20 hover:bg-secondary/30 transition-colors items-center">
          <span className="font-mono text-[10px] text-muted-foreground">
            {new Date(entry.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="font-mono text-xs font-bold text-foreground">{entry.asset}</span>
          <span className={cn(
            'font-mono text-[10px] font-bold uppercase',
            entry.direction === 'long' ? 'text-success' : 'text-danger'
          )}>
            {entry.direction}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground hidden sm:block">{entry.entry.toFixed(2)}</span>
          <span className="font-mono text-[10px] text-muted-foreground hidden sm:block">{entry.exit.toFixed(2)}</span>
          <span className={cn(
            'font-mono text-xs font-semibold text-right hidden sm:block',
            entry.pnl >= 0 ? 'text-success' : 'text-danger'
          )}>
            {entry.pnl >= 0 ? '+' : ''}{entry.pnlPercent.toFixed(2)}%
          </span>
          <span className="font-mono text-[10px] text-muted-foreground text-right hidden sm:block uppercase">{entry.confidence}</span>
        </div>
      ))}
    </div>
  );
}
