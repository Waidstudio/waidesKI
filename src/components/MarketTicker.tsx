import { cn } from '@/lib/utils';
import type { MarketData } from '@/lib/konsmia/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

interface MiniSparklineProps {
  data: number[];
  positive: boolean;
  className?: string;
}

function MiniSparkline({ data, positive, className }: MiniSparklineProps) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn('w-20 h-6', className)}>
      <polyline fill="none" stroke={positive ? 'hsl(160, 100%, 45%)' : 'hsl(0, 72%, 55%)'} strokeWidth="1.5" points={points} />
    </svg>
  );
}

interface MarketTickerProps {
  data: MarketData[];
  className?: string;
}

export function MarketTicker({ data, className }: MarketTickerProps) {
  // Track previous prices for flash animation
  const prevPrices = useRef<Record<string, number>>({});
  const [flashes, setFlashes] = useState<Record<string, 'up' | 'down' | null>>({});

  useEffect(() => {
    const newFlashes: Record<string, 'up' | 'down' | null> = {};
    data.forEach(asset => {
      const prev = prevPrices.current[asset.symbol];
      if (prev !== undefined && prev !== asset.price) {
        newFlashes[asset.symbol] = asset.price > prev ? 'up' : 'down';
      }
      prevPrices.current[asset.symbol] = asset.price;
    });
    if (Object.keys(newFlashes).length > 0) {
      setFlashes(newFlashes);
      const t = setTimeout(() => setFlashes({}), 1000);
      return () => clearTimeout(t);
    }
  }, [data]);

  return (
    <div className={cn('grid gap-2', className)}>
      {data.map(asset => (
        <div
          key={asset.symbol}
          className={cn(
            'flex items-center justify-between py-2 px-3 rounded transition-all duration-300',
            flashes[asset.symbol] === 'up' ? 'bg-success/10' : flashes[asset.symbol] === 'down' ? 'bg-danger/10' : 'bg-secondary/30 hover:bg-secondary/50'
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs font-bold text-foreground w-16 truncate">{asset.symbol}</span>
            <span className="text-xs text-muted-foreground hidden sm:block truncate">{asset.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <MiniSparkline data={asset.sparkline ?? []} positive={asset.change24h >= 0} />
            <span className={cn(
              'font-mono text-sm font-semibold w-24 text-right transition-colors duration-300',
              flashes[asset.symbol] === 'up' ? 'text-success' : flashes[asset.symbol] === 'down' ? 'text-danger' : 'text-foreground'
            )}>
              {asset.price < 10 ? asset.price.toFixed(4) : asset.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span className={cn('font-mono text-xs font-medium w-16 text-right', asset.change24h >= 0 ? 'text-success' : 'text-danger')}>
              {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
