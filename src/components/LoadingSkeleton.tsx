import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  variant?: 'card' | 'text' | 'gauge' | 'chart';
}

export function LoadingSkeleton({ className, lines = 3, variant = 'text' }: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={cn('terminal-border rounded-lg bg-card overflow-hidden animate-pulse', className)}>
        <div className="border-b border-border px-4 py-2.5">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-3 w-48 bg-muted/50 rounded mt-1" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="h-3 bg-muted/40 rounded" style={{ width: `${80 - i * 15}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'gauge') {
    return (
      <div className={cn('flex items-center justify-center py-6 animate-pulse', className)}>
        <div className="h-24 w-24 rounded-full border-4 border-muted" />
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-40 bg-muted/20 rounded flex items-end gap-1 p-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex-1 bg-muted/40 rounded-t" style={{ height: `${20 + Math.random() * 60}%` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2 animate-pulse', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-muted/40 rounded" style={{ width: `${90 - i * 10}%` }} />
      ))}
    </div>
  );
}
