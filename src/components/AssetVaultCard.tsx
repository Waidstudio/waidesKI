import type { AssetVaultData } from '@/lib/konsmia/types';
import { Vault, Lock, Unlock, TrendingUp } from 'lucide-react';

interface Props {
  vault: AssetVaultData;
  onToggleRule?: (ruleId: string) => void;
}

export function AssetVaultCard({ vault, onToggleRule }: Props) {
  return (
    <div className="space-y-4">
      {/* Balance Overview */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-secondary/20 rounded-lg p-3 text-center">
          <Vault className="h-4 w-4 text-primary mx-auto mb-1" />
          <p className="font-mono text-[10px] text-muted-foreground">TOTAL</p>
          <p className="font-mono text-sm font-bold text-foreground">${vault.totalBalance.toLocaleString()}</p>
        </div>
        <div className="bg-secondary/20 rounded-lg p-3 text-center">
          <Lock className="h-4 w-4 text-warning mx-auto mb-1" />
          <p className="font-mono text-[10px] text-muted-foreground">LOCKED</p>
          <p className="font-mono text-sm font-bold text-warning">${vault.lockedFunds.toLocaleString()}</p>
        </div>
        <div className="bg-secondary/20 rounded-lg p-3 text-center">
          <Unlock className="h-4 w-4 text-success mx-auto mb-1" />
          <p className="font-mono text-[10px] text-muted-foreground">AVAILABLE</p>
          <p className="font-mono text-sm font-bold text-success">${vault.availableFunds.toLocaleString()}</p>
        </div>
      </div>

      {/* Growth */}
      <div className="bg-success/5 border border-success/20 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-success" />
          <span className="text-xs text-foreground">Portfolio Growth</span>
        </div>
        <span className="font-mono text-sm font-bold text-success">+{vault.growthPercent}%</span>
      </div>

      {/* Lock Rules */}
      <div className="space-y-2">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Protection Rules</p>
        {vault.lockRules.map(rule => (
          <div key={rule.id} className="flex items-center justify-between bg-secondary/20 rounded p-3">
            <div>
              <p className="text-xs font-semibold text-foreground">{rule.name}</p>
              <p className="text-[10px] text-muted-foreground">{rule.description}</p>
            </div>
            <button
              onClick={() => onToggleRule?.(rule.id)}
              className={`relative w-9 h-5 rounded-full transition-colors ${rule.active ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition-transform ${rule.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
