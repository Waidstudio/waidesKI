import { Activity } from 'lucide-react';

interface Props {
  status: 'active' | 'observing' | 'waiting';
  globalBias: string;
  signalsCount: number;
  alertsCount: number;
}

export function KIStatusBar({ status, globalBias, signalsCount, alertsCount }: Props) {
  const statusStyles: Record<string, string> = {
    active: 'text-success',
    observing: 'text-info',
    waiting: 'text-warning',
  };

  return (
    <div className="flex flex-wrap items-center gap-3 bg-secondary/20 rounded-lg p-3 border border-border/50">
      <div className="flex items-center gap-2">
        <Activity className={`h-4 w-4 ${statusStyles[status]} animate-pulse`} />
        <span className={`font-mono text-xs font-bold uppercase ${statusStyles[status]}`}>{status}</span>
      </div>
      <div className="h-4 w-px bg-border hidden sm:block" />
      <div className="flex items-center gap-1">
        <span className="font-mono text-[10px] text-muted-foreground">BIAS:</span>
        <span className={`font-mono text-[10px] font-bold uppercase ${globalBias === 'bullish' ? 'text-success' : globalBias === 'bearish' ? 'text-danger' : 'text-muted-foreground'}`}>
          {globalBias}
        </span>
      </div>
      <div className="h-4 w-px bg-border hidden sm:block" />
      <span className="font-mono text-[10px] text-muted-foreground">{signalsCount} signals</span>
      <div className="h-4 w-px bg-border hidden sm:block" />
      <span className="font-mono text-[10px] text-muted-foreground">{alertsCount} alerts</span>
    </div>
  );
}
