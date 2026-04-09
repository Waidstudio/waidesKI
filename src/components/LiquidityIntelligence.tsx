import type { LiquidityAnalysis } from '@/lib/konsmia/types';
import { Droplets } from 'lucide-react';

interface Props {
  liquidity: LiquidityAnalysis;
}

export function LiquidityIntelligence({ liquidity }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Droplets className="h-4 w-4 text-info" />
        <p className="font-mono text-xs font-bold text-foreground">LIQUIDITY INTELLIGENCE</p>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">Score: {liquidity.score}</span>
      </div>

      <div className="space-y-2">
        <div className="bg-secondary/20 rounded p-3">
          <p className="font-mono text-[10px] text-danger mb-1.5">STOP HUNT ZONES</p>
          {liquidity.stopHuntZones.map((z, i) => (
            <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5 mb-1">
              <span className="text-danger mt-0.5 shrink-0">⚡</span> {z}
            </p>
          ))}
        </div>

        <div className="bg-secondary/20 rounded p-3">
          <p className="font-mono text-[10px] text-info mb-1.5">LIQUIDITY POOLS</p>
          {liquidity.liquidityPools.map((p, i) => (
            <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5 mb-1">
              <span className="text-info mt-0.5 shrink-0">💧</span> {p}
            </p>
          ))}
        </div>

        <div className="bg-secondary/20 rounded p-3">
          <p className="font-mono text-[10px] text-warning mb-1.5">TRAP ZONES</p>
          {liquidity.trapZones.map((t, i) => (
            <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5 mb-1">
              <span className="text-warning mt-0.5 shrink-0">⚠</span> {t}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
