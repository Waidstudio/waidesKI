import { TerminalCard } from '@/components/TerminalCard';
import { KonsmiaMap } from '@/components/KonsmiaMap';
import { TredbeingPanel } from '@/components/TredbeingPanel';
import { NiuzFeed } from '@/components/NiuzFeed';
import { allModules } from '@/lib/konsmia/modules';
import { generateTredbeings, generateNiuzArticles } from '@/lib/konsmia/signal-engine';
import { generateSignal } from '@/lib/konsmia/signal-engine';
import { useMemo } from 'react';

export default function Konsmia() {
  const tredbeings = useMemo(() => generateTredbeings(), []);
  const signals = useMemo(() => {
    const assets = ['BTC/USD', 'ETH/USD', 'EUR/USD', 'SOL/USD'];
    return assets.map(a => generateSignal(a)).filter(Boolean) as any[];
  }, []);
  const articles = useMemo(() => generateNiuzArticles(signals), [signals]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">Konsmia System</h1>
        <p className="text-xs text-muted-foreground font-mono">Full ecosystem view — all modules synchronized with Waides KI</p>
      </div>

      <TerminalCard title="KONSMIA SYSTEM MAP" subtitle="Module health and integrity">
        <KonsmiaMap modules={allModules} />
      </TerminalCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TerminalCard title="TREDBEINGS" subtitle="Autonomous Trading Entities">
          <TredbeingPanel tredbeings={tredbeings} />
        </TerminalCard>

        <TerminalCard title="WAIDES NIUZ" subtitle="Human-Readable Intelligence Feed">
          <NiuzFeed articles={articles} />
        </TerminalCard>
      </div>

      {/* Module Deep Dive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allModules.map(mod => (
          <TerminalCard key={mod.id} title={mod.name}>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">{mod.description}</p>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-muted-foreground">Status: <span className="text-foreground uppercase">{mod.status}</span></span>
                <span className="text-muted-foreground">Integrity: <span className={mod.integrity > 90 ? 'text-success' : 'text-warning'}>{mod.integrity}%</span></span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                <span>Last sync:</span>
                <span>{new Date(mod.lastSync).toLocaleTimeString()}</span>
              </div>
            </div>
          </TerminalCard>
        ))}
      </div>
    </div>
  );
}
