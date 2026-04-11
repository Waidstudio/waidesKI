import { cn } from '@/lib/utils';

interface DataFreshnessProps {
  ageMs: number;
  isStale: boolean;
  source?: string;
  className?: string;
}

export function DataFreshness({ ageMs, isStale, source, className }: DataFreshnessProps) {
  const seconds = Math.floor(ageMs / 1000);
  const minutes = Math.floor(seconds / 60);
  
  let ageLabel: string;
  if (seconds < 5) ageLabel = 'Just now';
  else if (seconds < 60) ageLabel = `${seconds}s ago`;
  else ageLabel = `${minutes}m ago`;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className={cn(
        'h-1.5 w-1.5 rounded-full',
        isStale ? 'bg-warning' : seconds < 10 ? 'bg-success pulse-dot' : 'bg-success'
      )} />
      <span className={cn(
        'font-mono text-[10px]',
        isStale ? 'text-warning' : 'text-muted-foreground'
      )}>
        {ageLabel}
        {source && ` • ${source}`}
      </span>
    </div>
  );
}
