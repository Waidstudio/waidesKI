// Walks every "pending" signal, marks it `triggered`, `won`, `lost`, or `expired`
// against the latest cached market price, emits alerts row, and writes
// signal_memory + ki_accuracy_log so the win-rate is self-correcting.
//
// Designed to be invoked by pg_cron every 2 minutes. Also fully safe to call
// manually via supabase.functions.invoke('signal-resolver').

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HORIZON_MS = 24 * 60 * 60 * 1000; // 24h to resolve a signal

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Price map from cache
  const { data: prices } = await supabase
    .from("market_data_cache")
    .select("symbol, price, updated_at");
  const priceFor = (asset: string): number | null => {
    const sym = asset.replace("/USD", "").toUpperCase();
    const row = prices?.find(p => p.symbol.toUpperCase() === sym);
    return row ? Number(row.price) : null;
  };

  // Pull open signals
  const { data: open } = await supabase
    .from("signals")
    .select("*")
    .in("lifecycle_state", ["pending", "active", "triggered"])
    .limit(500);

  let resolved = 0, alertsCreated = 0;
  const now = Date.now();

  for (const s of (open ?? [])) {
    const price = priceFor(s.asset);
    if (!price) continue;
    const created = new Date(s.created_at).getTime();
    const ageMs = now - created;
    const plans = (s.trade_plans as any[]) ?? [];
    const plan = plans[0]; // primary plan
    if (!plan) continue;

    const dir = plan.direction;
    const entry = Number(plan.entry);
    const sl = Number(plan.stopLoss);
    const tp1 = Number(plan.takeProfit1);
    const tp2 = Number(plan.takeProfit2);
    const tp3 = Number(plan.takeProfit3 ?? tp2);

    let nextState = s.lifecycle_state as string;
    let outcome: "correct" | "incorrect" | null = null;
    let alertKind: string | null = null;
    let title = "", message = "";

    // Lifecycle transitions
    if (s.lifecycle_state === "pending") {
      // Mark active once we have any price
      nextState = "active";
    }
    // Triggered?
    const triggered = dir === "long" ? price >= entry : price <= entry;
    if ((nextState === "active") && triggered) {
      nextState = "triggered";
      alertKind = "signal_fired";
      title = `${s.asset} ${dir.toUpperCase()} triggered`;
      message = `Entered at ${price.toFixed(price < 10 ? 4 : 2)} • SL ${sl.toFixed(sl < 10 ? 4 : 2)} • TP1 ${tp1.toFixed(tp1 < 10 ? 4 : 2)}`;
    }
    // Win/Loss check
    if (nextState === "triggered") {
      if (dir === "long") {
        if (price <= sl) { nextState = "lost"; outcome = "incorrect"; }
        else if (price >= tp3) { nextState = "won"; outcome = "correct"; }
        else if (price >= tp2) { nextState = "partial"; }
        else if (price >= tp1) { nextState = "partial"; }
      } else {
        if (price >= sl) { nextState = "lost"; outcome = "incorrect"; }
        else if (price <= tp3) { nextState = "won"; outcome = "correct"; }
        else if (price <= tp2) { nextState = "partial"; }
        else if (price <= tp1) { nextState = "partial"; }
      }
    }
    // Expiry
    if (!["won", "lost"].includes(nextState) && ageMs > HORIZON_MS) {
      nextState = "expired";
      outcome = nextState === "expired" ? (s.lifecycle_state === "triggered" ? "correct" : "incorrect") : null;
    }

    if (nextState !== s.lifecycle_state) {
      await supabase.from("signals").update({
        lifecycle_state: nextState,
        resolved_at: ["won","lost","expired"].includes(nextState) ? new Date().toISOString() : null,
        resolution_price: ["won","lost","expired"].includes(nextState) ? price : null,
      }).eq("id", s.id);
      resolved++;
    }

    // Append version snapshot
    if (nextState !== s.lifecycle_state) {
      const newVersion = (s.version ?? 1) + 1;
      await supabase.from("signal_versions").insert({
        signal_id: s.signal_id, asset: s.asset, version: newVersion,
        bias: s.bias, confidence_percent: s.confidence_percent,
        overall_score: s.overall_score,
        snapshot: { lifecycle: nextState, price, ageMs },
      });
      await supabase.from("signals").update({ version: newVersion }).eq("id", s.id);
    }

    // Outcome to signal_memory + ki_accuracy_log
    if (outcome) {
      await supabase.from("signal_memory").upsert({
        signal_id: s.signal_id, asset: s.asset,
        prediction: s.bias, confidence_percent: s.confidence_percent,
        outcome, resolved_at: new Date().toISOString(),
        actual_result: `${dir} resolved at ${price}`,
      }, { onConflict: "signal_id" });

      await supabase.from("ki_accuracy_log").insert({
        asset: s.asset, signal_id: s.signal_id,
        predicted_direction: dir,
        confidence_percent: s.confidence_percent,
        outcome: outcome === "correct" ? "win" : "loss",
        pnl_percent: ((price - entry) / entry) * 100 * (dir === "long" ? 1 : -1),
      });

      alertKind = outcome === "correct" ? "signal_won" : "signal_lost";
      title = `${s.asset} ${outcome === "correct" ? "WON" : "LOST"}`;
      message = `${dir.toUpperCase()} from ${entry.toFixed(entry < 10 ? 4 : 2)} → ${price.toFixed(price < 10 ? 4 : 2)}`;
    }

    if (alertKind) {
      await supabase.from("alerts").insert({
        kind: alertKind,
        severity: alertKind === "signal_lost" ? "warning" : "info",
        asset: s.asset, signal_id: s.signal_id,
        title, message,
        payload: { lifecycle: nextState, price, entry, sl, tp1 },
      });
      alertsCreated++;
    }
  }

  return new Response(JSON.stringify({ resolved, alertsCreated, scanned: open?.length ?? 0 }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});