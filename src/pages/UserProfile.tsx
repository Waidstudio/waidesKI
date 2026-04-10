import { TerminalCard } from '@/components/TerminalCard';
import { UserIntelligencePanel } from '@/components/UserIntelligencePanel';
import { AdaptiveAlertCard } from '@/components/AdaptiveAlertCard';
import { generateUserProfile } from '@/lib/konsmia/quantum-engine';
import { useMemo } from 'react';

export default function UserProfile() {
  const profile = useMemo(() => generateUserProfile(), []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">User Intelligence</h1>
        <p className="text-xs text-muted-foreground font-mono">Behavioral analysis • Adaptive coaching • Personal risk profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TerminalCard title="TRADER PROFILE" subtitle="KI behavioral analysis">
          <UserIntelligencePanel profile={profile} />
        </TerminalCard>

        <div className="space-y-4">
          <TerminalCard title="ADAPTIVE ALERTS" subtitle="Personalized intelligence">
            <AdaptiveAlertCard />
          </TerminalCard>

          <TerminalCard title="KI COACHING">
            <div className="space-y-3">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-xs text-foreground font-medium mb-2">Based on your profile, Waides KI recommends:</p>
                <ul className="space-y-1.5 text-[10px] text-muted-foreground">
                  <li className="flex items-start gap-1.5"><span className="text-success">✓</span> Good risk management — continue 1-2% per trade</li>
                  <li className="flex items-start gap-1.5"><span className="text-warning">⚠</span> Work on holding winners longer — you exit too early</li>
                  <li className="flex items-start gap-1.5"><span className="text-danger">✗</span> Avoid revenge trading after losses — take breaks</li>
                  <li className="flex items-start gap-1.5"><span className="text-primary">→</span> Focus on London session — your highest win rate</li>
                </ul>
              </div>

              <div className="bg-secondary/20 rounded p-3">
                <p className="font-mono text-[10px] text-muted-foreground uppercase mb-2">Emotional State Assessment</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center bg-secondary/20 rounded p-2">
                    <p className="font-mono text-lg">😌</p>
                    <p className="text-[10px] text-muted-foreground">Current: Calm</p>
                  </div>
                  <div className="text-center bg-secondary/20 rounded p-2">
                    <p className="font-mono text-lg">📊</p>
                    <p className="text-[10px] text-muted-foreground">Focus: High</p>
                  </div>
                </div>
              </div>
            </div>
          </TerminalCard>
        </div>
      </div>
    </div>
  );
}
