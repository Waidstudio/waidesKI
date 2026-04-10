import { Shield, Brain, Eye, Heart } from 'lucide-react';

interface Props {
  ethicalAlignment: boolean;
  shavokaApproved: boolean;
  confidencePercent: number;
  mode: string;
}

export function KonsAiPanel({ ethicalAlignment, shavokaApproved, confidencePercent, mode }: Props) {
  const checks = [
    { icon: Shield, label: 'Shavoka Ethical Firewall', passed: shavokaApproved, description: shavokaApproved ? 'Signal passed ethical screening — no manipulation detected' : 'Signal blocked — potential manipulation patterns detected' },
    { icon: Brain, label: 'KonsAi Intelligence Alignment', passed: ethicalAlignment, description: ethicalAlignment ? 'Decision aligns with KonsAi moral framework' : 'Decision conflicts with KonsAi stability requirements' },
    { icon: Eye, label: 'Transparency Check', passed: true, description: 'All analysis layers visible and auditable' },
    { icon: Heart, label: 'User Protection Protocol', passed: confidencePercent >= 75, description: confidencePercent >= 75 ? 'Confidence meets minimum safety threshold' : `Confidence ${confidencePercent}% below safety threshold` },
  ];

  const allPassed = checks.every(c => c.passed);

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className={`rounded-lg p-4 border text-center ${allPassed ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}`}>
        <Shield className={`h-6 w-6 mx-auto mb-2 ${allPassed ? 'text-success' : 'text-warning'}`} />
        <p className={`font-mono text-sm font-bold ${allPassed ? 'text-success' : 'text-warning'}`}>
          {allPassed ? 'KONSAI APPROVED' : 'KONSAI CAUTION'}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1 capitalize">Mode: {mode}</p>
      </div>

      {/* Checks */}
      <div className="space-y-2">
        {checks.map((check, i) => {
          const Icon = check.icon;
          return (
            <div key={i} className={`rounded p-3 border ${check.passed ? 'border-success/10 bg-success/5' : 'border-danger/10 bg-danger/5'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-3.5 w-3.5 ${check.passed ? 'text-success' : 'text-danger'}`} />
                <p className="text-xs font-medium text-foreground">{check.label}</p>
                <span className={`ml-auto font-mono text-[10px] ${check.passed ? 'text-success' : 'text-danger'}`}>
                  {check.passed ? '✓ PASS' : '✗ FAIL'}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground pl-5">{check.description}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-secondary/20 rounded p-3 text-center">
        <p className="text-[10px] text-muted-foreground italic">
          "KonsAi ensures every decision respects ethical boundaries, user protection, and long-term stability."
        </p>
      </div>
    </div>
  );
}
