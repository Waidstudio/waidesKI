import { cn } from '@/lib/utils';

interface StatusDotProps {
  status: 'online' | 'syncing' | 'offline' | 'active' | 'paused' | 'learning';
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  const color = {
    online: 'bg-success',
    active: 'bg-success',
    syncing: 'bg-warning',
    learning: 'bg-info',
    paused: 'bg-muted-foreground',
    offline: 'bg-danger',
  }[status];

  return (
    <span className={cn('inline-block h-2 w-2 rounded-full', color, (status === 'online' || status === 'active' || status === 'syncing') && 'pulse-dot', className)} />
  );
}
