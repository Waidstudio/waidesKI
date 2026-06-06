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

  // Hide on any chat surface — the chat is the landing route ("/") and "/chat".
  // Footer must disappear inside conversations for a cleaner experience.
  if (pathname === '/' || pathname.startsWith('/chat')) return null;

  return (
    <nav
      className="sticky bottom-0 left-0 right-0 z-40 sm:hidden bg-black border-t border-[hsl(0_0%_12%)] shrink-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Primary mobile navigation"
    >
      <div>
        <ul className="flex items-center justify-between px-2 h-12">
          {navItems.map((item) => {
            const active = item.path === '/' ? pathname === '/' : pathname === item.path;
            const Icon = item.icon;
            if (item.center) {
              return (
                <li key={item.path} className="-mt-3">
                  <NavLink
                    to={item.path}
                    aria-label={item.label}
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full bg-black',
                      'border border-[hsl(185_100%_55%/0.6)]',
                      'shadow-[0_0_10px_-2px_hsl(185_100%_55%/0.55),inset_0_0_8px_-4px_hsl(280_90%_65%/0.4)]',
                      'transition-transform active:scale-95',
                      active && 'ring-1 ring-[hsl(280_90%_65%/0.7)]'
                    )}
                  >
                    <Icon className="h-[14px] w-[14px] text-primary" />
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
                    'flex flex-col items-center gap-0.5 py-1 rounded-lg transition-colors',
                    active ? 'text-primary' : 'text-white/55 hover:text-white'
                  )}
                >
                  <Icon className={cn('h-[14px] w-[14px]', active && 'drop-shadow-[0_0_5px_hsl(185_100%_55%)]')} />
                  <span className="font-mono text-[8px] leading-none tracking-wide">{item.label}</span>
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
