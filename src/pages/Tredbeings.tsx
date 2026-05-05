import { useEffect, useMemo, useState } from 'react';
import { useSignals } from '@/hooks/useSignals';
import { useMarketData } from '@/hooks/useMarketData';
import { TerminalCard } from '@/components/TerminalCard';
import { OnyixBadge } from '@/components/OnyixBadge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  enginesForAsset, processTredbeing, listTredbeingHistory, ENGINE_PROFILE,
  TRED_TIMEFRAMES, type TredEngine, type TredTimeframe, type TredbeingExpansion,
} from '@/lib/konsmia/tredbeings';
import { consumeOnyix } from '@/lib/konsmia/onyix';
import { Activity, Zap, Target, Shield, TrendingUp, Brain } from 'lucide-react';

const ASSETS = ['BTC/USD','ETH/USD','SOL/USD','EUR/USD','GBP/USD','AAPL','TSLA','NVDA'];

export default function Tredbeings() {
  const { signals } = useSignals();
  useMarketData();

  const [asset, setAsset] = useState('BTC/USD');
  const [timeframe, setTimeframe] = useState<TredTimeframe>('1H');
  const engines = useMemo(() => enginesForAsset(asset), [asset]);
  const [engine, setEngine] = useState<TredEngine>(engines[0]);
  const [expansion, setExpansion] = useState<TredbeingExpansion | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  // Reset engine when asset class changes
  useEffect(() => { if (!engines.includes(engine)) setEngine(engines[0]); }, [engines, engine]);

  // Onyix consumption on control change
  useEffect(() => { consumeOnyix('asset_change'); }, [asset]);
  useEffect(() => { consumeOnyix('timeframe_change'); }, [timeframe]);
  useEffect(() => { consumeOnyix('engine_change'); }, [engine]);

  const signal = useMemo(
    () => signals.find(s => s.asset === asset) ?? signals[0],
    [signals, asset],
  );

  async function loadHistory() {
    const rows = await listTredbeingHistory(asset, engine, 20);
    setHistory(rows);
  }

  async function reprocess(autoExecute: boolean) {
    if (!signal) return;
    setBusy(true);
    const exp = await processTredbeing(signal, engine, timeframe, { autoExecute });
    setExpansion(exp);
    await loadHistory();
    setBusy(false);
  }

  // Auto-expand when context changes
  useEffect(() => { if (signal) reprocess(false); /* eslint-disable-next-line */ }, [asset, timeframe, engine, signal?.id]);
  useEffect(() => { loadHistory(); /* eslint-disable-next-line */ }, [asset, engine]);

  const profile = ENGINE_PROFILE[engine];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-futuristic text-xl font-black tracking-widest text-gradient-primary">
            TREDBEINGS
          </h1>
          <p className="text-[10px] font-mono text-muted-foreground">
            Interpretation + Execution layer · After-decision intelligence
          </p>
        </div>
        <OnyixBadge />
      </div>

      {/* Control bar */}
      <TerminalCard title="CONTROL BAR" subtitle="Asset · Timeframe · Engine">
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
        <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span><Brain className="inline h-3 w-3 mr-1 text-primary" />{profile.nature} · horizon {profile.horizon}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={busy} onClick={() => reprocess(false)}>Reprocess</Button>
            <Button size="sm" disabled={busy || !signal} onClick={() => reprocess(true)}>Execute (Sandbox)</Button>
          </div>
        </div>
      </TerminalCard>

      {/* Expansion outputs */}
      {expansion ? (
        <TerminalCard title="SIGNAL EXPANSION" subtitle={`${expansion.engine} · ${expansion.asset} · ${expansion.timeframe}`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {Object.entries(expansion.outputs).map(([k, v]) => (
              <div key={k} className="rounded border border-border/60 p-2 bg-secondary/30">
                <div className="text-[9px] font-mono text-muted-foreground uppercase">{k}</div>
                <div className="text-xs font-mono text-foreground truncate">{String(v)}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
            <div className="rounded border border-success/30 bg-success/5 p-2 flex items-center gap-2">
              <Target className="h-3 w-3 text-success" /> TP {expansion.takeProfit}
            </div>
            <div className="rounded border border-danger/30 bg-danger/5 p-2 flex items-center gap-2">
              <Shield className="h-3 w-3 text-danger" /> SL {expansion.stopLoss}
            </div>
            <div className="rounded border border-primary/30 bg-primary/5 p-2 flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-primary" /> R:R {expansion.riskReward}
            </div>
          </div>
          <div className="mt-3 text-[11px] font-mono italic text-muted-foreground">
            "{expansion.konslangStatement}"
          </div>
        </TerminalCard>
      ) : (
        <TerminalCard title="SIGNAL EXPANSION"><p className="text-xs font-mono text-muted-foreground">Awaiting signal…</p></TerminalCard>
      )}

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

      {/* System Flow */}
      <TerminalCard title="SYSTEM FLOW" subtitle="Strict — no skipping layers">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
          {['Market Data','Prediction Engines','Smai Chinnikstah','Adaptive KI Core','Tredbeings','Smai Being (Sandbox)','Womb Layer','KI Feedback'].map((step, i) => (
            <span key={step} className="flex items-center gap-1">
              <span className="rounded border border-primary/40 bg-primary/5 px-2 py-1 text-primary">{step}</span>
              {i < 7 && <Zap className="h-3 w-3 text-muted-foreground" />}
            </span>
          ))}
        </div>
      </TerminalCard>
    </div>
  );
}