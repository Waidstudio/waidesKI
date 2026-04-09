import type { WaidesSignal, KIMode, MarketBias } from './types';
import { generateSignal } from './signal-engine';

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
  const isGeneral = lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('how are');

  if (isGeneral) {
    return "I am here, observing. The markets breathe constantly, and I listen. What would you like to understand? Ask me about any asset, and I will share what I see — honestly, without hype.";
  }

  const signal = generateSignal(asset, mode);

  if (!signal) {
    return `I attempted to analyze ${asset}, but the Shavoka ethical firewall has blocked this assessment. This means current conditions carry too much risk of manipulative patterns. I will not guide you into a trap. Let's wait for cleaner conditions.`;
  }

  if (isTrade) {
    return generateTradeResponse(signal);
  }

  if (isTiming) {
    return generateTimingResponse(signal);
  }

  if (isAnalysis) {
    return generateAnalysisResponse(signal);
  }

  return generateGeneralResponse(signal);
}

function generateTradeResponse(signal: WaidesSignal): string {
  if (signal.bias === 'no_trade') {
    return `Regarding ${signal.asset} — I would not trade this right now.\n\n${signal.verdict.soulVoice}\n\nWhat's missing:\n${signal.verdict.noTradeMissing?.map(r => `• ${r}`).join('\n') || '• Multiple conditions not met'}\n\nI know it's tempting to act, but the best traders know when to sit on their hands. This is one of those moments.`;
  }

  let response = `Here is my assessment of ${signal.asset}:\n\n`;
  response += `${signal.verdict.soulVoice}\n\n`;
  response += `**Direction:** ${signal.bias.toUpperCase()}\n`;
  response += `**Confidence:** ${signal.confidencePercent}%\n`;
  response += `**Risk Level:** ${signal.verdict.riskLevel}\n`;

  if (signal.entryPrecision) {
    response += `\n**Entry Zone:** ${signal.entryPrecision.entryZone[0].toFixed(2)} – ${signal.entryPrecision.entryZone[1].toFixed(2)}\n`;
    response += `**Invalidation:** ${signal.entryPrecision.invalidationLevel.toFixed(2)}\n`;
    response += `**Trigger:** ${signal.entryPrecision.confirmationTrigger}\n`;
  }

  response += `\nRemember — this is guidance, not a command. Manage your risk. Protect your capital. The market will always offer another opportunity.`;
  return response;
}

function generateTimingResponse(signal: WaidesSignal): string {
  if (!signal.timeWindow) {
    return `Timing for ${signal.asset} is unclear right now. The market has not built enough pressure for a predictable move. I refuse to give you false precision — that would be irresponsible. When timing becomes clearer, I will let you know.`;
  }

  let response = `Regarding timing for ${signal.asset}:\n\n`;
  response += `A move is likely around **${signal.timeWindow.breakoutTime}**, with expansion expected for **${signal.timeWindow.expectedDuration}**.\n\n`;
  response += `**Window:** ${signal.timeWindow.startTime} – ${signal.timeWindow.endTime}\n`;
  response += `**Timing Strength:** ${signal.timeWindow.timingStrength}\n\n`;
  response += `However — entry should only be considered if structure confirms at that time. Timing alone is never enough. Watch for the confirmation trigger before committing capital.`;
  return response;
}

function generateAnalysisResponse(signal: WaidesSignal): string {
  let response = `Here is what I see in ${signal.asset}:\n\n`;
  response += `**Confluence Summary:**\n${signal.verdict.confluenceSummary}\n\n`;
  response += `**Layer Scores:**\n`;
  response += `• Macro: ${signal.macro.score > 0 ? '+' : ''}${signal.macro.score} — ${signal.macro.globalTrend}\n`;
  response += `• Micro: ${signal.micro.score > 0 ? '+' : ''}${signal.micro.score} — ${signal.micro.priceAction}\n`;
  response += `• Psychological: ${signal.psychological.score > 0 ? '+' : ''}${signal.psychological.score} — ${signal.psychological.crowdEmotion} sentiment\n`;
  response += `• Temporal: ${signal.temporal.score > 0 ? '+' : ''}${signal.temporal.score} — ${signal.temporal.shortTermStructure}\n`;
  response += `• Liquidity: ${signal.liquidity.score > 0 ? '+' : ''}${signal.liquidity.score}\n`;
  response += `• Correlation: ${signal.correlation.score > 0 ? '+' : ''}${signal.correlation.score}\n\n`;
  response += `**Weighted Score:** ${signal.overallScore} | **Confidence:** ${signal.confidencePercent}%\n\n`;
  response += signal.verdict.soulVoice;
  return response;
}

function generateGeneralResponse(signal: WaidesSignal): string {
  return `Let me share my current view on ${signal.asset}:\n\n${signal.verdict.soulVoice}\n\n${signal.verdict.confluenceSummary}\n\nOverall Score: ${signal.overallScore} | Confidence: ${signal.confidencePercent}%\n\nWould you like me to go deeper into any specific layer, or discuss entry timing?`;
}
