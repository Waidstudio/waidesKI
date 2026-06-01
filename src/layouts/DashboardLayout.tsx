import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { SmaiPopups } from '@/components/SmaiPopups';
import { Zap } from 'lucide-react';
import { StatusDot } from '@/components/StatusDot';
import { getSystemHealth } from '@/lib/konsmia/modules';
import { memo, useEffect, useState } from 'react';
import { useSignals } from '@/hooks/useSignals';
import { useSandboxAutoTrader } from '@/hooks/useSandboxAutoTrader';
import { useMarketData } from '@/hooks/useMarketData';
import { AppFooter } from '@/components/AppFooter';

// Isolated runtime — mounts once, no UI, keeps KI training across navigation.
const GlobalRuntime = memo(function GlobalRuntime() {
  useMarketData();
  const { signals } = useSignals();
  useSandboxAutoTrader(signals);
  return null;
});

// Header is memoized + polls health independently so route changes don't re-render it.
const AppHeader = memo(function AppHeader() {
  const [health, setHealth] = useState(getSystemHealth());
  useEffect(() => {
    const t = setInterval(() => {
      const next = getSystemHealth();
      setHealth(prev =>
        prev.overall === next.overall &&
        prev.modules.every((m, i) => m.status === next.modules[i].status && m.integrity === next.modules[i].integrity)
          ? prev
          : next
      );
    }, 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-12 flex items-center border-b border-border bg-background px-4 gap-3">
      <SidebarTrigger className="text-muted-foreground hover:text-primary" />
      <div className="flex items-center gap-2 sm:hidden">
        <Zap className="h-4 w-4 text-primary float-glow" />
        <span className="font-futuristic text-xs font-black text-gradient-primary tracking-widest">WAIDES KI</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5">
          {health.modules.map(m => (
            <div
              key={m.name}
              title={`${m.name}: ${m.status} (${m.integrity}%)`}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                m.status === 'online' ? 'bg-primary' : m.status === 'syncing' ? 'bg-accent pulse-dot' : 'bg-accent'
              }`}
            />
          ))}
        </div>
        <StatusDot status="online" />
        <span className="font-mono text-[10px] text-muted-foreground hidden sm:block">
          System {health.overall}%
        </span>
      </div>
    </header>
  );
});

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <GlobalRuntime />
      <div className="min-h-screen flex w-full bg-background relative">
        <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative z-10 bg-background">
          <AppHeader />
          <main className="flex-1 overflow-auto p-4 sm:p-6 pb-20 sm:pb-6 bg-background">
            <Outlet />
          </main>
          <AppFooter />
        </div>
        <MobileBottomNav />
        <SmaiPopups />
      </div>
    </SidebarProvider>
  );
}
