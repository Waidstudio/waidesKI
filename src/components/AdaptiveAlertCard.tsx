import { AlertTriangle, Info, Bell, ShieldAlert } from 'lucide-react';

interface AdaptiveAlert {
  id: string;
  type: 'market_shift' | 'risk_warning' | 'opportunity' | 'system';
  title: string;
  message: string;
  timestamp: string;
  actionable: boolean;
}

interface Props { alerts?: AdaptiveAlert[] }

const alertConfig = {
  market_shift: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
  risk_warning: { icon: ShieldAlert, color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' },
  opportunity: { icon: Bell, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  system: { icon: Info, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
};

const defaultAlerts: AdaptiveAlert[] = [
  { id: 'AA-1', type: 'market_shift', title: 'Rapid Sentiment Reversal', message: 'Fear/Greed index shifted 15 points in 2 hours. Market conditions may have changed. Previous bias should be re-evaluated.', timestamp: new Date().toISOString(), actionable: true },
  { id: 'AA-2', type: 'risk_warning', title: 'Liquidity Thin Zone', message: 'Order book depth below normal. Slippage risk elevated. Reduce position size if entering.', timestamp: new Date(Date.now() - 600000).toISOString(), actionable: true },
  { id: 'AA-3', type: 'opportunity', title: 'Confluence Building', message: '4 of 6 layers aligning bullish for BTC/USD. Monitoring for 85% threshold.', timestamp: new Date(Date.now() - 1200000).toISOString(), actionable: false },
  { id: 'AA-4', type: 'system', title: 'KonsAi Recalibration', message: 'Ethical intelligence layer recalibrating weights based on last 24h accuracy data.', timestamp: new Date(Date.now() - 3600000).toISOString(), actionable: false },
];

export function AdaptiveAlertCard({ alerts = defaultAlerts }: Props) {
  return (
    <div className="space-y-2">
      {alerts.map(alert => {
        const config = alertConfig[alert.type];
        const Icon = config.icon;
        return (
          <div key={alert.id} className={`rounded-lg border ${config.border} ${config.bg} p-3`}>
            <div className="flex items-start gap-2">
              <Icon className={`h-4 w-4 ${config.color} mt-0.5 shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-foreground">{alert.title}</p>
                  {alert.actionable && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary shrink-0">ACTION</span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{alert.message}</p>
                <p className="text-[9px] text-muted-foreground/60 mt-1">{new Date(alert.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
