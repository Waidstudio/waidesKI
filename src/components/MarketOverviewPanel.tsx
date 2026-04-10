import { TrendingUp, Activity, BarChart2, Zap, Layers, Brain } from 'lucide-react';
import type { MarketOverviewState } from '@/lib/konsmia/quantum-engine';

interface Props { overview: MarketOverviewState }

export function MarketOverviewPanel({ overview }: Props) {
  const sections = [
    { icon: TrendingUp, title: 'Trend', content: `${overview.trendAnalysis.direction} (${overview.trendAnalysis.strength}%) — ${overview.trendAnalysis.alignment}` },
    { icon: Activity, title: 'Momentum', content: `Strength: ${overview.momentumAnalysis.strength}% — ${overview.momentumAnalysis.acceleration ? '⚡ Accelerating' : overview.momentumAnalysis.exhaustion ? '⚠️ Exhaustion' : '→ Steady'}` },
    { icon: BarChart2, title: 'Volume', content: `${overview.volumeAnalysis.institutional ? '🏦 Institutional' : '👥 Retail'} — Conviction: ${overview.volumeAnalysis.conviction}%${overview.volumeAnalysis.fakeMove ? ' ⚠️ Fake move risk' : ''}` },
    { icon: Zap, title: 'Volatility', content: `${overview.volatilityAnalysis.phase === 'expansion' ? '📈 Expansion' : '📉 Contraction'} — Breakout potential: ${overview.volatilityAnalysis.breakoutPotential}%` },
    { icon: Layers, title: 'Structure', content: overview.structureAnalysis.pattern },
    { icon: Brain, title: 'Psychology', content: `${overview.psychologicalState.zone} — ${overview.psychologicalState.retailVsSmart}` },
  ];

  return (
    <div className="space-y-3">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
        <p className="text-xs text-foreground font-medium">{overview.globalCondition}</p>
      </div>
      {sections.map(section => (
        <div key={section.title} className="flex items-start gap-3 bg-secondary/20 rounded p-3">
          <section.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground">{section.title}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{section.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
