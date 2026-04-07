"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";

const TokenContext = createContext(null);

const STORAGE_KEYS = {
  balance: "cora_balance",
  history: "cora_history",
  quests: "cora_completed_quests",
  analyzed: "cora_analyzed_tokens",
  trackedWallets: "cora_tracked_wallets",
  alertSettings: "cora_alert_settings",
  watchlist: "cora_watchlist",
};

const INITIAL_BALANCE = 500; // new users start with 500 CORA

function loadFromStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("localStorage save failed:", e);
  }
}

export function TokenProvider({ children }) {
  const { isConnected, address } = useAccount();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [analyzedTokens, setAnalyzedTokens] = useState({});
  const [trackedWallets, setTrackedWallets] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [alertSettings, setAlertSettings] = useState({
    WHALE_BUY: true, LIQUIDITY_SPIKE: true, VOLUME_SURGE: true, SMART_MONEY: true, NEW_TOKEN: false,
  });
  const [loaded, setLoaded] = useState(false);
  const [walletInitialized, setWalletInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setHistory(loadFromStorage(STORAGE_KEYS.history, []));
    setCompletedQuests(loadFromStorage(STORAGE_KEYS.quests, []));
    setAnalyzedTokens(loadFromStorage(STORAGE_KEYS.analyzed, {}));
    setTrackedWallets(loadFromStorage(STORAGE_KEYS.trackedWallets, []));
    setWatchlist(loadFromStorage(STORAGE_KEYS.watchlist, []));
    setAlertSettings(loadFromStorage(STORAGE_KEYS.alertSettings, {
      WHALE_BUY: true, LIQUIDITY_SPIKE: true, VOLUME_SURGE: true, SMART_MONEY: true, NEW_TOKEN: false,
    }));
    setLoaded(true);
  }, []);

  // Wallet-aware balance: 0 when disconnected, load/grant INITIAL_BALANCE on connect
  useEffect(() => {
    if (!loaded) return;
    if (isConnected && address) {
      const storedBalance = loadFromStorage(STORAGE_KEYS.balance, null);
      const hasInitialized = loadFromStorage("cora_wallet_initialized", false);
      if (hasInitialized) {
        // Returning user — restore their balance
        setBalance(storedBalance !== null ? storedBalance : INITIAL_BALANCE);
      } else {
        // First time connecting — grant initial tokens
        setBalance(INITIAL_BALANCE);
        saveToStorage(STORAGE_KEYS.balance, INITIAL_BALANCE);
        saveToStorage("cora_wallet_initialized", true);
      }
      setWalletInitialized(true);
    } else {
      // Wallet disconnected — show 0
      setBalance(0);
      setWalletInitialized(false);
    }
  }, [isConnected, address, loaded]);

  // Persist on change
  useEffect(() => {
    if (!loaded) return;
    saveToStorage(STORAGE_KEYS.balance, balance);
  }, [balance, loaded]);

  useEffect(() => {
    if (!loaded) return;
    saveToStorage(STORAGE_KEYS.history, history);
  }, [history, loaded]);

  useEffect(() => {
    if (!loaded) return;
    saveToStorage(STORAGE_KEYS.quests, completedQuests);
  }, [completedQuests, loaded]);

  useEffect(() => {
    if (!loaded) return;
    saveToStorage(STORAGE_KEYS.analyzed, analyzedTokens);
  }, [analyzedTokens, loaded]);

  useEffect(() => {
    if (!loaded) return;
    saveToStorage(STORAGE_KEYS.trackedWallets, trackedWallets);
  }, [trackedWallets, loaded]);

  useEffect(() => {
    if (!loaded) return;
    saveToStorage(STORAGE_KEYS.watchlist, watchlist);
  }, [watchlist, loaded]);

  useEffect(() => {
    if (!loaded) return;
    saveToStorage(STORAGE_KEYS.alertSettings, alertSettings);
  }, [alertSettings, loaded]);

  const addHistoryEntry = useCallback((type, amount, reason) => {
    const entry = { type, amount, reason, timestamp: Date.now() };
    setHistory((prev) => [entry, ...prev].slice(0, 100)); // keep last 100
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
    setAnalyzedTokens((prev) => ({
      ...prev,
      [tokenKey]: { ...data, cachedAt: Date.now() },
    }));
  }, []);

  const getCachedAnalysis = useCallback((tokenKey) => {
    const cached = analyzedTokens[tokenKey];
    if (!cached) return null;
    // cache valid for 1 hour
    if (Date.now() - cached.cachedAt > 3600000) return null;
    return cached;
  }, [analyzedTokens]);

  const trackWallet = useCallback((address, label) => {
    if (trackedWallets.find((w) => w.address === address)) return false;
    setTrackedWallets((prev) => [...prev, { address, label: label || address.slice(0, 6) + "..." + address.slice(-4), addedAt: Date.now() }]);
    return true;
  }, [trackedWallets]);

  const removeTrackedWallet = useCallback((address) => {
    setTrackedWallets((prev) => prev.filter((w) => w.address !== address));
  }, []);

  const addToWatchlist = useCallback((token) => {
    if (watchlist.find((w) => w.address === token.address)) return false;
    setWatchlist((prev) => [...prev, { ...token, addedAt: Date.now() }]);
    return true;
  }, [watchlist]);

  const removeFromWatchlist = useCallback((address) => {
    setWatchlist((prev) => prev.filter((w) => w.address !== address));
  }, []);

  const updateAlertSettings = useCallback((settings) => {
    setAlertSettings(settings);
  }, []);

  const value = {
    balance,
    history,
    completedQuests,
    analyzedTokens,
    trackedWallets,
    watchlist,
    alertSettings,
    loaded,
    isConnected,
    walletInitialized,
    earnTokens,
    spendTokens,
    completeQuest,
    cacheAnalysis,
    getCachedAnalysis,
    trackWallet,
    removeTrackedWallet,
    addToWatchlist,
    removeFromWatchlist,
    updateAlertSettings,
  };

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
}

export function useTokens() {
  const ctx = useContext(TokenContext);
  if (!ctx) throw new Error("useTokens must be used within TokenProvider");
  return ctx;
}
