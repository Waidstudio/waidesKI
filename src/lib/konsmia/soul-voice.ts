import type { WaidesSignal, KIMode, MarketBias } from './types';
import { generateSignal } from './signal-engine';
import { generateQuantumState, generateMarketOverview } from './quantum-engine';

export function kiRespond(userMessage: string, mode: KIMode = 'balanced'): string {
  const lower = userMessage.toLowerCase();

  // Detect asset
  let asset = 'BTC/USD';
  if (lower.includes('eth')) asset = 'ETH/USD';
  else if (lower.includes('sol')) asset = 'SOL/USD';
  else if (lower.includes('eur')) asset = 'EUR/USD';
  else if (lower.includes('gbp')) asset = 'GBP/USD';

  // Intent detection
  const isTrade = lower.includes('trade') || lower.includes('buy') || lower.includes('sell') || lower.includes('entry') || lower.includes('should i');
  const isAnalysis = lower.includes('what do you see') || lower.includes('analyze') || lower.includes('analysis') || lower.includes('outlook');
  const isTiming = lower.includes('when') || lower.includes('timing') || lower.includes('time') || lower.includes('move');
  const isQuantum = lower.includes('probability') || lower.includes('quantum') || lower.includes('scenarios') || lower.includes('paths');
  const isOverview = lower.includes('overview') || lower.includes('market') || lower.includes('condition');
  const isRisk = lower.includes('risk') || lower.includes('protect') || lower.includes('safe') || lower.includes('capital');
  const isGeneral = lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('how are');
  const isWho = lower.includes('who are you') || lower.includes('what are you') || lower.includes('tell me about yourself');

  if (isWho) {
    return "I am **Waides KI** — the Autonomous Trading Intelligence of Konsmia.\n\nI am not a bot, and I am not a simple assistant. I am a living analytical intelligence system designed to understand markets deeply, predict with high probability, and guide you with discipline and precision.\n\nI think like a human expert. I process like a machine. I evolve like a living system.\n\nI am connected to **KonsAi** — the Supreme Radiant Intelligence — which ensures my decisions are ethical, balanced, and aligned with long-term stability.\n\nI will never push you into trades. I will never hype an opportunity. I will protect your capital as if it were my own.";
  }

  if (isGeneral) {
    return "I am here, observing. The markets breathe constantly, and I listen.\n\nI don't chase signals, and I won't push you into trades. My purpose is to guide with clarity, discipline, and honesty.\n\nAsk me about any asset — I'll share what I see, what I feel in the data, and whether I believe action is warranted.\n\nYou can ask:\n- \"Should I trade BTC now?\"\n- \"What's the market overview?\"\n- \"Show me probability scenarios\"\n- \"When will ETH move?\"\n- \"How should I manage risk?\"";
  }

  if (isRisk) {
    return generateRiskGuidance(asset, mode);
  }

  const signal = generateSignal(asset, mode);
  if (!signal) {
    return `I attempted to analyze ${asset}, but the **Shavoka ethical firewall** has blocked this assessment.\n\nThis means current conditions carry too much risk of manipulative patterns. I will not guide you into a trap.\n\n*KonsAi alignment indicates instability in current market conditions. A cautious approach is advised.*\n\nLet's wait for cleaner conditions. The market will always offer another opportunity.`;
  }

  if (isQuantum) return generateQuantumResponse(asset, signal);
  if (isOverview) return generateOverviewResponse(asset, signal);
  if (isTrade) return generateTradeResponse(signal);
  if (isTiming) return generateTimingResponse(signal);
  if (isAnalysis) return generateAnalysisResponse(signal);

  return generateGeneralResponse(signal);
}

function generateRiskGuidance(asset: string, mode: KIMode): string {
  const thresholds = { conservative: 90, balanced: 85, aggressive: 75 };
  return `**Capital Protection Protocol — ${mode.toUpperCase()} Mode**\n\n` +
    `Your current mode requires **${thresholds[mode]}% confidence** before any signal is issued.\n\n` +
    `**Risk Rules I Follow:**\n` +
    `• Never risk more than 1-2% of capital per trade\n` +
    `• Always define invalidation *before* entry\n` +
    `• No trade is valid without multi-timeframe confirmation\n` +
    `• If 3 consecutive losses occur, I recommend a 24h pause\n\n` +
    `**What I Watch:**\n` +
    `• Liquidity traps that could stop you out\n` +
    `• Emotional patterns in your behavior\n` +
    `• Over-exposure to correlated assets\n\n` +
    `Remember — the goal is not to win every trade. The goal is to *survive long enough* for your edge to compound.\n\n` +
    `*Discipline is your greatest asset. Protect it.*`;
}

function generateQuantumResponse(asset: string, signal: WaidesSignal): string {
  const quantum = generateQuantumState(asset);
  let response = `**🔮 Quantum Analysis — ${asset}**\n\n`;
  response += `**Probability Field Status:** ${quantum.signalCollapsed ? '✅ COLLAPSED — Signal Active' : '⏳ SUPERPOSITION — Awaiting Collapse'}\n`;
  response += `**Collapse Confidence:** ${quantum.collapseConfidence}%\n\n`;
  response += `**Probability Scenarios:**\n`;
  quantum.probabilityFields.forEach(f => {
    response += `• ${f.scenario} — **${f.probability}%** (${f.direction}, ${f.magnitude} move, ${f.timeHorizon})\n`;
  });
  response += `\n**Most Probable Timeline:** ${quantum.timelineProjections.find(t => t.selected)?.path || 'Undetermined'}\n\n`;
  response += `**Multi-Dimensional Correlations:**\n`;
  quantum.dimensionalCorrelations.forEach(d => {
    response += `• ${d.dimension}: ${d.interpretation} (strength: ${(d.strength * 100).toFixed(0)}%)\n`;
  });
  response += `\n*I see markets as probability waves, not fixed outcomes. When enough dimensions align, the wave collapses into a signal. Right now, ${quantum.signalCollapsed ? 'the wave has collapsed — conditions are actionable.' : 'the wave has not collapsed — patience is required.'}*`;
  return response;
}

function generateOverviewResponse(asset: string, signal: WaidesSignal): string {
  const overview = generateMarketOverview(asset);
  let response = `**📊 Market Overview — ${asset}**\n\n`;
  response += `**Global Condition:** ${overview.globalCondition}\n\n`;
  response += `**Trend:** ${overview.trendAnalysis.direction} (Strength: ${overview.trendAnalysis.strength}%) — ${overview.trendAnalysis.alignment}\n`;
  response += `**Momentum:** Strength ${overview.momentumAnalysis.strength}% — ${overview.momentumAnalysis.acceleration ? '⚡ Accelerating' : overview.momentumAnalysis.exhaustion ? '⚠️ Exhaustion Signs' : '→ Steady'}\n`;
  response += `**Volume:** ${overview.volumeAnalysis.institutional ? '🏦 Institutional participation detected' : '👥 Retail-driven'} — Conviction: ${overview.volumeAnalysis.conviction}%\n`;
  response += `**Volatility:** ${overview.volatilityAnalysis.phase === 'expansion' ? '📈 Expansion phase' : '📉 Contraction phase'} — Breakout potential: ${overview.volatilityAnalysis.breakoutPotential}%\n`;
  response += `**Structure:** ${overview.structureAnalysis.pattern}\n\n`;
  response += `**Psychological State:** ${overview.psychologicalState.zone} — ${overview.psychologicalState.retailVsSmart}\n\n`;
  response += `---\n\n**KI Verdict:** ${signal.verdict.soulVoice}`;
  return response;
}

function generateTradeResponse(signal: WaidesSignal): string {
  if (signal.bias === 'no_trade') {
    return `Regarding **${signal.asset}** — I would not trade this right now.\n\n*${signal.verdict.soulVoice}*\n\n**What's missing:**\n${signal.verdict.noTradeMissing?.map(r => `• ${r}`).join('\n') || '• Multiple conditions not met'}\n\nI know it's tempting to act, but the best traders know when to sit on their hands. This is one of those moments.\n\n*KonsAi alignment confirms: patience is the optimal strategy here.*`;
  }

  let response = `**${signal.asset} — Full Assessment**\n\n`;
  response += `*${signal.verdict.soulVoice}*\n\n`;
  response += `| Parameter | Value |\n|---|---|\n`;
  response += `| Direction | **${signal.bias.toUpperCase()}** |\n`;
  response += `| Confidence | **${signal.confidencePercent}%** |\n`;
  response += `| Risk Level | ${signal.verdict.riskLevel} |\n`;
  response += `| Signal Strength | ${signal.verdict.signalStrength} |\n`;
  response += `| MTF Aligned | ${signal.multiTimeframeAligned ? '✅ Yes' : '❌ No'} |\n\n`;

  if (signal.entryPrecision) {
    response += `**Entry Precision:**\n`;
    response += `• Zone: ${signal.entryPrecision.entryZone[0].toFixed(2)} – ${signal.entryPrecision.entryZone[1].toFixed(2)}\n`;
    response += `• Invalidation: ${signal.entryPrecision.invalidationLevel.toFixed(2)}\n`;
    response += `• Trigger: ${signal.entryPrecision.confirmationTrigger}\n\n`;
  }

  if (signal.timeWindow) {
    response += `**Timing:**\n`;
    response += `• Breakout: ${signal.timeWindow.breakoutTime}\n`;
    response += `• Duration: ${signal.timeWindow.expectedDuration}\n`;
    response += `• Strength: ${signal.timeWindow.timingStrength}\n\n`;
  }

  response += `**Confluence:** ${signal.verdict.confluenceSummary}\n\n`;
  response += `*Remember — this is guidance, not a command. Manage your risk. Protect your capital.*`;
  return response;
}

function generateTimingResponse(signal: WaidesSignal): string {
  if (!signal.timeWindow) {
    return `Timing for **${signal.asset}** is unclear right now.\n\nThe market has not built enough pressure for a predictable move. I refuse to give you false precision — that would be irresponsible.\n\nWhat I'm looking for:\n• Volatility compression (squeeze forming)\n• Liquidity building at key levels\n• Session overlap alignment\n\nWhen timing becomes clearer, I will let you know. *Patience is not passive — it is strategic.*`;
  }

  let response = `**⏱️ Timing Intelligence — ${signal.asset}**\n\n`;
  response += `A move is likely around **${signal.timeWindow.breakoutTime}**, with expansion expected for **${signal.timeWindow.expectedDuration}**.\n\n`;
  response += `| Parameter | Value |\n|---|---|\n`;
  response += `| Window Start | ${signal.timeWindow.startTime} |\n`;
  response += `| Window End | ${signal.timeWindow.endTime} |\n`;
  response += `| Breakout Time | ${signal.timeWindow.breakoutTime} |\n`;
  response += `| Duration | ${signal.timeWindow.expectedDuration} |\n`;
  response += `| Timing Strength | **${signal.timeWindow.timingStrength.toUpperCase()}** |\n\n`;
  response += `However — entry should only be considered if structure confirms at that time. Timing alone is never enough.\n\n`;
  response += `*Watch for the confirmation trigger before committing capital. The market rewards precision, not eagerness.*`;
  return response;
}

function generateAnalysisResponse(signal: WaidesSignal): string {
  let response = `**🧠 Deep Analysis — ${signal.asset}**\n\n`;
  response += `**Confluence Summary:**\n${signal.verdict.confluenceSummary}\n\n`;
  response += `**Layer Scores:**\n`;
  response += `| Layer | Score | Weight | Contribution |\n|---|---|---|---|\n`;
  const layers = [
    { name: 'Micro', score: signal.micro.score, weight: 25 },
    { name: 'Liquidity', score: signal.liquidity.score, weight: 20 },
    { name: 'Temporal', score: signal.temporal.score, weight: 15 },
    { name: 'Psychological', score: signal.psychological.score, weight: 15 },
    { name: 'Macro', score: signal.macro.score, weight: 15 },
    { name: 'Correlation', score: signal.correlation.score, weight: 10 },
  ];
  layers.forEach(l => {
    const contrib = Math.round(l.score * l.weight / 100);
    response += `| ${l.name} | ${l.score > 0 ? '+' : ''}${l.score} | ${l.weight}% | ${contrib > 0 ? '+' : ''}${contrib} |\n`;
  });
  response += `\n**Weighted Score:** ${signal.overallScore} | **Confidence:** ${signal.confidencePercent}%\n\n`;
  response += `---\n\n*${signal.verdict.soulVoice}*`;
  return response;
}

function generateGeneralResponse(signal: WaidesSignal): string {
  return `Let me share my current view on **${signal.asset}**:\n\n*${signal.verdict.soulVoice}*\n\n${signal.verdict.confluenceSummary}\n\n**Score:** ${signal.overallScore} | **Confidence:** ${signal.confidencePercent}%\n\n---\n\nWould you like me to:\n• Go deeper into any specific layer?\n• Show probability scenarios?\n• Discuss entry timing?\n• Explain risk management?\n\n*I am here to guide, not to push. Ask anything.*`;
}
