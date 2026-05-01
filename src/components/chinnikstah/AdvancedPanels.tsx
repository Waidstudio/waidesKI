import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TerminalCard } from '@/components/TerminalCard';
import {
  Atom, Network, Crown, Waves, Layers, Flame, MessageSquare, Compass, Magnet, ShieldAlert,
  Calculator, Timer, AlertTriangle, RefreshCw, ScanSearch, Zap, Link2, Database, Bug, Target,
} from 'lucide-react';
import type { getAllAdvancedFeatures } from '@/lib/konsmia/chinnikstah-features';

type Features = ReturnType<typeof getAllAdvancedFeatures>;

function StatRow({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1 border-b border-border/30 last:border-0">
      <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
      <span className={cn('font-mono text-[11px] font-bold', accent ?? 'text-foreground')}>{value}</span>
    </div>
  );
}

function biasColor(v: number) {
  if (v > 10) return 'text-success';
  if (v < -10) return 'text-danger';
  return 'text-warning';
}

export function QuantumCone({ data }: { data: Features['quantumCone'] }) {
  return (
    <TerminalCard title="QUANTUM PROBABILITY CONE" subtitle="Forward price distribution" headerRight={<Atom className="h-3.5 w-3.5 text-primary float-glow" />}>
      <div className="space-y-1.5">
        {data.map(d => (
          <div key={d.hours} className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground w-10">{d.hours}h</span>
            <div className="flex-1 h-2 bg-muted rounded-full relative overflow-hidden">
              <motion.div
                className="absolute h-full bg-gradient-primary opacity-70 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${50 + d.expected * 8}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <span className={cn('font-mono text-[10px] font-bold w-14 text-right', biasColor(d.expected))}>{d.expected > 0 ? '+' : ''}{d.expected}%</span>
            <span className="font-mono text-[9px] text-accent w-10 text-right">{d.prob}%</span>
          </div>
        ))}
      </div>
    </TerminalCard>
  );
}

export function ConfluenceMap({ data }: { data: Features['confluence'] }) {
  return (
    <TerminalCard title="NEURAL CONFLUENCE MAP" subtitle="Cross-family agreement" headerRight={<Network className="h-3.5 w-3.5 text-accent" />}>
      <div className="grid gap-px" style={{ gridTemplateColumns: `40px repeat(${data.families.length}, 1fr)` }}>
        <div />
        {data.families.map(f => <div key={f} className="font-mono text-[7px] text-muted-foreground text-center truncate">{f.slice(0, 3)}</div>)}
        {data.matrix.map((row, i) => (
          <>
            <div key={`l-${i}`} className="font-mono text-[7px] text-muted-foreground truncate text-right pr-1">{data.families[i].slice(0, 3)}</div>
            {row.map((v, j) => (
              <div
                key={`${i}-${j}`}
                className="aspect-square rounded-sm"
                style={{
                  background: v > 0.3 ? `hsl(165 90% 50% / ${v})` : v < -0.3 ? `hsl(348 95% 60% / ${Math.abs(v)})` : `hsl(260 25% 14%)`,
                }}
                title={`${data.families[i]} ↔ ${data.families[j]}: ${v}`}
              />
            ))}
          </>
        ))}
      </div>
    </TerminalCard>
  );
}

export function SmartMoney({ data }: { data: Features['smartMoney'] }) {
  return (
    <TerminalCard title="SMART MONEY FOOTPRINT" headerRight={<Crown className="h-3.5 w-3.5 text-accent" />}>
      <div className="text-center space-y-2">
        <div className={cn('font-futuristic text-3xl font-black', biasColor(data.score))}>{data.score > 0 ? '+' : ''}{data.score}</div>
        <p className="font-mono text-[10px] text-foreground">{data.label}</p>
        <p className="font-mono text-[9px] text-muted-foreground">Confidence {data.confidence}%</p>
      </div>
    </TerminalCard>
  );
}

export function WhalePulse({ data }: { data: Features['whales'] }) {
  return (
    <TerminalCard title="WHALE PULSE" headerRight={<Waves className="h-3.5 w-3.5 text-info" />}>
      <StatRow label="Large Orders (1h)" value={data.largeOrders} />
      <StatRow label="Exchange Inflow" value={`${data.exchangeInflow}M`} accent={data.exchangeInflow > 0 ? 'text-danger' : 'text-success'} />
      <StatRow label="Exchange Outflow" value={`${data.exchangeOutflow}M`} accent={data.exchangeOutflow > 0 ? 'text-success' : 'text-danger'} />
      <StatRow label="Net Flow" value={`${data.netFlow}M`} accent={biasColor(-data.netFlow * 30)} />
    </TerminalCard>
  );
}

export function MTFResonance({ data }: { data: Features['mtf'] }) {
  return (
    <TerminalCard title="MULTI-TIMEFRAME RESONANCE" headerRight={<Layers className="h-3.5 w-3.5 text-primary" />}>
      <div className="grid grid-cols-6 gap-1">
        {data.map(t => (
          <div key={t.timeframe} className="text-center">
            <p className="font-mono text-[9px] text-muted-foreground">{t.timeframe}</p>
            <div className={cn('h-12 rounded mt-1 flex items-end justify-center pb-1', t.score > 0 ? 'bg-success/10' : 'bg-danger/10')}>
              <span className={cn('font-mono text-[10px] font-bold', biasColor(t.score))}>{t.score > 0 ? '+' : ''}{t.score}</span>
            </div>
          </div>
        ))}
      </div>
    </TerminalCard>
  );
}

export function PredictiveHeatwave({ data }: { data: Features['heatwave'] }) {
  return (
    <TerminalCard title="PREDICTIVE HEATWAVE" subtitle="Next 6 candles" headerRight={<Flame className="h-3.5 w-3.5 text-warning" />}>
      <div className="flex gap-1 items-end h-24">
        {data.map(c => {
          const h = Math.abs(c.heat) + 10;
          const isUp = c.direction === 'up';
          const isDown = c.direction === 'down';
          return (
            <div key={c.candle} className="flex-1 flex flex-col items-center justify-end gap-1">
              <span className={cn('font-mono text-[9px]', biasColor(c.heat))}>{c.heat > 0 ? '+' : ''}{c.heat}</span>
              <div
                className={cn('w-full rounded-t', isUp ? 'bg-success/60' : isDown ? 'bg-danger/60' : 'bg-warning/40')}
                style={{ height: `${Math.min(h, 100)}%` }}
              />
              <span className="font-mono text-[8px] text-muted-foreground">+{c.candle}</span>
            </div>
          );
        })}
      </div>
    </TerminalCard>
  );
}

export function SentimentPolarity({ data }: { data: Features['sentiment'] }) {
  return (
    <TerminalCard title="SENTIMENT POLARITY" subtitle="Multi-source crowd reading" headerRight={<MessageSquare className="h-3.5 w-3.5 text-accent" />}>
      {data.map(s => (
        <div key={s.source} className="py-1.5 border-b border-border/30 last:border-0">
          <div className="flex justify-between mb-1">
            <span className="font-mono text-[10px] text-muted-foreground">{s.source}</span>
            <span className={cn('font-mono text-[10px] font-bold', biasColor(s.score))}>{s.score > 0 ? '+' : ''}{s.score}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full relative overflow-hidden">
            <div className="absolute left-1/2 top-0 h-full w-px bg-foreground/30" />
            <div
              className={cn('absolute h-full', s.score > 0 ? 'bg-success/60 left-1/2' : 'bg-danger/60 right-1/2')}
              style={{ width: `${Math.abs(s.score) / 2}%` }}
            />
          </div>
        </div>
      ))}
    </TerminalCard>
  );
}

export function MarketRegime({ data }: { data: Features['regime'] }) {
  return (
    <TerminalCard title="MARKET REGIME" headerRight={<Compass className="h-3.5 w-3.5 text-primary" />}>
      <div className="space-y-2">
        <div className="font-futuristic text-lg font-bold text-gradient-primary">{data.regime}</div>
        <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">{data.description}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-primary" style={{ width: `${data.confidence}%` }} />
          </div>
          <span className="font-mono text-[10px] text-foreground">{data.confidence}%</span>
        </div>
      </div>
    </TerminalCard>
  );
}

export function LiquidityMagnets({ data }: { data: Features['magnets'] }) {
  return (
    <TerminalCard title="LIQUIDITY MAGNETS" headerRight={<Magnet className="h-3.5 w-3.5 text-accent" />}>
      {data.map((m, i) => (
        <div key={i} className="flex justify-between items-center py-1 border-b border-border/30 last:border-0">
          <span className="font-mono text-[10px] text-muted-foreground">{m.type}</span>
          <div className="flex items-center gap-2">
            <span className={cn('font-mono text-[10px] font-bold', biasColor(m.distance))}>{m.distance > 0 ? '+' : ''}{m.distance}%</span>
            <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${m.strength}%` }} />
            </div>
          </div>
        </div>
      ))}
    </TerminalCard>
  );
}

export function AIRiskScore({ data }: { data: Features['risk'] }) {
  const tierColor = data.tier === 'EXTREME' ? 'text-danger' : data.tier === 'HIGH' ? 'text-warning' : data.tier === 'MODERATE' ? 'text-info' : 'text-success';
  return (
    <TerminalCard title="AI RISK SCORE" headerRight={<ShieldAlert className={cn('h-3.5 w-3.5', tierColor)} />}>
      <div className="text-center space-y-2">
        <div className={cn('font-futuristic text-4xl font-black', tierColor)}>{data.score}</div>
        <div className={cn('font-mono text-xs font-bold', tierColor)}>{data.tier} RISK</div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className={cn('h-full', data.tier === 'EXTREME' ? 'bg-danger' : data.tier === 'HIGH' ? 'bg-warning' : data.tier === 'MODERATE' ? 'bg-info' : 'bg-success')} style={{ width: `${data.score}%` }} />
        </div>
      </div>
    </TerminalCard>
  );
}

export function PositionSize({ data }: { data: Features['position'] }) {
  return (
    <TerminalCard title="OPTIMAL POSITION SIZE" subtitle="Kelly-inspired sizing" headerRight={<Calculator className="h-3.5 w-3.5 text-info" />}>
      <StatRow label="Suggested" value={`${data.suggested}%`} accent="text-primary" />
      <StatRow label="Conservative" value={`${data.conservative}%`} accent="text-success" />
      <StatRow label="Maximum" value={`${data.max}%`} accent="text-warning" />
    </TerminalCard>
  );
}

export function TimeToMove({ data }: { data: Features['timing'] }) {
  return (
    <TerminalCard title="TIME-TO-MOVE FORECAST" headerRight={<Timer className="h-3.5 w-3.5 text-primary" />}>
      <div className="text-center">
        <div className="font-futuristic text-3xl font-black text-gradient-primary">{data.minutes}m</div>
        <p className="font-mono text-xs text-muted-foreground mt-1">{data.label} catalyst window</p>
      </div>
    </TerminalCard>
  );
}

export function BehavioralTraps({ data }: { data: Features['traps'] }) {
  return (
    <TerminalCard title="BEHAVIORAL TRAPS" headerRight={<AlertTriangle className={cn('h-3.5 w-3.5', data.severity === 'high' ? 'text-danger' : data.severity === 'medium' ? 'text-warning' : 'text-success')} />}>
      {data.detected.length === 0 ? (
        <p className="font-mono text-[10px] text-success">✓ No traps detected — clean structure</p>
      ) : (
        <ul className="space-y-1">
          {data.detected.map(t => (
            <li key={t} className="font-mono text-[10px] text-warning flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-warning pulse-dot" />{t} active
            </li>
          ))}
        </ul>
      )}
    </TerminalCard>
  );
}

export function CyclePosition({ data }: { data: Features['cycle'] }) {
  return (
    <TerminalCard title="CYCLE POSITION" subtitle="Wyckoff + Elliott" headerRight={<RefreshCw className="h-3.5 w-3.5 text-accent" />}>
      <StatRow label="Wyckoff Phase" value={data.wyckoff} accent="text-primary" />
      <StatRow label="Elliott Wave" value={data.elliott} accent="text-accent" />
      <StatRow label="Alignment" value={`${data.alignment}%`} />
    </TerminalCard>
  );
}

export function PatternRecognition({ data }: { data: Features['patterns'] }) {
  return (
    <TerminalCard title="AI PATTERN RECOGNITION" headerRight={<ScanSearch className="h-3.5 w-3.5 text-primary" />}>
      {data.length === 0 ? (
        <p className="font-mono text-[10px] text-muted-foreground">No high-confidence patterns currently active.</p>
      ) : (
        data.map((p, i) => (
          <div key={i} className="flex justify-between items-center py-1 border-b border-border/30 last:border-0">
            <div>
              <p className="font-mono text-[11px] font-bold text-foreground">{p.name}</p>
              <p className={cn('font-mono text-[9px]', p.bias === 'bullish' ? 'text-success' : 'text-danger')}>{p.bias}</p>
            </div>
            <span className="font-mono text-[11px] font-bold text-primary">{p.conf}%</span>
          </div>
        ))
      )}
    </TerminalCard>
  );
}

export function EnergyFlow({ data }: { data: Features['energy'] }) {
  return (
    <TerminalCard title="ENERGY FLOW INDEX" headerRight={<Zap className="h-3.5 w-3.5 text-warning float-glow" />}>
      <div className="text-center space-y-2">
        <div className={cn('font-futuristic text-4xl font-black', biasColor(data.value))}>{data.value > 0 ? '+' : ''}{data.value}</div>
        <p className="font-mono text-[10px] text-muted-foreground capitalize">{data.polarity} • intensity {data.intensity}</p>
      </div>
    </TerminalCard>
  );
}

export function CrossAssetContagion({ data }: { data: Features['contagion'] }) {
  return (
    <TerminalCard title="CROSS-ASSET CONTAGION" headerRight={<Link2 className="h-3.5 w-3.5 text-info" />}>
      <div className="grid grid-cols-5 gap-2">
        {data.map(a => (
          <div key={a.asset} className="text-center">
            <p className="font-mono text-[10px] text-muted-foreground">{a.asset}</p>
            <p className={cn('font-mono text-xs font-bold', biasColor(a.impact * 30))}>{a.impact > 0 ? '+' : ''}{a.impact}</p>
          </div>
        ))}
      </div>
    </TerminalCard>
  );
}

export function ChinnikstahMemory({ data }: { data: Features['memory'] }) {
  return (
    <TerminalCard title="CHINNIKSTAH MEMORY" subtitle="Historical setup recall" headerRight={<Database className="h-3.5 w-3.5 text-primary" />}>
      <StatRow label="Similar Setups Found" value={data.similarSetups} />
      <StatRow label="Historical Win Rate" value={`${data.historicalWinRate}%`} accent={data.historicalWinRate > 60 ? 'text-success' : 'text-warning'} />
      <StatRow label="Avg Return" value={`${data.avgReturn}%`} accent={biasColor(data.avgReturn * 30)} />
      <p className="font-mono text-[9px] text-muted-foreground mt-2">{data.bestMatch}</p>
    </TerminalCard>
  );
}

export function AnomalyScanner({ data }: { data: Features['anomalies'] }) {
  return (
    <TerminalCard title="ANOMALY SCANNER" subtitle={`${data.total} active`} headerRight={<Bug className={cn('h-3.5 w-3.5', data.total > 1 ? 'text-danger' : data.total === 1 ? 'text-warning' : 'text-success')} />}>
      {data.anomalies.map((a, i) => (
        <div key={i} className="flex justify-between items-center py-1 border-b border-border/30 last:border-0">
          <span className="font-mono text-[10px] text-muted-foreground">{a.signal}</span>
          <span className={cn('font-mono text-[9px] uppercase font-bold', a.severity === 'detected' ? 'text-danger' : 'text-success')}>{a.severity}</span>
        </div>
      ))}
    </TerminalCard>
  );
}

export function VerdictSynthesis({ data }: { data: Features['verdict'] }) {
  return (
    <TerminalCard title="KI VERDICT SYNTHESIS" subtitle="Final action plan" headerRight={<Target className="h-3.5 w-3.5 text-primary float-glow" />} className="nexus-border">
      <div className="space-y-2">
        <div className="font-futuristic text-base font-bold text-gradient-primary">{data.action}</div>
        <StatRow label="Entry" value={data.entry} accent="text-primary" />
        <StatRow label="Stop Loss" value={data.stop} accent="text-danger" />
        <StatRow label="Target" value={data.target} accent="text-success" />
        <p className="font-mono text-[10px] text-muted-foreground italic mt-2">"{data.note}"</p>
      </div>
    </TerminalCard>
  );
}