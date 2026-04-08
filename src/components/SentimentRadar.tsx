import { cn } from '@/lib/utils';

interface SentimentRadarProps {
  fearGreed: number;
  retailSentiment: number;
  socialVolume: number;
  newsImpact: number;
  className?: string;
}

export function SentimentRadar({ fearGreed, retailSentiment, socialVolume, newsImpact, className }: SentimentRadarProps) {
  const metrics = [
    { label: 'Fear/Greed', value: fearGreed },
    { label: 'Retail', value: retailSentiment },
    { label: 'Social', value: socialVolume },
    { label: 'News', value: newsImpact },
  ];

  const getLevel = (v: number) => {
    if (v > 70) return { text: 'Extreme', color: 'text-danger' };
    if (v > 55) return { text: 'High', color: 'text-warning' };
    if (v > 35) return { text: 'Neutral', color: 'text-muted-foreground' };
    return { text: 'Low', color: 'text-success' };
  };

  return (
    <div className={cn('space-y-3', className)}>
      {metrics.map(m => {
        const level = getLevel(m.value);
        return (
          <div key={m.label} className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-muted-foreground">{m.label}</span>
              <span className={level.color}>{m.value} — {level.text}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', 
                  m.value > 70 ? 'bg-danger' : m.value > 55 ? 'bg-warning' : m.value > 35 ? 'bg-muted-foreground' : 'bg-success'
                )}
                style={{ width: `${m.value}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
