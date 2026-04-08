import { cn } from '@/lib/utils';

interface SignalStrengthMeterProps {
  score: number; // -100 to 100
  label?: string;
  className?: string;
}

export function SignalStrengthMeter({ score, label, className }: SignalStrengthMeterProps) {
  const normalized = (score + 100) / 200; // 0 to 1
  const segments = 20;
  const filledSegments = Math.round(normalized * segments);

  return (
    <div className={cn('space-y-2', className)}>
      {label && <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>}
      <div className="flex gap-0.5">
        {Array.from({ length: segments }, (_, i) => {
          const filled = i < filledSegments;
          const segColor = i < segments * 0.3
            ? 'bg-danger'
            : i < segments * 0.45
              ? 'bg-warning'
              : i < segments * 0.55
                ? 'bg-muted-foreground'
                : i < segments * 0.7
                  ? 'bg-warning'
                  : 'bg-success';
          return (
            <div
              key={i}
              className={cn('h-6 flex-1 rounded-sm transition-all', filled ? segColor : 'bg-muted/30')}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
        <span>BEARISH</span>
        <span className={cn(
          'font-bold',
          score > 20 ? 'text-success' : score < -20 ? 'text-danger' : 'text-warning'
        )}>
          {score > 0 ? '+' : ''}{score}
        </span>
        <span>BULLISH</span>
      </div>
    </div>
  );
}
