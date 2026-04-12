import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Zap } from 'lucide-react';
import { StatusDot } from '@/components/StatusDot';
import { getSystemHealth } from '@/lib/konsmia/modules';
import { useEffect, useState } from 'react';

export default function DashboardLayout() {
  const [health, setHealth] = useState(getSystemHealth());

  useEffect(() => {
    const t = setInterval(() => setHealth(getSystemHealth()), 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-dark relative">
        <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <header className="sticky top-0 z-20 h-12 flex items-center border-b border-border/50 bg-background/80 backdrop-blur-sm px-4 gap-3">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex items-center gap-2 sm:hidden">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-mono text-xs font-bold text-foreground tracking-wider">WAIDES KI</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {/* System health indicator */}
              <div className="hidden sm:flex items-center gap-1.5">
                {health.modules.map(m => (
                  <div
                    key={m.name}
                    title={`${m.name}: ${m.status} (${m.integrity}%)`}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      m.status === 'online' ? 'bg-success' : m.status === 'syncing' ? 'bg-warning pulse-dot' : 'bg-danger'
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
          <main className="flex-1 overflow-auto p-4 sm:p-6 pb-20 sm:pb-6">
            <Outlet />
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
