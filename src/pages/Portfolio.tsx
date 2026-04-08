import { useMemo } from 'react';
import { TerminalCard } from '@/components/TerminalCard';
import { PortfolioChart } from '@/components/PortfolioChart';
import { TradeJournal } from '@/components/TradeJournal';
import { RiskCalculator } from '@/components/RiskCalculator';
import { PerformanceCard } from '@/components/PerformanceCard';
import { generatePortfolio, generateTradeJournal, generatePerformanceMetrics } from '@/lib/konsmia/mock-data';

export default function Portfolio() {
  const portfolio = useMemo(() => generatePortfolio(), []);
  const journal = useMemo(() => generateTradeJournal(), []);
  const metrics = useMemo(() => generatePerformanceMetrics(), []);

  const totalValue = portfolio.reduce((s, a) => s + a.value, 0);
  const totalPnl = portfolio.reduce((s, a) => s + a.pnl, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">Portfolio</h1>
        <p className="text-xs text-muted-foreground font-mono">
          Total: ${totalValue.toLocaleString()} • P&L: <span className={totalPnl >= 0 ? 'text-success' : 'text-danger'}>{totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString()}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {metrics.map(m => <PerformanceCard key={m.label} metric={m} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TerminalCard title="ALLOCATION" subtitle="Webonyix-managed portfolio">
          <PortfolioChart assets={portfolio} />
        </TerminalCard>
        <TerminalCard title="RISK CALCULATOR" subtitle="Position sizing tool">
          <RiskCalculator />
        </TerminalCard>
      </div>

      <TerminalCard title="TRADE JOURNAL" subtitle="Recent trade history — Tredbeing executed">
        <TradeJournal entries={journal} />
      </TerminalCard>
    </div>
  );
}
