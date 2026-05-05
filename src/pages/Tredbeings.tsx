import { useEffect, useMemo, useRef, useState } from 'react';
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
  enginesForAsset, processTredbeing, listTredbeingHistory, ENGINE_PROFILE,
  TRED_TIMEFRAMES, type TredEngine, type TredTimeframe, type TredbeingExpansion,
} from '@/lib/konsmia/tredbeings';
import { getLivePrice } from '@/lib/konsmia/live-prices';
import {
  Activity, Brain, Target, Shield, TrendingUp, Zap, Flame, MessageSquare,
  CheckCircle2, AlertTriangle, Clock, Cpu,
} from 'lucide-react';

const ASSETS = ['BTC/USD','ETH/USD','SOL/USD','EUR/USD','GBP/USD','USD/JPY','AAPL','TSLA','NVDA'];

interface Narration { t: number; tone: 'info'|'good'|'warn'|'work'; text: string; }

export default function Tredbeings() {
  const { signals } = useSignals();
  useMarketData();

  const [asset, setAsset] = useState('BTC/USD');
  const [timeframe, setTimeframe] = useState<TredTimeframe>('1H');
  const engines = useMemo(() => enginesForAsset(asset), [asset]);
  const [engine, setEngine] = useState<TredEngine>(engines[0]);
  const [expansion, setExpansion] = useState<TredbeingExpansion | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [narration, setNarration] = useState<Narration[]>([]);
  const livePrice = getLivePrice(asset);

  const say = (text: string, tone: Narration['tone'] = 'info') =>
    setNarration(prev => [{ t: Date.now(), tone, text }, ...prev].slice(0, 40));

  // Keep engine valid when asset class changes
  useEffect(() => {
    if (!engines.includes(engine)) {
      setEngine(engines[0]);
      say(`Switching engine roster for ${asset}. Now using ${engines[0]}.`, 'work');
    }
  }, [engines, engine, asset]);

  const signal = useMemo(
    () => signals.find(s => s.asset === asset) ?? signals[0],
    [signals, asset],
  );

  async function loadHistory() {
    const rows = await listTredbeingHistory(asset, engine, 25);
    setHistory(rows);
  }
  async function loadTrades() {
    const { data } = await supabase
      .from('sandbox_trades').select('*')
      .eq('asset', asset).order('opened_at', { ascending: false }).limit(15);
    setTrades(data ?? []);
  }

  async function reprocess(autoExecute: boolean) {
    if (!signal) { say(`No upstream signal for ${asset} yet — waiting for the KI core.`, 'warn'); return; }
    setBusy(true);
    say(`${engine} is reading ${asset} on ${timeframe}…`, 'work');
    const exp = await processTredbeing(signal, engine, timeframe, { autoExecute });
    if (!exp) {
      say(`Onyix is too low or system is frozen. ${engine} stepped back.`, 'warn');
    } else {
      setExpansion(exp);
      say(`${engine} verdict: ${exp.bias.toUpperCase()} • R:R ${exp.riskReward} • ${exp.confidencePercent}% conf.`, 'good');
      if (autoExecute && exp.bias !== 'neutral') {
        say(`Sandbox order routed → entry ${exp.entry}, SL ${exp.stopLoss}, TP ${exp.takeProfit}.`, 'good');
      }
      await loadHistory(); await loadTrades();
    }
    setBusy(false);
  }

  // Narrate selection changes
  useEffect(() => { say(`Asset locked: ${asset}. Live tape: ${livePrice ? `$${livePrice}` : 'fetching…'}`, 'info'); /* eslint-disable-next-line */ }, [asset]);
  useEffect(() => { say(`Timeframe set to ${timeframe} — recomputing horizon.`, 'info'); /* eslint-disable-next-line */ }, [timeframe]);
  useEffect(() => { say(`Engine focus → ${engine} (${ENGINE_PROFILE[engine].nature}).`, 'info'); /* eslint-disable-next-line */ }, [engine]);

  // Auto-expand when context changes
  const lastKey = useRef('');
  useEffect(() => {
    const key = `${asset}|${timeframe}|${engine}|${signal?.id ?? ''}`;
    if (key === lastKey.current || !signal) return;
    lastKey.current = key;
    reprocess(false);
    // eslint-disable-next-line
  }, [asset, timeframe, engine, signal?.id]);

  useEffect(() => { loadHistory(); loadTrades(); /* eslint-disable-next-line */ }, [asset, engine]);

  // Realtime: backend-driven updates (no frontend polling loops)
  useEffect(() => {
    const ch = supabase
      .channel('tredbeings-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tredbeing_signals' }, (p: any) => {
        const row = p.new ?? p.old;
        if (row?.asset === asset) {
          say(`Womb update · ${row.engine} ${row.timeframe} → ${row.execution_status}`, 'info');
          loadHistory();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sandbox_trades' }, (p: any) => {
        const row = p.new ?? p.old;
        if (row?.asset === asset) {
          if (p.eventType === 'INSERT') say(`Sandbox opened · ${row.direction.toUpperCase()} ${row.asset} @ ${row.entry_price}`, 'good');
          else if (row.status === 'closed') say(`Sandbox closed · ${row.outcome?.toUpperCase()} ${row.pnl_percent}%`, row.outcome === 'win' ? 'good' : 'warn');
          loadTrades();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line
  }, [asset]);

  const profile = ENGINE_PROFILE[engine];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-futuristic text-xl font-black tracking-widest text-gradient-primary">TREDBEINGS</h1>
          <p className="text-[10px] font-mono text-muted-foreground">
            Interpretation + execution layer · Live state from backend
          </p>
        </div>
        <OnyixBadge />
      </div>

      {/* Control bar */}
      <TerminalCard title="CONTROL" subtitle="Each selection renders live state below">
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
          <div>
            <label className="text-[10px] font-mono text-muted-foreground">ENGINE</label>
            <Select value={engine} onValueChange={(v) => setEngine(v as TredEngine)}>
              <SelectTrigger className="font-mono text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{engines.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground">
          <span><Brain className="inline h-3 w-3 mr-1 text-primary" />{profile.nature} · horizon {profile.horizon}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={busy} onClick={() => reprocess(false)}>Reprocess</Button>
            <Button size="sm" disabled={busy || !signal} onClick={() => reprocess(true)}>Execute (Sandbox)</Button>
          </div>
        </div>
      </TerminalCard>

      {/* Live state grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TerminalCard title="ENGINE STATE" subtitle={`${engine} · ${asset} · ${timeframe}`}>
          {expansion ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <Stat icon={<Cpu className="h-3 w-3" />} label="Bias" value={expansion.bias.toUpperCase()} />
                <Stat icon={<Flame className="h-3 w-3" />} label="Confidence" value={`${expansion.confidencePercent}%`} />
                <Stat icon={<TrendingUp className="h-3 w-3" />} label="Trend" value={expansion.trend} />
                <Stat icon={<Activity className="h-3 w-3" />} label="Momentum" value={expansion.momentum} />
                <Stat icon={<AlertTriangle className="h-3 w-3" />} label="Volatility" value={expansion.volatility} />
                <Stat icon={<Activity className="h-3 w-3" />} label="Liquidity" value={expansion.liquidity} />
                <Stat icon={<CheckCircle2 className="h-3 w-3" />} label="Structure" value={expansion.marketStructure} />
                <Stat icon={<Clock className="h-3 w-3" />} label="Horizon" value={expansion.forecastHorizon} />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-[11px] font-mono">
                <Stat icon={<TrendingUp className="h-3 w-3 text-primary" />} label="Entry" value={String(expansion.entry)} />
                <Stat icon={<Shield className="h-3 w-3 text-danger" />} label="Stop" value={String(expansion.stopLoss)} />
                <Stat icon={<Target className="h-3 w-3 text-success" />} label="Target" value={String(expansion.takeProfit)} />
              </div>
              <div className="text-[11px] font-mono italic text-muted-foreground pt-2">
                "{expansion.konslangStatement}"
              </div>
              <div className="flex justify-between text-[10px] font-mono pt-1">
                <Badge variant="outline">R:R {expansion.riskReward}</Badge>
                <span className="text-muted-foreground">Hist. accuracy {expansion.historicalAccuracy}%</span>
                <Badge className={cn(
                  expansion.executionStatus === 'executing' && 'bg-warning text-background',
                  expansion.executionStatus === 'pending' && 'bg-secondary',
                  expansion.executionStatus === 'frozen' && 'bg-danger text-background',
                )}>{expansion.executionStatus}</Badge>
              </div>
            </div>
          ) : (
            <p className="text-xs font-mono text-muted-foreground">
              {signal ? 'Waiting for engine response…' : 'No upstream signal yet. Adaptive KI core has not approved a setup for this asset.'}
            </p>
          )}
        </TerminalCard>

        <TerminalCard title="LIVE NARRATION" subtitle="What the engine is doing, in real time">
          <ScrollArea className="h-[280px] pr-2">
            <div className="space-y-1.5">
              {narration.length === 0 && <p className="text-xs font-mono text-muted-foreground">Quiet… make a selection to wake the engine.</p>}
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

      {/* Sandbox trades from backend */}
      <TerminalCard title="SANDBOX EXECUTION" subtitle={`Live from backend · ${asset}`}>
        {trades.length === 0 ? (
          <p className="text-xs font-mono text-muted-foreground">No sandbox trades for this asset yet.</p>
        ) : (
          <div className="space-y-1">
            {trades.map(t => (
              <div key={t.id} className="flex items-center justify-between text-[11px] font-mono py-1.5 px-2 rounded bg-secondary/30">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn('text-[9px]',
                    t.direction === 'long' ? 'text-success' : 'text-danger')}>{t.direction}</Badge>
                  <span>{t.timeframe}</span>
                  <span className="text-muted-foreground">@ {t.entry_price}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(t.status === 'open' && 'text-warning',
                    t.outcome === 'win' && 'text-success',
                    t.outcome === 'loss' && 'text-danger')}>
                    {t.status === 'open' ? 'OPEN' : (t.outcome ?? 'closed').toUpperCase()}
                  </span>
                  <span className={cn((t.pnl_percent ?? 0) >= 0 ? 'text-success' : 'text-danger')}>
                    {(t.pnl_percent ?? 0) >= 0 ? '+' : ''}{Number(t.pnl_percent ?? 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </TerminalCard>

      {/* History */}
      <TerminalCard title="WOMB LAYER · TREDBEING HISTORY" subtitle={`${engine} on ${asset}`}>
        {history.length === 0 ? (
          <p className="text-xs font-mono text-muted-foreground">No expansions yet.</p>
        ) : (
          <div className="space-y-1">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between text-[11px] font-mono py-1.5 px-2 rounded bg-secondary/30">
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-primary" />
                  <span>{h.timeframe}</span>
                  <Badge variant="outline" className="text-[9px]">{h.bias}</Badge>
                  <span className="text-muted-foreground">RR {h.risk_reward}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{h.confidence_percent}%</span>
                  <span className={cn(
                    h.execution_status === 'closed_win' && 'text-success',
                    h.execution_status === 'closed_loss' && 'text-danger',
                    h.execution_status === 'executing' && 'text-warning',
                  )}>{h.execution_status}</span>
                  <span className="text-muted-foreground">{new Date(h.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </TerminalCard>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded border border-border/60 bg-secondary/30 p-2">
      <div className="flex items-center gap-1 text-[9px] uppercase text-muted-foreground">{icon}{label}</div>
      <div className="text-xs text-foreground truncate">{value}</div>
    </div>
  );
}