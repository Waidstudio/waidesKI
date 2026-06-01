import { Link } from 'react-router-dom';
import { Zap, MessageCircle, Signal, Atom, Sparkles, Brain, Bot } from 'lucide-react';
import { memo } from 'react';

const links = [
  { to: '/', label: 'Chat', icon: MessageCircle },
  { to: '/signals', label: 'Signals', icon: Signal },
  { to: '/predictions', label: 'Predictions', icon: Atom },
  { to: '/chinnikstah', label: 'Chinnikstah', icon: Sparkles },
  { to: '/tredbeings', label: 'Tredbeings', icon: Brain },
  { to: '/sandbox', label: 'Sandbox', icon: Bot },
];

function AppFooterImpl() {
  return (
    <footer className="relative mt-8 border-t border-border bg-background">
      <div className="h-px w-full bg-gradient-primary opacity-60" />
      <div className="px-4 sm:px-6 py-6 grid gap-6 sm:grid-cols-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary float-glow" />
            <span className="font-futuristic text-sm font-black text-gradient-primary tracking-widest">
              WAIDES KI
            </span>
          </div>
          <p className="text-[11px] font-mono text-muted-foreground leading-relaxed max-w-xs">
            Markets as living systems. Speak with the KI — it listens, reasons, and acts with discipline.
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-2 sm:gap-3 content-start">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              <Icon className="h-3 w-3" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col sm:items-end gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card">
            <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
            <span className="text-[10px] font-mono text-foreground">All systems live</span>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground">
            Konsmik Civilization · © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}

export const AppFooter = memo(AppFooterImpl);