import type { TimeWindow } from '@/lib/konsmia/types';
import { Clock } from 'lucide-react';

interface Props {
  timeWindow: TimeWindow;
}

export function TimePrediction({ timeWindow }: Props) {
  const strengthColors: Record<string, string> = {
    strong: 'text-success',
    moderate: 'text-warning',
    weak: 'text-muted-foreground',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4 text-primary" />
        <p className="font-mono text-xs font-bold text-foreground">TIME PREDICTION</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-secondary/20 rounded p-3 text-center">
          <p className="font-mono text-[10px] text-muted-foreground">BREAKOUT</p>
          <p className="font-mono text-sm font-bold text-primary">{timeWindow.breakoutTime}</p>
        </div>
        <div className="bg-secondary/20 rounded p-3 text-center">
          <p className="font-mono text-[10px] text-muted-foreground">DURATION</p>
          <p className="font-mono text-sm font-bold text-foreground">{timeWindow.expectedDuration}</p>
        </div>
        <div className="bg-secondary/20 rounded p-3 text-center">
          <p className="font-mono text-[10px] text-muted-foreground">WINDOW START</p>
          <p className="font-mono text-xs font-bold text-foreground">{timeWindow.startTime}</p>
        </div>
        <div className="bg-secondary/20 rounded p-3 text-center">
          <p className="font-mono text-[10px] text-muted-foreground">WINDOW END</p>
          <p className="font-mono text-xs font-bold text-foreground">{timeWindow.endTime}</p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-secondary/10 rounded p-2">
        <span className="font-mono text-[10px] text-muted-foreground">TIMING STRENGTH</span>
        <span className={`font-mono text-xs font-bold uppercase ${strengthColors[timeWindow.timingStrength]}`}>
          {timeWindow.timingStrength}
        </span>
      </div>
    </div>
  );
}
