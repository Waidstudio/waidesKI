import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function QuickTradePanel({ className }: { className?: string }) {
  const [asset, setAsset] = useState('BTC/USD');
  const [amount, setAmount] = useState('0.01');
  const [type, setType] = useState<'market' | 'limit'>('market');

  const handleTrade = (direction: 'long' | 'short') => {
    toast.success(`Simulated ${direction.toUpperCase()} ${amount} ${asset} — Tredbeing dispatched`, {
      description: 'Signal routed through KonsNet → Shavoka verified → Tredbeing executing',
    });
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">Asset</label>
          <select
            value={asset}
            onChange={e => setAsset(e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded px-2 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {['BTC/USD', 'ETH/USD', 'SOL/USD', 'EUR/USD', 'GBP/USD'].map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded px-2 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex gap-2">
        {(['market', 'limit'] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              'flex-1 py-1 rounded text-[10px] font-mono uppercase border transition-colors',
              type === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => handleTrade('long')} className="bg-success/20 text-success hover:bg-success/30 border border-success/30 font-mono text-xs">
          LONG
        </Button>
        <Button onClick={() => handleTrade('short')} className="bg-danger/20 text-danger hover:bg-danger/30 border border-danger/30 font-mono text-xs">
          SHORT
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground text-center font-mono">
        Simulated • Routed via KonsNet → Shavoka → Tredbeing
      </p>
    </div>
  );
}
