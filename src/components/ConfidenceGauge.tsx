import { motion } from 'framer-motion';

interface Props {
  score: number;
  layers: { name: string; score: number }[];
}

export function ConfidenceGauge({ score, layers }: Props) {
  const getColor = (s: number) => {
    if (s >= 85) return 'text-success';
    if (s >= 70) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="space-y-4">
      {/* Main Gauge */}
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="50" fill="none"
              stroke={score >= 85 ? 'hsl(var(--success))' : score >= 70 ? 'hsl(var(--warning))' : 'hsl(var(--danger))'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 314} 314`}
              initial={{ strokeDasharray: '0 314' }}
              animate={{ strokeDasharray: `${(score / 100) * 314} 314` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={`font-mono text-2xl font-bold ${getColor(score)}`}>{score}%</p>
            <p className="font-mono text-[10px] text-muted-foreground">CONFIDENCE</p>
          </div>
        </div>
      </div>

      {/* Layer Breakdown */}
      <div className="space-y-1.5">
        {layers.map(layer => (
          <div key={layer.name} className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground w-16 text-right">{layer.name}</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${layer.score > 20 ? 'bg-success' : layer.score < -20 ? 'bg-danger' : 'bg-warning'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, 50 + layer.score / 2)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <span className="font-mono text-[10px] text-muted-foreground w-8">{layer.score > 0 ? '+' : ''}{layer.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
