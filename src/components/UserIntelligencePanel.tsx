import { User, Brain, Shield, Target } from 'lucide-react';
import type { UserIntelligenceProfile } from '@/lib/konsmia/quantum-engine';

interface Props { profile: UserIntelligenceProfile }

export function UserIntelligencePanel({ profile }: Props) {
  const emotionBars = [
    { label: 'Fear Tendency', value: profile.emotionalProfile.fearTendency, color: 'bg-danger/60' },
    { label: 'Greed Tendency', value: profile.emotionalProfile.greedTendency, color: 'bg-warning/60' },
    { label: 'Impulsiveness', value: profile.emotionalProfile.impulsiveness, color: 'bg-danger/60' },
    { label: 'Patience', value: profile.emotionalProfile.patience, color: 'bg-success/60' },
  ];

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="flex items-center gap-3 bg-secondary/20 rounded-lg p-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Trader Profile</p>
          <p className="text-[10px] font-mono text-muted-foreground capitalize">{profile.experienceLevel} • {profile.riskTolerance} risk</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: Target, label: 'Win Rate', value: `${profile.winRate}%` },
          { icon: Brain, label: 'Total Trades', value: profile.totalTrades.toString() },
          { icon: Shield, label: 'Avg Hold', value: profile.avgHoldTime },
          { icon: User, label: 'Frequency', value: profile.tradingFrequency },
        ].map(stat => (
          <div key={stat.label} className="bg-secondary/20 rounded p-2.5 text-center">
            <stat.icon className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
            <p className="font-mono text-[10px] text-muted-foreground">{stat.label}</p>
            <p className="font-mono text-sm font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Emotional Profile */}
      <div className="space-y-2">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Emotional Profile</p>
        {emotionBars.map(bar => (
          <div key={bar.label}>
            <div className="flex justify-between mb-0.5">
              <span className="text-[10px] text-muted-foreground">{bar.label}</span>
              <span className="font-mono text-[10px] text-foreground">{bar.value}%</span>
            </div>
            <div className="w-full bg-secondary/40 rounded-full h-1.5">
              <div className={`${bar.color} rounded-full h-1.5 transition-all`} style={{ width: `${bar.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Behavior Notes */}
      <div className="space-y-1.5">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">KI Behavior Observations</p>
        {profile.behaviorNotes.map((note, i) => (
          <div key={i} className="flex items-start gap-2 bg-secondary/10 rounded p-2">
            <span className="text-primary text-[10px] mt-0.5">→</span>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
