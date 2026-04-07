import { cn } from '@/lib/utils';
import type { MarketBias, Confidence } from '@/lib/konsmia/types';

interface BiasIndicatorProps {
  bias: MarketBias;
  confidence: Confidence;
  score: number;
  className?: string;
}

export function BiasIndicator({ bias, confidence, score, className }: BiasIndicatorProps) {
  const biasConfig = {
    bullish: { label: 'BULLISH', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' },
    bearish: { label: 'BEARISH', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30' },
    neutral: { label: 'NEUTRAL', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
    no_trade: { label: 'NO TRADE', color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border' },
  };

  const config = biasConfig[bias];
  const confidenceDots = { high: 3, medium: 2, low: 1 };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('px-3 py-1.5 rounded border font-mono text-xs font-bold', config.bg, config.border, config.color)}>
        {config.label}
      </div>
      <div className="flex gap-1">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className={cn(
              'h-1.5 w-4 rounded-full',
              i <= confidenceDots[confidence] ? config.bg.replace('/10', '/60') : 'bg-muted'
            )}
          />
        ))}
      </div>
      <span className="font-mono text-xs text-muted-foreground">
        Score: {score > 0 ? '+' : ''}{score}
      </span>
    </div>
  );
}
