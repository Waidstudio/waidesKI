import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface TerminalCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
}

export function TerminalCard({ title, subtitle, children, className, headerRight }: TerminalCardProps) {
  return (
    <div className={cn('terminal-border rounded-lg bg-card overflow-hidden', className)}>
      {(title || headerRight) && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div>
            {title && <h3 className="text-sm font-semibold font-mono text-foreground">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {headerRight}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
