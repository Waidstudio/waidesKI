import { cn } from '@/lib/utils';
import type { TradeJournalEntry } from '@/lib/konsmia/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props { entries: TradeJournalEntry[] }

export function TradingHistoryPanel({ entries }: Props) {
  const wins = entries.filter(e => e.outcome === 'win').length;
  const losses = entries.filter(e => e.outcome === 'loss').length;
  const totalPnl = entries.reduce((sum, e) => sum + e.pnl, 0);
  const winRate = entries.length > 0 ? Math.round((wins / entries.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Trades', value: entries.length },
          { label: 'Win Rate', value: `${winRate}%` },
          { label: 'Wins', value: wins },
          { label: 'Losses', value: losses },
        ].map(stat => (
          <div key={stat.label} className="bg-secondary/20 rounded p-2 text-center">
            <p className="font-mono text-[10px] text-muted-foreground">{stat.label}</p>
            <p className="font-mono text-sm font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Total P&L */}
      <div className={`rounded-lg p-3 border text-center ${totalPnl >= 0 ? 'border-success/20 bg-success/5' : 'border-danger/20 bg-danger/5'}`}>
        <p className="font-mono text-[10px] text-muted-foreground">TOTAL P&L</p>
        <p className={`font-mono text-xl font-bold ${totalPnl >= 0 ? 'text-success' : 'text-danger'}`}>
          {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)}
        </p>
      </div>

      {/* Recent Trades */}
      <div className="space-y-1">
        {entries.slice(0, 8).map(entry => (
          <div key={entry.id} className="flex items-center gap-2 px-2 py-1.5 rounded bg-secondary/10 hover:bg-secondary/20 transition-colors">
            {entry.direction === 'long'
              ? <TrendingUp className="h-3 w-3 text-success shrink-0" />
              : <TrendingDown className="h-3 w-3 text-danger shrink-0" />
            }
            <span className="font-mono text-[10px] font-bold text-foreground w-16">{entry.asset}</span>
            <span className="font-mono text-[10px] text-muted-foreground hidden sm:inline">{entry.entry.toFixed(2)}</span>
            <span className="text-[10px] text-muted-foreground mx-1 hidden sm:inline">→</span>
            <span className="font-mono text-[10px] text-muted-foreground hidden sm:inline">{entry.exit.toFixed(2)}</span>
            <span className={cn('font-mono text-[10px] font-bold ml-auto', entry.pnl >= 0 ? 'text-success' : 'text-danger')}>
              {entry.pnl >= 0 ? '+' : ''}{entry.pnlPercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
