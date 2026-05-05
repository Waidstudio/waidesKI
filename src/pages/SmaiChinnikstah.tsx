import { useState, useMemo } from 'react';
import { generateChinnikstah, type ChinnikstahComposite, type IndicatorReading, type ChinnikstahDirection, type ChinnikstahTimeframe } from '@/lib/konsmia/chinnikstah-engine';
import {
  getAllAdvancedFeatures,
  liveQuantumCone, liveSmartMoney, liveWhalePulse, liveMtf, liveHeatwave,
  liveSentiment, liveMagnets, liveRisk, liveTiming, liveTraps,
  livePatterns, liveEnergy, liveContagion, liveMemory, liveAnomalies,
  marketRegime, neuralConfluenceMap, optimalPositionSize, cyclePosition, kiVerdictSynthesis,
} from '@/lib/konsmia/chinnikstah-features';
import { TerminalCard } from '@/components/TerminalCard';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  Zap, Brain, Activity, BarChart3, Eye, Waves, GitBranch,
  Clock, Target, Hexagon, Split, Sparkles, Info, BookOpen,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  QuantumCone, ConfluenceMap, SmartMoney, WhalePulse, MTFResonance, PredictiveHeatwave,
  SentimentPolarity, MarketRegime, LiquidityMagnets, AIRiskScore, PositionSize, TimeToMove,
  BehavioralTraps, CyclePosition, PatternRecognition, EnergyFlow, CrossAssetContagion,
  ChinnikstahMemory, AnomalyScanner, VerdictSynthesis,
} from '@/components/chinnikstah/AdvancedPanels';
import { ChinnikstahLiveModule } from '@/components/chinnikstah/ChinnikstahLiveModule';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const ASSETS = ['BTC/USD','ETH/USD','SOL/USD','EUR/USD','GBP/USD','USD/JPY','XAU/USD','AAPL','TSLA','NVDA'] as const;
const TIMEFRAMES: ChinnikstahTimeframe[] = ['5m','15m','1H','4H','1D'];

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
  const [asset, setAsset] = useState<string>('BTC/USD');
  const [timeframe, setTimeframe] = useState<ChinnikstahTimeframe>('1H');
  // Recomputes when asset OR timeframe changes (and via candle-close seed inside engine)
  const composite = useMemo(() => generateChinnikstah(asset, timeframe), [asset, timeframe]);
  const features = useMemo(() => getAllAdvancedFeatures(composite), [composite]);

  const stateColor = composite.state === 'trending' ? 'text-success' : composite.state === 'volatile' ? 'text-warning' : 'text-info';
  const biasColor = composite.bias === 'buy' ? 'text-success' : composite.bias === 'sell' ? 'text-danger' : 'text-muted-foreground';

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-0">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary float-glow" />
          <h1 className="text-lg sm:text-2xl font-futuristic font-black neon-text text-gradient-primary">Smai Chinnikstah</h1>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground mt-1">
          The Unified Indicator — {composite.readings.length} families • {composite.readings.reduce((s, r) => s + r.subIndicators.length, 0)} indicators • Adaptive KI Core
        </p>
      </div>

      {/* Asset + Timeframe controls + Trust strip */}
      <TerminalCard title="ACTIVE CONTEXT" subtitle="Asset & timeframe drive every Adaptive KI Core calculation">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground uppercase">Asset</span>
            <Select value={asset} onValueChange={setAsset}>
              <SelectTrigger className="h-8 w-[130px] font-mono text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ASSETS.map(a => <SelectItem key={a} value={a} className="font-mono text-xs">{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground uppercase">Timeframe</span>
            <div className="flex gap-1">
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={cn(
                    'px-2.5 py-1 rounded font-mono text-[11px] border transition-all',
                    timeframe === tf
                      ? 'bg-primary/20 border-primary text-primary font-bold'
                      : 'bg-secondary/20 border-border/40 text-muted-foreground hover:text-foreground'
                  )}
                >{tf}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <Badge variant="outline" className="font-mono text-[10px]">State: <span className={cn('ml-1 font-bold capitalize', stateColor)}>{composite.state}</span></Badge>
            <Badge variant="outline" className="font-mono text-[10px]">Bias: <span className={cn('ml-1 font-bold capitalize', biasColor)}>{composite.bias}</span></Badge>
            <Badge variant="outline" className="font-mono text-[10px]">Confidence: <span className="ml-1 font-bold text-foreground">{composite.unifiedConfidence}%</span></Badge>
          </div>
        </div>
        <p className="font-mono text-[9px] text-muted-foreground mt-2">
          All indicators recompute on asset / timeframe change and on candle close. Output schema: <span className="text-foreground">{`{ score, bias, confidence, state }`}</span>
        </p>
      </TerminalCard>

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

      {/* ── CHINNIKSTAH CONSTELLATION ── */}
      <div className="pt-4 border-t border-border/40">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-accent float-glow" />
          <h2 className="font-futuristic text-sm font-bold text-gradient-accent uppercase tracking-wider">
            Chinnikstah Constellation — Adaptive KI Core
          </h2>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground mb-3 ml-6">
          Tap any layer of the Adaptive KI Core to open its live stream, philosophy, and trader interpretation.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Verdict — full width on lg */}
          <div className="lg:col-span-2">
            <ChinnikstahLiveModule
              title="KI Verdict Synthesis"
              subtitle="The final unified action plan distilled from the entire Adaptive KI Core"
              preview={<VerdictSynthesis data={features.verdict} />}
              compute={() => kiVerdictSynthesis(composite)}
              renderLive={(d) => (
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="text-gradient-primary font-bold text-sm">{d.action}</div>
                  <div><span className="text-muted-foreground">Entry:</span> <span className="text-primary">{d.entry}</span></div>
                  <div><span className="text-muted-foreground">Stop:</span> <span className="text-danger">{d.stop}</span></div>
                  <div><span className="text-muted-foreground">Target:</span> <span className="text-success">{d.target}</span></div>
                  <div className="italic text-foreground/80 mt-2">"{d.note}"</div>
                </div>
              )}
              explanation="The synthesis layer collapses the 12 indicator families and the rest of the Adaptive KI Core into one decisive playbook with entry, stop, target and risk note."
              whatItMeans="When the action says 'High Conviction', size up within risk rules. 'Stand Aside' means harmony is too low — preserving capital is the trade."
              philosophy="In Chinnikstah, the verdict is never a command — it's a mirror. It reflects what the market has already decided, so the trader can move with the current instead of against it."
            />
          </div>

          <ChinnikstahLiveModule
            title="AI Risk Score"
            subtitle="How dangerous the current environment is, 0-100"
            preview={<AIRiskScore data={features.risk} />}
            compute={() => liveRisk(composite)}
            renderLive={(d) => (
              <div className="text-center space-y-2">
                <div className="font-futuristic text-4xl font-black text-gradient-primary">{d.score}</div>
                <div className="font-mono text-xs">{d.tier} RISK</div>
              </div>
            )}
            explanation="A blend of volatility, sentiment extremes and harmony. A high score means the playing field is hostile — sizing, stops and patience matter more."
            whatItMeans="LOW/MODERATE: trade your normal plan. HIGH: cut size in half. EXTREME: only A+ setups, or sit out entirely."
            philosophy="Risk is the price of admission to opportunity. Chinnikstah measures the price so you only pay it when the prize is worth it."
          />

          <ChinnikstahLiveModule
            title="Quantum Probability Cone"
            subtitle="Forward price drift across multiple horizons"
            preview={<QuantumCone data={features.quantumCone} />}
            compute={() => liveQuantumCone(composite)}
            renderLive={(d) => (
              <div className="space-y-1 font-mono text-[10px]">
                {d.map((h: any) => (
                  <div key={h.hours} className="flex justify-between">
                    <span className="text-muted-foreground">{h.hours}h horizon</span>
                    <span className="text-foreground">drift {h.expected > 0 ? '+' : ''}{h.expected}% • prob {h.prob.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            )}
            explanation="Projects expected price drift and 95% confidence bands forward in time, weighted by current Chinnikstah confidence."
            whatItMeans="Use the 1h-4h cone for entries, the 24h cone for trade management, and the 72h cone to decide if a swing is worth the wait."
            philosophy="The future is not a single line — it's a cone of possibilities. Chinnikstah maps the cone so you can pick your spot inside it."
          />

          <ChinnikstahLiveModule
            title="Predictive Heatwave"
            subtitle="Heat across the next 6 candles"
            preview={<PredictiveHeatwave data={features.heatwave} />}
            compute={() => liveHeatwave(composite)}
            renderLive={(d) => (
              <div className="space-y-1 font-mono text-[10px]">
                {d.map((c: any) => (
                  <div key={c.candle} className="flex justify-between">
                    <span className="text-muted-foreground">candle +{c.candle}</span>
                    <span className={cn(c.heat > 0 ? 'text-success' : c.heat < 0 ? 'text-danger' : 'text-warning')}>
                      {c.heat > 0 ? '+' : ''}{c.heat} • {c.direction}
                    </span>
                  </div>
                ))}
              </div>
            )}
            explanation="Forecasts directional heat for the next 6 candles by combining unified score with stochastic noise and trend persistence."
            whatItMeans="A run of green candles ahead means trend continuation. Mixed candles signal chop — wait for fresh alignment before entering."
            philosophy="Heat is the colour of intention. When the wave glows in one direction long enough, the market commits."
          />

          <ChinnikstahLiveModule
            title="Smart Money Footprint"
            subtitle="Where institutions are leaving traces"
            preview={<SmartMoney data={features.smartMoney} />}
            compute={() => liveSmartMoney(composite)}
            renderLive={(d) => (
              <div className="text-center space-y-1 font-mono text-[11px]">
                <div className="font-futuristic text-3xl font-black text-gradient-primary">{d.score > 0 ? '+' : ''}{d.score}</div>
                <div>{d.label}</div>
                <div className="text-muted-foreground text-[10px]">confidence {d.confidence}%</div>
              </div>
            )}
            explanation="Fuses liquidity and volume reads to estimate whether large players are accumulating, distributing, or in mixed flow."
            whatItMeans="Strong positive = follow the smart money. Strong negative = consider taking profit. Mixed = no edge, stay flat."
            philosophy="Footprints don't lie. Chinnikstah follows the giants quietly — never in front of them."
          />

          <ChinnikstahLiveModule
            title="Multi-Timeframe Resonance"
            subtitle="1m → 1d alignment of bias"
            preview={<MTFResonance data={features.mtf} />}
            compute={() => liveMtf(composite)}
            renderLive={(d) => (
              <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                {d.map((t: any) => (
                  <div key={t.timeframe} className={cn('p-2 rounded text-center', t.score > 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger')}>
                    <div className="text-foreground/70">{t.timeframe}</div>
                    <div className="font-bold">{t.score > 0 ? '+' : ''}{t.score}</div>
                  </div>
                ))}
              </div>
            )}
            explanation="Reads bias on six timeframes simultaneously. When the majority point the same direction, the trade has wind at its back."
            whatItMeans="4+ timeframes aligned = strong setup. 3 aligned = standard size. 2 or fewer = avoid — you're fighting the higher timeframes."
            philosophy="Resonance is not chance — it's chorus. Chinnikstah enters when the timeframes sing together."
          />

          <ChinnikstahLiveModule
            title="Market Regime"
            subtitle="What kind of market you're in right now"
            preview={<MarketRegime data={features.regime} />}
            compute={() => marketRegime(composite)}
            renderLive={(d) => (
              <div className="space-y-1 font-mono text-[11px]">
                <div className="text-gradient-primary font-bold">{d.regime}</div>
                <p className="text-muted-foreground text-[10px]">{d.description}</p>
                <div className="text-foreground">confidence {d.confidence}%</div>
              </div>
            )}
            explanation="Classifies the tape into Trending Calm, Trending Wild, Coiled Spring, Chop Zone, or Transitional based on trend & volatility readings."
            whatItMeans="Trend-follow in 'Trending Calm', breakout-trade 'Coiled Spring', mean-revert in 'Chop Zone', and stand aside in 'Transitional'."
            philosophy="Strategy without regime is gambling. Chinnikstah names the weather before choosing the sail."
          />

          <ChinnikstahLiveModule
            title="Energy Flow Index"
            subtitle="Net momentum × volume × harmony"
            preview={<EnergyFlow data={features.energy} />}
            compute={() => liveEnergy(composite)}
            renderLive={(d) => (
              <div className="text-center space-y-1 font-mono text-[11px]">
                <div className="font-futuristic text-4xl font-black">{d.value > 0 ? '+' : ''}{d.value}</div>
                <div className="capitalize">{d.polarity} energy</div>
                <div className="text-muted-foreground text-[10px]">intensity {d.intensity}</div>
              </div>
            )}
            explanation="A proprietary blend that measures the kinetic 'push' behind price — not just direction, but the force driving it."
            whatItMeans="High positive intensity = ride the trend. High negative intensity = short-side fuel. Low intensity = no edge."
            philosophy="Price moves on energy, not opinion. Chinnikstah listens for the hum before the surge."
          />

          <ChinnikstahLiveModule
            title="Sentiment Polarity"
            subtitle="Crowd reading across 5 sources"
            preview={<SentimentPolarity data={features.sentiment} />}
            compute={() => liveSentiment(composite)}
            renderLive={(d) => (
              <div className="space-y-1 font-mono text-[10px]">
                {d.map((s: any) => (
                  <div key={s.source} className="flex justify-between">
                    <span className="text-muted-foreground">{s.source}</span>
                    <span className={cn(s.score > 0 ? 'text-success' : 'text-danger')}>{s.score > 0 ? '+' : ''}{s.score}</span>
                  </div>
                ))}
              </div>
            )}
            explanation="Aggregates sentiment from social, news, derivatives funding and on-chain mood into a multi-source polarity grid."
            whatItMeans="When all 5 lean the same direction, the crowd is committed — fade extremes, follow moderation."
            philosophy="The crowd is loudest right before it's wrong. Chinnikstah listens for unanimous noise as a contrarian whisper."
          />

          <ChinnikstahLiveModule
            title="Liquidity Magnets"
            subtitle="Where price is being pulled"
            preview={<LiquidityMagnets data={features.magnets} />}
            compute={() => liveMagnets(composite)}
            renderLive={(d) => (
              <div className="space-y-1 font-mono text-[10px]">
                {d.map((m: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{m.type}</span>
                    <span className="text-foreground">{m.distance > 0 ? '+' : ''}{m.distance}% • strength {m.strength}</span>
                  </div>
                ))}
              </div>
            )}
            explanation="Maps stop clusters, liquidation pools and order blocks — the gravitational fields that pull price toward them."
            whatItMeans="Strong magnets close to price often act as targets. Place TPs near them; never put stops inside them."
            philosophy="Markets travel where the fuel is. Chinnikstah follows liquidity the way a river follows gravity."
          />

          <ChinnikstahLiveModule
            title="Whale Pulse"
            subtitle="Large-order and exchange flow"
            preview={<WhalePulse data={features.whales} />}
            compute={() => liveWhalePulse(composite)}
            renderLive={(d) => (
              <div className="space-y-1 font-mono text-[10px]">
                <div className="flex justify-between"><span className="text-muted-foreground">Large orders (1h)</span><span>{d.largeOrders}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Exchange inflow</span><span>{d.exchangeInflow}M</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Exchange outflow</span><span>{d.exchangeOutflow}M</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Net flow</span><span>{d.netFlow}M</span></div>
              </div>
            )}
            explanation="Tracks large-block prints and exchange flows to detect whale activity in near-real-time."
            whatItMeans="Net outflow = bullish (coins leaving exchanges to cold storage). Net inflow = bearish (preparing to sell)."
            philosophy="Whales move slowly but they move oceans. Chinnikstah watches the wake, not the splash."
          />

          <ChinnikstahLiveModule
            title="AI Pattern Recognition"
            subtitle="High-confidence chart patterns"
            preview={<PatternRecognition data={features.patterns} />}
            compute={() => livePatterns(composite)}
            renderLive={(d) => (
              <div className="space-y-1 font-mono text-[10px]">
                {d.length === 0 ? <p className="text-muted-foreground">No patterns above 50% confidence right now.</p> :
                  d.map((p: any, i: number) => (
                    <div key={i} className="flex justify-between">
                      <span className={cn(p.bias === 'bullish' ? 'text-success' : 'text-danger')}>{p.name}</span>
                      <span className="text-primary">{p.conf}%</span>
                    </div>
                  ))
                }
              </div>
            )}
            explanation="Scans for classical chart patterns and ranks them by AI-detected confidence. Only patterns above 50% are surfaced."
            whatItMeans="Trade the highest-confidence pattern only when its bias matches the unified Chinnikstah bias."
            philosophy="Patterns are memory crystallised. The market repeats because traders do."
          />

          <ChinnikstahLiveModule
            title="Behavioral Traps"
            subtitle="Active manipulation patterns"
            preview={<BehavioralTraps data={features.traps} />}
            compute={() => liveTraps(composite)}
            renderLive={(d) => (
              <div className="space-y-1 font-mono text-[10px]">
                <div className="text-foreground">Severity: <span className="font-bold uppercase">{d.severity}</span></div>
                {d.detected.length === 0 ? <p className="text-success">✓ No active traps</p> :
                  d.detected.map((t: string) => <div key={t} className="text-warning">⚠ {t}</div>)
                }
              </div>
            )}
            explanation="Detects active bull/bear traps, FOMO setups, capitulation, stop hunts and liquidity grabs."
            whatItMeans="If 'Stop Hunt' or 'Liquidity Grab' is active, wait for the sweep to complete before entering — don't be the exit liquidity."
            philosophy="Every trap is a lesson the market wants to teach. Chinnikstah notices the bait so you don't bite."
          />

          <ChinnikstahLiveModule
            title="Anomaly Scanner"
            subtitle="Statistical outliers right now"
            preview={<AnomalyScanner data={features.anomalies} />}
            compute={() => liveAnomalies(composite)}
            renderLive={(d) => (
              <div className="space-y-1 font-mono text-[10px]">
                <div>Total active: <span className="font-bold text-foreground">{d.total}</span></div>
                {d.anomalies.map((a: any, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{a.signal}</span>
                    <span className={cn(a.severity === 'detected' ? 'text-danger' : 'text-success')}>{a.severity}</span>
                  </div>
                ))}
              </div>
            )}
            explanation="Flags volume spikes, spread widening, off-hours moves and correlation breaks — events that historically precede regime shifts."
            whatItMeans="2+ anomalies = reduce size and tighten stops. The market is behaving abnormally; expect the unexpected."
            philosophy="The future arrives first as anomaly. Chinnikstah keeps watch on the edges of normal."
          />

          <ChinnikstahLiveModule
            title="Cycle Position"
            subtitle="Wyckoff phase + Elliott wave"
            preview={<CyclePosition data={features.cycle} />}
            compute={() => cyclePosition(composite)}
            renderLive={(d) => (
              <div className="space-y-1 font-mono text-[11px]">
                <div>Wyckoff: <span className="text-primary">{d.wyckoff}</span></div>
                <div>Elliott: <span className="text-accent">{d.elliott}</span></div>
                <div>Alignment: <span className="text-foreground">{d.alignment}%</span></div>
              </div>
            )}
            explanation="Combines Wyckoff phase analysis with Elliott Wave count to locate the current bar inside the broader market cycle."
            whatItMeans="Wave 3 / Markup = best risk-reward. Wave 5 / Distribution = take profit. Wave 2 / Spring = high-probability long."
            philosophy="Cycles always complete. Chinnikstah patiently asks: where are we in the breath of the market?"
          />

          <ChinnikstahLiveModule
            title="Optimal Position Size"
            subtitle="Kelly-inspired sizing"
            preview={<PositionSize data={features.position} />}
            compute={() => optimalPositionSize(composite)}
            renderLive={(d) => (
              <div className="space-y-1 font-mono text-[11px]">
                <div>Suggested: <span className="text-primary font-bold">{d.suggested}%</span></div>
                <div>Conservative: <span className="text-success">{d.conservative}%</span></div>
                <div>Maximum: <span className="text-warning">{d.max}%</span></div>
              </div>
            )}
            explanation="Calculates a fractional-Kelly position size from the unified confidence assuming 1:2 reward-to-risk."
            whatItMeans="Use 'Conservative' as your default. Only step up to 'Suggested' when harmony exceeds 70%."
            philosophy="Survival before profit. Chinnikstah sizes so you can be wrong many times and still play tomorrow."
          />

          <ChinnikstahLiveModule
            title="Time-To-Move Forecast"
            subtitle="Estimated minutes until catalyst window"
            preview={<TimeToMove data={features.timing} />}
            compute={() => liveTiming(composite)}
            renderLive={(d) => (
              <div className="text-center space-y-1 font-mono text-[11px]">
                <div className="font-futuristic text-3xl font-black text-gradient-primary">{d.minutes}m</div>
                <div>{d.label} catalyst window</div>
              </div>
            )}
            explanation="Estimates how soon the next directional move is likely to begin based on confidence buildup and stochastic timing."
            whatItMeans="'Imminent' = stay glued to the chart. 'Distant' = step away, alerts will call you back."
            philosophy="Timing is the difference between right and rich. Chinnikstah waits with you."
          />

          <ChinnikstahLiveModule
            title="Cross-Asset Contagion"
            subtitle="How other markets are pulling this one"
            preview={<CrossAssetContagion data={features.contagion} />}
            compute={() => liveContagion(composite)}
            renderLive={(d) => (
              <div className="grid grid-cols-5 gap-2 font-mono text-[10px] text-center">
                {d.map((a: any) => (
                  <div key={a.asset}>
                    <div className="text-muted-foreground">{a.asset}</div>
                    <div className={cn('font-bold', a.impact > 0 ? 'text-success' : 'text-danger')}>{a.impact > 0 ? '+' : ''}{a.impact}</div>
                  </div>
                ))}
              </div>
            )}
            explanation="Measures how strongly correlated assets (BTC, ETH, DXY, GOLD, SPX) are tugging on the current instrument."
            whatItMeans="If DXY is strongly negative, risk assets get a tailwind. If SPX leads, crypto often follows within hours."
            philosophy="No market is an island. Chinnikstah watches the tides between them."
          />

          <ChinnikstahLiveModule
            title="Chinnikstah Memory"
            subtitle="Recall of past similar setups"
            preview={<ChinnikstahMemory data={features.memory} />}
            compute={() => liveMemory(composite)}
            renderLive={(d) => (
              <div className="space-y-1 font-mono text-[10px]">
                <div>Similar setups: <span className="text-foreground">{d.similarSetups}</span></div>
                <div>Historical win rate: <span className={cn(d.historicalWinRate > 60 ? 'text-success' : 'text-warning')}>{d.historicalWinRate}%</span></div>
                <div>Avg return: <span className="text-foreground">{d.avgReturn}%</span></div>
                <div className="text-muted-foreground italic">{d.bestMatch}</div>
              </div>
            )}
            explanation="Searches the engine's pattern memory for setups matching the current harmony fingerprint and reports historical outcomes."
            whatItMeans="Win rate above 60% with 20+ similar setups is a high-evidence trade. Below 50% means this setup historically failed."
            philosophy="Memory is the cheapest edge. Chinnikstah remembers so you don't have to relearn the same lesson."
          />

          <div className="lg:col-span-1">
            <ChinnikstahLiveModule
              title="Neural Confluence Map"
              subtitle="Cross-family agreement matrix"
              preview={<ConfluenceMap data={features.confluence} />}
              compute={() => neuralConfluenceMap(composite)}
              renderLive={(d) => (
                <div className="font-mono text-[10px] space-y-1">
                  <p className="text-muted-foreground">Pairs with strongest alignment:</p>
                  {d.matrix.flatMap((row: number[], i: number) =>
                    row.map((v: number, j: number) => i < j ? { i, j, v } : null).filter(Boolean) as any[]
                  )
                  .sort((a: any, b: any) => Math.abs(b.v) - Math.abs(a.v))
                  .slice(0, 5)
                  .map((p: any, i: number) => (
                    <div key={i} className="flex justify-between">
                      <span>{d.families[p.i]} ↔ {d.families[p.j]}</span>
                      <span className={cn(p.v > 0 ? 'text-success' : 'text-danger')}>{p.v > 0 ? '+' : ''}{p.v}</span>
                    </div>
                  ))}
                </div>
              )}
              explanation="Shows which of the 12 indicator families currently agree (green) or disagree (red) with each other in a pairwise matrix."
              whatItMeans="Many bright green cells = high-confidence environment. Mixed cells = the families are arguing — wait for consensus."
              philosophy="Truth emerges where many witnesses converge. Chinnikstah trusts the cells that glow together."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
