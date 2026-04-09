import { useMemo, useState } from 'react';
import { TerminalCard } from '@/components/TerminalCard';
import { PortfolioChart } from '@/components/PortfolioChart';
import { TradeJournal } from '@/components/TradeJournal';
import { RiskCalculator } from '@/components/RiskCalculator';
import { PerformanceCard } from '@/components/PerformanceCard';
import { AssetVaultCard } from '@/components/AssetVaultCard';
import { generatePortfolio, generateTradeJournal, generatePerformanceMetrics, generateAssetVault } from '@/lib/konsmia/mock-data';

export default function Portfolio() {
  const portfolio = useMemo(() => generatePortfolio(), []);
  const journal = useMemo(() => generateTradeJournal(), []);
  const metrics = useMemo(() => generatePerformanceMetrics(), []);
  const [vault, setVault] = useState(() => generateAssetVault());

  const totalValue = portfolio.reduce((s, a) => s + a.value, 0);
  const totalPnl = portfolio.reduce((s, a) => s + a.pnl, 0);

  const toggleLockRule = (ruleId: string) => {
    setVault(v => ({
      ...v,
      lockRules: v.lockRules.map(r => r.id === ruleId ? { ...r, active: !r.active } : r),
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">Portfolio & Vault</h1>
        <p className="text-xs text-muted-foreground font-mono">
          Total: ${totalValue.toLocaleString()} • P&L: <span className={totalPnl >= 0 ? 'text-success' : 'text-danger'}>{totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString()}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {metrics.map(m => <PerformanceCard key={m.label} metric={m} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TerminalCard title="ASSET VAULT" subtitle="Webonyix value management">
          <AssetVaultCard vault={vault} onToggleRule={toggleLockRule} />
        </TerminalCard>
        <TerminalCard title="ALLOCATION" subtitle="Portfolio distribution">
          <PortfolioChart assets={portfolio} />
        </TerminalCard>
      </div>

      <TerminalCard title="RISK CALCULATOR" subtitle="Position sizing tool">
        <RiskCalculator />
      </TerminalCard>

      <TerminalCard title="TRADE JOURNAL" subtitle="Signal memory — outcomes tracked">
        <TradeJournal entries={journal} />
      </TerminalCard>
    </div>
  );
}
