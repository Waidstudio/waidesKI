import { Zap, BarChart3, TrendingUp, Briefcase, Network, Settings as SettingsIcon, Home, Menu } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { StatusDot } from '@/components/StatusDot';

const mainItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Analysis', url: '/analysis', icon: BarChart3 },
  { title: 'Markets', url: '/markets', icon: TrendingUp },
  { title: 'Portfolio', url: '/portfolio', icon: Briefcase },
  { title: 'Konsmia', url: '/konsmia', icon: Network },
  { title: 'Settings', url: '/settings', icon: SettingsIcon },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
      <SidebarContent>
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-border/50">
          <Zap className="h-4 w-4 text-primary shrink-0" />
          {!collapsed && (
            <span className="font-mono text-xs font-bold text-foreground tracking-wider">WAIDES KI</span>
          )}
          {!collapsed && <StatusDot status="online" className="ml-auto" />}
        </div>

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="font-mono text-[10px] text-muted-foreground">Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-2 px-2 py-1.5 rounded text-xs font-mono hover:bg-muted/50 text-muted-foreground transition-colors"
                      activeClassName="bg-primary/10 text-primary"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-3">
        {!collapsed && (
          <p className="text-[10px] font-mono text-muted-foreground text-center">Konsmik Civilization</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
