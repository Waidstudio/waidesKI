import { cn } from '@/lib/utils';
import { Activity, Shield, Wifi, WifiOff } from 'lucide-react';
import { getSystemHealth } from '@/lib/konsmia/modules';
import { useEffect, useState } from 'react';

interface Props {
  status: 'active' | 'observing' | 'waiting';
  globalBias: string;
  signalsCount: number;
  alertsCount: number;
  dataAge?: number;
  isStale?: boolean;
}

export function KIStatusBar({ status, globalBias, signalsCount, alertsCount, dataAge, isStale }: Props) {
  const [health, setHealth] = useState(getSystemHealth());

  useEffect(() => {
    const t = setInterval(() => setHealth(getSystemHealth()), 5000);
    return () => clearInterval(t);
  }, []);

  const statusStyles: Record<string, string> = {
    active: 'text-success',
    observing: 'text-info',
    waiting: 'text-warning',
  };

  const ageLabel = dataAge != null
    ? dataAge < 5000 ? 'Live' : dataAge < 60000 ? `${Math.floor(dataAge / 1000)}s` : `${Math.floor(dataAge / 60000)}m`
    : null;

  return (
    <div className="flex flex-wrap items-center gap-3 bg-secondary/20 rounded-lg p-3 border border-border/50">
      <div className="flex items-center gap-2">
        <Activity className={cn('h-4 w-4 animate-pulse', statusStyles[status])} />
        <span className={cn('font-mono text-xs font-bold uppercase', statusStyles[status])}>{status}</span>
      </div>
      <div className="h-4 w-px bg-border hidden sm:block" />

      {/* System Health */}
      <div className="flex items-center gap-1">
        <Shield className={cn('h-3 w-3', health.overall > 90 ? 'text-success' : 'text-warning')} />
        <span className="font-mono text-[10px] text-muted-foreground">{health.overall}%</span>
      </div>
      <div className="h-4 w-px bg-border hidden sm:block" />

      {/* Data freshness */}
      {ageLabel && (
        <>
          <div className="flex items-center gap-1">
            {isStale ? <WifiOff className="h-3 w-3 text-warning" /> : <Wifi className="h-3 w-3 text-success" />}
            <span className={cn('font-mono text-[10px]', isStale ? 'text-warning' : 'text-muted-foreground')}>
              {ageLabel}
            </span>
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
        </>
      )}

      <div className="flex items-center gap-1">
        <span className="font-mono text-[10px] text-muted-foreground">BIAS:</span>
        <span className={cn('font-mono text-[10px] font-bold uppercase',
          globalBias === 'bullish' ? 'text-success' : globalBias === 'bearish' ? 'text-danger' : 'text-muted-foreground'
        )}>
          {globalBias}
        </span>
      </div>
      <div className="h-4 w-px bg-border hidden sm:block" />
      <span className="font-mono text-[10px] text-muted-foreground">{signalsCount} signals</span>
      <div className="h-4 w-px bg-border hidden sm:block" />
      <span className="font-mono text-[10px] text-muted-foreground">{alertsCount} alerts</span>

      {/* Module status dots */}
      <div className="hidden lg:flex items-center gap-1 ml-auto">
        {health.modules.map(m => (
          <div
            key={m.name}
            title={`${m.name}: ${m.status} (${m.integrity}%)`}
            className={cn('h-2 w-2 rounded-full', m.status === 'online' ? 'bg-success' : m.status === 'syncing' ? 'bg-warning pulse-dot' : 'bg-danger')}
          />
        ))}
      </div>
    </div>
  );
}
