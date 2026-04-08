import { cn } from '@/lib/utils';
import type { CorrelationPair } from '@/lib/konsmia/types';

interface CorrelationMatrixProps {
  pairs: CorrelationPair[];
  className?: string;
}

export function CorrelationMatrix({ pairs, className }: CorrelationMatrixProps) {
  const assets = [...new Set(pairs.flatMap(p => [p.assetA, p.assetB]))];
  
  const getCorrelation = (a: string, b: string) => {
    if (a === b) return 1;
    const pair = pairs.find(p => (p.assetA === a && p.assetB === b) || (p.assetA === b && p.assetB === a));
    return pair?.correlation ?? 0;
  };

  const getColor = (v: number) => {
    if (v > 0.5) return 'bg-success/40 text-success';
    if (v > 0.2) return 'bg-success/20 text-success';
    if (v > -0.2) return 'bg-muted/30 text-muted-foreground';
    if (v > -0.5) return 'bg-danger/20 text-danger';
    return 'bg-danger/40 text-danger';
  };

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-[10px] font-mono text-muted-foreground p-1" />
            {assets.map(a => (
              <th key={a} className="text-[10px] font-mono text-muted-foreground p-1 text-center">{a}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {assets.map(row => (
            <tr key={row}>
              <td className="text-[10px] font-mono text-muted-foreground p-1 font-bold">{row}</td>
              {assets.map(col => {
                const v = getCorrelation(row, col);
                return (
                  <td key={col} className={cn('p-1 text-center')}>
                    <span className={cn('inline-block w-full rounded px-1 py-0.5 text-[10px] font-mono font-bold', getColor(v))}>
                      {v.toFixed(2)}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
