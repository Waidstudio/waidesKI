import type { TimelineProjection } from '@/lib/konsmia/quantum-engine';

interface Props { projections: TimelineProjection[] }

export function PredictionTimeline({ projections }: Props) {
  return (
    <div className="relative space-y-3">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border/50" />

      {projections.map((proj, i) => (
        <div key={proj.id} className="relative pl-10">
          {/* Dot */}
          <div className={`absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 ${
            proj.selected ? 'bg-primary border-primary' : 'bg-secondary border-border'
          }`} />

          <div className={`rounded-lg p-3 border ${proj.selected ? 'border-primary/30 bg-primary/5' : 'border-border/30 bg-secondary/10'}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-foreground">{proj.path}</p>
              <p className="font-mono text-xs font-bold text-primary">{proj.probability}%</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span>Target: {proj.priceTarget.toFixed(2)}</span>
              <span>Duration: {proj.duration}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
