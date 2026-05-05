// Onyix — the fuel of Waides KI.
// Every backend action consumes Onyix. When balance drops below the threshold,
// the backend auto-refills (no user action). If refill fails AND balance hits 0,
// the system freezes signal generation.
//
// Accuracy tier scales with balance:
//   < 25%  → low      (shallow processing)
//   25-65% → medium   (normal)
//   > 65%  → high     (deep multi-layer)

import { supabase } from '@/integrations/supabase/client';

export type AccuracyTier = 'low' | 'medium' | 'high';

const MAX_BALANCE = 1000;
const REFILL_THRESHOLD = 200;
const REFILL_AMOUNT = 600;

export const ONYIX_COSTS: Record<string, number> = {
  asset_change: 2,
  timeframe_change: 2,
  engine_change: 2,
  signal_process: 5,
  tredbeing_expand: 6,
  sandbox_open: 4,
  sandbox_reconcile: 1,
  data_refresh: 1,
  chinnikstah_compute: 8, // chinnikstah is the heaviest consumer
};

let balance = MAX_BALANCE;
let frozen = false;
let refilling = false;
const listeners = new Set<(s: OnyixState) => void>();

export interface OnyixState {
  balance: number;
  max: number;
  tier: AccuracyTier;
  frozen: boolean;
  consumptionRate: number; // per minute (rolling)
}

const recent: { t: number; n: number }[] = [];

export function getTier(b = balance): AccuracyTier {
  const pct = b / MAX_BALANCE;
  if (pct < 0.25) return 'low';
  if (pct > 0.65) return 'high';
  return 'medium';
}

export function getOnyixState(): OnyixState {
  const cutoff = Date.now() - 60_000;
  const rate = recent.filter(r => r.t > cutoff).reduce((s, r) => s + r.n, 0);
  return { balance, max: MAX_BALANCE, tier: getTier(), frozen, consumptionRate: rate };
}

export function subscribeOnyix(fn: (s: OnyixState) => void): () => void {
  listeners.add(fn);
  fn(getOnyixState());
  return () => listeners.delete(fn);
}

function notify() {
  const s = getOnyixState();
  listeners.forEach(l => l(s));
}

async function logLedger(action: string, amount: number) {
  try {
    await supabase.from('onyix_ledger').insert({
      action, amount, balance_after: balance, accuracy_tier: getTier(),
    });
  } catch {/* ignore */}
}

async function autoRefill() {
  if (refilling || balance > REFILL_THRESHOLD) return;
  refilling = true;
  try {
    // Simulated backend top-up (instant, succeeds in demo)
    const add = Math.min(REFILL_AMOUNT, MAX_BALANCE - balance);
    balance += add;
    frozen = false;
    await logLedger('auto_refill', add);
    notify();
  } finally {
    refilling = false;
  }
}

export async function consumeOnyix(action: keyof typeof ONYIX_COSTS | string, multiplier = 1): Promise<boolean> {
  if (frozen) return false;
  const cost = (ONYIX_COSTS[action] ?? 1) * multiplier;
  if (balance < cost) {
    // try refill once
    await autoRefill();
    if (balance < cost) {
      frozen = true;
      notify();
      return false;
    }
  }
  balance -= cost;
  recent.push({ t: Date.now(), n: cost });
  if (recent.length > 200) recent.splice(0, recent.length - 200);
  notify();
  // log async (don't await)
  logLedger(action, -cost);
  if (balance < REFILL_THRESHOLD) autoRefill();
  return true;
}

export function isFrozen(): boolean { return frozen; }

/** Called by engines that scale depth with tier. */
export function depthForTier(): number {
  switch (getTier()) {
    case 'low': return 1;
    case 'medium': return 2;
    case 'high': return 3;
  }
}