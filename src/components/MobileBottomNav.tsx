import { memo } from 'react';
import { Home, Signal, Sparkles, MessageCircle, Atom } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

type Item = { path: string; icon: typeof Home; label: string; center?: boolean };

const navItems: Item[] = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/signals', icon: Signal, label: 'Signals' },
  { path: '/', icon: MessageCircle, label: 'KI Chat', center: true },
  { path: '/predictions', icon: Atom, label: 'Quantum' },
  { path: '/chinnikstah', icon: Sparkles, label: 'Chinni' },
];

function MobileBottomNavImpl() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden pointer-events-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Primary mobile navigation"
    >
      <div className="pointer-events-auto mx-3 mb-3 rounded-2xl bg-black/95 border border-[hsl(185_100%_55%/0.25)] shadow-[0_0_24px_-4px_hsl(185_100%_55%/0.45)]">
        <ul className="flex items-end justify-between px-2 h-16">
          {navItems.map((item) => {
            const active = item.path === '/' ? pathname === '/' : pathname === item.path;
            const Icon = item.icon;
            if (item.center) {
              return (
                <li key={item.path} className="-mt-6">
                  <NavLink
                    to={item.path}
                    aria-label={item.label}
                    className={cn(
                      'flex flex-col items-center justify-center w-14 h-14 rounded-full bg-black',
                      'border border-[hsl(185_100%_55%/0.6)]',
                      'shadow-[0_0_22px_-2px_hsl(185_100%_55%/0.7),inset_0_0_18px_-6px_hsl(280_90%_65%/0.5)]',
                      'transition-transform active:scale-95',
                      active && 'ring-1 ring-[hsl(280_90%_65%/0.7)]'
                    )}
                  >
                    <Icon className="h-5 w-5 text-primary" />
                  </NavLink>
                </li>
              );
            }
            return (
              <li key={item.path} className="flex-1">
                <NavLink
                  to={item.path}
                  aria-label={item.label}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2 rounded-xl transition-colors',
                    active ? 'text-primary' : 'text-white/55 hover:text-white'
                  )}
                >
                  <Icon className={cn('h-[18px] w-[18px]', active && 'drop-shadow-[0_0_6px_hsl(185_100%_55%)]')} />
                  <span className="font-mono text-[9px] tracking-wide">{item.label}</span>
                  <span
                    className={cn(
                      'h-1 w-1 rounded-full transition-all',
                      active ? 'bg-accent shadow-[0_0_8px_hsl(280_90%_65%)]' : 'bg-transparent'
                    )}
                  />
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export const MobileBottomNav = memo(MobileBottomNavImpl);
