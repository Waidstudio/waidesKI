import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { getAllLivePrices } from '@/lib/konsmia/live-prices';

interface Popup {
  id: string;
  being: string;
  color: string;
  message: string;
}

const BEINGS = [
  { name: 'Konsai', color: 'text-primary' },
  { name: 'Shavoka', color: 'text-warning' },
  { name: 'Webonyix', color: 'text-info' },
  { name: 'Tredbeing Alpha', color: 'text-success' },
  { name: 'Smai Sentinel', color: 'text-accent' },
];

function craftMessage(being: string): string {
  const prices = getAllLivePrices();
  const symbols = Object.keys(prices).filter(k => !k.includes('/')).slice(0, 8);
  const focus = symbols[Math.floor(Math.random() * Math.max(1, symbols.length))] ?? 'BTC';
  const price = prices[focus];
  const trend = Math.random() > 0.5 ? 'expansion' : 'compression';

  const lines: Record<string, string[]> = {
    Konsai: [
      `${focus} is breathing — ${price ? `tape at ${price.toFixed(focus.includes('USD') || price < 10 ? 4 : 2)}` : 'reading flow'}. Stay patient.`,
      `I sense a ${trend} window opening on ${focus}. Don't chase, position.`,
      `Discipline beats prediction. The ${focus} structure is teaching us something.`,
    ],
    Shavoka: [
      `Ethical filter green. ${focus} setup passes the integrity check.`,
      `Avoid revenge entries — your last close was emotional, not strategic.`,
      `If the trade requires you to override the plan, it isn't the trade.`,
    ],
    Webonyix: [
      `Risk budget at 72%. One more loss exits us from execution mode.`,
      `Vault locks engaged. Capital is protected from impulse.`,
      `Position sizing for ${focus}: half size only — confidence is moderate.`,
    ],
    'Tredbeing Alpha': [
      `${focus} momentum diverging from price — watching for liquidity sweep.`,
      `Auto-journal updated. Last 3 ${focus} trades: 2W / 1L.`,
      `New confluence detected on ${focus} 15m — entries staged.`,
    ],
    'Smai Sentinel': [
      `Chinnikstah harmony index recalibrating — ${trend} regime confirmed.`,
      `12-family indicator aligned. ${focus} ready for directional resolution.`,
      `Cross-asset whisper: ${focus} is leading the broader tape today.`,
    ],
  };
  const opts = lines[being] ?? lines.Konsai;
  return opts[Math.floor(Math.random() * opts.length)];
}

export function SmaiPopups() {
  const [popups, setPopups] = useState<Popup[]>([]);

  useEffect(() => {
    let cancelled = false;
    function schedule() {
      const delay = 25_000 + Math.random() * 35_000; // 25-60s
      setTimeout(() => {
        if (cancelled) return;
        const being = BEINGS[Math.floor(Math.random() * BEINGS.length)];
        const popup: Popup = {
          id: `${being.name}-${Date.now()}`,
          being: being.name,
          color: being.color,
          message: craftMessage(being.name),
        };
        setPopups(prev => [...prev.slice(-2), popup]);
        setTimeout(() => {
          setPopups(prev => prev.filter(p => p.id !== popup.id));
        }, 8000);
        schedule();
      }, delay);
    }
    // First popup sooner for liveliness
    const first = setTimeout(() => {
      const being = BEINGS[0];
      setPopups([{ id: `init-${Date.now()}`, being: being.name, color: being.color, message: craftMessage(being.name) }]);
      setTimeout(() => setPopups([]), 7000);
      schedule();
    }, 6000);
    return () => { cancelled = true; clearTimeout(first); };
  }, []);

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {popups.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20 }}
            className="pointer-events-auto max-w-xs rounded-lg border border-primary/30 bg-background/95 backdrop-blur-md shadow-lg shadow-primary/10 p-3"
          >
            <div className="flex items-start gap-2">
              <Sparkles className={`h-4 w-4 mt-0.5 ${p.color}`} />
              <div className="flex-1 min-w-0">
                <p className={`font-mono text-[10px] font-bold uppercase tracking-wider ${p.color}`}>{p.being}</p>
                <p className="text-xs text-foreground/90 mt-1 leading-relaxed">{p.message}</p>
              </div>
              <button
                onClick={() => setPopups(prev => prev.filter(x => x.id !== p.id))}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}