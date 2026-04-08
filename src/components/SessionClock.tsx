import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const sessions = [
  { name: 'Asia', start: 0, end: 8, color: 'bg-info' },
  { name: 'London', start: 8, end: 16, color: 'bg-primary' },
  { name: 'New York', start: 13, end: 22, color: 'bg-accent' },
];

export function SessionClock({ className }: { className?: string }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const utcH = now.getUTCHours();
  const utcM = now.getUTCMinutes();
  const utcS = now.getUTCSeconds();
  const progress = ((utcH * 3600 + utcM * 60 + utcS) / 86400) * 100;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">UTC</span>
        <span className="font-mono text-lg font-bold text-foreground tabular-nums">
          {String(utcH).padStart(2, '0')}:{String(utcM).padStart(2, '0')}:{String(utcS).padStart(2, '0')}
        </span>
      </div>
      
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        {sessions.map(s => (
          <div
            key={s.name}
            className={cn('absolute top-0 h-full opacity-30', s.color)}
            style={{ left: `${(s.start / 24) * 100}%`, width: `${((s.end - s.start) / 24) * 100}%` }}
          />
        ))}
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground z-10"
          style={{ left: `${progress}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {sessions.map(s => {
          const active = utcH >= s.start && utcH < s.end;
          return (
            <span key={s.name} className={cn(
              'text-[10px] font-mono px-2 py-0.5 rounded-full border',
              active ? `${s.color}/20 border-current text-foreground` : 'bg-muted/50 text-muted-foreground border-transparent'
            )}>
              {active && <span className="inline-block h-1.5 w-1.5 rounded-full bg-current mr-1 pulse-dot" />}
              {s.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}
