import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSignals } from '@/hooks/useSignals';
import { useMarketData } from '@/hooks/useMarketData';
import { TerminalCard } from '@/components/TerminalCard';
import { OnyixBadge } from '@/components/OnyixBadge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import {
  enginesForAsset, processTredbeing, ENGINE_PROFILE,
  TRED_TIMEFRAMES, type TredEngine, type TredTimeframe, type TredbeingExpansion,
} from '@/lib/konsmia/tredbeings';
import { getLivePrice } from '@/lib/konsmia/live-prices';
import {
  Activity, Brain, Target, Shield, TrendingUp, MessageSquare,
  CheckCircle2, AlertTriangle, Clock, Cpu, Play, ExternalLink, Zap,
} from 'lucide-react';

const ASSETS = ['BTC/USD','ETH/USD','SOL/USD','EUR/USD','GBP/USD','USD/JPY','AAPL','TSLA','NVDA'];

interface Narration { t: number; tone: 'info'|'good'|'warn'|'work'; text: string; }

interface EngineStats {
  total: number; wins: number; losses: number; winRate: number;
  profit: number; openPos: 'long'|'short'|'flat';
  lastUpdate: string; recentDir?: string;
}

const STRATEGY_BY_ENGINE: Record<TredEngine, { strategy: string; tf: string; risk: string; model: string; successRate: number; tag: string }> = {
  'WaidBot':     { strategy: 'Reactive Crypto Scalp + Trend',     tf: '5m – 4H',   risk: 'Aggressive',   model: 'Quantum Flux α',         successRate: 73.4, tag: 'Crypto · Reactive' },
  'WaidBot Pro': { strategy: 'Macro Predictive Swing',            tf: '4H – 1M',   risk: 'Conservative', model: 'Konsai Singularity β',   successRate: 78.5, tag: 'Crypto · Predictive' },
  'TredFlux':    { strategy: 'UP/DOWN Bidirectional Volatility',  tf: '15m – 3D',  risk: 'Aggressive',   model: 'Bidirectional Engine',   successRate: 71.2, tag: 'Crypto · Vol' },
  'TredSpot':    { strategy: 'Spot Accumulation / Breakout',      tf: '1H – 7D',   risk: 'Balanced',     model: 'Accumulation Net',       successRate: 75.6, tag: 'Crypto · Spot' },
  'TredGem':     { strategy: 'Forex Liquidity / Session Alpha',   tf: '5m – 2W',   risk: 'Balanced',     model: 'Autonomous Wealth Engine',successRate: 82.3, tag: 'Forex' },
  'TredGaze':    { strategy: 'Stocks Event-Driven Momentum',      tf: '5m – 2W',   risk: 'Conservative', model: 'Event Horizon Net',      successRate: 76.1, tag: 'Stocks' },
};

export default function Tredbeings() {
  const { signals } = useSignals();
  useMarketData();

  const [asset, setAsset] = useState('BTC/USD');
  const [timeframe, setTimeframe] = useState<TredTimeframe>('1H');
  const engines = useMemo(() => enginesForAsset(asset), [asset]);
  const [expansions, setExpansions] = useState<Record<TredEngine, TredbeingExpansion | null>>({} as any);
  const [stats, setStats] = useState<Record<TredEngine, EngineStats>>({} as any);
  const [narration, setNarration] = useState<Narration[]>([]);
  const [busy, setBusy] = useState<TredEngine | null>(null);
  const livePrice = getLivePrice(asset);

  const say = (text: string, tone: Narration['tone'] = 'info') =>
    setNarration(prev => [{ t: Date.now(), tone, text }, ...prev].slice(0, 60));

  const signal = useMemo(
    () => signals.find(s => s.asset === asset) ?? signals[0],
    [signals, asset],
  );

  // Load per-engine stats from sandbox_trades (real backend data)
  async function loadStats() {
    const next: Record<TredEngine, EngineStats> = {} as any;
    for (const e of engines) {
      const { data } = await supabase
        .from('sandbox_trades').select('*')
        .eq('asset', asset).eq('opened_by', e)
        .order('opened_at', { ascending: false }).limit(200);
      const rows = data ?? [];
      const closed = rows.filter(r => r.status === 'closed');
      const wins = closed.filter(r => r.outcome === 'win').length;
      const losses = closed.filter(r => r.outcome === 'loss').length;
      const profit = closed.reduce((s, r) => s + Number(r.pnl ?? 0), 0);
      const openRow = rows.find(r => r.status === 'open');
      next[e] = {
        total: rows.length, wins, losses,
        winRate: closed.length ? Math.round((wins / closed.length) * 1000) / 10 : 0,
        profit: Math.round(profit * 100) / 100,
        openPos: (openRow?.direction as any) ?? 'flat',
        lastUpdate: rows[0]?.opened_at ?? new Date().toISOString(),
        recentDir: rows[0]?.direction,
      };
    }
    setStats(next);
  }

  // Run all engines for current context (one Reprocess pass)
  async function reprocessAll(autoExecute = false) {
    if (!signal) { say(`No upstream signal for ${asset} yet — Adaptive KI Core hasn’t cleared a setup.`, 'warn'); return; }
    say(`Reprocessing ${engines.length} engines on ${asset} ${timeframe}…`, 'work');
    const next = { ...expansions };
    for (const e of engines) {
      setBusy(e);
      const exp = await processTredbeing(signal, e, timeframe, { autoExecute });
      if (exp) {
        next[e] = exp;
        say(`${e}: ${exp.bias.toUpperCase()} · R:R ${exp.riskReward} · ${exp.confidencePercent}%`, 'good');
        if (autoExecute && exp.bias !== 'neutral') say(`${e} routed sandbox order @ ${exp.entry}`, 'good');
      } else {
        say(`${e} stepped back (Onyix low or frozen).`, 'warn');
      }
    }
    setExpansions(next);
    setBusy(null);
    await loadStats();
  }

  async function runOne(engine: TredEngine, autoExecute: boolean) {
    if (!signal) { say(`No upstream signal yet for ${asset}.`, 'warn'); return; }
    setBusy(engine);
    say(`${engine} reading ${asset} on ${timeframe}…`, 'work');
    const exp = await processTredbeing(signal, engine, timeframe, { autoExecute });
    if (exp) {
      setExpansions(prev => ({ ...prev, [engine]: exp }));
      say(`${engine} verdict: ${exp.bias.toUpperCase()} · R:R ${exp.riskReward}`, 'good');
      if (autoExecute && exp.bias !== 'neutral') {
        say(`Sandbox routed → entry ${exp.entry} · SL ${exp.stopLoss} · TP ${exp.takeProfit}`, 'good');
      }
    } else say(`${engine} could not run (Onyix low).`, 'warn');
    setBusy(null);
    await loadStats();
  }

  // Auto-expand when context changes (key-guarded — backend driven)
  const lastKey = useRef('');
  useEffect(() => {
    const key = `${asset}|${timeframe}|${signal?.id ?? ''}`;
    if (key === lastKey.current || !signal) return;
    lastKey.current = key;
    say(`Context locked: ${asset} · ${timeframe} · live ${livePrice ? `$${livePrice}` : '…'}`, 'info');
    reprocessAll(false);
    // eslint-disable-next-line
  }, [asset, timeframe, signal?.id]);

  useEffect(() => { loadStats(); /* eslint-disable-next-line */ }, [asset, engines.join(',')]);

  // Realtime backend subscriptions — NO frontend polling
  useEffect(() => {
    const ch = supabase
      .channel('tredbeings-stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tredbeing_signals' }, (p: any) => {
        const row = p.new ?? p.old;
        if (row?.asset === asset) {
          say(`${row.engine} · ${row.timeframe} → ${row.execution_status}`, 'info');
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sandbox_trades' }, (p: any) => {
        const row = p.new ?? p.old;
        if (row?.asset === asset) {
          if (p.eventType === 'INSERT') say(`Sandbox opened · ${row.opened_by} ${row.direction.toUpperCase()} @ ${row.entry_price}`, 'good');
          else if (row.status === 'closed') say(`${row.opened_by} closed · ${(row.outcome ?? '').toUpperCase()} ${row.pnl_percent}%`, row.outcome === 'win' ? 'good' : 'warn');
          loadStats();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line
  }, [asset]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-futuristic text-xl font-black tracking-widest text-gradient-primary">TREDBEINGS COMMAND CENTER</h1>
          <p className="text-[10px] font-mono text-muted-foreground">
            Each Tredbeing is a living engine. All execution flows into the <Link to="/sandbox" className="text-primary underline">Smai Forge</Link>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OnyixBadge />
          <Button asChild size="sm" variant="outline" className="font-mono text-xs">
            <Link to="/sandbox"><ExternalLink className="h-3 w-3 mr-1" />Smai Forge</Link>
          </Button>
        </div>
      </div>

      {/* Live header tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <HeaderTile label={`${asset} Live`} value={livePrice ? `$${Number(livePrice).toLocaleString(undefined,{maximumFractionDigits: 4})}` : '…'} accent="primary" />
        <HeaderTile label="Active Engines" value={`${engines.length}/${engines.length}`} />
        <HeaderTile label="Sandbox Trades" value={String(Object.values(stats).reduce((s, x) => s + (x?.total ?? 0), 0))} />
        <HeaderTile label="Aggregate Win" value={`${(() => { const arr = Object.values(stats); const w = arr.reduce((s,x)=>s+(x?.wins??0),0); const l = arr.reduce((s,x)=>s+(x?.losses??0),0); const t = w+l; return t? Math.round(w/t*1000)/10 : 0; })()}%`} accent="success" />
      </div>

      {/* Control bar */}
      <TerminalCard title="CONTROL" subtitle="Selection drives every Tredbeing card below — backend recomputes only">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-mono text-muted-foreground">ASSET</label>
            <Select value={asset} onValueChange={setAsset}>
              <SelectTrigger className="font-mono text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{ASSETS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-mono text-muted-foreground">TIMEFRAME</label>
            <Select value={timeframe} onValueChange={(v) => setTimeframe(v as TredTimeframe)}>
              <SelectTrigger className="font-mono text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{TRED_TIMEFRAMES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button size="sm" variant="outline" disabled={!!busy} onClick={() => reprocessAll(false)} className="flex-1">Reprocess All</Button>
            <Button size="sm" disabled={!!busy || !signal} onClick={() => reprocessAll(true)} className="flex-1">Execute All</Button>
          </div>
        </div>
      </TerminalCard>

      {/* ENGINE CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {engines.map(e => (
          <EngineCard
            key={e}
            engine={e}
            asset={asset}
            timeframe={timeframe}
            expansion={expansions[e] ?? null}
            stats={stats[e]}
            busy={busy === e}
            hasSignal={!!signal}
            onRun={(exec) => runOne(e, exec)}
          />
        ))}
      </div>

      {/* Live narration — backend-driven */}
      <TerminalCard title="LIVE NARRATION" subtitle="What the engines are doing, in real time">
        <ScrollArea className="h-[260px] pr-2">
          <div className="space-y-1.5">
            {narration.length === 0 && <p className="text-xs font-mono text-muted-foreground">Waking engines…</p>}
            {narration.map((n, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] font-mono">
                <MessageSquare className={cn('h-3 w-3 mt-0.5 shrink-0',
                  n.tone === 'good' && 'text-success',
                  n.tone === 'warn' && 'text-danger',
                  n.tone === 'work' && 'text-warning',
                  n.tone === 'info' && 'text-primary')} />
                <span className="text-muted-foreground">{new Date(n.t).toLocaleTimeString()}</span>
                <span className="text-foreground">{n.text}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </TerminalCard>
    </div>
  );
}

function HeaderTile({ label, value, accent }: { label: string; value: string; accent?: 'primary'|'success' }) {
  const color = accent === 'primary' ? 'text-primary' : accent === 'success' ? 'text-success' : 'text-foreground';
  return (
    <div className="terminal-border rounded-lg p-3 bg-card/40">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-display font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

function EngineCard({ engine, asset, timeframe, expansion, stats, busy, hasSignal, onRun }: {
  engine: TredEngine; asset: string; timeframe: TredTimeframe;
  expansion: TredbeingExpansion | null;
  stats?: EngineStats; busy: boolean; hasSignal: boolean;
  onRun: (autoExecute: boolean) => void;
}) {
  const meta = STRATEGY_BY_ENGINE[engine];
  const profile = ENGINE_PROFILE[engine];
  const status = expansion ? (expansion.executionStatus === 'executing' ? 'LIVE' : expansion.executionStatus === 'frozen' ? 'NEUTRAL' : 'STANDBY') : 'STANDBY';

  return (
    <TerminalCard
      title={`${engine}`}
      subtitle={meta.tag}
      headerRight={
        <Badge className={cn('text-[10px] font-mono',
          status === 'LIVE' && 'bg-success text-background',
          status === 'NEUTRAL' && 'bg-danger text-background',
          status === 'STANDBY' && 'bg-secondary')}>{status}</Badge>
      }
    >
      <div className="space-y-3">
        {/* Spec strip */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono">
          <Row label="Strategy" value={meta.strategy} />
          <Row label="Timeframe" value={timeframe} />
          <Row label="Risk Level" value={meta.risk} />
          <Row label="AI Model" value={meta.model} />
          <Row label="Success Rate" value={`${meta.successRate}%`} />
          <Row label="Horizon" value={profile.horizon} />
        </div>

        {/* PREDICTION — always on screen */}
        <div className="rounded-md border border-primary/30 bg-primary/5 p-3 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase">
            <span className="text-primary flex items-center gap-1"><Brain className="h-3 w-3" /> Prediction</span>
            <span className="text-muted-foreground">{asset} · {timeframe}</span>
          </div>
          {expansion ? (
            <>
              <div className="flex items-center justify-between">
                <Badge className={cn('text-[10px] font-mono',
                  expansion.bias === 'long' && 'bg-success text-background',
                  expansion.bias === 'short' && 'bg-danger text-background',
                  expansion.bias === 'neutral' && 'bg-muted')}>
                  {expansion.bias.toUpperCase()}
                </Badge>
                <span className="text-[11px] font-mono text-foreground">{expansion.confidencePercent}% conf</span>
                <span className="text-[11px] font-mono text-muted-foreground">R:R {expansion.riskReward}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                <Mini icon={<TrendingUp className="h-3 w-3 text-primary" />} label="Entry" value={String(expansion.entry)} />
                <Mini icon={<Shield className="h-3 w-3 text-danger" />} label="Stop" value={String(expansion.stopLoss)} />
                <Mini icon={<Target className="h-3 w-3 text-success" />} label="TP" value={String(expansion.takeProfit)} />
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] font-mono pt-1">
                <Row label="Trend" value={expansion.trend} />
                <Row label="Momentum" value={expansion.momentum} />
                <Row label="Volatility" value={expansion.volatility} />
                <Row label="Liquidity" value={expansion.liquidity} />
                <Row label="Structure" value={expansion.marketStructure} />
                <Row label="Hist Acc" value={`${expansion.historicalAccuracy}%`} />
              </div>
              <p className="text-[11px] font-mono italic text-muted-foreground border-t border-border/40 pt-2">
                "{expansion.konslangStatement}"
              </p>
            </>
          ) : (
            <p className="text-[11px] font-mono text-muted-foreground py-3">
              {hasSignal
                ? `${engine} is preparing its read on ${asset}…`
                : `Waiting for Adaptive KI Core to clear a setup on ${asset}.`}
            </p>
          )}
        </div>

        {/* Performance — real backend */}
        <div className="grid grid-cols-4 gap-2 text-[11px] font-mono">
          <Tile label="Trades" value={String(stats?.total ?? 0)} />
          <Tile label="Win Rate" value={`${stats?.winRate ?? 0}%`} accent={(stats?.winRate ?? 0) >= 55 ? 'success' : (stats?.winRate ?? 0) >= 45 ? 'warning' : 'danger'} />
          <Tile label="Profit" value={`$${stats?.profit ?? 0}`} accent={(stats?.profit ?? 0) >= 0 ? 'success' : 'danger'} />
          <Tile label="Position" value={(stats?.openPos ?? 'flat').toUpperCase()} />
        </div>

        {/* Live status footer */}
        <div className="rounded bg-secondary/30 p-2 text-[10px] font-mono space-y-1">
          <div className="flex items-center gap-1 text-primary">
            <Zap className="h-3 w-3" /> {new Date().toLocaleTimeString()} · Engine focus: {profile.nature}
          </div>
          <Row label="Current Action" value={expansion ? (expansion.bias === 'neutral' ? 'Holding — no execution' : `Plan ready · ${expansion.bias.toUpperCase()}`) : 'Standby — waiting for KI core'} />
          <Row label="Next Action" value={expansion ? (expansion.executionStatus === 'executing' ? 'Monitoring SL/TP' : 'Awaiting Execute press') : 'Begin reading market'} />
          <Row label="KI Agreement" value={expansion?.kiAgreement ?? '—'} />
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onRun(false)} className="flex-1 font-mono text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Reprocess
          </Button>
          <Button size="sm" disabled={busy || !hasSignal} onClick={() => onRun(true)} className="flex-1 font-mono text-xs">
            <Play className="h-3 w-3 mr-1" /> Execute (Forge)
          </Button>
        </div>
      </div>
    </TerminalCard>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground truncate text-right">{value}</span>
    </div>
  );
}
function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded border border-border/60 bg-secondary/40 p-1.5">
      <div className="flex items-center gap-1 text-[9px] uppercase text-muted-foreground">{icon}{label}</div>
      <div className="text-[11px] text-foreground truncate">{value}</div>
    </div>
  );
}
function Tile({ label, value, accent }: { label: string; value: string; accent?: 'success'|'danger'|'warning' }) {
  const color = accent === 'success' ? 'text-success' : accent === 'danger' ? 'text-danger' : accent === 'warning' ? 'text-warning' : 'text-foreground';
  return (
    <div className="rounded border border-border/60 bg-card/40 p-2 text-center">
      <div className="text-[9px] uppercase text-muted-foreground">{label}</div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
    </div>
  );
}
