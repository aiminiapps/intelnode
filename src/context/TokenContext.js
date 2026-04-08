"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAccount } from "wagmi";

const TokenContext = createContext(null);

const STORAGE_KEYS = {
  balance: "inod_balance",
  history: "inod_history",
  quests: "inod_completed_quests",
  analyzed: "inod_analyzed_tokens",
  trackedWallets: "inod_tracked_wallets",
  alertSettings: "inod_alert_settings",
  watchlist: "inod_watchlist",
  portfolio: "inod_portfolio",
};

const INITIAL_BALANCE = 500;

/* ═══════════════════════════════════════════
   TIER SYSTEM — Token-Gated Access Model
   ═══════════════════════════════════════════ */
export const TIERS = {
  BASIC:          { id: "BASIC",          name: "Basic",          minBalance: 0,      color: "#6B7280", icon: "◇", maxResearch: 3,  maxWallets: 3,  maxAlerts: 5,   sentimentAccess: false, flowAccess: false, portfolioAccess: false, pdfExport: false },
  PRO:            { id: "PRO",            name: "Pro",            minBalance: 2000,   color: "#111827", icon: "◆", maxResearch: 15, maxWallets: 10, maxAlerts: 20,  sentimentAccess: true,  flowAccess: false, portfolioAccess: false, pdfExport: false },
  INSTITUTIONAL:  { id: "INSTITUTIONAL",  name: "Institutional",  minBalance: 10000,  color: "#111827", icon: "★", maxResearch: -1, maxWallets: -1, maxAlerts: -1,  sentimentAccess: true,  flowAccess: true,  portfolioAccess: true,  pdfExport: true  },
};

export function getTier(balance) {
  if (balance >= TIERS.INSTITUTIONAL.minBalance) return TIERS.INSTITUTIONAL;
  if (balance >= TIERS.PRO.minBalance) return TIERS.PRO;
  return TIERS.BASIC;
}

export function getNextTier(currentTier) {
  if (currentTier.id === "BASIC") return TIERS.PRO;
  if (currentTier.id === "PRO") return TIERS.INSTITUTIONAL;
  return null;
}

function loadFromStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key, value) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { console.warn("localStorage save failed:", e); }
}

export function TokenProvider({ children }) {
  const { isConnected, address } = useAccount();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [analyzedTokens, setAnalyzedTokens] = useState({});
  const [trackedWallets, setTrackedWallets] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [alertSettings, setAlertSettings] = useState({
    WHALE_BUY: true, LIQUIDITY_SPIKE: true, VOLUME_SURGE: true, SMART_MONEY: true, NEW_TOKEN: false,
  });
  const [loaded, setLoaded] = useState(false);
  const [walletInitialized, setWalletInitialized] = useState(false);

  // Derived tier
  const tier = useMemo(() => getTier(balance), [balance]);
  const nextTier = useMemo(() => getNextTier(tier), [tier]);

  useEffect(() => {
    setHistory(loadFromStorage(STORAGE_KEYS.history, []));
    setCompletedQuests(loadFromStorage(STORAGE_KEYS.quests, []));
    setAnalyzedTokens(loadFromStorage(STORAGE_KEYS.analyzed, {}));
    setTrackedWallets(loadFromStorage(STORAGE_KEYS.trackedWallets, []));
    setWatchlist(loadFromStorage(STORAGE_KEYS.watchlist, []));
    setPortfolio(loadFromStorage(STORAGE_KEYS.portfolio, []));
    setAlertSettings(loadFromStorage(STORAGE_KEYS.alertSettings, {
      WHALE_BUY: true, LIQUIDITY_SPIKE: true, VOLUME_SURGE: true, SMART_MONEY: true, NEW_TOKEN: false,
    }));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (isConnected && address) {
      const storedBalance = loadFromStorage(STORAGE_KEYS.balance, null);
      const hasInitialized = loadFromStorage("inod_wallet_initialized", false);
      if (hasInitialized) {
        setBalance(storedBalance !== null ? storedBalance : INITIAL_BALANCE);
      } else {
        setBalance(INITIAL_BALANCE);
        saveToStorage(STORAGE_KEYS.balance, INITIAL_BALANCE);
        saveToStorage("inod_wallet_initialized", true);
      }
      setWalletInitialized(true);
    } else {
      setBalance(0);
      setWalletInitialized(false);
    }
  }, [isConnected, address, loaded]);

  useEffect(() => { if (loaded) saveToStorage(STORAGE_KEYS.balance, balance); }, [balance, loaded]);
  useEffect(() => { if (loaded) saveToStorage(STORAGE_KEYS.history, history); }, [history, loaded]);
  useEffect(() => { if (loaded) saveToStorage(STORAGE_KEYS.quests, completedQuests); }, [completedQuests, loaded]);
  useEffect(() => { if (loaded) saveToStorage(STORAGE_KEYS.analyzed, analyzedTokens); }, [analyzedTokens, loaded]);
  useEffect(() => { if (loaded) saveToStorage(STORAGE_KEYS.trackedWallets, trackedWallets); }, [trackedWallets, loaded]);
  useEffect(() => { if (loaded) saveToStorage(STORAGE_KEYS.watchlist, watchlist); }, [watchlist, loaded]);
  useEffect(() => { if (loaded) saveToStorage(STORAGE_KEYS.portfolio, portfolio); }, [portfolio, loaded]);
  useEffect(() => { if (loaded) saveToStorage(STORAGE_KEYS.alertSettings, alertSettings); }, [alertSettings, loaded]);

  const addHistoryEntry = useCallback((type, amount, reason) => {
    const entry = { type, amount, reason, timestamp: Date.now() };
    setHistory((prev) => [entry, ...prev].slice(0, 100));
  }, []);

  const earnTokens = useCallback((amount, reason) => {
    setBalance((prev) => prev + amount);
    addHistoryEntry("earn", amount, reason);
  }, [addHistoryEntry]);

  const spendTokens = useCallback((amount, reason) => {
    if (balance < amount) return false;
    setBalance((prev) => prev - amount);
    addHistoryEntry("spend", amount, reason);
    return true;
  }, [balance, addHistoryEntry]);

  const completeQuest = useCallback((questId, reward) => {
    if (completedQuests.includes(questId)) return false;
    setCompletedQuests((prev) => [...prev, questId]);
    earnTokens(reward, `Quest completed: #${questId}`);
    return true;
  }, [completedQuests, earnTokens]);

  const cacheAnalysis = useCallback((tokenKey, data) => {
    setAnalyzedTokens((prev) => ({ ...prev, [tokenKey]: { ...data, cachedAt: Date.now() } }));
  }, []);

  const getCachedAnalysis = useCallback((tokenKey) => {
    const cached = analyzedTokens[tokenKey];
    if (!cached) return null;
    if (Date.now() - cached.cachedAt > 3600000) return null;
    return cached;
  }, [analyzedTokens]);

  const trackWallet = useCallback((addr, label) => {
    if (trackedWallets.find((w) => w.address === addr)) return false;
    setTrackedWallets((prev) => [...prev, { address: addr, label: label || addr.slice(0, 6) + "..." + addr.slice(-4), addedAt: Date.now() }]);
    return true;
  }, [trackedWallets]);

  const removeTrackedWallet = useCallback((addr) => {
    setTrackedWallets((prev) => prev.filter((w) => w.address !== addr));
  }, []);

  const addToWatchlist = useCallback((token) => {
    if (watchlist.find((w) => w.address === token.address)) return false;
    setWatchlist((prev) => [...prev, { ...token, addedAt: Date.now() }]);
    return true;
  }, [watchlist]);

  const removeFromWatchlist = useCallback((addr) => {
    setWatchlist((prev) => prev.filter((w) => w.address !== addr));
  }, []);

  const updateAlertSettings = useCallback((settings) => { setAlertSettings(settings); }, []);

  // Portfolio management
  const addToPortfolio = useCallback((token) => {
    if (portfolio.find((p) => p.symbol === token.symbol)) return false;
    setPortfolio((prev) => [...prev, { ...token, addedAt: Date.now() }]);
    return true;
  }, [portfolio]);

  const removeFromPortfolio = useCallback((symbol) => {
    setPortfolio((prev) => prev.filter((p) => p.symbol !== symbol));
  }, []);

  const updatePortfolioAllocation = useCallback((symbol, allocation) => {
    setPortfolio((prev) => prev.map((p) => p.symbol === symbol ? { ...p, allocation } : p));
  }, []);

  const value = {
    balance, history, completedQuests, analyzedTokens, trackedWallets,
    watchlist, alertSettings, loaded, isConnected, walletInitialized,
    tier, nextTier,
    portfolio,
    earnTokens, spendTokens, completeQuest,
    cacheAnalysis, getCachedAnalysis,
    trackWallet, removeTrackedWallet,
    addToWatchlist, removeFromWatchlist,
    updateAlertSettings,
    addToPortfolio, removeFromPortfolio, updatePortfolioAllocation,
  };

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
}

export function useTokens() {
  const ctx = useContext(TokenContext);
  if (!ctx) throw new Error("useTokens must be used within TokenProvider");
  return ctx;
}
