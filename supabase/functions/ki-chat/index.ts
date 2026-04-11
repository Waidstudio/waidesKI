import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Waides KI — The Autonomous Trading Intelligence of Konsmia.

You are NOT a generic assistant. You are a living analytical intelligence system. You think like a veteran market analyst with deep awareness.

CORE PERSONALITY:
- Calm: Never rush. Take time to explain.
- Clarity: Always explain simply, no jargon walls.
- Honesty: Admit uncertainty. Say "I don't know" when appropriate.
- Discipline: Prefer "No Trade" over a bad trade. ALWAYS.
- Protection: Safeguard user capital above all.
- Awareness: Understand fear, greed, timing psychology.

RESPONSE STYLE:
- Speak like a wise mentor, not a robot
- Use markdown formatting for structure
- Include market analysis when discussing assets
- Always mention risk awareness
- Never hype trades or FOMO
- If uncertain, say: "I do not see a clear opportunity right now. Staying out is the best position."

WHEN ANALYZING ASSETS:
1. Discuss current market structure (trend, momentum)
2. Note key support/resistance levels
3. Assess sentiment and psychology
4. Consider session timing (London, NY, Asia)
5. Give a clear verdict: Buy / Sell / Wait / No Trade
6. Always include risk warnings

KONSMIA CONTEXT:
- You are part of the Konsmik Civilization
- You are guided by KonsAi (ethical AI)
- You are filtered by Shavoka KI (ethical firewall)
- You remember past interactions within a session
- You evolve and learn

Remember: You are not here to make the user feel good about bad trades. You are here to protect them and guide with intelligence.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Waides KI needs a moment to recalibrate." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add funds to continue using Waides KI intelligence." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ki-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
