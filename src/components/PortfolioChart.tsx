import { cn } from '@/lib/utils';
import type { PortfolioAsset } from '@/lib/konsmia/types';

interface PortfolioChartProps {
  assets: PortfolioAsset[];
  className?: string;
}

const colors = ['bg-primary', 'bg-accent', 'bg-info', 'bg-warning', 'bg-danger'];

export function PortfolioChart({ assets, className }: PortfolioChartProps) {
  const total = assets.reduce((s, a) => s + a.value, 0);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Bar chart */}
      <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
        {assets.map((a, i) => (
          <div
            key={a.symbol}
            className={cn('h-full transition-all', colors[i % colors.length])}
            style={{ width: `${a.allocation}%` }}
            title={`${a.symbol}: ${a.allocation}%`}
          />
        ))}
      </div>

      {/* Legend + details */}
      <div className="space-y-2">
        {assets.map((a, i) => (
          <div key={a.symbol} className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2">
              <div className={cn('h-3 w-3 rounded-sm', colors[i % colors.length])} />
              <span className="font-mono text-xs font-bold text-foreground">{a.symbol}</span>
              <span className="text-[10px] text-muted-foreground">{a.allocation}%</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-foreground">${a.value.toLocaleString()}</span>
              <span className={cn('font-mono text-[10px] font-semibold', a.pnl >= 0 ? 'text-success' : 'text-danger')}>
                {a.pnl >= 0 ? '+' : ''}{a.pnlPercent.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-2 flex justify-between">
        <span className="font-mono text-xs text-muted-foreground">Total Value</span>
        <span className="font-mono text-sm font-bold text-foreground">${total.toLocaleString()}</span>
      </div>
    </div>
  );
}
