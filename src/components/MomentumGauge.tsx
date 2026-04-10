import { Activity } from 'lucide-react';

interface Props {
  strength: number;
  acceleration: boolean;
  exhaustion: boolean;
}

export function MomentumGauge({ strength, acceleration, exhaustion }: Props) {
  const segments = 20;
  const filled = Math.round((strength / 100) * segments);
  const color = exhaustion ? 'bg-warning' : acceleration ? 'bg-success' : 'bg-primary/60';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="font-mono text-xs text-foreground font-bold">MOMENTUM</span>
        </div>
        <span className="font-mono text-lg font-bold text-foreground">{strength}%</span>
      </div>

      <div className="flex gap-0.5">
        {Array.from({ length: segments }).map((_, i) => (
          <div key={i} className={`h-6 flex-1 rounded-sm transition-all ${i < filled ? color : 'bg-secondary/30'}`} />
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">Weak</span>
        <span className={`font-mono font-bold ${exhaustion ? 'text-warning' : acceleration ? 'text-success' : 'text-primary'}`}>
          {exhaustion ? '⚠️ EXHAUSTION' : acceleration ? '⚡ ACCELERATING' : '→ STEADY'}
        </span>
        <span className="text-muted-foreground">Strong</span>
      </div>
    </div>
  );
}
