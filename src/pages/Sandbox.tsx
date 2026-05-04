import { useEffect, useState } from 'react';
import { TerminalCard } from '@/components/TerminalCard';
import { fetchAccuracyStats, listSandboxTrades, reconcileSandboxTrades } from '@/lib/konsmia/sandbox-engine';
import { Activity, TrendingUp, Brain, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Sandbox() {
  const [open, setOpen] = useState<any[]>([]);
  const [closed, setClosed] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, wins: 0, losses: 0, winRate: 0, avgPnl: 0 });
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    await reconcileSandboxTrades().catch(() => {});
    const [o, c, s] = await Promise.all([
      listSandboxTrades('open'), listSandboxTrades('closed'), fetchAccuracyStats(),
    ]);
    setOpen(o); setClosed(c); setStats(s); setLoading(false);
  }
  useEffect(() => { load(); const id = setInterval(load, 25_000); return () => clearInterval(id); }, []);

  const fmt = (n: any, d = 2) => Number(n ?? 0).toFixed(d);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-display font-bold text-foreground flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary float-glow" /> KI Sandbox — Training Arena
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Waides KI auto-opens paper trades from its own signals. Every win and loss feeds its accuracy.
          </p>
        </div>
        <Button onClick={load} disabled={loading} size="sm" variant="outline" className="font-mono text-xs">
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} /> Reconcile
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Total Trades" value={stats.total} />
        <StatTile label="Win Rate" value={`${stats.winRate}%`} accent={stats.winRate >= 55 ? 'success' : stats.winRate >= 45 ? 'warning' : 'danger'} />
        <StatTile label="Wins / Losses" value={`${stats.wins} / ${stats.losses}`} />
        <StatTile label="Avg PnL" value={`${stats.avgPnl >= 0 ? '+' : ''}${fmt(stats.avgPnl)}%`} accent={stats.avgPnl >= 0 ? 'success' : 'danger'} />
      </div>

      <TerminalCard title="OPEN POSITIONS">
        {open.length === 0 ? (
          <p className="text-xs text-muted-foreground font-mono py-4 text-center">
            No open paper trades. KI opens new positions when a high-confidence signal appears.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="text-[10px] text-muted-foreground border-b border-border/40">
                <tr><th className="text-left p-2">Asset</th><th className="text-left p-2">Dir</th><th className="text-left p-2">TF</th><th className="text-right p-2">Entry</th><th className="text-right p-2">Now</th><th className="text-right p-2">SL</th><th className="text-right p-2">TP1</th><th className="text-right p-2">PnL%</th><th className="text-right p-2">Conf</th></tr>
              </thead>
              <tbody>
                {open.map(t => (
                  <tr key={t.id} className="border-b border-border/20 hover:bg-muted/20">
                    <td className="p-2">{t.asset} <span className="text-[9px] text-muted-foreground">[{t.asset_class}]</span></td>
                    <td className={`p-2 ${t.direction === 'long' ? 'text-success' : 'text-danger'}`}>{t.direction.toUpperCase()}</td>
                    <td className="p-2">{t.timeframe}</td>
                    <td className="p-2 text-right">{fmt(t.entry_price, 4)}</td>
                    <td className="p-2 text-right">{fmt(t.current_price, 4)}</td>
                    <td className="p-2 text-right text-danger/80">{fmt(t.stop_loss, 4)}</td>
                    <td className="p-2 text-right text-success/80">{fmt(t.take_profit_1, 4)}</td>
                    <td className={`p-2 text-right ${Number(t.pnl_percent) >= 0 ? 'text-success' : 'text-danger'}`}>
                      {Number(t.pnl_percent) >= 0 ? '+' : ''}{fmt(t.pnl_percent)}
                    </td>
                    <td className="p-2 text-right">{t.confidence_percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TerminalCard>

      <TerminalCard title="CLOSED HISTORY — KI LEARNING LOG">
        {closed.length === 0 ? (
          <p className="text-xs text-muted-foreground font-mono py-4 text-center">No closed trades yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="text-[10px] text-muted-foreground border-b border-border/40">
                <tr><th className="text-left p-2">When</th><th className="text-left p-2">Asset</th><th className="text-left p-2">Dir</th><th className="text-right p-2">Entry → Exit</th><th className="text-right p-2">PnL%</th><th className="text-left p-2">Outcome</th></tr>
              </thead>
              <tbody>
                {closed.map(t => (
                  <tr key={t.id} className="border-b border-border/20">
                    <td className="p-2 text-[10px] text-muted-foreground">{new Date(t.closed_at ?? t.opened_at).toLocaleString()}</td>
                    <td className="p-2">{t.asset}</td>
                    <td className={`p-2 ${t.direction === 'long' ? 'text-success' : 'text-danger'}`}>{t.direction.toUpperCase()}</td>
                    <td className="p-2 text-right">{fmt(t.entry_price, 4)} → {fmt(t.current_price, 4)}</td>
                    <td className={`p-2 text-right ${Number(t.pnl_percent) >= 0 ? 'text-success' : 'text-danger'}`}>
                      {Number(t.pnl_percent) >= 0 ? '+' : ''}{fmt(t.pnl_percent)}
                    </td>
                    <td className="p-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${t.outcome === 'win' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}>
                        {(t.outcome ?? 'pending').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TerminalCard>
    </div>
  );
}

function StatTile({ label, value, accent }: { label: string; value: any; accent?: 'success' | 'danger' | 'warning' }) {
  const color = accent === 'success' ? 'text-success' : accent === 'danger' ? 'text-danger' : accent === 'warning' ? 'text-warning' : 'text-foreground';
  return (
    <div className="terminal-border rounded-lg p-3 bg-card/40">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-display font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}