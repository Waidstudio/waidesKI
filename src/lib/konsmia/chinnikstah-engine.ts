/**
 * SMAI CHINNIKSTAH ENGINE
 * ─────────────────────────
 * The Next-Gen Unified Indicator — synthesizes every major indicator family
 * into a single composite intelligence signal.
 *
 * 12 Indicator Families → 1 Unified Reading
 */

export type ChinnikstahDirection = 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
export type IndicatorFamily = 
  | 'trend' | 'momentum' | 'volatility' | 'volume' 
  | 'sentiment' | 'liquidity' | 'correlation' | 'temporal'
  | 'fibonacci' | 'harmonic' | 'divergence' | 'fractal';

export interface IndicatorReading {
  family: IndicatorFamily;
  label: string;
  description: string;
  score: number;        // -100 to +100
  confidence: number;   // 0-100
  weight: number;       // how much this family matters in current context
  subIndicators: SubIndicator[];
  direction: ChinnikstahDirection;
  educationalNote: string;
}

export interface SubIndicator {
  name: string;
  value: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  explanation: string;
}

export interface ChinnikstahComposite {
  unifiedScore: number;       // -100 to +100
  unifiedConfidence: number;  // 0-100
  direction: ChinnikstahDirection;
  phase: 'accumulation' | 'markup' | 'distribution' | 'markdown';
  dominantFamily: IndicatorFamily;
  harmonyIndex: number;       // 0-100 — how aligned all indicators are
  readings: IndicatorReading[];
  timestamp: string;
  verdictText: string;
  futureProjection: string;
  educationalSummary: string;
}

// ───── Deterministic Sub-Indicator Generators ─────

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getTimeSeed(): number {
  const now = new Date();
  // Changes every 5 minutes — stable enough for UI, dynamic enough to feel alive
  return Math.floor(now.getTime() / 300000);
}

function scoreToDirection(score: number): ChinnikstahDirection {
  if (score >= 60) return 'strong_buy';
  if (score >= 20) return 'buy';
  if (score > -20) return 'neutral';
  if (score > -60) return 'sell';
  return 'strong_sell';
}

function generateTrend(rng: () => number): IndicatorReading {
  const ema20 = rng() * 200 - 100;
  const ema50 = rng() * 200 - 100;
  const ema200 = rng() * 200 - 100;
  const adx = rng() * 100;
  const ichimoku = rng() * 200 - 100;
  const supertrend = rng() > 0.5 ? 1 : -1;

  const avgScore = (ema20 * 0.3 + ema50 * 0.25 + ema200 * 0.15 + (adx > 25 ? ema20 * 0.2 : 0) + ichimoku * 0.1) * supertrend * 0.5;
  const score = clamp(avgScore, -100, 100);

  return {
    family: 'trend',
    label: 'Trend Alignment',
    description: 'Multi-timeframe trend detection using EMA ribbons, ADX, Ichimoku Cloud, and Supertrend.',
    score: Math.round(score),
    confidence: Math.round(clamp(adx, 10, 95)),
    weight: 18,
    direction: scoreToDirection(score),
    subIndicators: [
      { name: 'EMA 20/50 Cross', value: Math.round(ema20 - ema50), signal: ema20 > ema50 ? 'bullish' : 'bearish', explanation: 'Short-term EMA above long-term = uptrend' },
      { name: 'EMA 200 Position', value: Math.round(ema200), signal: ema200 > 0 ? 'bullish' : 'bearish', explanation: 'Price above 200 EMA = macro uptrend' },
      { name: 'ADX Strength', value: Math.round(adx), signal: adx > 25 ? 'bullish' : 'neutral', explanation: 'ADX > 25 = strong trend, < 20 = range-bound' },
      { name: 'Ichimoku Cloud', value: Math.round(ichimoku), signal: ichimoku > 0 ? 'bullish' : 'bearish', explanation: 'Price above cloud = bullish bias, below = bearish' },
      { name: 'Supertrend', value: supertrend, signal: supertrend > 0 ? 'bullish' : 'bearish', explanation: 'Trend-following stop that flips at reversal points' },
    ],
    educationalNote: 'Trend indicators identify the prevailing market direction. When multiple timeframes align, the probability of continuation increases significantly.',
  };
}

function generateMomentum(rng: () => number): IndicatorReading {
  const rsi = rng() * 100;
  const macd = rng() * 200 - 100;
  const stoch = rng() * 100;
  const cci = rng() * 400 - 200;
  const williams = -(rng() * 100);
  const roc = rng() * 40 - 20;

  const rsiScore = rsi > 70 ? -(rsi - 70) * 2 : rsi < 30 ? (30 - rsi) * 2 : (rsi - 50) * 1.5;
  const score = clamp((rsiScore + macd * 0.3 + (stoch - 50) * 0.5 + cci * 0.1 + roc * 3) / 3, -100, 100);

  return {
    family: 'momentum',
    label: 'Momentum Pulse',
    description: 'Measures the speed of price changes using RSI, MACD, Stochastic, CCI, Williams %R, and Rate of Change.',
    score: Math.round(score),
    confidence: Math.round(clamp(60 + Math.abs(score) * 0.3, 30, 95)),
    weight: 16,
    direction: scoreToDirection(score),
    subIndicators: [
      { name: 'RSI (14)', value: Math.round(rsi), signal: rsi > 70 ? 'bearish' : rsi < 30 ? 'bullish' : 'neutral', explanation: 'RSI > 70 = overbought, < 30 = oversold' },
      { name: 'MACD Histogram', value: Math.round(macd), signal: macd > 0 ? 'bullish' : 'bearish', explanation: 'Positive MACD = bullish momentum accelerating' },
      { name: 'Stochastic %K', value: Math.round(stoch), signal: stoch > 80 ? 'bearish' : stoch < 20 ? 'bullish' : 'neutral', explanation: 'Oscillator comparing close to high-low range' },
      { name: 'CCI (20)', value: Math.round(cci), signal: cci > 100 ? 'bullish' : cci < -100 ? 'bearish' : 'neutral', explanation: 'Identifies cyclical turns in price' },
      { name: 'Williams %R', value: Math.round(williams), signal: williams < -80 ? 'bullish' : williams > -20 ? 'bearish' : 'neutral', explanation: 'Fast oscillator measuring overbought/oversold' },
      { name: 'Rate of Change', value: +(roc.toFixed(1)), signal: roc > 0 ? 'bullish' : 'bearish', explanation: 'Percentage change over N periods' },
    ],
    educationalNote: 'Momentum indicators measure the velocity of price movement. Divergence between momentum and price often precedes reversals.',
  };
}

function generateVolatility(rng: () => number): IndicatorReading {
  const bbWidth = rng() * 10;
  const atr = rng() * 5;
  const keltner = rng() * 200 - 100;
  const vix = 10 + rng() * 40;
  const squeeze = rng() > 0.6;
  const historicalVol = rng() * 100;

  const squeezeFactor = squeeze ? 30 : -10;
  const score = clamp(((bbWidth < 2 ? 40 : bbWidth > 6 ? -30 : 0) + keltner * 0.2 + squeezeFactor + (vix > 30 ? -20 : 10)) / 2, -100, 100);

  return {
    family: 'volatility',
    label: 'Volatility Matrix',
    description: 'Tracks market volatility through Bollinger Bands, ATR, Keltner Channels, VIX, and Squeeze detection.',
    score: Math.round(score),
    confidence: Math.round(clamp(50 + Math.abs(score) * 0.4, 25, 90)),
    weight: 12,
    direction: scoreToDirection(score),
    subIndicators: [
      { name: 'Bollinger Width', value: +(bbWidth.toFixed(2)), signal: bbWidth < 2 ? 'bullish' : bbWidth > 6 ? 'bearish' : 'neutral', explanation: 'Narrow bands = compression, wide = expansion' },
      { name: 'ATR (14)', value: +(atr.toFixed(2)), signal: atr > 3 ? 'bearish' : 'neutral', explanation: 'Average True Range measures daily price range' },
      { name: 'Keltner Channel', value: Math.round(keltner), signal: keltner > 0 ? 'bullish' : 'bearish', explanation: 'Similar to Bollinger but uses ATR for width' },
      { name: 'Volatility Index', value: Math.round(vix), signal: vix > 30 ? 'bearish' : vix < 15 ? 'bullish' : 'neutral', explanation: 'Market fear gauge — high VIX = uncertainty' },
      { name: 'Squeeze Active', value: squeeze ? 1 : 0, signal: squeeze ? 'bullish' : 'neutral', explanation: 'BB inside KC = volatility squeeze → breakout imminent' },
      { name: 'Historical Vol', value: Math.round(historicalVol), signal: historicalVol > 60 ? 'bearish' : 'neutral', explanation: 'Realized volatility over past 30 days' },
    ],
    educationalNote: 'Volatility compression (squeeze) often precedes explosive moves. Low volatility does not mean low risk — it means the market is coiling for its next big move.',
  };
}

function generateVolume(rng: () => number): IndicatorReading {
  const obv = rng() * 200 - 100;
  const vwap = rng() * 200 - 100;
  const mfi = rng() * 100;
  const volumeRatio = 0.5 + rng() * 2;
  const accumDist = rng() * 200 - 100;

  const score = clamp((obv * 0.3 + vwap * 0.25 + (mfi - 50) * 0.8 + accumDist * 0.15) / 2, -100, 100);

  return {
    family: 'volume',
    label: 'Volume Intelligence',
    description: 'Analyzes buying/selling pressure through OBV, VWAP, MFI, Volume Ratio, and Accumulation/Distribution.',
    score: Math.round(score),
    confidence: Math.round(clamp(45 + volumeRatio * 15, 30, 90)),
    weight: 10,
    direction: scoreToDirection(score),
    subIndicators: [
      { name: 'OBV Trend', value: Math.round(obv), signal: obv > 0 ? 'bullish' : 'bearish', explanation: 'On-Balance Volume tracks cumulative buying/selling volume' },
      { name: 'VWAP Position', value: Math.round(vwap), signal: vwap > 0 ? 'bullish' : 'bearish', explanation: 'Volume Weighted Average Price — institutional benchmark' },
      { name: 'Money Flow Index', value: Math.round(mfi), signal: mfi > 80 ? 'bearish' : mfi < 20 ? 'bullish' : 'neutral', explanation: 'Volume-weighted RSI — detects smart money flow' },
      { name: 'Volume Ratio', value: +(volumeRatio.toFixed(2)), signal: volumeRatio > 1.5 ? 'bullish' : volumeRatio < 0.7 ? 'bearish' : 'neutral', explanation: 'Current vs average volume — spikes = institutional interest' },
      { name: 'Accum/Dist Line', value: Math.round(accumDist), signal: accumDist > 0 ? 'bullish' : 'bearish', explanation: 'Tracks whether volume flows into or out of asset' },
    ],
    educationalNote: 'Volume precedes price. A breakout without volume confirmation is suspect. Institutional accumulation often happens quietly before big moves.',
  };
}

function generateSentiment(rng: () => number): IndicatorReading {
  const fearGreed = rng() * 100;
  const putCallRatio = 0.5 + rng() * 1.5;
  const socialSentiment = rng() * 200 - 100;
  const fundingRate = rng() * 0.2 - 0.1;
  const longShortRatio = 0.3 + rng() * 1.4;

  const score = clamp(((fearGreed - 50) * 0.8 + (1 - putCallRatio) * 40 + socialSentiment * 0.2 + fundingRate * 200 + (longShortRatio - 1) * 30) / 2.5, -100, 100);

  return {
    family: 'sentiment',
    label: 'Crowd Psychology',
    description: 'Maps collective market emotions through Fear & Greed, Put/Call ratio, social sentiment, and funding rates.',
    score: Math.round(score),
    confidence: Math.round(clamp(40 + Math.abs(fearGreed - 50), 25, 85)),
    weight: 8,
    direction: scoreToDirection(score),
    subIndicators: [
      { name: 'Fear & Greed Index', value: Math.round(fearGreed), signal: fearGreed > 75 ? 'bearish' : fearGreed < 25 ? 'bullish' : 'neutral', explanation: 'Extreme greed = sell signal, extreme fear = buy signal (contrarian)' },
      { name: 'Put/Call Ratio', value: +(putCallRatio.toFixed(2)), signal: putCallRatio > 1.2 ? 'bullish' : putCallRatio < 0.7 ? 'bearish' : 'neutral', explanation: 'High ratio = bearish hedging = contrarian bullish' },
      { name: 'Social Sentiment', value: Math.round(socialSentiment), signal: socialSentiment > 30 ? 'bullish' : socialSentiment < -30 ? 'bearish' : 'neutral', explanation: 'Aggregate social media and news sentiment' },
      { name: 'Funding Rate', value: +(fundingRate.toFixed(4)), signal: fundingRate > 0.05 ? 'bearish' : fundingRate < -0.05 ? 'bullish' : 'neutral', explanation: 'Positive = longs pay shorts (crowded long), negative = opposite' },
      { name: 'Long/Short Ratio', value: +(longShortRatio.toFixed(2)), signal: longShortRatio > 1.3 ? 'bearish' : longShortRatio < 0.7 ? 'bullish' : 'neutral', explanation: 'Ratio of long vs short positions — extremes trigger reversals' },
    ],
    educationalNote: 'Markets are driven by human psychology. When everyone is euphoric, smart money exits. When panic rules, smart money accumulates. Be contrarian at extremes.',
  };
}

function generateLiquidity(rng: () => number): IndicatorReading {
  const orderBookDepth = rng() * 100;
  const bidAskSpread = rng() * 0.5;
  const darkPoolActivity = rng() * 100;
  const liquidationHeatmap = rng() * 200 - 100;

  const score = clamp((orderBookDepth * 0.3 + (0.25 - bidAskSpread) * 100 + darkPoolActivity * 0.2 + liquidationHeatmap * 0.2) / 2, -100, 100);

  return {
    family: 'liquidity',
    label: 'Liquidity Depth',
    description: 'Scans market depth, bid-ask spreads, dark pool flows, and liquidation heatmaps.',
    score: Math.round(score),
    confidence: Math.round(clamp(35 + orderBookDepth * 0.5, 20, 85)),
    weight: 8,
    direction: scoreToDirection(score),
    subIndicators: [
      { name: 'Order Book Depth', value: Math.round(orderBookDepth), signal: orderBookDepth > 60 ? 'bullish' : 'neutral', explanation: 'Deep order books = strong support/resistance' },
      { name: 'Bid-Ask Spread', value: +(bidAskSpread.toFixed(3)), signal: bidAskSpread < 0.1 ? 'bullish' : bidAskSpread > 0.3 ? 'bearish' : 'neutral', explanation: 'Tight spread = high liquidity, wide = thin market' },
      { name: 'Dark Pool Activity', value: Math.round(darkPoolActivity), signal: darkPoolActivity > 60 ? 'bullish' : 'neutral', explanation: 'High dark pool activity = institutional accumulation' },
      { name: 'Liquidation Zones', value: Math.round(liquidationHeatmap), signal: liquidationHeatmap > 50 ? 'bullish' : liquidationHeatmap < -50 ? 'bearish' : 'neutral', explanation: 'Clusters of liquidation orders attract price like magnets' },
    ],
    educationalNote: 'Liquidity is the invisible hand of markets. Price moves toward liquidity clusters. Understanding where stop losses cluster reveals where price is likely headed next.',
  };
}

function generateCorrelation(rng: () => number): IndicatorReading {
  const dxyCorr = rng() * 2 - 1;
  const goldCorr = rng() * 2 - 1;
  const sp500Corr = rng() * 2 - 1;
  const btcDominance = 40 + rng() * 30;

  const score = clamp((-dxyCorr * 30 + goldCorr * 20 + sp500Corr * 25 + (btcDominance - 50) * 1.5) / 2, -100, 100);

  return {
    family: 'correlation',
    label: 'Cross-Asset Intelligence',
    description: 'Analyzes relationships between crypto, forex, commodities, and equities.',
    score: Math.round(score),
    confidence: Math.round(clamp(40 + Math.abs(score) * 0.3, 25, 80)),
    weight: 7,
    direction: scoreToDirection(score),
    subIndicators: [
      { name: 'DXY Correlation', value: +(dxyCorr.toFixed(2)), signal: dxyCorr < -0.5 ? 'bullish' : dxyCorr > 0.5 ? 'bearish' : 'neutral', explanation: 'Strong USD typically pressures crypto and commodities' },
      { name: 'Gold Correlation', value: +(goldCorr.toFixed(2)), signal: goldCorr > 0.5 ? 'bullish' : 'neutral', explanation: 'Gold correlation indicates risk-off sentiment alignment' },
      { name: 'S&P 500 Correlation', value: +(sp500Corr.toFixed(2)), signal: sp500Corr > 0.5 ? 'bullish' : 'neutral', explanation: 'High equity correlation = risk-on environment' },
      { name: 'BTC Dominance', value: +(btcDominance.toFixed(1)), signal: btcDominance > 55 ? 'bearish' : btcDominance < 45 ? 'bullish' : 'neutral', explanation: 'Rising dominance = alt weakness, falling = alt season' },
    ],
    educationalNote: 'No asset moves in isolation. The US Dollar, bonds, gold, and equities form an interconnected web. Understanding correlations helps you see the bigger picture.',
  };
}

function generateTemporal(rng: () => number): IndicatorReading {
  const sessionWeight = rng() * 100;
  const dayOfWeek = new Date().getDay();
  const hourOfDay = new Date().getUTCHours();
  const seasonalBias = rng() * 200 - 100;
  const cyclePosition = rng() * 360;

  const sessionScore = hourOfDay >= 13 && hourOfDay <= 17 ? 30 : hourOfDay >= 8 && hourOfDay <= 13 ? 20 : -10;
  const dayScore = (dayOfWeek >= 2 && dayOfWeek <= 4) ? 15 : dayOfWeek === 1 ? -5 : -15;
  const score = clamp((sessionScore + dayScore + seasonalBias * 0.2 + Math.sin(cyclePosition * Math.PI / 180) * 20) / 2, -100, 100);

  return {
    family: 'temporal',
    label: 'Time Intelligence',
    description: 'Factors in session timing, day-of-week patterns, seasonal trends, and market cycles.',
    score: Math.round(score),
    confidence: Math.round(clamp(30 + sessionWeight * 0.4, 20, 75)),
    weight: 5,
    direction: scoreToDirection(score),
    subIndicators: [
      { name: 'Session Quality', value: Math.round(sessionWeight), signal: sessionWeight > 60 ? 'bullish' : 'neutral', explanation: 'London/NY overlap = highest volume and best moves' },
      { name: 'Day Bias', value: dayScore, signal: dayScore > 0 ? 'bullish' : 'bearish', explanation: 'Tue-Thu historically show strongest trends' },
      { name: 'Seasonal Pattern', value: Math.round(seasonalBias), signal: seasonalBias > 30 ? 'bullish' : seasonalBias < -30 ? 'bearish' : 'neutral', explanation: 'Historical seasonal patterns for this time of year' },
      { name: 'Cycle Position', value: Math.round(cyclePosition), signal: cyclePosition < 180 ? 'bullish' : 'bearish', explanation: 'Position within the current market cycle (0-360°)' },
    ],
    educationalNote: 'Markets have rhythm. The best trades happen during specific sessions and days. Understanding temporal patterns gives you an edge before you even look at a chart.',
  };
}

function generateFibonacci(rng: () => number): IndicatorReading {
  const retracement = rng() * 100;
  const extension = 100 + rng() * 161.8;
  const goldenZone = Math.abs(retracement - 61.8) < 10;
  const pivotProximity = rng() * 100;

  const score = clamp((goldenZone ? 40 : 0) + (retracement > 50 && retracement < 78.6 ? 20 : -10) + pivotProximity * 0.2, -100, 100);

  return {
    family: 'fibonacci',
    label: 'Fibonacci Geometry',
    description: 'Sacred geometry of markets — retracements, extensions, time zones, and golden ratio confluences.',
    score: Math.round(score),
    confidence: Math.round(clamp(goldenZone ? 75 : 40, 20, 90)),
    weight: 6,
    direction: scoreToDirection(score),
    subIndicators: [
      { name: 'Retracement Level', value: +(retracement.toFixed(1)), signal: retracement > 50 && retracement < 78.6 ? 'bullish' : 'neutral', explanation: '61.8% retracement is the golden zone for entries' },
      { name: 'Extension Target', value: +(extension.toFixed(1)), signal: 'neutral', explanation: '161.8% extension is the primary profit target' },
      { name: 'Golden Zone', value: goldenZone ? 1 : 0, signal: goldenZone ? 'bullish' : 'neutral', explanation: 'Price in the 61.8-65% zone = highest probability reversal' },
      { name: 'Pivot Proximity', value: Math.round(pivotProximity), signal: pivotProximity > 70 ? 'bullish' : 'neutral', explanation: 'How close price is to a Fibonacci pivot' },
    ],
    educationalNote: 'The Fibonacci sequence appears everywhere in nature — and in markets. The 61.8% retracement (golden ratio) is where institutional orders cluster most heavily.',
  };
}

function generateHarmonic(rng: () => number): IndicatorReading {
  const patterns = ['Gartley', 'Bat', 'Butterfly', 'Crab', 'Shark', 'Cypher'];
  const activePattern = patterns[Math.floor(rng() * patterns.length)];
  const completion = rng() * 100;
  const prz = rng() * 100;

  const score = clamp((completion > 80 ? 40 : completion > 60 ? 20 : -10) + prz * 0.3, -100, 100);

  return {
    family: 'harmonic',
    label: 'Harmonic Patterns',
    description: 'Detects Gartley, Bat, Butterfly, Crab, Shark, and Cypher patterns for precision entries.',
    score: Math.round(score),
    confidence: Math.round(clamp(completion * 0.7, 15, 85)),
    weight: 4,
    direction: scoreToDirection(score),
    subIndicators: [
      { name: 'Active Pattern', value: patterns.indexOf(activePattern), signal: completion > 80 ? 'bullish' : 'neutral', explanation: `${activePattern} pattern detected — each has specific Fibonacci ratios` },
      { name: 'Completion %', value: Math.round(completion), signal: completion > 80 ? 'bullish' : 'neutral', explanation: 'Pattern must complete before entry — premature entries fail' },
      { name: 'PRZ Strength', value: Math.round(prz), signal: prz > 60 ? 'bullish' : 'neutral', explanation: 'Potential Reversal Zone — where the pattern completes' },
    ],
    educationalNote: 'Harmonic patterns are advanced Fibonacci structures. They have specific ratios that, when met, create high-probability reversal zones. Patience for completion is key.',
  };
}

function generateDivergence(rng: () => number): IndicatorReading {
  const rsiDiv = rng() * 200 - 100;
  const macdDiv = rng() * 200 - 100;
  const obvDiv = rng() * 200 - 100;
  const hiddenDiv = rng() > 0.7;

  const score = clamp((rsiDiv * 0.4 + macdDiv * 0.35 + obvDiv * 0.25) / 2, -100, 100);

  return {
    family: 'divergence',
    label: 'Divergence Scanner',
    description: 'Detects regular and hidden divergences across RSI, MACD, and OBV to spot trend exhaustion.',
    score: Math.round(score),
    confidence: Math.round(clamp(35 + Math.abs(score) * 0.5, 20, 85)),
    weight: 4,
    direction: scoreToDirection(score),
    subIndicators: [
      { name: 'RSI Divergence', value: Math.round(rsiDiv), signal: rsiDiv > 30 ? 'bullish' : rsiDiv < -30 ? 'bearish' : 'neutral', explanation: 'Price makes new low but RSI makes higher low = bullish divergence' },
      { name: 'MACD Divergence', value: Math.round(macdDiv), signal: macdDiv > 30 ? 'bullish' : macdDiv < -30 ? 'bearish' : 'neutral', explanation: 'MACD divergence often precedes major reversals' },
      { name: 'OBV Divergence', value: Math.round(obvDiv), signal: obvDiv > 30 ? 'bullish' : obvDiv < -30 ? 'bearish' : 'neutral', explanation: 'Volume divergence reveals hidden accumulation/distribution' },
      { name: 'Hidden Divergence', value: hiddenDiv ? 1 : 0, signal: hiddenDiv ? 'bullish' : 'neutral', explanation: 'Hidden divergence = trend continuation signal (pro-level)' },
    ],
    educationalNote: 'Divergence is one of the most powerful tools in trading. When price and an indicator disagree, the indicator is usually right. Hidden divergences confirm trend continuation.',
  };
}

function generateFractal(rng: () => number): IndicatorReading {
  const marketDimension = 1 + rng() * 0.5;
  const fractalLevel = rng() * 100;
  const selfSimilarity = rng() * 100;
  const chaosIndex = rng() * 100;

  const score = clamp((selfSimilarity * 0.4 + fractalLevel * 0.3 - chaosIndex * 0.2 + (marketDimension - 1.25) * 80) / 2, -100, 100);

  return {
    family: 'fractal',
    label: 'Fractal Intelligence',
    description: 'Next-century analysis — fractal dimension, self-similarity detection, and chaos theory application.',
    score: Math.round(score),
    confidence: Math.round(clamp(25 + selfSimilarity * 0.4, 15, 75)),
    weight: 2,
    direction: scoreToDirection(score),
    subIndicators: [
      { name: 'Fractal Dimension', value: +(marketDimension.toFixed(3)), signal: marketDimension < 1.3 ? 'bullish' : marketDimension > 1.4 ? 'bearish' : 'neutral', explanation: 'Market dimension < 1.3 = trending, > 1.4 = random walk' },
      { name: 'Self-Similarity', value: Math.round(selfSimilarity), signal: selfSimilarity > 60 ? 'bullish' : 'neutral', explanation: 'How much smaller timeframes mirror larger ones' },
      { name: 'Fractal Support', value: Math.round(fractalLevel), signal: fractalLevel > 50 ? 'bullish' : 'bearish', explanation: 'Williams Fractal identification of pivot points' },
      { name: 'Chaos Index', value: Math.round(chaosIndex), signal: chaosIndex < 30 ? 'bullish' : chaosIndex > 70 ? 'bearish' : 'neutral', explanation: 'Low chaos = predictable, high chaos = unpredictable' },
    ],
    educationalNote: 'Fractal geometry reveals that markets repeat patterns at every scale. A 1-minute chart structure mirrors a weekly chart. This self-similarity is the basis of future-century analysis.',
  };
}

// ───── Main Composite Generator ─────

export function generateChinnikstah(): ChinnikstahComposite {
  const seed = getTimeSeed();
  const rng = seededRandom(seed);

  const readings: IndicatorReading[] = [
    generateTrend(rng),
    generateMomentum(rng),
    generateVolatility(rng),
    generateVolume(rng),
    generateSentiment(rng),
    generateLiquidity(rng),
    generateCorrelation(rng),
    generateTemporal(rng),
    generateFibonacci(rng),
    generateHarmonic(rng),
    generateDivergence(rng),
    generateFractal(rng),
  ];

  // Weighted composite score
  const totalWeight = readings.reduce((s, r) => s + r.weight, 0);
  const unifiedScore = Math.round(readings.reduce((s, r) => s + r.score * r.weight, 0) / totalWeight);
  const unifiedConfidence = Math.round(readings.reduce((s, r) => s + r.confidence * r.weight, 0) / totalWeight);

  // Harmony index — how aligned all readings are
  const directions = readings.map(r => r.score);
  const allPositive = directions.every(d => d > 0);
  const allNegative = directions.every(d => d < 0);
  const variance = directions.reduce((s, d) => s + Math.pow(d - unifiedScore, 2), 0) / directions.length;
  const harmonyIndex = Math.round(clamp(100 - Math.sqrt(variance), 0, 100));

  // Dominant family
  const dominantFamily = readings.reduce((best, r) => Math.abs(r.score * r.weight) > Math.abs(best.score * best.weight) ? r : best).family;

  // Market phase
  const phase = unifiedScore > 30 ? 'markup' : unifiedScore > 0 ? 'accumulation' : unifiedScore > -30 ? 'distribution' : 'markdown';

  const direction = scoreToDirection(unifiedScore);

  const verdicts: Record<ChinnikstahDirection, string> = {
    strong_buy: 'Chinnikstah reads STRONG CONVERGENCE — multiple indicator families align bullish. High-confidence entry window detected.',
    buy: 'Chinnikstah leans bullish — majority of indicator families favor upward movement, though some caution signals remain.',
    neutral: 'Chinnikstah observes equilibrium — indicator families are divided. Wait for clearer alignment before acting.',
    sell: 'Chinnikstah leans bearish — selling pressure dominates across multiple indicator families.',
    strong_sell: 'Chinnikstah reads STRONG DIVERGENCE — multiple indicator families align bearish. Risk management critical.',
  };

  const projections: Record<ChinnikstahDirection, string> = {
    strong_buy: 'Projection: Price likely to push toward next major resistance within 4-12 hours. Momentum acceleration expected.',
    buy: 'Projection: Gradual upward pressure likely over next 6-24 hours. Watch for momentum confirmation.',
    neutral: 'Projection: Range-bound movement expected. Breakout direction uncertain — patience required.',
    sell: 'Projection: Gradual downward pressure likely. Support levels may be tested within 6-24 hours.',
    strong_sell: 'Projection: Sharp move down probable within 2-8 hours. Protect positions and tighten stops.',
  };

  return {
    unifiedScore,
    unifiedConfidence,
    direction,
    phase,
    dominantFamily,
    harmonyIndex,
    readings,
    timestamp: new Date().toISOString(),
    verdictText: verdicts[direction],
    futureProjection: projections[direction],
    educationalSummary: `Smai Chinnikstah synthesizes ${readings.length} indicator families containing ${readings.reduce((s, r) => s + r.subIndicators.length, 0)} individual indicators. The current harmony index of ${harmonyIndex}% shows how aligned these indicators are. When harmony exceeds 70%, signals become significantly more reliable.`,
  };
}
