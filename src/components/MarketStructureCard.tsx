import { Layers, MapPin } from 'lucide-react';

interface Props {
  pattern: string;
  keyZones: string[];
  liquidityMap: string[];
}

export function MarketStructureCard({ pattern, keyZones, liquidityMap }: Props) {
  const isBullish = pattern.toLowerCase().includes('bullish') || pattern.includes('HH');
  const isBearish = pattern.toLowerCase().includes('bearish') || pattern.includes('LH');

  return (
    <div className="space-y-3">
      <div className={`rounded-lg p-4 border text-center ${isBullish ? 'border-success/20 bg-success/5' : isBearish ? 'border-danger/20 bg-danger/5' : 'border-border/30 bg-secondary/10'}`}>
        <Layers className={`h-5 w-5 mx-auto mb-1 ${isBullish ? 'text-success' : isBearish ? 'text-danger' : 'text-muted-foreground'}`} />
        <p className={`font-mono text-sm font-bold ${isBullish ? 'text-success' : isBearish ? 'text-danger' : 'text-foreground'}`}>{pattern}</p>
      </div>

      <div className="space-y-1.5">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Key Zones</p>
        {keyZones.map((zone, i) => (
          <div key={i} className="flex items-center gap-2 bg-secondary/20 rounded p-2">
            <MapPin className="h-3 w-3 text-primary shrink-0" />
            <p className="text-[10px] text-muted-foreground">{zone}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Liquidity Map</p>
        {liquidityMap.map((zone, i) => (
          <div key={i} className="flex items-center gap-2 bg-warning/5 border border-warning/10 rounded p-2">
            <span className="text-warning text-[10px]">⚡</span>
            <p className="text-[10px] text-muted-foreground">{zone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
