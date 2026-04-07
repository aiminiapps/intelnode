// ===== DASHBOARD STATS =====
export const dashboardStats = [
  { label: "ASCP Balance", value: "12,450", change: "+340 today", positive: true },
  { label: "Tokens Analyzed", value: "89", change: "+7 this week", positive: true },
  { label: "Active Alerts", value: "24", change: "3 triggered", positive: false },
  { label: "Avg Alpha Score", value: "7.4", change: "+0.3 vs last week", positive: true },
];

// ===== MARKET CHART DATA =====
export const marketChartData = [
  { date: "Jan", price: 0.042, volume: 12400 },
  { date: "Feb", price: 0.058, volume: 18900 },
  { date: "Mar", price: 0.045, volume: 15300 },
  { date: "Apr", price: 0.072, volume: 24100 },
  { date: "May", price: 0.089, volume: 31500 },
  { date: "Jun", price: 0.078, volume: 27800 },
  { date: "Jul", price: 0.095, volume: 35200 },
  { date: "Aug", price: 0.112, volume: 42100 },
  { date: "Sep", price: 0.098, volume: 38400 },
  { date: "Oct", price: 0.134, volume: 51200 },
  { date: "Nov", price: 0.156, volume: 58900 },
  { date: "Dec", price: 0.189, volume: 67800 },
];

// ===== TRENDING TOKENS =====
export const trendingTokens = [
  { name: "NeuralAI", symbol: "NRAI", chain: "ETH", price: "$0.0847", change: "+34.2%", alphaScore: 8.9, volume: "$2.4M", liquidity: "$890K", positive: true },
  { name: "DefiPulse", symbol: "DPLS", chain: "SOL", price: "$1.24", change: "+28.7%", alphaScore: 8.2, volume: "$5.1M", liquidity: "$2.1M", positive: true },
  { name: "MetaVault", symbol: "MVLT", chain: "BASE", price: "$0.456", change: "+22.1%", alphaScore: 7.8, volume: "$1.8M", liquidity: "$650K", positive: true },
  { name: "ChainLink2", symbol: "CL2", chain: "ARB", price: "$0.0023", change: "-5.4%", alphaScore: 6.1, volume: "$890K", liquidity: "$320K", positive: false },
  { name: "QuantumSwap", symbol: "QSWP", chain: "ETH", price: "$3.78", change: "+15.9%", alphaScore: 7.5, volume: "$8.2M", liquidity: "$4.5M", positive: true },
  { name: "ZeroLayer", symbol: "ZRL", chain: "SOL", price: "$0.187", change: "+41.3%", alphaScore: 9.1, volume: "$3.6M", liquidity: "$1.2M", positive: true },
];

// ===== RECENT ACTIVITY =====
export const recentActivity = [
  { type: "analysis", title: "Analyzed NeuralAI (NRAI)", time: "2 min ago", detail: "Alpha Score: 8.9" },
  { type: "alert", title: "Whale Buy detected on DPLS", time: "15 min ago", detail: "$450K purchase" },
  { type: "quest", title: "Completed: Follow @AlphaScope", time: "1 hr ago", detail: "+50 ASCP" },
  { type: "gem", title: "New gem found: ZeroLayer", time: "2 hrs ago", detail: "Score: 9.1" },
  { type: "alert", title: "Liquidity spike on MVLT", time: "3 hrs ago", detail: "+210% in 1hr" },
];

// ===== TOKEN ANALYSIS =====
export const sampleAnalysis = {
  token: {
    name: "NeuralAI",
    symbol: "NRAI",
    chain: "Ethereum",
    address: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    price: "$0.0847",
    marketCap: "$4.2M",
    totalSupply: "100,000,000",
    circulatingSupply: "42,000,000",
    launchDate: "2025-12-15",
  },
  metrics: {
    liquidity: "$890K",
    liquidityChange: "+12.4%",
    volume24h: "$2.4M",
    volumeChange: "+156%",
    holders: 2847,
    holdersChange: "+342",
    transactions24h: 4521,
  },
  alphaScore: 8.9,
  riskFactors: [
    { label: "Liquidity Depth", score: 8.5 },
    { label: "Holder Distribution", score: 7.8 },
    { label: "Dev Wallet Risk", score: 9.2 },
    { label: "Volume Consistency", score: 8.4 },
    { label: "Smart Money Interest", score: 9.5 },
    { label: "Contract Safety", score: 9.0 },
  ],
  holderDistribution: [
    { range: "Top 10", percentage: 28 },
    { range: "11-50", percentage: 22 },
    { range: "51-100", percentage: 15 },
    { range: "101-500", percentage: 20 },
    { range: "500+", percentage: 15 },
  ],
  priceHistory: [
    { time: "12:00", price: 0.071 },
    { time: "14:00", price: 0.074 },
    { time: "16:00", price: 0.069 },
    { time: "18:00", price: 0.078 },
    { time: "20:00", price: 0.082 },
    { time: "22:00", price: 0.079 },
    { time: "00:00", price: 0.085 },
    { time: "02:00", price: 0.081 },
    { time: "04:00", price: 0.084 },
    { time: "06:00", price: 0.087 },
    { time: "08:00", price: 0.083 },
    { time: "10:00", price: 0.085 },
  ],
  aiSummary: "NeuralAI shows strong early-stage momentum with healthy liquidity depth and increasing smart money accumulation. The token has attracted 342 new holders in the past 24 hours, with trading volume surging 156%. Developer wallets are locked with a 12-month vesting schedule, reducing rug-pull risk. The project focuses on decentralized AI model training, which aligns with the current AI narrative trend. Whale wallets have accumulated approximately $450K in the past 48 hours, signaling institutional interest.",
  premiumInsights: [
    "Top 3 whale wallets have increased positions by 23% in 48 hours",
    "Liquidity is 89% locked via TeamFinance for 12 months",
    "Smart money wallet cluster identified — 7 wallets with >80% win rate have entered",
    "Token is gaining traction on Crypto Twitter with 340% increase in mentions",
    "DEX volume-to-liquidity ratio of 2.7x indicates healthy trading activity",
  ],
};

// ===== GEM SCANNER =====
export const gemTokens = [
  { name: "ZeroLayer", symbol: "ZRL", chain: "SOL", price: "$0.187", change: "+41.3%", alphaScore: 9.1, volume: "$3.6M", liquidity: "$1.2M", holders: 1890, age: "3d", positive: true, miniChart: [0.12, 0.13, 0.14, 0.15, 0.16, 0.17, 0.18, 0.19] },
  { name: "NeuralAI", symbol: "NRAI", chain: "ETH", price: "$0.0847", change: "+34.2%", alphaScore: 8.9, volume: "$2.4M", liquidity: "$890K", holders: 2847, age: "5d", positive: true, miniChart: [0.05, 0.06, 0.065, 0.07, 0.072, 0.078, 0.082, 0.085] },
  { name: "PhantomDEX", symbol: "PHDX", chain: "BASE", price: "$0.523", change: "+29.8%", alphaScore: 8.5, volume: "$4.2M", liquidity: "$1.8M", holders: 3210, age: "7d", positive: true, miniChart: [0.35, 0.38, 0.4, 0.42, 0.45, 0.48, 0.5, 0.52] },
  { name: "SynthWave", symbol: "SYNW", chain: "ETH", price: "$0.0034", change: "+67.1%", alphaScore: 8.3, volume: "$1.1M", liquidity: "$420K", holders: 945, age: "1d", positive: true, miniChart: [0.001, 0.0015, 0.002, 0.0022, 0.0025, 0.0028, 0.003, 0.0034] },
  { name: "DataVerse", symbol: "DTVS", chain: "ARB", price: "$1.87", change: "+18.4%", alphaScore: 7.9, volume: "$6.8M", liquidity: "$3.2M", holders: 5120, age: "12d", positive: true, miniChart: [1.4, 1.45, 1.5, 1.55, 1.6, 1.65, 1.7, 1.87] },
  { name: "FluxProtocol", symbol: "FLUX", chain: "SOL", price: "$0.0091", change: "+52.3%", alphaScore: 7.7, volume: "$890K", liquidity: "$310K", holders: 678, age: "2d", positive: true, miniChart: [0.004, 0.005, 0.0055, 0.006, 0.007, 0.008, 0.0085, 0.009] },
  { name: "OmniChain", symbol: "OMNI", chain: "BSC", price: "$0.234", change: "+11.2%", alphaScore: 7.4, volume: "$2.1M", liquidity: "$780K", holders: 1560, age: "9d", positive: true, miniChart: [0.18, 0.19, 0.2, 0.21, 0.215, 0.22, 0.23, 0.234] },
  { name: "VoidSwap", symbol: "VOID", chain: "ETH", price: "$0.00078", change: "-8.2%", alphaScore: 5.8, volume: "$340K", liquidity: "$120K", holders: 423, age: "1d", positive: false, miniChart: [0.001, 0.0009, 0.00095, 0.00088, 0.00085, 0.0008, 0.00079, 0.00078] },
];

// ===== QUESTS =====
export const quests = [
  { id: 1, title: "Follow @AlphaScope on X", description: "Follow our official X account", reward: 50, category: "Social", completed: true, icon: "twitter" },
  { id: 2, title: "Like & Repost Launch Tweet", description: "Engage with our latest announcement", reward: 30, category: "Social", completed: true, icon: "heart" },
  { id: 3, title: "Comment on Community Post", description: "Leave a thoughtful comment on our latest post", reward: 25, category: "Social", completed: false, icon: "comment" },
  { id: 4, title: "Join Telegram Community", description: "Join and verify in our Telegram group", reward: 75, category: "Community", completed: false, icon: "telegram" },
  { id: 5, title: "Invite 3 Friends", description: "Share your referral link and get 3 sign-ups", reward: 150, category: "Community", completed: false, icon: "users" },
  { id: 6, title: "Analyze Your First Token", description: "Use the AI Analyzer on any token", reward: 100, category: "Platform", completed: true, icon: "search" },
  { id: 7, title: "Explore Gem Scanner", description: "Browse the Hidden Gem Scanner page", reward: 40, category: "Platform", completed: false, icon: "gem" },
  { id: 8, title: "Set Up Alpha Alerts", description: "Configure at least 2 alert types", reward: 60, category: "Platform", completed: false, icon: "bell" },
  { id: 9, title: "Track a Smart Wallet", description: "Add a wallet to your tracking list", reward: 80, category: "Platform", completed: false, icon: "wallet" },
  { id: 10, title: "Daily Login Bonus", description: "Log in to the platform daily", reward: 20, category: "Platform", completed: false, icon: "calendar", daily: true },
  { id: 11, title: "Join Discord Server", description: "Join and verify on our Discord", reward: 75, category: "Community", completed: false, icon: "discord" },
  { id: 12, title: "Share Analysis Report", description: "Share a token analysis on social media", reward: 45, category: "Social", completed: false, icon: "share" },
];

// ===== SMART WALLETS =====
export const smartWallets = [
  { address: "0x8a1f...3d2b", label: "Alpha Whale #1", pnl: "+$2.4M", winRate: "87%", trades: 142, lastActive: "12 min ago", topTokens: ["NRAI", "DPLS", "ZRL"], trend: [100, 120, 115, 140, 155, 170, 185, 210] },
  { address: "0x3c7e...9f1a", label: "DeFi Degen", pnl: "+$890K", winRate: "82%", trades: 89, lastActive: "1 hr ago", topTokens: ["SYNW", "FLUX", "PHDX"], trend: [50, 55, 58, 62, 60, 68, 72, 78] },
  { address: "0x5d2a...7b4c", label: "Smart Money #3", pnl: "+$1.6M", winRate: "79%", trades: 203, lastActive: "3 hrs ago", topTokens: ["DTVS", "OMNI", "MVLT"], trend: [80, 85, 82, 90, 95, 92, 100, 108] },
  { address: "0x9e4f...2a8d", label: "Narrative Trader", pnl: "+$540K", winRate: "74%", trades: 67, lastActive: "5 hrs ago", topTokens: ["NRAI", "SYNW", "QSWP"], trend: [30, 35, 32, 40, 38, 45, 50, 54] },
  { address: "0x1b6c...8e3f", label: "Gem Hunter", pnl: "+$3.1M", winRate: "91%", trades: 56, lastActive: "30 min ago", topTokens: ["ZRL", "FLUX", "PHDX"], trend: [200, 220, 215, 250, 270, 290, 300, 310] },
];

// ===== WALLET ACTIVITY FEED =====
export const walletActivity = [
  { wallet: "Alpha Whale #1", action: "Bought", token: "ZRL", amount: "$125K", time: "12 min ago", type: "buy" },
  { wallet: "Gem Hunter", action: "Bought", token: "SYNW", amount: "$89K", time: "30 min ago", type: "buy" },
  { wallet: "DeFi Degen", action: "Sold", token: "OMNI", amount: "$45K", time: "1 hr ago", type: "sell" },
  { wallet: "Smart Money #3", action: "Bought", token: "NRAI", amount: "$210K", time: "2 hrs ago", type: "buy" },
  { wallet: "Alpha Whale #1", action: "Bought", token: "PHDX", amount: "$340K", time: "3 hrs ago", type: "buy" },
  { wallet: "Narrative Trader", action: "Sold", token: "CL2", amount: "$28K", time: "4 hrs ago", type: "sell" },
  { wallet: "Gem Hunter", action: "Bought", token: "FLUX", amount: "$67K", time: "5 hrs ago", type: "buy" },
];

// ===== ALPHA ALERTS =====
export const alphaAlerts = [
  { id: 1, type: "WHALE_BUY", token: "ZRL", title: "Whale accumulation detected", description: "Wallet 0x8a1f...3d2b bought $125K of ZRL in a single transaction", time: "12 min ago", severity: "high" },
  { id: 2, type: "VOLUME_SURGE", token: "SYNW", title: "Volume surge 340%", description: "SynthWave trading volume spiked from $320K to $1.1M in the past hour", time: "28 min ago", severity: "high" },
  { id: 3, type: "LIQUIDITY_SPIKE", token: "NRAI", title: "Liquidity increased +$200K", description: "NeuralAI liquidity pool grew from $690K to $890K in 2 hours", time: "1 hr ago", severity: "medium" },
  { id: 4, type: "SMART_MONEY", token: "PHDX", title: "Smart money cluster forming", description: "5 wallets with >75% win rate have entered PhantomDEX positions", time: "2 hrs ago", severity: "high" },
  { id: 5, type: "NEW_TOKEN", token: "FLUX", title: "New token gaining traction", description: "FluxProtocol launched 2 days ago with $310K liquidity and 678 holders", time: "3 hrs ago", severity: "medium" },
  { id: 6, type: "WHALE_BUY", token: "DTVS", title: "Multiple whale purchases", description: "3 whale wallets accumulated $500K+ of DataVerse in 24 hours", time: "4 hrs ago", severity: "high" },
  { id: 7, type: "VOLUME_SURGE", token: "OMNI", title: "Trading volume spike", description: "OmniChain volume doubled from $1M to $2.1M with price holding steady", time: "5 hrs ago", severity: "low" },
  { id: 8, type: "LIQUIDITY_SPIKE", token: "QSWP", title: "Liquidity lock detected", description: "QuantumSwap locked $3.2M liquidity via TeamFinance for 6 months", time: "6 hrs ago", severity: "medium" },
];
