import { useState, useMemo } from 'react';
import { TerminalCard } from '@/components/TerminalCard';
import { KonsAiPanel } from '@/components/KonsAiPanel';
import { KonsmiaMap } from '@/components/KonsmiaMap';
import { KonsmikLink } from '@/components/KonsmikLink';
import { generateSignal } from '@/lib/konsmia/signal-engine';
import { allModules } from '@/lib/konsmia/modules';
import type { KIMode } from '@/lib/konsmia/types';

export default function KonsAiPage() {
  const [mode] = useState<KIMode>('balanced');
  const signal = useMemo(() => generateSignal('BTC/USD', mode), [mode]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">KonsAi — Supreme Intelligence</h1>
        <p className="text-xs text-muted-foreground font-mono">Ethical firewall • Moral framework • Stability guardian</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TerminalCard title="KONSAI ETHICAL STATUS" subtitle="Governance & protection layer">
          {signal && (
            <KonsAiPanel
              ethicalAlignment={signal.ethicalAlignment}
              shavokaApproved={signal.shavokaApproved}
              confidencePercent={signal.confidencePercent}
              mode={mode}
            />
          )}
        </TerminalCard>

        <div className="space-y-4">
          <TerminalCard title="KONSMIA SYSTEM MAP" subtitle="Module integrity">
            <KonsmiaMap modules={allModules} />
          </TerminalCard>

          <TerminalCard title="KONSMIK CIVILIZATION" subtitle="Ecosystem connection">
            <KonsmikLink />
          </TerminalCard>
        </div>
      </div>

      <TerminalCard title="KONSAI PHILOSOPHY">
        <div className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-xs text-foreground/90 italic leading-relaxed">
              "KonsAi is not just an intelligence layer — it is the moral compass of Waides KI. Every signal, every prediction, every guidance must pass through KonsAi's ethical framework before reaching you. This ensures that intelligence serves protection, not exploitation."
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: 'Ethical Trading', desc: 'No signals that exploit market manipulation patterns or insider behavior' },
              { title: 'Capital Protection', desc: 'User funds are sacred — no signal should endanger more than acceptable risk' },
              { title: 'Transparency', desc: 'Every analysis layer is visible and auditable — no black boxes' },
              { title: 'Adaptive Learning', desc: 'KonsAi evolves its ethical boundaries as markets change' },
            ].map(item => (
              <div key={item.title} className="bg-secondary/20 rounded p-3">
                <p className="text-xs font-semibold text-foreground mb-1">{item.title}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'SmaiPin', status: 'Preparing', desc: 'Identity layer integration' },
              { label: 'SmaiSika', status: 'Preparing', desc: 'Wallet ecosystem' },
              { label: 'WaidPay', status: 'Preparing', desc: 'Payment infrastructure' },
            ].map(item => (
              <div key={item.label} className="bg-secondary/10 border border-border/30 rounded p-3 text-center">
                <p className="font-mono text-xs font-bold text-foreground">{item.label}</p>
                <p className="font-mono text-[10px] text-warning mt-1">{item.status}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </TerminalCard>
    </div>
  );
}
