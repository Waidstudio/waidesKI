import type { WaidesSignal } from '@/lib/konsmia/types';

interface Props {
  signal: WaidesSignal;
}

export function NoTradePanel({ signal }: Props) {
  return (
    <div className="border border-warning/30 bg-warning/5 rounded-lg p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">⚠️</span>
        <div>
          <p className="font-mono text-sm font-bold text-warning">NO TRADE RECOMMENDED</p>
          <p className="text-xs text-muted-foreground">{signal.asset} — Conditions are not aligned</p>
        </div>
      </div>

      <div className="bg-background/30 rounded p-3">
        <p className="text-sm text-foreground/90 italic leading-relaxed">"{signal.verdict.soulVoice}"</p>
      </div>

      {signal.verdict.noTradeMissing && signal.verdict.noTradeMissing.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[10px] text-warning uppercase tracking-wider">What Is Missing</p>
          {signal.verdict.noTradeMissing.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 bg-background/20 rounded p-2">
              <span className="text-warning text-xs mt-0.5">✗</span>
              <p className="text-xs text-muted-foreground">{reason}</p>
            </div>
          ))}
        </div>
      )}

      <div className="text-center pt-2">
        <p className="text-[10px] text-muted-foreground">
          Discipline over impulse. The best traders know when not to act.
        </p>
      </div>
    </div>
  );
}
