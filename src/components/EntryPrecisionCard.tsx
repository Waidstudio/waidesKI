import type { EntryPrecision as EntryPrecisionType } from '@/lib/konsmia/types';
import { Target } from 'lucide-react';

interface Props {
  entry: EntryPrecisionType;
  bias: string;
}

export function EntryPrecisionCard({ entry, bias }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        <p className="font-mono text-xs font-bold text-foreground">ENTRY PRECISION</p>
      </div>

      <div className="space-y-2">
        <div className={`rounded p-3 border ${bias === 'bullish' ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'}`}>
          <p className="font-mono text-[10px] text-muted-foreground mb-1">ENTRY ZONE</p>
          <p className="font-mono text-sm font-bold text-foreground">
            {entry.entryZone[0].toFixed(2)} – {entry.entryZone[1].toFixed(2)}
          </p>
        </div>

        <div className="rounded p-3 border border-danger/30 bg-danger/5">
          <p className="font-mono text-[10px] text-muted-foreground mb-1">INVALIDATION</p>
          <p className="font-mono text-sm font-bold text-danger">{entry.invalidationLevel.toFixed(2)}</p>
        </div>

        <div className="rounded p-3 border border-info/30 bg-info/5">
          <p className="font-mono text-[10px] text-muted-foreground mb-1">CONFIRMATION TRIGGER</p>
          <p className="text-xs text-foreground">{entry.confirmationTrigger}</p>
        </div>
      </div>
    </div>
  );
}
