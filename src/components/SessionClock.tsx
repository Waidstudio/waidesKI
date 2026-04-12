import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getCurrentSession } from '@/lib/konsmia/signal-engine';

const sessions = [
  { name: 'Asia', start: 22, end: 8, color: 'bg-info', wrap: true },
  { name: 'London', start: 8, end: 13, color: 'bg-primary', wrap: false },
  { name: 'Overlap', start: 13, end: 17, color: 'bg-accent', wrap: false },
  { name: 'New York', start: 17, end: 22, color: 'bg-warning', wrap: false },
];

export function SessionClock({ className }: { className?: string }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(t);
  }, []);

  const utcH = now.getUTCHours();
  const utcM = now.getUTCMinutes();
  const utcS = now.getUTCSeconds();
  const progress = ((utcH * 3600 + utcM * 60 + utcS) / 86400) * 100;
  const currentSession = getCurrentSession();

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">UTC</span>
        <span className="font-mono text-lg font-bold text-foreground tabular-nums">
          {String(utcH).padStart(2, '0')}:{String(utcM).padStart(2, '0')}:{String(utcS).padStart(2, '0')}
        </span>
      </div>
      
      {/* Session timeline */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        {sessions.map(s => {
          if (s.wrap) {
            // Asia wraps around midnight
            return (
              <div key={s.name}>
                <div
                  className={cn('absolute top-0 h-full opacity-30', s.color)}
                  style={{ left: `${(s.start / 24) * 100}%`, width: `${((24 - s.start) / 24) * 100}%` }}
                />
                <div
                  className={cn('absolute top-0 h-full opacity-30', s.color)}
                  style={{ left: '0%', width: `${(s.end / 24) * 100}%` }}
                />
              </div>
            );
          }
          return (
            <div
              key={s.name}
              className={cn('absolute top-0 h-full opacity-30', s.color)}
              style={{ left: `${(s.start / 24) * 100}%`, width: `${((s.end - s.start) / 24) * 100}%` }}
            />
          );
        })}
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground z-10 transition-all duration-1000"
          style={{ left: `${progress}%` }}
        />
      </div>

      {/* Session labels */}
      <div className="flex flex-wrap gap-2">
        {sessions.map(s => {
          const active = s.name.toLowerCase() === currentSession || 
            (s.name === 'Overlap' && currentSession === 'overlap');
          return (
            <span key={s.name} className={cn(
              'text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all',
              active ? `${s.color}/20 border-current text-foreground` : 'bg-muted/50 text-muted-foreground border-transparent'
            )}>
              {active && <span className="inline-block h-1.5 w-1.5 rounded-full bg-current mr-1 pulse-dot" />}
              {s.name}
            </span>
          );
        })}
      </div>

      {/* Current session info */}
      <div className="bg-secondary/20 rounded p-2">
        <p className="font-mono text-[10px] text-muted-foreground">
          Active: <span className="text-foreground font-semibold capitalize">{currentSession}</span>
          {currentSession === 'overlap' && ' — Peak volatility window'}
          {currentSession === 'asia' && ' — Low volatility, range-bound'}
          {currentSession === 'london' && ' — Trend initiation likely'}
          {currentSession === 'new_york' && ' — Continuation or reversal'}
        </p>
      </div>
    </div>
  );
}
