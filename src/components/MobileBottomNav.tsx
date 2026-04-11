import { Home, BarChart3, TrendingUp, MessageCircle, Settings as SettingsIcon } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/analysis', icon: BarChart3, label: 'Analysis' },
  { path: '/markets', icon: TrendingUp, label: 'Markets' },
  { path: '/chat', icon: MessageCircle, label: 'KI Chat' },
  { path: '/settings', icon: SettingsIcon, label: 'Settings' },
];

export function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-background/95 backdrop-blur-sm border-t border-border">
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
              <item.icon className={cn('h-4 w-4', active && 'drop-shadow-[0_0_4px_hsl(160,100%,45%)]')} />
              <span className="font-mono text-[9px]">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
