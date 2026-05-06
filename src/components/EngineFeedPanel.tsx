import { useEffect, useState } from 'react';
import { TerminalCard } from './TerminalCard';
import { Badge } from './ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ENGINE_REGISTRY, getEngineFeedHealth, type FeedHealth } from '@/lib/konsmia/engine-registry';
import type { TredEngine } from '@/lib/konsmia/tredbeings';
import { Wifi, WifiOff, Activity, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

function fmtAge(ms: number) {
  if (!Number.isFinite(ms)) return '—';
  if (ms < 1000) return 'just now';
  if (ms < 60_000) return `${Math.round(ms/1000)}s ago`;
  if (ms < 3_600_000) return `${Math.round(ms/60_000)}m ago`;
  return `${Math.round(ms/3_600_000)}h ago`;
}

export function EngineFeedPanel({ engines }: { engines: TredEngine[] }) {
  const [health, setHealth] = useState<Record<TredEngine, FeedHealth[]>>({} as any);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  async function refresh() {
    const next: Record<TredEngine, FeedHealth[]> = {} as any;
    for (const e of engines) next[e] = await getEngineFeedHealth(e);
    setHealth(next);
    setLastCheck(new Date());
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [engines.join(',')]);

  // Backend-driven: re-check on every market_data_cache write
  useEffect(() => {
    const ch = supabase
      .channel('feed-health-stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'market_data_cache' }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line
  }, [engines.join(',')]);

  return (
    <TerminalCard
      title="DATA-SOURCE VERIFICATION"
      subtitle="Per-engine feed health · backend-driven"
      headerRight={
        <Badge variant="outline" className="font-mono text-[10px]">
          <Clock className="h-3 w-3 mr-1" /> checked {lastCheck.toLocaleTimeString()}
        </Badge>
      }
    >
      <div className="space-y-2">
        {engines.map(e => {
          const conn = ENGINE_REGISTRY[e];
          const rows = health[e] ?? [];
          const live = rows.filter(r => r.status === 'live').length;
          const allOk = rows.length > 0 && live === rows.length;
          return (
            <div key={e} className="rounded border border-border/60 bg-card/40 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {allOk ? <Wifi className="h-3.5 w-3.5 text-success" /> : <WifiOff className="h-3.5 w-3.5 text-warning" />}
                  <span className="font-mono text-xs font-bold text-foreground">{e}</span>
                  <Badge variant="outline" className="font-mono text-[9px]">{conn.feed}</Badge>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {live}/{rows.length} live · {conn.assetClass}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                {rows.map(r => (
                  <div key={r.symbol} className={cn('rounded px-1.5 py-1 border text-[10px] font-mono flex items-center justify-between',
                    r.status === 'live' && 'border-success/40 bg-success/5',
                    r.status === 'stale' && 'border-warning/40 bg-warning/5',
                    r.status === 'offline' && 'border-danger/40 bg-danger/5',
                  )}>
                    <span className="text-foreground">{r.symbol}</span>
                    <span className={cn(
                      r.status === 'live' && 'text-success',
                      r.status === 'stale' && 'text-warning',
                      r.status === 'offline' && 'text-danger',
                    )}>{fmtAge(r.ageMs)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 mt-1.5 text-[9px] font-mono text-muted-foreground">
                <Activity className="h-2.5 w-2.5" /> sandbox endpoint: <span className="text-primary">{conn.sandboxEndpoint}</span>
              </div>
            </div>
          );
        })}
      </div>
    </TerminalCard>
  );
}