import { TerminalCard } from '@/components/TerminalCard';
import { UserIntelligencePanel } from '@/components/UserIntelligencePanel';
import { AdaptiveAlertCard } from '@/components/AdaptiveAlertCard';
import { generateUserProfile } from '@/lib/konsmia/quantum-engine';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut } from 'lucide-react';

export default function UserProfile() {
  const profile = useMemo(() => generateUserProfile(), []);
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email?: string | null; display_name?: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) {
        if (!cancelled) setUser(null);
        return;
      }
      const { data: p } = await supabase.from('profiles').select('display_name').eq('id', u.id).maybeSingle();
      if (!cancelled) setUser({ email: u.email, display_name: p?.display_name ?? null });
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-display font-bold text-foreground">User Intelligence</h1>
        <p className="text-xs text-muted-foreground font-mono">Behavioral analysis • Adaptive coaching • Personal risk profile</p>
      </div>

      <TerminalCard title="ACCOUNT">
        {user ? (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm text-foreground font-semibold">{user.display_name || 'Trader'}</p>
              <p className="text-[11px] text-muted-foreground font-mono">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut} className="font-mono text-[11px]">
              <LogOut className="h-3 w-3 mr-1.5" /> Sign out
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-muted-foreground">You are browsing as guest.</p>
            <Link to="/auth">
              <Button size="sm" className="font-mono text-[11px]">
                <LogIn className="h-3 w-3 mr-1.5" /> Sign in / Register
              </Button>
            </Link>
          </div>
        )}
      </TerminalCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TerminalCard title="TRADER PROFILE" subtitle="KI behavioral analysis">
          <UserIntelligencePanel profile={profile} />
        </TerminalCard>

        <div className="space-y-4">
          <TerminalCard title="ADAPTIVE ALERTS" subtitle="Personalized intelligence">
            <AdaptiveAlertCard />
          </TerminalCard>

          <TerminalCard title="KI COACHING">
            <div className="space-y-3">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-xs text-foreground font-medium mb-2">Based on your profile, Waides KI recommends:</p>
                <ul className="space-y-1.5 text-[10px] text-muted-foreground">
                  <li className="flex items-start gap-1.5"><span className="text-success">✓</span> Good risk management — continue 1-2% per trade</li>
                  <li className="flex items-start gap-1.5"><span className="text-warning">⚠</span> Work on holding winners longer — you exit too early</li>
                  <li className="flex items-start gap-1.5"><span className="text-danger">✗</span> Avoid revenge trading after losses — take breaks</li>
                  <li className="flex items-start gap-1.5"><span className="text-primary">→</span> Focus on London session — your highest win rate</li>
                </ul>
              </div>

              <div className="bg-secondary/20 rounded p-3">
                <p className="font-mono text-[10px] text-muted-foreground uppercase mb-2">Emotional State Assessment</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center bg-secondary/20 rounded p-2">
                    <p className="font-mono text-lg">😌</p>
                    <p className="text-[10px] text-muted-foreground">Current: Calm</p>
                  </div>
                  <div className="text-center bg-secondary/20 rounded p-2">
                    <p className="font-mono text-lg">📊</p>
                    <p className="text-[10px] text-muted-foreground">Focus: High</p>
                  </div>
                </div>
              </div>
            </div>
          </TerminalCard>
        </div>
      </div>
    </div>
  );
}
