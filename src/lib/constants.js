import { 
  RiDashboardLine, RiSearchEyeLine, RiVipDiamondLine, RiTaskLine, 
  RiWallet3Line, RiNotification3Line, RiEyeLine, RiLineChartLine,
  RiFileTextLine, RiShieldCheckLine
} from "react-icons/ri";

export const NAV_ITEMS = [
  { name: "Dashboard", href: "/app", icon: RiDashboardLine },
  { name: "Intel Feed", href: "/app/gems", icon: RiLineChartLine },
  { name: "Research", href: "/app/analyzer", icon: RiSearchEyeLine },
  { name: "Quests", href: "/app/quests", icon: RiTaskLine },
  { name: "Wallets", href: "/app/wallets", icon: RiWallet3Line },
  { name: "Alerts", href: "/app/alerts", icon: RiNotification3Line },
];

export const QUEST_CATEGORIES = ["All", "Social", "Platform", "Community"];

export const ALERT_TYPES = {
  WHALE_BUY: { label: "Whale Buy", color: "#16A34A" },
  LIQUIDITY_SPIKE: { label: "Liquidity Spike", color: "#3B82F6" },
  VOLUME_SURGE: { label: "Volume Surge", color: "#F97316" },
  SMART_MONEY: { label: "Smart Money", color: "#7C3AED" },
  NEW_TOKEN: { label: "New Token", color: "#9F67FF" },
};

export const CHAIN_BADGES = {
  ETH: { label: "Ethereum", color: "#627EEA" },
  SOL: { label: "Solana", color: "#9945FF" },
  BSC: { label: "BSC", color: "#F3BA2F" },
  BASE: { label: "Base", color: "#0052FF" },
  ARB: { label: "Arbitrum", color: "#28A0F0" },
};

export const PREDICTION_CATEGORIES = [
  "Top Intel",
  "Accumulation Phase",
  "Rising Narratives",
  "High Volatility",
  "AI Forecast",
];
