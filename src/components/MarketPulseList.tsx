import type { MarketData } from '@/lib/konsmia/types';
import { Eye, TrendingUp, AlertTriangle, Ban } from 'lucide-react';

interface Props {
  data: MarketData[];
}

export function MarketPulseList({ data }: Props) {
  const getTagInfo = (tag: MarketData['kiTag']) => {
    switch (tag) {
      case 'watching': return { icon: Eye, label: 'KI Watching', cls: 'text-info bg-info/10 border-info/20' };
      case 'high_opportunity': return { icon: TrendingUp, label: 'High Opportunity', cls: 'text-success bg-success/10 border-success/20' };
      case 'avoid': return { icon: Ban, label: 'Avoid', cls: 'text-danger bg-danger/10 border-danger/20' };
      default: return null;
    }
  };

  return (
    <div className="space-y-2">
      {data.map(asset => {
        const tag = getTagInfo(asset.kiTag);
        return (
          <div key={asset.symbol} className="flex items-center justify-between bg-secondary/20 rounded p-3">
            <div className="flex items-center gap-3 min-w-0">
              <div>
                <p className="font-mono text-xs font-bold text-foreground">{asset.symbol}</p>
                <p className="text-[10px] text-muted-foreground truncate">{asset.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {tag && (
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono ${tag.cls}`}>
                  <tag.icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{tag.label}</span>
                </span>
              )}
              <div className="text-right">
                <p className="font-mono text-xs font-bold text-foreground">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                <p className={`font-mono text-[10px] ${asset.change24h >= 0 ? 'text-success' : 'text-danger'}`}>
                  {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
