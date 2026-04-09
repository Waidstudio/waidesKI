import { motion } from 'framer-motion';
import type { KIVerdict } from '@/lib/konsmia/types';

interface Props {
  verdict: KIVerdict;
}

export function VerdictPanel({ verdict }: Props) {
  const actionColors: Record<string, string> = {
    buy: 'text-success border-success/30 bg-success/5',
    sell: 'text-danger border-danger/30 bg-danger/5',
    wait: 'text-warning border-warning/30 bg-warning/5',
    no_trade: 'text-muted-foreground border-border bg-muted/20',
  };

  const directionEmoji: Record<string, string> = {
    bullish: '▲',
    bearish: '▼',
    neutral: '◆',
    no_trade: '⚠',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* Main Verdict */}
      <div className={`rounded-lg border p-4 ${actionColors[verdict.action]}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{directionEmoji[verdict.direction]}</span>
            <div>
              <p className="font-mono text-sm font-bold uppercase">{verdict.direction}</p>
              <p className="font-mono text-[10px] opacity-70">{verdict.action.toUpperCase()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-bold">{verdict.confidencePercent}%</p>
            <p className="font-mono text-[10px] opacity-70">CONFIDENCE</p>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="text-center bg-background/30 rounded p-2">
            <p className="font-mono text-[10px] opacity-70">RISK</p>
            <p className="font-mono text-xs font-bold uppercase">{verdict.riskLevel}</p>
          </div>
          <div className="text-center bg-background/30 rounded p-2">
            <p className="font-mono text-[10px] opacity-70">STRENGTH</p>
            <p className="font-mono text-xs font-bold">{verdict.signalStrength}</p>
          </div>
          <div className="text-center bg-background/30 rounded p-2">
            <p className="font-mono text-[10px] opacity-70">ACTION</p>
            <p className="font-mono text-xs font-bold uppercase">{verdict.action}</p>
          </div>
        </div>
      </div>

      {/* Soul Voice */}
      <div className="bg-secondary/20 rounded-lg p-4 border border-border/50">
        <p className="font-mono text-[10px] text-primary mb-2 uppercase tracking-wider">Waides KI Says</p>
        <p className="text-sm text-foreground/90 leading-relaxed italic">"{verdict.soulVoice}"</p>
      </div>

      {/* No Trade Reasons */}
      {verdict.noTradeMissing && verdict.noTradeMissing.length > 0 && (
        <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
          <p className="font-mono text-[10px] text-warning mb-2 uppercase tracking-wider">Why Not Trade</p>
          <ul className="space-y-1">
            {verdict.noTradeMissing.map((reason, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confluence */}
      <div className="bg-secondary/10 rounded-lg p-3 border border-border/30">
        <p className="font-mono text-[10px] text-primary mb-2 uppercase tracking-wider">Confluence Summary</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{verdict.confluenceSummary}</p>
      </div>
    </motion.div>
  );
}
