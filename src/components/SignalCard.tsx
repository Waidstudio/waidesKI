import { TrendingUp, TrendingDown, MinusCircle, Clock, Shield } from 'lucide-react';
import type { WaidesSignal } from '@/lib/konsmia/types';

interface Props { signal: WaidesSignal; onClick?: () => void }

const biasConfig = {
  bullish: { icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  bearish: { icon: TrendingDown, color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' },
  neutral: { icon: MinusCircle, color: 'text-muted-foreground', bg: 'bg-muted/10', border: 'border-border/50' },
  no_trade: { icon: Shield, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
};

export function SignalCard({ signal, onClick }: Props) {
  const config = biasConfig[signal.bias];
  const Icon = config.icon;

  return (
    <div onClick={onClick} className={`rounded-lg border ${config.border} ${config.bg} p-4 cursor-pointer hover:brightness-110 transition-all space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config.color}`} />
          <div>
            <p className="font-mono text-sm font-bold text-foreground">{signal.asset}</p>
            <p className={`font-mono text-[10px] uppercase ${config.color}`}>{signal.bias === 'no_trade' ? 'NO TRADE' : signal.bias}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-bold text-foreground">{signal.confidencePercent}%</p>
          <p className="font-mono text-[10px] text-muted-foreground">confidence</p>
        </div>
      </div>

      <p className="text-[11px] text-foreground/80 italic leading-relaxed line-clamp-2">"{signal.verdict.soulVoice}"</p>

      <div className="flex items-center gap-3 flex-wrap">
        <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${config.bg} ${config.color} border ${config.border}`}>
          {signal.verdict.action.toUpperCase()}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">Risk: {signal.verdict.riskLevel}</span>
        {signal.timeWindow && (
          <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" /> {signal.timeWindow.breakoutTime}
          </span>
        )}
        <span className={`font-mono text-[10px] ${signal.multiTimeframeAligned ? 'text-success' : 'text-danger'}`}>
          MTF: {signal.multiTimeframeAligned ? '✓' : '✗'}
        </span>
      </div>
    </div>
  );
}
