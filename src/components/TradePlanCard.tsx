import type { TradePlan } from '@/lib/konsmia/types';
import { Clock, Target, Shield, TrendingUp, TrendingDown } from 'lucide-react';

interface Props { plans: TradePlan[]; asset: string }

function fmt(n: number) {
  if (!Number.isFinite(n)) return '—';
  return n < 10 ? n.toFixed(4) : n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function TradePlanCard({ plans, asset }: Props) {
  if (!plans || plans.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs font-bold text-foreground">EXECUTABLE PLANS — {asset}</p>
        <span className="font-mono text-[10px] text-muted-foreground">All timeframes • UTC</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {plans.map(p => {
          const long = p.direction === 'long';
          const Icon = long ? TrendingUp : TrendingDown;
          return (
            <div key={p.timeframe}
              className={`rounded-lg border p-3 space-y-2 ${long ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-3.5 w-3.5 ${long ? 'text-success' : 'text-danger'}`} />
                  <span className="font-mono text-xs font-bold uppercase">{p.timeframe} {p.direction}</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">RR {p.riskRewardRatio}:1</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <div className="bg-background/30 rounded p-1.5">
                  <span className="text-muted-foreground">Entry</span>
                  <p className="text-foreground font-bold">{fmt(p.entry)}</p>
                </div>
                <div className="bg-background/30 rounded p-1.5">
                  <span className="text-muted-foreground flex items-center gap-1"><Shield className="h-2.5 w-2.5" />SL</span>
                  <p className="text-danger font-bold">{fmt(p.stopLoss)}</p>
                </div>
                <div className="bg-background/30 rounded p-1.5">
                  <span className="text-muted-foreground flex items-center gap-1"><Target className="h-2.5 w-2.5" />TP1</span>
                  <p className="text-success font-bold">{fmt(p.takeProfit1)}</p>
                </div>
                <div className="bg-background/30 rounded p-1.5">
                  <span className="text-muted-foreground flex items-center gap-1"><Target className="h-2.5 w-2.5" />TP2</span>
                  <p className="text-success font-bold">{fmt(p.takeProfit2)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-border/30">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" /> {p.startTimeUTC}
                </span>
                <span className="text-muted-foreground">{p.expectedDuration.split('•')[0].trim()}</span>
              </div>
              <p className="text-[10px] text-muted-foreground italic">{p.positionSizingHint}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}