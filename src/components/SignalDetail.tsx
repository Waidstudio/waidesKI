import { cn } from '@/lib/utils';
import type { WaidesSignal } from '@/lib/konsmia/types';
import { BiasIndicator } from './BiasIndicator';
import { TerminalCard } from './TerminalCard';
import { Shield, Clock, Brain, TrendingUp } from 'lucide-react';

interface SignalDetailProps {
  signal: WaidesSignal;
  className?: string;
}

export function SignalDetail({ signal, className }: SignalDetailProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-mono text-lg font-bold text-foreground">{signal.asset}</h2>
          <p className="text-xs text-muted-foreground font-mono">{signal.timeframe}</p>
        </div>
        <BiasIndicator bias={signal.bias} confidence={signal.confidence} score={signal.overallScore} />
      </div>

      <div className="bg-secondary/20 rounded-lg p-3 border border-border">
        <p className="text-sm text-foreground leading-relaxed">{signal.reasoning}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TerminalCard title="MACRO" headerRight={<ScoreBadge score={signal.macro.score} />}>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><span className="text-foreground font-medium">Trend:</span> {signal.macro.globalTrend}</p>
            <p><span className="text-foreground font-medium">Rates:</span> {signal.macro.interestRates}</p>
            <p><span className="text-foreground font-medium">Institutions:</span> {signal.macro.institutionalBehavior}</p>
          </div>
        </TerminalCard>

        <TerminalCard title="MICRO" headerRight={<ScoreBadge score={signal.micro.score} />}>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><span className="text-foreground font-medium">Price:</span> {signal.micro.priceAction}</p>
            <p><span className="text-foreground font-medium">Flow:</span> {signal.micro.orderFlow}</p>
            <p><span className="text-foreground font-medium">Zones:</span> {signal.micro.liquidityZones.join(', ')}</p>
          </div>
        </TerminalCard>

        <TerminalCard title="PSYCHOLOGICAL" headerRight={<ScoreBadge score={signal.psychological.score} />}>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><span className="text-foreground font-medium">Crowd:</span> {signal.psychological.crowdEmotion.replace('_', ' ')}</p>
            <p><span className="text-foreground font-medium">Retail vs Inst:</span> {signal.psychological.retailVsInstitutional}</p>
            <p><span className="text-foreground font-medium">Fear/Greed:</span> {signal.psychological.fearGreedIndex}/100</p>
          </div>
        </TerminalCard>

        <TerminalCard title="TEMPORAL" headerRight={<ScoreBadge score={signal.temporal.score} />}>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <p><span className="text-foreground font-medium">Session:</span> {signal.temporal.currentSession}</p>
            <p><span className="text-foreground font-medium">Short-term:</span> {signal.temporal.shortTermStructure}</p>
            <p><span className="text-foreground font-medium">Next Key:</span> {signal.temporal.nextKeyTime}</p>
          </div>
        </TerminalCard>
      </div>

      <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
        {signal.ethicalAlignment && (
          <span className="flex items-center gap-1 text-success">
            <Shield className="h-3 w-3" /> KonsAi Aligned
          </span>
        )}
        {signal.shavokaApproved && (
          <span className="flex items-center gap-1 text-success">
            <Shield className="h-3 w-3" /> Shavoka Approved
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {new Date(signal.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className={cn(
      'font-mono text-[10px] font-bold px-1.5 py-0.5 rounded',
      score > 20 ? 'bg-success/10 text-success' : score < -20 ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
    )}>
      {score > 0 ? '+' : ''}{score}
    </span>
  );
}
