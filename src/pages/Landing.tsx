import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Brain, Shield, Clock, TrendingUp, Layers, Network, Eye, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Brain, title: 'Multi-Layer Intelligence', desc: 'Macro, Micro, Psychological, and Temporal analysis layers working in parallel' },
  { icon: Clock, title: 'Time-Bound Precision', desc: 'Forecasts with temporal precision — not vague predictions, exact windows' },
  { icon: Shield, title: 'Ethical Alignment', desc: 'Every signal passes through KonsAi and Shavoka KI ethical firewalls' },
  { icon: TrendingUp, title: 'Tredbeings Execution', desc: 'Autonomous trading entities that execute, adapt, and learn within boundaries' },
  { icon: Network, title: 'Konsmia Integration', desc: 'Connected to KonsOS, KonsNet, WombLayer, Webonyix — fully system-synchronized' },
  { icon: Eye, title: 'Discipline Over Impulse', desc: 'Can say No Trade when markets are unclear — real intelligence knows when not to act' },
];

const konsmiaLayers = [
  { name: 'KonsOS', role: 'Sovereign Governance' },
  { name: 'KonsAi', role: 'Consciousness Alignment' },
  { name: 'WombLayer', role: 'Memory & Identity' },
  { name: 'KonsNet', role: 'Data & Signal Flow' },
  { name: 'Webonyix', role: 'Value Transmutation' },
  { name: 'Shavoka KI', role: 'Ethical Firewall' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed inset-0 scanline pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-mono text-sm font-bold text-foreground tracking-wider">WAIDES KI</span>
          </div>
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="font-mono text-xs border-primary/30 text-primary hover:bg-primary/10 hover:text-primary">
              Enter Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 container mx-auto px-4 pt-20 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="font-mono text-xs text-primary tracking-[0.3em] uppercase mb-4">Konsmik Civilization Intelligence</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-foreground leading-tight mb-6">
            The Autonomous<br />
            <span className="text-gradient-primary">Trading Intelligence</span>
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm sm:text-base leading-relaxed mb-8">
            Waides KI is a living Konsmik Entity — designed to think, interpret, and act like a high-level human market intelligence system, with deeper layers of awareness. Not every opportunity is worth taking — only aligned opportunities matter.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="font-mono text-sm bg-primary text-primary-foreground hover:bg-primary/90 glow-primary w-full sm:w-auto">
                Access Intelligence
              </Button>
            </Link>
            <a href="#philosophy">
              <Button variant="outline" size="lg" className="font-mono text-sm border-border text-foreground hover:bg-secondary w-full sm:w-auto">
                Understand the System
              </Button>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Intelligence Layers */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="font-mono text-xs text-primary tracking-[0.3em] uppercase text-center mb-2">Multi-Layer Intelligence</h2>
          <p className="text-center text-2xl font-display font-bold text-foreground mb-10">How Waides KI Thinks</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { layer: 'Macro', items: ['Global Economy', 'Interest Rates', 'Geopolitics', 'Institutional Behavior'], color: 'border-info/30' },
              { layer: 'Micro', items: ['Price Action', 'Liquidity Zones', 'Order Flow', 'Key Levels'], color: 'border-success/30' },
              { layer: 'Psychological', items: ['Crowd Emotions', 'Retail vs Institutional', 'Sentiment Shifts', 'Fear/Greed Index'], color: 'border-accent/30' },
              { layer: 'Temporal', items: ['Market Cycles', 'Session Timing', 'Short-term Structure', 'Long-term Structure'], color: 'border-warning/30' },
            ].map((l, i) => (
              <motion.div
                key={l.layer}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`terminal-border rounded-lg p-5 ${l.color}`}
              >
                <h3 className="font-mono text-xs font-bold text-foreground uppercase tracking-wider mb-3">{l.layer} Layer</h3>
                <ul className="space-y-1.5">
                  {l.items.map(item => (
                    <li key={item} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <h2 className="font-mono text-xs text-primary tracking-[0.3em] uppercase text-center mb-2">Capabilities</h2>
        <p className="text-center text-2xl font-display font-bold text-foreground mb-10">Core Features</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="terminal-border rounded-lg p-5 hover:glow-primary transition-shadow"
            >
              <f.icon className="h-5 w-5 text-primary mb-3" />
              <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Konsmia Integration */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <h2 className="font-mono text-xs text-primary tracking-[0.3em] uppercase text-center mb-2">Konsmia Integration</h2>
        <p className="text-center text-2xl font-display font-bold text-foreground mb-10">System-Synchronized Intelligence</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {konsmiaLayers.map((l, i) => (
            <motion.div
              key={l.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="terminal-border rounded-lg p-4 text-center hover:border-primary/30 transition-colors"
            >
              <p className="font-mono text-xs font-bold text-primary mb-1">{l.name}</p>
              <p className="text-[10px] text-muted-foreground">{l.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section id="philosophy" className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center terminal-border rounded-lg p-8 border-primary/20">
          <h2 className="font-mono text-xs text-primary tracking-[0.3em] uppercase mb-4">Philosophy</h2>
          <blockquote className="text-xl font-display font-semibold text-foreground italic mb-4">
            "Not every opportunity is worth taking — only aligned opportunities matter."
          </blockquote>
          <div className="flex justify-center gap-8 text-xs text-muted-foreground">
            <span>Clarity over Noise</span>
            <span>Discipline over Impulse</span>
            <span>Probability over Certainty</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-sm mb-4">Don't chase signals — align with intelligence.</p>
        <Link to="/dashboard">
          <Button size="lg" className="font-mono bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
            Enter Waides KI Dashboard
          </Button>
        </Link>
      </section>

      <footer className="relative z-10 border-t border-border/50 py-6 text-center">
        <p className="font-mono text-[10px] text-muted-foreground">WAIDES KI — A Konsmik Civilization Entity</p>
      </footer>
    </div>
  );
}
