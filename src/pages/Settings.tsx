import { useState } from 'react';
import { TerminalCard } from '@/components/TerminalCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Settings() {
  const [riskTolerance, setRiskTolerance] = useState(2);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode] = useState(true);
  const [ethicalFilter, setEthicalFilter] = useState(true);

  const handleSave = () => {
    toast.success('Settings saved', { description: 'Configuration synced with KonsOS governance layer' });
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      <div>
        <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground font-mono">System configuration — governed by KonsOS</p>
      </div>

      <TerminalCard title="TRADING PARAMETERS">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-muted-foreground block mb-1">Max Risk per Trade (%)</label>
            <input
              type="range" min={0.5} max={10} step={0.5} value={riskTolerance}
              onChange={e => setRiskTolerance(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1">
              <span>Conservative (0.5%)</span>
              <span className="text-foreground font-bold">{riskTolerance}%</span>
              <span>Aggressive (10%)</span>
            </div>
          </div>
        </div>
      </TerminalCard>

      <TerminalCard title="SYSTEM PREFERENCES">
        <div className="space-y-3">
          {[
            { label: 'Auto-Refresh Data', desc: 'Automatically refresh market data every 30s', value: autoRefresh, setter: setAutoRefresh },
            { label: 'Notifications', desc: 'Receive alerts for signals and risk events', value: notifications, setter: setNotifications },
            { label: 'Ethical Filter (Shavoka)', desc: 'Block signals that fail ethical alignment checks', value: ethicalFilter, setter: setEthicalFilter },
          ].map(pref => (
            <div key={pref.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div>
                <p className="text-xs font-semibold text-foreground">{pref.label}</p>
                <p className="text-[10px] text-muted-foreground">{pref.desc}</p>
              </div>
              <button
                onClick={() => pref.setter(!pref.value)}
                className={`relative w-10 h-5 rounded-full transition-colors ${pref.value ? 'bg-primary' : 'bg-muted'}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition-transform ${pref.value ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </TerminalCard>

      <TerminalCard title="KONSMIA MODULES">
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>• <span className="text-foreground">KonsOS</span> — Governance: Active</p>
          <p>• <span className="text-foreground">KonsAi</span> — Consciousness: Online</p>
          <p>• <span className="text-foreground">WombLayer</span> — Memory: 95% integrity</p>
          <p>• <span className="text-foreground">KonsNet</span> — Data Flow: Syncing</p>
          <p>• <span className="text-foreground">Webonyix</span> — Value Reserve: Active</p>
          <p>• <span className="text-foreground">Shavoka KI</span> — Ethical Firewall: {ethicalFilter ? 'ENABLED' : 'DISABLED'}</p>
        </div>
      </TerminalCard>

      <Button onClick={handleSave} className="font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
        Save Configuration
      </Button>
    </div>
  );
}
