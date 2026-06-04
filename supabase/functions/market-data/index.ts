import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const BINANCE_BASE = "https://api.binance.com/api/v3";
const BYBIT_BASE = "https://api.bybit.com/v5";
const CACHE_TTL_MS = 15_000; // 15s — keep prices truly live across the app

// Symbol → CoinGecko name + USDT pair on Binance/Bybit
const ASSETS: Array<{ symbol: string; name: string; pair: string }> = [
  { symbol: "BTC",  name: "Bitcoin",   pair: "BTCUSDT" },
  { symbol: "ETH",  name: "Ethereum",  pair: "ETHUSDT" },
  { symbol: "SOL",  name: "Solana",    pair: "SOLUSDT" },
  { symbol: "XRP",  name: "Ripple",    pair: "XRPUSDT" },
  { symbol: "ADA",  name: "Cardano",   pair: "ADAUSDT" },
  { symbol: "BNB",  name: "BNB",       pair: "BNBUSDT" },
  { symbol: "DOGE", name: "Dogecoin",  pair: "DOGEUSDT" },
  { symbol: "AVAX", name: "Avalanche", pair: "AVAXUSDT" },
  { symbol: "LINK", name: "Chainlink", pair: "LINKUSDT" },
  { symbol: "DOT",  name: "Polkadot",  pair: "DOTUSDT" },
];

async function fetchBinance(pair: string) {
  const [t24, kl] = await Promise.all([
    fetch(`${BINANCE_BASE}/ticker/24hr?symbol=${pair}`, { signal: AbortSignal.timeout(5000) }),
    fetch(`${BINANCE_BASE}/klines?symbol=${pair}&interval=1h&limit=24`, { signal: AbortSignal.timeout(5000) }),
  ]);
  if (!t24.ok || !kl.ok) throw new Error(`binance ${pair} ${t24.status}/${kl.status}`);
  const t = await t24.json();
  const k = await kl.json();
  return {
    price: Number(t.lastPrice),
    change_24h: Number(t.priceChangePercent),
    volume_24h: Number(t.quoteVolume),
    high_24h: Number(t.highPrice),
    low_24h: Number(t.lowPrice),
    sparkline: k.map((c: any[]) => Number(c[4])),
  };
}

async function fetchBybit(pair: string) {
  const r = await fetch(`${BYBIT_BASE}/market/tickers?category=spot&symbol=${pair}`, { signal: AbortSignal.timeout(5000) });
  if (!r.ok) throw new Error(`bybit ${pair}`);
  const j = await r.json();
  const t = j?.result?.list?.[0];
  if (!t) throw new Error("bybit empty");
  return {
    price: Number(t.lastPrice),
    change_24h: Number(t.price24hPcnt) * 100,
    volume_24h: Number(t.turnover24h),
    high_24h: Number(t.highPrice24h),
    low_24h: Number(t.lowPrice24h),
    sparkline: [] as number[],
  };
}

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

    // Multi-exchange aggregation: Binance primary, Bybit secondary, CoinGecko fallback.
    let freshData: any[] = [];
    const sources: string[] = [];
    try {
      const results = await Promise.all(ASSETS.map(async (a) => {
        const got: any[] = [];
        try { got.push({ src: "binance", ...(await fetchBinance(a.pair)) }); } catch {}
        try { got.push({ src: "bybit",   ...(await fetchBybit(a.pair)) }); } catch {}
        if (got.length === 0) return null;
        // Weighted average price across exchanges (anomaly safe — drop > 2% deviation)
        const median = got.map(g => g.price).sort((x, y) => x - y)[Math.floor(got.length / 2)];
        const kept = got.filter(g => Math.abs(g.price - median) / median < 0.02);
        const price = kept.reduce((s, g) => s + g.price, 0) / kept.length;
        const ref = kept[0];
        sources.push(...kept.map(k => k.src));
        return {
          symbol: a.symbol,
          name: a.name,
          price,
          change_24h: ref.change_24h,
          volume_24h: ref.volume_24h,
          high_24h: ref.high_24h,
          low_24h: ref.low_24h,
          market_cap: price * 1e7,
          sparkline: ref.sparkline?.length ? ref.sparkline : [],
          source: kept.map(k => k.src).join("+"),
          updated_at: new Date().toISOString(),
        };
      }));
      freshData = results.filter(Boolean) as any[];
    } catch (e) {
      console.warn("Exchange aggregation failed:", e);
    }

    // CoinGecko backup if exchanges failed
    if (freshData.length === 0) try {
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
