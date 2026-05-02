import { useEffect, useState, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Sparkles, BookOpen, Activity, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  /** The card preview (one of the existing AdvancedPanels components) */
  preview: ReactNode;
  /** Module title shown in the dialog header */
  title: string;
  /** One-line subtitle */
  subtitle?: string;
  /** Recomputes the module's data — called every 3s when the dialog is open */
  compute: () => any;
  /** Renders the live data inside the dialog */
  renderLive: (data: any) => ReactNode;
  /** What this module measures, in plain language */
  explanation: string;
  /** What the user should do with this signal */
  whatItMeans: string;
  /** How it ties back to the Chinnikstah philosophy */
  philosophy?: string;
}

export function ChinnikstahLiveModule({
  preview, title, subtitle, compute, renderLive,
  explanation, whatItMeans, philosophy,
}: Props) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>(() => compute());
  const [tick, setTick] = useState(0);

  // Live recompute every 3s while the dialog is open
  useEffect(() => {
    if (!open) return;
    setData(compute());
    const id = setInterval(() => {
      setData(compute());
      setTick(t => t + 1);
    }, 3000);
    return () => clearInterval(id);
  }, [open, compute]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            'group relative text-left w-full transition-all',
            'hover:scale-[1.01] hover:-translate-y-0.5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg',
          )}
        >
          <div className="relative">
            {preview}
            {/* Hover pulse overlay */}
            <div className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge variant="outline" className="font-mono text-[8px] px-1.5 py-0 h-4 border-primary/40 text-primary bg-background/80">
                LIVE
              </Badge>
            </div>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-futuristic text-base">
            <Sparkles className="h-4 w-4 text-primary float-glow" />
            <span className="text-gradient-primary uppercase tracking-wider">{title}</span>
          </DialogTitle>
          {subtitle && <p className="font-mono text-[10px] text-muted-foreground">{subtitle}</p>}
        </DialogHeader>

        <div className="space-y-4">
          {/* Live data section */}
          <section className="border border-primary/20 rounded-lg p-3 bg-primary/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success pulse-dot" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-success">Live Stream</span>
                <span className="font-mono text-[9px] text-muted-foreground">tick #{tick}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setData(compute()); setTick(t => t + 1); }}
                className="h-6 px-2 font-mono text-[10px]"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Refresh
              </Button>
            </div>
            <div className="space-y-2">{renderLive(data)}</div>
          </section>

          {/* What this module measures */}
          <section className="border border-border/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-3.5 w-3.5 text-info" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-info">What it measures</span>
            </div>
            <p className="font-mono text-[11px] text-foreground/85 leading-relaxed">{explanation}</p>
          </section>

          {/* Trader interpretation */}
          <section className="border border-accent/30 rounded-lg p-3 bg-accent/5">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-3.5 w-3.5 text-accent" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-accent">What it means for you</span>
            </div>
            <p className="font-mono text-[11px] text-foreground/85 leading-relaxed">{whatItMeans}</p>
          </section>

          {/* Chinnikstah philosophy tie-in */}
          {philosophy && (
            <section className="border border-border/40 rounded-lg p-3 bg-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Chinnikstah Lens</span>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground italic leading-relaxed">{philosophy}</p>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
