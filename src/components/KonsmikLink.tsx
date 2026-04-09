import { Shield, Globe, Zap } from 'lucide-react';

export function KonsmikLink() {
  return (
    <div className="space-y-4">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
        <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
        <p className="font-mono text-sm font-bold text-foreground">Connected to Konsmik Civilization</p>
        <p className="text-xs text-muted-foreground mt-1">Your intelligence is system-synchronized</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {[
          { name: 'SmaiPin', status: 'Preparing', desc: 'Digital identity layer' },
          { name: 'SmaiSika Wallet', status: 'Coming Soon', desc: 'Value management system' },
          { name: 'WaidPay', status: 'Coming Soon', desc: 'Sovereign payment rail' },
          { name: 'Konsmik Ecosystem', status: 'Active', desc: 'Civilization-level integration' },
        ].map(item => (
          <div key={item.name} className="flex items-center justify-between bg-secondary/20 rounded p-3">
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-primary" />
              <div>
                <p className="text-xs font-semibold text-foreground">{item.name}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${
              item.status === 'Active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
            }`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
