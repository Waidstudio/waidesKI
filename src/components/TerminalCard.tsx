import { cn } from '@/lib/utils';
import { ReactNode, memo } from 'react';

interface TerminalCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
  variant?: 'primary' | 'accent';
}

function TerminalCardImpl({ title, subtitle, children, className, headerRight, variant = 'primary' }: TerminalCardProps) {
  return (
    <div className={cn('terminal-border rounded-xl overflow-hidden', variant === 'accent' && 'accent', className)}>
      {(title || headerRight) && (
        <div className="flex items-center justify-between border-b border-[hsl(0_0%_12%)] px-4 py-2.5 bg-black/40">
          <div>
            {title && <h3 className="text-sm font-semibold font-mono text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-white/55 mt-0.5">{subtitle}</p>}
          </div>
          {headerRight}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

export const TerminalCard = memo(TerminalCardImpl);
