import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealtimeAlert {
  id: string;
  kind: string;
  severity: 'info' | 'warning' | 'critical';
  asset: string | null;
  signal_id: string | null;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function useAlerts(limit = 30) {
  const [alerts, setAlerts] = useState<RealtimeAlert[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (mounted && data) {
        setAlerts(data as RealtimeAlert[]);
        setUnread(data.filter(d => !d.read).length);
      }
    };
    load();

    const channel = supabase
      .channel('alerts-stream')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => {
        const row = payload.new as RealtimeAlert;
        setAlerts(prev => [row, ...prev].slice(0, limit));
        setUnread(u => u + 1);
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [limit]);

  const markAllRead = async () => {
    await supabase.from('alerts').update({ read: true }).eq('read', false);
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    setUnread(0);
  };

  return { alerts, unread, markAllRead };
}