import { KIChatInterface } from '@/components/KIChatInterface';
import { useState } from 'react';
import type { KIMode } from '@/lib/konsmia/types';

export default function Chat() {
  const [mode, setMode] = useState<KIMode>('balanced');

  return (
    <div className="-m-4 sm:-m-6 -mb-16 sm:-mb-6 h-[calc(100vh-3rem)] overflow-hidden">
      <div className="hidden sm:flex items-center gap-2 px-4 pt-3">
        {(['conservative', 'balanced', 'aggressive'] as KIMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded-full text-[10px] font-mono border transition-colors capitalize ${
              mode === m ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="h-full sm:h-[calc(100%-2.5rem)]">
        <KIChatInterface mode={mode} />
      </div>
    </div>
  );
}
