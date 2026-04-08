import { cn } from '@/lib/utils';
import type { AlertItem } from '@/lib/konsmia/types';
import { AlertTriangle, Info, AlertCircle, Bell } from 'lucide-react';

interface AlertsFeedProps {
  alerts: AlertItem[];
  className?: string;
}

const severityConfig = {
  info: { icon: Info, color: 'text-info', border: 'border-info/20' },
  warning: { icon: AlertTriangle, color: 'text-warning', border: 'border-warning/20' },
  critical: { icon: AlertCircle, color: 'text-danger', border: 'border-danger/20' },
};

export function AlertsFeed({ alerts, className }: AlertsFeedProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {alerts.map(alert => {
        const config = severityConfig[alert.severity];
        const Icon = config.icon;
        return (
          <div key={alert.id} className={cn(
            'flex items-start gap-3 p-3 rounded-lg border transition-colors',
            config.border,
            alert.read ? 'bg-muted/10 opacity-60' : 'bg-secondary/30'
          )}>
            <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', config.color)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-foreground">{alert.title}</h4>
                {!alert.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{alert.message}</p>
              <span className="text-[10px] font-mono text-muted-foreground mt-1 block">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
