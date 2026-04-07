import { cn } from '@/lib/utils';
import { StatusDot } from './StatusDot';
import type { KonsmiaModule } from '@/lib/konsmia/types';

interface KonsmiaMapProps {
  modules: KonsmiaModule[];
  className?: string;
}

export function KonsmiaMap({ modules, className }: KonsmiaMapProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 gap-3', className)}>
      {modules.map(mod => (
        <div
          key={mod.id}
          className={cn(
            'terminal-border rounded-lg p-3 transition-all hover:glow-primary',
            mod.status === 'online' && 'border-primary/20',
            mod.status === 'syncing' && 'border-warning/20',
            mod.status === 'offline' && 'border-danger/20',
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <StatusDot status={mod.status} />
            <span className="font-mono text-xs font-bold text-foreground">{mod.name}</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed mb-2 line-clamp-2">
            {mod.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase">{mod.status}</span>
            <div className="flex items-center gap-1">
              <div className="h-1 w-12 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full', mod.integrity > 90 ? 'bg-success' : mod.integrity > 70 ? 'bg-warning' : 'bg-danger')}
                  style={{ width: `${mod.integrity}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{mod.integrity}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
