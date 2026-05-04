// Builds the live "brain context" Waides KI receives on every chat turn.
// Includes: live prices, latest signals, open sandbox trades, accuracy stats,
// user preferences (long vs spot, risk), and the current page.

import { supabase } from '@/integrations/supabase/client';
import { getAllLivePrices } from './live-prices';

export interface BrainContext {
  generatedAt: string;
  livePrices: Record<string, number>;
  topSignals: any[];
  openTrades: any[];
  recentClosed: any[];
  accuracy: { total: number; wins: number; winRate: number; avgPnl: number };
  userPrefs: Record<string, any>;
  currentRoute?: string;
}

export async function buildBrainContext(currentRoute?: string): Promise<BrainContext> {
  const [signalsRes, openRes, closedRes, accRes, prefRes] = await Promise.all([
    supabase.from('signals').select('*').order('created_at', { ascending: false }).limit(8),
    supabase.from('sandbox_trades').select('*').eq('status', 'open').order('opened_at', { ascending: false }).limit(20),
    supabase.from('sandbox_trades').select('*').eq('status', 'closed').order('closed_at', { ascending: false }).limit(15),
    supabase.from('ki_accuracy_log').select('outcome,pnl_percent').limit(500),
    supabase.from('ki_brain_memory').select('*').eq('kind', 'preference').limit(50),
  ]);

  const accRows = accRes.data ?? [];
  const wins = accRows.filter(r => r.outcome === 'win').length;
  const total = accRows.length;
  const avgPnl = total ? accRows.reduce((s, r) => s + Number(r.pnl_percent || 0), 0) / total : 0;

  const userPrefs: Record<string, any> = {};
  for (const p of prefRes.data ?? []) userPrefs[p.key ?? p.id] = p.value;

  return {
    generatedAt: new Date().toISOString(),
    livePrices: getAllLivePrices(),
    topSignals: signalsRes.data ?? [],
    openTrades: openRes.data ?? [],
    recentClosed: closedRes.data ?? [],
    accuracy: { total, wins, winRate: total ? Math.round((wins / total) * 1000) / 10 : 0, avgPnl },
    userPrefs,
    currentRoute,
  };
}

export async function rememberPreference(key: string, value: any, sessionId = 'default') {
  // Upsert-like behavior without unique constraint
  const { data: existing } = await supabase
    .from('ki_brain_memory')
    .select('id')
    .eq('session_id', sessionId).eq('kind', 'preference').eq('key', key)
    .limit(1);
  if (existing && existing.length) {
    await supabase.from('ki_brain_memory').update({ value }).eq('id', existing[0].id);
  } else {
    await supabase.from('ki_brain_memory').insert({ session_id: sessionId, kind: 'preference', key, value });
  }
}