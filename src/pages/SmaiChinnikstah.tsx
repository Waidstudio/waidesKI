import { useState, useMemo } from 'react';
import { generateChinnikstah, type ChinnikstahComposite, type IndicatorReading, type ChinnikstahDirection } from '@/lib/konsmia/chinnikstah-engine';
import { TerminalCard } from '@/components/TerminalCard';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  Zap, Brain, Activity, BarChart3, Eye, Waves, GitBranch,
  Clock, Target, Hexagon, Split, Sparkles, Info, BookOpen,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const familyIcons: Record<string, any> = {
  trend: TrendingUp, momentum: Activity, volatility: Waves, volume: BarChart3,
  sentiment: Brain, liquidity: Eye, correlation: GitBranch, temporal: Clock,
  fibonacci: Target, harmonic: Hexagon, divergence: Split, fractal: Sparkles,
};

const familyColors: Record<string, string> = {
  trend: 'text-primary', momentum: 'text-info', volatility: 'text-warning',
  volume: 'text-accent', sentiment: 'text-success', liquidity: 'text-danger',
  correlation: 'text-primary', temporal: 'text-info', fibonacci: 'text-warning',
  harmonic: 'text-accent', divergence: 'text-success', fractal: 'text-primary',
};

function directionColor(d: ChinnikstahDirection) {
  if (d === 'strong_buy' || d === 'buy') return 'text-success';
  if (d === 'strong_sell' || d === 'sell') return 'text-danger';
  return 'text-warning';
}

function directionBg(d: ChinnikstahDirection) {
  if (d === 'strong_buy' || d === 'buy') return 'bg-success/10 border-success/30';
  if (d === 'strong_sell' || d === 'sell') return 'bg-danger/10 border-danger/30';
  return 'bg-warning/10 border-warning/30';
}

// ─── Unified Gauge ───
function UnifiedGauge({ score, confidence, direction }: { score: number; confidence: number; direction: ChinnikstahDirection }) {
  const normalizedAngle = ((score + 100) / 200) * 180 - 90; // -90 to 90 degrees
  const gaugeRadius = 90;
  const cx = 100, cy = 100;
  const needleX = cx + gaugeRadius * 0.75 * Math.cos((normalizedAngle - 90) * Math.PI / 180);
  const needleY = cy + gaugeRadius * 0.75 * Math.sin((normalizedAngle - 90) * Math.PI / 180);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 200 120" className="w-full max-w-[280px]">
        {/* Gauge arc background */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(0, 72%, 55%)" />
            <stop offset="30%" stopColor="hsl(30, 90%, 55%)" />
            <stop offset="50%" stopColor="hsl(45, 90%, 55%)" />
            <stop offset="70%" stopColor="hsl(90, 70%, 50%)" />
            <stop offset="100%" stopColor="hsl(160, 100%, 45%)" />
          </linearGradient>
        </defs>
        {/* Arc track */}
        <path d="M 15 100 A 85 85 0 0 1 185 100" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" strokeLinecap="round" />
        {/* Arc fill */}
        <path d="M 15 100 A 85 85 0 0 1 185 100" fill="none" stroke="url(#gaugeGradient)" strokeWidth="12" strokeLinecap="round" opacity="0.6" />
        {/* Needle */}
        <motion.line
          x1={cx} y1={cy}
          x2={needleX} y2={needleY}
          stroke="hsl(var(--foreground))"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ x2: cx, y2: cy }}
          animate={{ x2: needleX, y2: needleY }}
          transition={{ type: 'spring', stiffness: 60, damping: 12 }}
        />
        <circle cx={cx} cy={cy} r="4" fill="hsl(var(--foreground))" />
        {/* Labels */}
        <text x="15" y="115" fill="hsl(var(--muted-foreground))" fontSize="7" fontFamily="monospace">SELL</text>
        <text x="90" y="25" fill="hsl(var(--muted-foreground))" fontSize="7" fontFamily="monospace" textAnchor="middle">NEUTRAL</text>
        <text x="175" y="115" fill="hsl(var(--muted-foreground))" fontSize="7" fontFamily="monospace">BUY</text>
      </svg>

      <div className="text-center space-y-1">
        <div className={cn('font-mono text-3xl sm:text-4xl font-black tracking-tighter', directionColor(direction))}>
          {score > 0 ? '+' : ''}{score}
        </div>
        <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          {direction.replace('_', ' ')}
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">Confidence</span>
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <span className="font-mono text-[10px] text-foreground font-bold">{confidence}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Harmony Ring ───
function HarmonyRing({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (value / 100) * circumference;
  const color = value > 70 ? 'hsl(160, 100%, 45%)' : value > 40 ? 'hsl(45, 90%, 55%)' : 'hsl(0, 72%, 55%)';

  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 64 64" className="w-14 h-14">
        <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
        <motion.circle
          cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
        <text x="32" y="35" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="12" fontFamily="monospace" fontWeight="bold">{value}</text>
      </svg>
      <div>
        <p className="font-mono text-xs font-bold text-foreground">Harmony Index</p>
        <p className="font-mono text-[10px] text-muted-foreground">
          {value > 70 ? 'Strong alignment — high-fidelity signal' : value > 40 ? 'Partial alignment — mixed signals' : 'Low alignment — conflicting indicators'}
        </p>
      </div>
    </div>
  );
}

// ─── Score Bar ───
function ScoreBar({ score, label }: { score: number; label: string }) {
  const normalized = (score + 100) / 2; // 0-100
  const color = score > 20 ? 'bg-success' : score > -20 ? 'bg-warning' : 'bg-danger';

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[9px] text-muted-foreground w-20 truncate text-right">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
        <div className="absolute left-1/2 top-0 h-full w-px bg-foreground/20" />
        <motion.div
          className={cn('h-full rounded-full', color)}
          initial={{ width: '50%' }}
          animate={{ width: `${normalized}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ position: 'absolute', left: score >= 0 ? '50%' : undefined, right: score < 0 ? '50%' : undefined, maxWidth: '50%', width: `${Math.abs(score) / 2}%` }}
        />
      </div>
      <span className={cn('font-mono text-[10px] font-bold w-8 text-right', score > 0 ? 'text-success' : score < 0 ? 'text-danger' : 'text-warning')}>
        {score > 0 ? '+' : ''}{score}
      </span>
    </div>
  );
}

// ─── Indicator Family Card ───
function IndicatorFamilyCard({ reading }: { reading: IndicatorReading }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = familyIcons[reading.family] || Zap;

  return (
    <motion.div
      layout
      className={cn('border rounded-lg p-3 transition-all cursor-pointer', directionBg(reading.direction))}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={cn('h-4 w-4 shrink-0', familyColors[reading.family])} />
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold text-foreground truncate">{reading.label}</p>
            <p className="font-mono text-[9px] text-muted-foreground truncate">{reading.description.slice(0, 60)}…</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn('font-mono text-sm font-black', directionColor(reading.direction))}>
            {reading.score > 0 ? '+' : ''}{reading.score}
          </span>
          {expanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 border-t border-border/30 pt-3">
              {/* Sub-indicators */}
              {reading.subIndicators.map((sub, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={cn(
                      'h-1.5 w-1.5 rounded-full shrink-0',
                      sub.signal === 'bullish' ? 'bg-success' : sub.signal === 'bearish' ? 'bg-danger' : 'bg-warning'
                    )} />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-mono text-[10px] text-foreground/80 truncate cursor-help">{sub.name}</span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px]">
                        <p className="text-xs">{sub.explanation}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-[10px] font-bold text-foreground">{sub.value}</span>
                    <span className={cn(
                      'font-mono text-[8px] uppercase px-1 py-0.5 rounded',
                      sub.signal === 'bullish' ? 'bg-success/10 text-success' : sub.signal === 'bearish' ? 'bg-danger/10 text-danger' : 'bg-muted text-muted-foreground'
                    )}>{sub.signal}</span>
                  </div>
                </div>
              ))}

              {/* Educational note */}
              <div className="mt-2 bg-background/50 rounded p-2 flex gap-1.5">
                <BookOpen className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                <p className="font-mono text-[9px] text-muted-foreground leading-relaxed">{reading.educationalNote}</p>
              </div>

              {/* Confidence + Weight */}
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-[9px] text-muted-foreground">Confidence: <span className="text-foreground font-bold">{reading.confidence}%</span></span>
                <span className="font-mono text-[9px] text-muted-foreground">Weight: <span className="text-foreground font-bold">{reading.weight}%</span></span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Phase Indicator ───
function PhaseIndicator({ phase }: { phase: string }) {
  const phases = ['accumulation', 'markup', 'distribution', 'markdown'];
  const idx = phases.indexOf(phase);
  const colors = ['text-info', 'text-success', 'text-warning', 'text-danger'];

  return (
    <div className="flex items-center gap-1">
      {phases.map((p, i) => (
        <div key={p} className="flex items-center gap-1">
          <span className={cn(
            'font-mono text-[9px] px-1.5 py-0.5 rounded transition-all',
            i === idx ? `${colors[i]} bg-current/10 font-bold` : 'text-muted-foreground/40'
          )}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </span>
          {i < phases.length - 1 && <span className="text-muted-foreground/20">→</span>}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ───
export default function SmaiChinnikstah() {
  const composite = useMemo(() => generateChinnikstah(), []);

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-0">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">Smai Chinnikstah</h1>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground mt-1">
          The Unified Indicator — {composite.readings.length} families • {composite.readings.reduce((s, r) => s + r.subIndicators.length, 0)} indicators synthesized
        </p>
      </div>

      {/* Main Gauge + Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TerminalCard title="UNIFIED READING" subtitle="Composite Intelligence Score">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <UnifiedGauge score={composite.unifiedScore} confidence={composite.unifiedConfidence} direction={composite.direction} />
              <div className="flex-1 space-y-3">
                <div className={cn('p-3 rounded border', directionBg(composite.direction))}>
                  <p className="font-mono text-xs text-foreground leading-relaxed">{composite.verdictText}</p>
                </div>
                <div className="bg-secondary/20 rounded p-3">
                  <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">{composite.futureProjection}</p>
                </div>
                <PhaseIndicator phase={composite.phase} />
              </div>
            </div>
          </TerminalCard>
        </div>

        <div className="space-y-4">
          <TerminalCard title="HARMONY">
            <HarmonyRing value={composite.harmonyIndex} />
          </TerminalCard>
          <TerminalCard title="DOMINANT FORCE">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = familyIcons[composite.dominantFamily] || Zap;
                return <Icon className={cn('h-5 w-5', familyColors[composite.dominantFamily])} />;
              })()}
              <div>
                <p className="font-mono text-xs font-bold text-foreground capitalize">{composite.dominantFamily}</p>
                <p className="font-mono text-[9px] text-muted-foreground">Strongest signal contributor</p>
              </div>
            </div>
          </TerminalCard>
        </div>
      </div>

      {/* Family Score Overview */}
      <TerminalCard title="INDICATOR SPECTRUM" subtitle="All 12 families at a glance">
        <div className="space-y-1.5">
          {composite.readings
            .sort((a, b) => Math.abs(b.score * b.weight) - Math.abs(a.score * a.weight))
            .map(r => <ScoreBar key={r.family} score={r.score} label={r.label.split(' ')[0]} />)
          }
        </div>
      </TerminalCard>

      {/* All Indicator Families — Expandable */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-primary" />
          <h2 className="font-mono text-sm font-bold text-foreground">Deep Analysis — 12 Indicator Families</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {composite.readings.map(r => (
            <IndicatorFamilyCard key={r.family} reading={r} />
          ))}
        </div>
      </div>

      {/* Educational Summary */}
      <TerminalCard title="LEARN" subtitle="Understanding Smai Chinnikstah" headerRight={<Info className="h-3.5 w-3.5 text-muted-foreground" />}>
        <div className="space-y-3">
          <p className="font-mono text-xs text-foreground/80 leading-relaxed">{composite.educationalSummary}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-secondary/20 rounded p-2 text-center">
              <p className="font-mono text-lg font-black text-foreground">{composite.readings.length}</p>
              <p className="font-mono text-[8px] text-muted-foreground">FAMILIES</p>
            </div>
            <div className="bg-secondary/20 rounded p-2 text-center">
              <p className="font-mono text-lg font-black text-foreground">{composite.readings.reduce((s, r) => s + r.subIndicators.length, 0)}</p>
              <p className="font-mono text-[8px] text-muted-foreground">INDICATORS</p>
            </div>
            <div className="bg-secondary/20 rounded p-2 text-center">
              <p className="font-mono text-lg font-black text-foreground">{composite.harmonyIndex}%</p>
              <p className="font-mono text-[8px] text-muted-foreground">HARMONY</p>
            </div>
            <div className="bg-secondary/20 rounded p-2 text-center">
              <p className="font-mono text-lg font-black text-foreground">{composite.unifiedConfidence}%</p>
              <p className="font-mono text-[8px] text-muted-foreground">CONFIDENCE</p>
            </div>
          </div>
        </div>
      </TerminalCard>
    </div>
  );
}
