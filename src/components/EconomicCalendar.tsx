import { cn } from '@/lib/utils';
import type { EconomicEvent } from '@/lib/konsmia/types';
import { Clock } from 'lucide-react';

interface EconomicCalendarProps {
  events: EconomicEvent[];
  className?: string;
}

const impactColors = {
  high: 'bg-danger/20 text-danger border-danger/30',
  medium: 'bg-warning/20 text-warning border-warning/30',
  low: 'bg-muted text-muted-foreground border-border',
};

export function EconomicCalendar({ events, className }: EconomicCalendarProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {events.map(event => {
        const time = new Date(event.timestamp);
        const isUpcoming = time > new Date();
        return (
          <div key={event.id} className={cn(
            'flex items-center gap-3 p-2.5 rounded-lg transition-colors',
            isUpcoming ? 'bg-secondary/30' : 'bg-muted/20 opacity-60'
          )}>
            <div className="flex flex-col items-center min-w-[50px]">
              <span className="font-mono text-[10px] text-muted-foreground">
                {time.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
              <span className="font-mono text-xs font-bold text-foreground">
                {time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className={cn('px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border', impactColors[event.impact])}>
              {event.impact}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{event.title}</p>
              <p className="text-[10px] text-muted-foreground">{event.country}</p>
            </div>
            <div className="hidden sm:flex gap-3 text-[10px] font-mono text-muted-foreground">
              {event.forecast && <span>F: {event.forecast}</span>}
              {event.previous && <span>P: {event.previous}</span>}
              {event.actual && <span className="text-foreground font-bold">A: {event.actual}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
