import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { PerformanceMetric } from '@/lib/konsmia/types';

interface PerformanceCardProps {
  metric: PerformanceMetric;
  className?: string;
}

export function PerformanceCard({ metric, className }: PerformanceCardProps) {
  const positive = metric.change >= 0;
  return (
    <div className={cn('terminal-border rounded-lg p-4 hover:glow-primary transition-shadow', className)}>
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">{metric.label}</p>
      <div className="flex items-end justify-between">
        <p className="text-xl font-mono font-bold text-foreground">
          {metric.unit === 'USD' && '$'}{typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}{metric.unit === '%' && '%'}
        </p>
        <div className={cn('flex items-center gap-0.5 text-xs font-mono', positive ? 'text-success' : 'text-danger')}>
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {positive ? '+' : ''}{metric.change}{metric.unit === '%' ? 'pp' : metric.unit === 'USD' ? '$' : ''}
        </div>
      </div>
    </div>
  );
}
