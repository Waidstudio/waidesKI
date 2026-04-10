import { ShieldAlert } from 'lucide-react';

interface Props {
  riskLevel: 'low' | 'medium' | 'high';
  confidencePercent: number;
  noTradeReasons?: string[];
}

const riskConfig = {
  low: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', label: 'LOW RISK' },
  medium: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', label: 'MEDIUM RISK' },
  high: { color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20', label: 'HIGH RISK' },
};

export function RiskNoteCard({ riskLevel, confidencePercent, noTradeReasons }: Props) {
  const config = riskConfig[riskLevel];

  return (
    <div className="space-y-3">
      <div className={`rounded-lg p-4 border ${config.border} ${config.bg} text-center`}>
        <ShieldAlert className={`h-6 w-6 mx-auto mb-2 ${config.color}`} />
        <p className={`font-mono text-sm font-bold ${config.color}`}>{config.label}</p>
        <p className="text-[10px] text-muted-foreground mt-1">Confidence: {confidencePercent}%</p>
      </div>

      <div className="bg-secondary/20 rounded p-3 space-y-2">
        <p className="font-mono text-[10px] text-muted-foreground uppercase">Risk Guidelines</p>
        <ul className="space-y-1 text-[10px] text-muted-foreground">
          <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span> Never risk more than 1-2% per trade</li>
          <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span> Always set invalidation before entry</li>
          <li className="flex items-start gap-1.5"><span className="text-primary mt-0.5">•</span> {riskLevel === 'high' ? 'Consider staying out entirely' : riskLevel === 'medium' ? 'Reduce position size by 50%' : 'Standard position sizing applies'}</li>
        </ul>
      </div>

      {noTradeReasons && noTradeReasons.length > 0 && (
        <div className="space-y-1.5">
          <p className="font-mono text-[10px] text-warning uppercase">Caution Flags</p>
          {noTradeReasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 bg-warning/5 border border-warning/10 rounded p-2">
              <span className="text-warning text-[10px] mt-0.5">⚠</span>
              <p className="text-[10px] text-muted-foreground">{reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
