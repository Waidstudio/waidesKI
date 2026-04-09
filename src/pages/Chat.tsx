import { TerminalCard } from '@/components/TerminalCard';
import { KIChatInterface } from '@/components/KIChatInterface';
import { useState } from 'react';
import type { KIMode } from '@/lib/konsmia/types';

export default function Chat() {
  const [mode, setMode] = useState<KIMode>('balanced');

  return (
    <div className="space-y-4 sm:space-y-6 h-[calc(100vh-6rem)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">Speak with Waides KI</h1>
          <p className="text-xs text-muted-foreground font-mono">Your intelligent market companion — ask anything</p>
        </div>
        <div className="flex gap-2">
          {(['conservative', 'balanced', 'aggressive'] as KIMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded text-[10px] font-mono border transition-colors capitalize ${
                mode === m ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="terminal-border rounded-lg overflow-hidden h-[calc(100%-4rem)]">
        <KIChatInterface mode={mode} />
      </div>
    </div>
  );
}
