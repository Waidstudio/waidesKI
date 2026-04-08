import { cn } from '@/lib/utils';
import type { MarketData } from '@/lib/konsmia/types';

interface MarketHeatmapProps {
  data: MarketData[];
  className?: string;
}

export function MarketHeatmap({ data, className }: MarketHeatmapProps) {
  const maxAbs = Math.max(...data.map(d => Math.abs(d.change24h)), 1);

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5', className)}>
      {data.map(asset => {
        const intensity = Math.min(Math.abs(asset.change24h) / maxAbs, 1);
        const positive = asset.change24h >= 0;
        return (
          <div
            key={asset.symbol}
            className={cn(
              'rounded-lg p-3 text-center transition-all hover:scale-105 cursor-default',
              positive
                ? `bg-success/${Math.round(intensity * 40 + 10)}`
                : `bg-danger/${Math.round(intensity * 40 + 10)}`
            )}
            style={{
              backgroundColor: positive
                ? `hsl(160 100% 45% / ${intensity * 0.4 + 0.05})`
                : `hsl(0 72% 55% / ${intensity * 0.4 + 0.05})`,
            }}
          >
            <p className="font-mono text-xs font-bold text-foreground">{asset.symbol}</p>
            <p className={cn('font-mono text-sm font-bold mt-0.5', positive ? 'text-success' : 'text-danger')}>
              {positive ? '+' : ''}{asset.change24h.toFixed(2)}%
            </p>
            <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
              {asset.price < 10 ? asset.price.toFixed(4) : asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
        );
      })}
    </div>
  );
}
