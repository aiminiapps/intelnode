const BASE_URL = "https://api.dexscreener.com";

export async function searchTokens(query) {
  const res = await fetch(`${BASE_URL}/latest/dex/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("DexScreener search failed");
  const data = await res.json();
  return data.pairs || [];
}

export async function getTokenPairs(tokenAddress) {
  const res = await fetch(`${BASE_URL}/latest/dex/search?q=${encodeURIComponent(tokenAddress)}`);
  if (!res.ok) throw new Error("DexScreener token lookup failed");
  const data = await res.json();
  return data.pairs || [];
}

export async function getTrendingTokens() {
  const res = await fetch(`${BASE_URL}/token-boosts/latest/v1`);
  if (!res.ok) throw new Error("DexScreener trending failed");
  const data = await res.json();
  return data || [];
}

export async function getTopBoostedTokens() {
  const res = await fetch(`${BASE_URL}/token-boosts/top/v1`);
  if (!res.ok) throw new Error("DexScreener top boosts failed");
  const data = await res.json();
  return data || [];
}

export async function getTokenProfiles() {
  const res = await fetch(`${BASE_URL}/token-profiles/latest/v1`);
  if (!res.ok) throw new Error("DexScreener profiles failed");
  const data = await res.json();
  return data || [];
}

// Calculate an Alpha Score from DexScreener pair data
export function calculateAlphaScore(pair) {
  if (!pair) return 0;
  let score = 5; // base

  // Liquidity scoring (higher = better)
  const liq = pair.liquidity?.usd || 0;
  if (liq > 1000000) score += 1.5;
  else if (liq > 500000) score += 1;
  else if (liq > 100000) score += 0.5;
  else if (liq < 10000) score -= 1;

  // Volume to liquidity ratio (healthy trading = good)
  const vol = pair.volume?.h24 || 0;
  if (liq > 0) {
    const ratio = vol / liq;
    if (ratio > 2) score += 1;
    else if (ratio > 0.5) score += 0.5;
    else if (ratio < 0.1) score -= 0.5;
  }

  // Transaction count (more activity = better)
  const buys = pair.txns?.h24?.buys || 0;
  const sells = pair.txns?.h24?.sells || 0;
  const totalTxns = buys + sells;
  if (totalTxns > 1000) score += 1;
  else if (totalTxns > 500) score += 0.5;
  else if (totalTxns < 50) score -= 0.5;

  // Buy/sell ratio (more buys = bullish)
  if (buys + sells > 0) {
    const buyRatio = buys / (buys + sells);
    if (buyRatio > 0.6) score += 0.5;
    else if (buyRatio < 0.35) score -= 0.5;
  }

  // Price momentum
  const priceChange = pair.priceChange?.h24 || 0;
  if (priceChange > 50) score += 0.5;
  else if (priceChange > 10) score += 0.3;
  else if (priceChange < -30) score -= 0.5;

  // FDV scoring
  const fdv = pair.fdv || 0;
  if (fdv > 0 && fdv < 10000000) score += 0.5; // early stage gems
  if (fdv > 100000000) score -= 0.3; // already big

  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}

// Format a DexScreener pair into a clean token object
export function formatPairData(pair) {
  if (!pair) return null;
  return {
    name: pair.baseToken?.name || "Unknown",
    symbol: pair.baseToken?.symbol || "???",
    address: pair.baseToken?.address || "",
    chain: pair.chainId || "unknown",
    dex: pair.dexId || "unknown",
    pairAddress: pair.pairAddress || "",
    price: pair.priceUsd ? `$${parseFloat(pair.priceUsd).toFixed(pair.priceUsd < 0.01 ? 8 : pair.priceUsd < 1 ? 4 : 2)}` : "N/A",
    priceRaw: parseFloat(pair.priceUsd || 0),
    priceChange5m: pair.priceChange?.m5 || 0,
    priceChange1h: pair.priceChange?.h1 || 0,
    priceChange6h: pair.priceChange?.h6 || 0,
    priceChange24h: pair.priceChange?.h24 || 0,
    volume24h: pair.volume?.h24 || 0,
    volume6h: pair.volume?.h6 || 0,
    volume1h: pair.volume?.h1 || 0,
    liquidity: pair.liquidity?.usd || 0,
    fdv: pair.fdv || 0,
    marketCap: pair.marketCap || 0,
    buys24h: pair.txns?.h24?.buys || 0,
    sells24h: pair.txns?.h24?.sells || 0,
    buys1h: pair.txns?.h1?.buys || 0,
    sells1h: pair.txns?.h1?.sells || 0,
    pairCreatedAt: pair.pairCreatedAt || null,
    imageUrl: pair.info?.imageUrl || null,
    websites: pair.info?.websites || [],
    socials: pair.info?.socials || [],
    boosts: pair.boosts?.active || 0,
    url: pair.url || `https://dexscreener.com/${pair.chainId}/${pair.pairAddress}`,
    alphaScore: calculateAlphaScore(pair),
    positive: (pair.priceChange?.h24 || 0) >= 0,
  };
}

// Format currency values nicely
export function formatCurrency(value) {
  if (!value || value === 0) return "$0";
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatNumber(value) {
  if (!value || value === 0) return "0";
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString();
}

export function timeAgo(timestamp) {
  if (!timestamp) return "Unknown";
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getChainLabel(chainId) {
  const chains = {
    ethereum: "ETH", solana: "SOL", bsc: "BSC", base: "BASE",
    arbitrum: "ARB", polygon: "MATIC", avalanche: "AVAX", optimism: "OP",
    fantom: "FTM", cronos: "CRO", sui: "SUI", ton: "TON",
  };
  return chains[chainId] || chainId?.toUpperCase() || "???";
}
