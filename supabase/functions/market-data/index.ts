import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const CACHE_TTL_MS = 60_000; // 60 seconds

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check cache freshness
    const { data: cached } = await supabase
      .from("market_data_cache")
      .select("updated_at")
      .limit(1)
      .single();

    const cacheAge = cached ? Date.now() - new Date(cached.updated_at).getTime() : Infinity;

    if (cacheAge < CACHE_TTL_MS) {
      // Return cached data
      const { data } = await supabase
        .from("market_data_cache")
        .select("*")
        .order("market_cap", { ascending: false });

      return new Response(JSON.stringify({ data, source: "cache", age_ms: cacheAge }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch fresh data from CoinGecko
    let freshData: any[] = [];
    try {
      const res = await fetch(
        `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`,
        { signal: AbortSignal.timeout(10000) }
      );

      if (res.ok) {
        const coins = await res.json();
        freshData = coins.map((coin: any) => ({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.current_price,
          change_24h: coin.price_change_percentage_24h ?? 0,
          volume_24h: coin.total_volume,
          high_24h: coin.high_24h,
          low_24h: coin.low_24h,
          market_cap: coin.market_cap,
          sparkline: coin.sparkline_in_7d?.price?.slice(-24) ?? [],
          source: "coingecko",
          updated_at: new Date().toISOString(),
        }));
      } else {
        console.warn("CoinGecko returned", res.status);
      }
    } catch (e) {
      console.error("CoinGecko fetch failed:", e);
    }

    if (freshData.length > 0) {
      // Upsert into cache
      for (const item of freshData) {
        await supabase
          .from("market_data_cache")
          .upsert(item, { onConflict: "symbol" });
      }

      return new Response(JSON.stringify({ data: freshData, source: "live", age_ms: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback to cache even if stale
    const { data: stale } = await supabase
      .from("market_data_cache")
      .select("*")
      .order("market_cap", { ascending: false });

    return new Response(JSON.stringify({ data: stale ?? [], source: "stale_cache", age_ms: cacheAge }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("market-data error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
