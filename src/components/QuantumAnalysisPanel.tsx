import { Atom, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { QuantumState } from '@/lib/konsmia/quantum-engine';

interface Props {
  quantum: QuantumState;
  asset: string;
}

const directionIcon = {
  bullish: <TrendingUp className="h-3 w-3 text-success" />,
  bearish: <TrendingDown className="h-3 w-3 text-danger" />,
  neutral: <Minus className="h-3 w-3 text-muted-foreground" />,
  no_trade: <Minus className="h-3 w-3 text-warning" />,
};

export function QuantumAnalysisPanel({ quantum, asset }: Props) {
  return (
    <div className="space-y-4">
      {/* Collapse Status */}
      <div className={`rounded-lg p-4 border text-center ${quantum.signalCollapsed ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}>
        <div className="flex items-center justify-center gap-2 mb-1">
          <Atom className={`h-4 w-4 ${quantum.signalCollapsed ? 'text-success' : 'text-warning animate-pulse'}`} />
          <p className={`font-mono text-sm font-bold ${quantum.signalCollapsed ? 'text-success' : 'text-warning'}`}>
            {quantum.signalCollapsed ? 'WAVE COLLAPSED — SIGNAL ACTIVE' : 'SUPERPOSITION — AWAITING COLLAPSE'}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">Collapse confidence: {quantum.collapseConfidence}%</p>
      </div>

      {/* Probability Fields */}
      <div className="space-y-2">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Probability Scenarios</p>
        {quantum.probabilityFields.map((field, i) => (
          <div key={i} className="bg-secondary/20 rounded p-3 flex items-start gap-3">
            {directionIcon[field.direction]}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground font-medium">{field.scenario}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{field.magnitude} move • {field.timeHorizon}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-sm font-bold text-primary">{field.probability}%</p>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Projections */}
      <div className="space-y-2">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Timeline Projections</p>
        {quantum.timelineProjections.map(proj => (
          <div key={proj.id} className={`rounded p-3 border ${proj.selected ? 'border-primary/30 bg-primary/5' : 'border-border/30 bg-secondary/10'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">{proj.path}</p>
                <p className="text-[10px] text-muted-foreground">Duration: {proj.duration}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs font-bold text-foreground">{proj.priceTarget.toFixed(2)}</p>
                <p className="font-mono text-[10px] text-primary">{proj.probability}%</p>
              </div>
            </div>
            {proj.selected && (
              <p className="text-[10px] text-primary mt-1 font-mono">★ MOST PROBABLE PATH</p>
            )}
          </div>
        ))}
      </div>

      {/* Dimensional Correlations */}
      <div className="space-y-2">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Multi-Dimensional Correlations</p>
        {quantum.dimensionalCorrelations.map((dim, i) => (
          <div key={i} className="bg-secondary/20 rounded p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-foreground">{dim.dimension}</p>
              <p className="font-mono text-[10px] text-primary">{(dim.strength * 100).toFixed(0)}%</p>
            </div>
            <div className="w-full bg-secondary/40 rounded-full h-1.5 mb-1">
              <div className="bg-primary/60 rounded-full h-1.5 transition-all" style={{ width: `${dim.strength * 100}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground">{dim.interpretation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
