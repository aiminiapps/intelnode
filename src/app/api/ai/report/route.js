import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { tokenData } = await request.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey || apiKey === "your-openrouter-api-key-here") {
      // Fallback: generate a structured report without AI
      return NextResponse.json({
        report: generateFallbackReport(tokenData),
        source: "fallback",
      });
    }

    const prompt = `You are AlphaScope, an elite AI crypto research analyst. Analyze this token data and produce a detailed research report.

TOKEN DATA:
- Name: ${tokenData.name} (${tokenData.symbol})
- Chain: ${tokenData.chain}
- Price: ${tokenData.price}
- 24h Price Change: ${tokenData.priceChange24h}%
- 1h Price Change: ${tokenData.priceChange1h}%
- 24h Volume: $${tokenData.volume24h?.toLocaleString()}
- Liquidity: $${tokenData.liquidity?.toLocaleString()}
- FDV: $${tokenData.fdv?.toLocaleString()}
- Market Cap: $${tokenData.marketCap?.toLocaleString()}
- 24h Buys: ${tokenData.buys24h}
- 24h Sells: ${tokenData.sells24h}
- Pair Created: ${tokenData.pairCreatedAt ? new Date(tokenData.pairCreatedAt).toISOString() : "Unknown"}
- DEX: ${tokenData.dex}
- Alpha Score: ${tokenData.alphaScore}/10

Provide a JSON response with exactly this structure:
{
  "summary": "2-3 sentence executive summary of the token's current state and potential",
  "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "narrative": "What narrative/sector does this token belong to and why it matters",
  "strengths": ["strength1", "strength2", "strength3"],
  "risks": ["risk1", "risk2", "risk3"],
  "liquidityAnalysis": "Detailed analysis of liquidity depth and health",
  "volumeAnalysis": "Analysis of trading volume patterns and what they indicate",
  "buyPressureAnalysis": "Analysis of buy vs sell pressure and what it signals",
  "priceAction": "Analysis of recent price movement and momentum",
  "recommendation": "STRONG_BUY|BUY|HOLD|CAUTION|AVOID with explanation",
  "keyInsights": ["insight1", "insight2", "insight3", "insight4", "insight5"]
}

Be specific, data-driven, and honest. If data suggests red flags, say so clearly.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://alphascope.app",
        "X-Title": "AlphaScope AI Analyzer",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-maverick",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter error:", errorData);
      return NextResponse.json({
        report: generateFallbackReport(tokenData),
        source: "fallback",
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let report;
    try {
      report = JSON.parse(content);
    } catch {
      report = generateFallbackReport(tokenData);
    }

    return NextResponse.json({ report, source: "ai" });
  } catch (error) {
    console.error("AI report error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

function generateFallbackReport(data) {
  const liq = data.liquidity || 0;
  const vol = data.volume24h || 0;
  const buys = data.buys24h || 0;
  const sells = data.sells24h || 0;
  const change = data.priceChange24h || 0;
  const ratio = liq > 0 ? vol / liq : 0;
  const buyRatio = buys + sells > 0 ? buys / (buys + sells) : 0.5;

  let riskLevel = "MEDIUM";
  if (liq < 50000) riskLevel = "CRITICAL";
  else if (liq < 200000) riskLevel = "HIGH";
  else if (liq > 1000000 && ratio > 0.5) riskLevel = "LOW";

  let recommendation = "HOLD";
  if (data.alphaScore >= 8) recommendation = "BUY";
  if (data.alphaScore >= 9) recommendation = "STRONG_BUY";
  if (data.alphaScore <= 5) recommendation = "CAUTION";
  if (data.alphaScore <= 3) recommendation = "AVOID";

  return {
    summary: `${data.name} (${data.symbol}) is trading at ${data.price} with ${change >= 0 ? "+" : ""}${change.toFixed(1)}% change in 24h. The token has $${(liq / 1000).toFixed(0)}K in liquidity and $${(vol / 1000).toFixed(0)}K in daily volume, resulting in an Alpha Score of ${data.alphaScore}/10.`,
    riskLevel,
    narrative: `${data.name} operates on the ${data.chain} network via ${data.dex}. Based on volume patterns and liquidity depth, this token is ${liq > 500000 ? "well-established" : "in early stages"} with a vol/liq ratio of ${ratio.toFixed(2)}x.`,
    strengths: [
      liq > 200000 ? "Healthy liquidity pool above $200K" : "Growing liquidity base",
      buyRatio > 0.55 ? `Strong buy pressure (${(buyRatio * 100).toFixed(0)}% buys)` : "Balanced trading activity",
      vol > 100000 ? `Active trading volume ($${(vol / 1000).toFixed(0)}K daily)` : "Developing trading activity",
    ],
    risks: [
      liq < 100000 ? "Low liquidity — high slippage risk" : "Market-dependent liquidity fluctuations",
      ratio > 5 ? "Unusually high volume-to-liquidity ratio (potential wash trading)" : "Standard market volatility risk",
      sells > buys ? "Sell pressure exceeds buy pressure currently" : "Normal market dynamics apply",
    ],
    liquidityAnalysis: `The token holds $${(liq / 1000).toFixed(1)}K in liquidity. ${liq > 500000 ? "This is a healthy liquidity level that supports larger trades with minimal slippage." : liq > 100000 ? "Moderate liquidity — suitable for small to medium trades." : "Low liquidity — exercise caution with trade sizes."}`,
    volumeAnalysis: `24h trading volume of $${(vol / 1000).toFixed(1)}K with a volume-to-liquidity ratio of ${ratio.toFixed(2)}x. ${ratio > 1 ? "Active trading suggests strong market interest." : "Conservative trading volume relative to pool size."}`,
    buyPressureAnalysis: `${buys} buys vs ${sells} sells in 24h (${(buyRatio * 100).toFixed(0)}% buy ratio). ${buyRatio > 0.6 ? "Strong bullish sentiment with dominant buy pressure." : buyRatio > 0.45 ? "Balanced market with slight lean toward buying." : "Bearish pressure with more sellers than buyers."}`,
    priceAction: `${change >= 0 ? "Positive" : "Negative"} momentum with ${change >= 0 ? "+" : ""}${change.toFixed(1)}% in 24h. ${Math.abs(change) > 20 ? "Significant volatility — potential opportunity or risk." : "Relatively stable price action."}`,
    recommendation: `${recommendation} — Based on liquidity depth, volume patterns, and price momentum, this token ${recommendation === "STRONG_BUY" || recommendation === "BUY" ? "shows positive signals for potential entry" : recommendation === "HOLD" ? "warrants monitoring before committing" : "carries elevated risk factors that suggest caution"}.`,
    keyInsights: [
      `Alpha Score: ${data.alphaScore}/10 based on multi-factor analysis`,
      `Vol/Liq ratio: ${ratio.toFixed(2)}x — ${ratio > 2 ? "high activity" : ratio > 0.5 ? "healthy" : "low activity"}`,
      `Buy dominance: ${(buyRatio * 100).toFixed(0)}% — ${buyRatio > 0.6 ? "bullish" : "neutral"} signal`,
      `Pair age: ${data.pairCreatedAt ? Math.floor((Date.now() - data.pairCreatedAt) / 86400000) + " days" : "Unknown"}`,
      `Risk level: ${riskLevel} — ${riskLevel === "LOW" ? "favorable conditions" : riskLevel === "MEDIUM" ? "standard caution advised" : "elevated risk factors present"}`,
    ],
  };
}
