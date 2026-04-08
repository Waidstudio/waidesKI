import { cn } from '@/lib/utils';

interface VolatilityGaugeProps {
  value: number; // 0-100
  label: string;
  className?: string;
}

export function VolatilityGauge({ value, label, className }: VolatilityGaugeProps) {
  const angle = (value / 100) * 180 - 90; // -90 to 90 degrees
  const level = value > 70 ? 'HIGH' : value > 40 ? 'MODERATE' : 'LOW';
  const color = value > 70 ? 'text-danger' : value > 40 ? 'text-warning' : 'text-success';

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative w-32 h-16 overflow-hidden">
        {/* Background arc */}
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full border-4 border-muted" />
        {/* Colored segments */}
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full"
          style={{
            background: `conic-gradient(from 180deg, hsl(var(--success)) 0deg, hsl(var(--warning)) 90deg, hsl(var(--danger)) 180deg, transparent 180deg)`,
            opacity: 0.2,
          }}
        />
        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 h-14 w-0.5 bg-foreground origin-bottom transition-transform duration-700"
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-foreground" />
      </div>
      <p className={cn('font-mono text-sm font-bold mt-2', color)}>{level}</p>
      <p className="text-[10px] font-mono text-muted-foreground">{label}: {value}</p>
    </div>
  );
}
