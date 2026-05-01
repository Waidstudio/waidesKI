import { Home, Signal, Sparkles, MessageCircle, Atom } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/signals', icon: Signal, label: 'Signals' },
  { path: '/chinnikstah', icon: Sparkles, label: 'Chinni' },
  { path: '/predictions', icon: Atom, label: 'Quantum' },
  { path: '/chat', icon: MessageCircle, label: 'KI Chat' },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-background/90 backdrop-blur-md border-t border-border" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn('h-4 w-4', active && 'drop-shadow-[0_0_6px_hsl(185,100%,55%)]')} />
              <span className="font-mono text-[9px]">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
