import { BarChart2, Building2, Users } from 'lucide-react';

interface Props {
  institutional: boolean;
  fakeMove: boolean;
  conviction: number;
}

export function VolumeAnalysisCard({ institutional, fakeMove, conviction }: Props) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className={`rounded-lg p-3 border text-center ${institutional ? 'border-success/20 bg-success/5' : 'border-border/30 bg-secondary/10'}`}>
          <Building2 className={`h-5 w-5 mx-auto mb-1 ${institutional ? 'text-success' : 'text-muted-foreground'}`} />
          <p className="font-mono text-[10px] text-muted-foreground">INSTITUTIONAL</p>
          <p className={`font-mono text-xs font-bold ${institutional ? 'text-success' : 'text-muted-foreground'}`}>
            {institutional ? 'DETECTED' : 'NOT FOUND'}
          </p>
        </div>
        <div className={`rounded-lg p-3 border text-center ${fakeMove ? 'border-danger/20 bg-danger/5' : 'border-border/30 bg-secondary/10'}`}>
          <Users className={`h-5 w-5 mx-auto mb-1 ${fakeMove ? 'text-danger' : 'text-muted-foreground'}`} />
          <p className="font-mono text-[10px] text-muted-foreground">FAKE MOVE</p>
          <p className={`font-mono text-xs font-bold ${fakeMove ? 'text-danger' : 'text-success'}`}>
            {fakeMove ? '⚠️ RISK' : 'CLEAR'}
          </p>
        </div>
      </div>

      <div className="bg-secondary/20 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] text-muted-foreground">CONVICTION</span>
          <span className="font-mono text-sm font-bold text-foreground">{conviction}%</span>
        </div>
        <div className="w-full bg-secondary/40 rounded-full h-2">
          <div className={`rounded-full h-2 transition-all ${conviction > 60 ? 'bg-success' : conviction > 40 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${conviction}%` }} />
        </div>
      </div>
    </div>
  );
}
