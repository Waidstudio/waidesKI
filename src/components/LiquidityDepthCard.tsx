import { cn } from '@/lib/utils';

interface LiquidityLevel {
  price: number;
  volume: number;
  type: 'bid' | 'ask';
}

interface LiquidityDepthCardProps {
  asset: string;
  className?: string;
}

function generateLevels(): LiquidityLevel[] {
  const mid = 67500;
  const levels: LiquidityLevel[] = [];
  for (let i = 5; i >= 1; i--) {
    levels.push({ price: mid + i * 100, volume: Math.random() * 50 + 10, type: 'ask' });
  }
  for (let i = 1; i <= 5; i++) {
    levels.push({ price: mid - i * 100, volume: Math.random() * 50 + 10, type: 'bid' });
  }
  return levels;
}

export function LiquidityDepthCard({ asset, className }: LiquidityDepthCardProps) {
  const levels = generateLevels();
  const maxVol = Math.max(...levels.map(l => l.volume));

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground uppercase mb-2">
        <span>Price</span>
        <span>Volume</span>
      </div>
      {levels.map((level, i) => (
        <div key={i} className="relative flex items-center justify-between py-1 px-2 rounded">
          <div
            className={cn(
              'absolute inset-0 rounded',
              level.type === 'bid' ? 'bg-success/10' : 'bg-danger/10'
            )}
            style={{ width: `${(level.volume / maxVol) * 100}%`, [level.type === 'ask' ? 'right' : 'left']: 0 }}
          />
          <span className={cn('relative font-mono text-xs', level.type === 'bid' ? 'text-success' : 'text-danger')}>
            {level.price.toLocaleString()}
          </span>
          <span className="relative font-mono text-[10px] text-muted-foreground">
            {level.volume.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}
