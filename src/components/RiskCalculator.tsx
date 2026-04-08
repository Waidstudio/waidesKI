import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function RiskCalculator({ className }: { className?: string }) {
  const [capital, setCapital] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(2);
  const [stopLoss, setStopLoss] = useState(50);

  const riskAmount = capital * (riskPercent / 100);
  const positionSize = stopLoss > 0 ? riskAmount / stopLoss : 0;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">Capital (USD)</label>
          <input
            type="number"
            value={capital}
            onChange={e => setCapital(Number(e.target.value))}
            className="w-full bg-secondary/50 border border-border rounded px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">Risk %</label>
          <input
            type="number"
            value={riskPercent}
            onChange={e => setRiskPercent(Number(e.target.value))}
            step={0.5}
            min={0.5}
            max={10}
            className="w-full bg-secondary/50 border border-border rounded px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-muted-foreground uppercase block mb-1">Stop Loss (pips/pts)</label>
          <input
            type="number"
            value={stopLoss}
            onChange={e => setStopLoss(Number(e.target.value))}
            className="w-full bg-secondary/50 border border-border rounded px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Risk Amount</p>
          <p className="text-lg font-mono font-bold text-warning">${riskAmount.toFixed(2)}</p>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3 text-center">
          <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Position Size</p>
          <p className="text-lg font-mono font-bold text-primary">{positionSize.toFixed(4)}</p>
        </div>
      </div>
    </div>
  );
}
