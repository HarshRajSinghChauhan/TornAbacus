"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import SecurityBanner from "@/components/SecurityBanner";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import KpiMetrics from "@/components/KpiMetrics";
import VisualAnalytics from "@/components/VisualAnalytics";
import ItemizedLedger from "@/components/ItemizedLedger";
import TransactionStream from "@/components/TransactionStream";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ErrorBanner from "@/components/ErrorBanner";

import {
  getStoredApiKey,
  setStoredApiKey,
  clearStoredApiKey,
  testApiKey,
  fetchUserLogs,
} from "@/lib/tornApi";
import { getTimeRangeTimestamps } from "@/lib/time";
import { processTornLogs } from "@/lib/logParser";
import { generateDemoLogs } from "@/lib/demoData";
import { Plane, AlertTriangle, Sparkles, ExternalLink, ShieldCheck } from "lucide-react";

export default function Dashboard() {
  const [apiKey, setApiKey] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [keyStatus, setKeyStatus] = useState("none"); // 'connected' | 'invalid' | 'demo' | 'none'
  const [playerInfo, setPlayerInfo] = useState(null);
  const [isTestingKey, setIsTestingKey] = useState(false);

  const [activePreset, setActivePreset] = useState("last7d");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [rangeDetails, setRangeDetails] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);

  // Initialize from localStorage or default to Demo Mode for instant usability
  useEffect(() => {
    const stored = getStoredApiKey();
    if (stored) {
      setApiKey(stored);
      setIsDemoMode(false);
      validateAndFetch(stored, "last7d");
    } else {
      // If no key found, activate demo mode so the user immediately gets a rich dashboard
      setIsDemoMode(true);
      setKeyStatus("demo");
      loadDemoData();
    }
  }, []);

  // Update time range details when preset or custom range changes
  useEffect(() => {
    const details = getTimeRangeTimestamps(activePreset, customRange.start, customRange.end);
    setRangeDetails(details);
  }, [activePreset, customRange]);

  // Load demo travel dataset
  const loadDemoData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      const demoLogs = generateDemoLogs();
      const parsed = processTornLogs(demoLogs);
      setLedgerData(parsed);
      setPlayerInfo({
        name: "AbacusTrader (Demo)",
        player_id: "7777777",
        level: 100,
        status: "Traveling abroad",
      });
      setIsLoading(false);
    }, 250);
  }, []);

  // Fetch financial logs only (1 single API call, preserves API rate limits)
  const fetchLogsOnly = useCallback(
    async (keyToUse, presetToUse = activePreset) => {
      if (!keyToUse) return;

      setIsLoading(true);
      setError(null);

      try {
        const timestamps = getTimeRangeTimestamps(
          presetToUse,
          customRange.start,
          customRange.end
        );
        setRangeDetails(timestamps);

        const logs = await fetchUserLogs(keyToUse, timestamps.from, timestamps.to);
        const parsed = processTornLogs(logs);
        setLedgerData(parsed);
      } catch (err) {
        setError(err.message || "Failed to load logs from Torn API");
        if (err.code === 2 || err.code === 16) {
          setKeyStatus("invalid");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [activePreset, customRange]
  );

  // Validate API Key and fetch live data (Used on initial load or key change)
  const validateAndFetch = useCallback(
    async (keyToUse, presetToUse = activePreset) => {
      if (!keyToUse) return;

      setIsLoading(true);
      setError(null);
      setIsTestingKey(true);

      try {
        // Step 1: Validate Key
        const testRes = await testApiKey(keyToUse);
        if (!testRes.valid) {
          setKeyStatus("invalid");
          setError(testRes.error);
          setIsLoading(false);
          setIsTestingKey(false);
          return;
        }

        setKeyStatus("connected");
        setPlayerInfo(testRes.player);
        setIsTestingKey(false);

        // Step 2: Fetch Logs
        const timestamps = getTimeRangeTimestamps(
          presetToUse,
          customRange.start,
          customRange.end
        );
        setRangeDetails(timestamps);

        const logs = await fetchUserLogs(keyToUse, timestamps.from, timestamps.to);
        const parsed = processTornLogs(logs);
        setLedgerData(parsed);
      } catch (err) {
        setError(err.message || "Failed to load data from Torn API");
        setKeyStatus(err.code === 2 || err.code === 16 ? "invalid" : "connected");
      } finally {
        setIsLoading(false);
        setIsTestingKey(false);
      }
    },
    [activePreset, customRange]
  );

  // Handle Save API Key
  const handleSaveKey = (newKey) => {
    setStoredApiKey(newKey);
    setApiKey(newKey);
    setIsDemoMode(false);
    validateAndFetch(newKey);
  };

  // Handle Clear / Disconnect
  const handleClearKey = () => {
    clearStoredApiKey();
    setApiKey("");
    setPlayerInfo(null);
    setKeyStatus("none");
    setIsDemoMode(true);
    loadDemoData();
  };

  // Toggle Demo Mode
  const handleToggleDemo = () => {
    if (isDemoMode) {
      // Switching off demo mode
      if (apiKey) {
        setIsDemoMode(false);
        if (playerInfo) {
          fetchLogsOnly(apiKey);
        } else {
          validateAndFetch(apiKey);
        }
      } else {
        setIsDemoMode(false);
        setKeyStatus("none");
        setLedgerData(processTornLogs({}));
      }
    } else {
      // Switching to demo mode
      setIsDemoMode(true);
      setKeyStatus("demo");
      loadDemoData();
    }
  };

  // Handle Range Preset Selection
  const handleSelectPreset = (preset) => {
    setActivePreset(preset);
    if (isDemoMode) {
      loadDemoData();
    } else if (apiKey) {
      if (keyStatus === "connected" && playerInfo) {
        fetchLogsOnly(apiKey, preset);
      } else {
        validateAndFetch(apiKey, preset);
      }
    }
  };

  // Handle Custom Range Input
  const handleCustomRangeChange = (type, val) => {
    setCustomRange((prev) => ({ ...prev, [type]: val }));
  };

  // Refresh current view
  const handleRefresh = () => {
    if (isDemoMode) {
      loadDemoData();
    } else if (apiKey) {
      if (keyStatus === "connected" && playerInfo) {
        fetchLogsOnly(apiKey, activePreset);
      } else {
        validateAndFetch(apiKey, activePreset);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
      
      {/* Sticky Top Header with Dual Clocks & Key Controls */}
      <Header
        apiKey={apiKey}
        onSaveKey={handleSaveKey}
        onClearKey={handleClearKey}
        isDemoMode={isDemoMode}
        onToggleDemo={handleToggleDemo}
        isTestingKey={isTestingKey}
        keyStatus={keyStatus}
        playerInfo={playerInfo}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* Security & Client-Side Privacy Banner */}
        <SecurityBanner />

        {/* Time Range Filter Bar */}
        <TimeRangeSelector
          activePreset={activePreset}
          onSelectPreset={handleSelectPreset}
          customRange={customRange}
          onCustomRangeChange={handleCustomRangeChange}
          onFetch={handleRefresh}
          isLoading={isLoading}
          currentRangeDetails={rangeDetails}
        />

        {/* Error Alert Display */}
        {error && (
          <ErrorBanner
            error={error}
            onRetry={handleRefresh}
            onEnableDemo={() => {
              setIsDemoMode(true);
              setKeyStatus("demo");
              loadDemoData();
            }}
          />
        )}

        {/* Demo Mode Notice Banner if Active */}
        {isDemoMode && (
          <div className="w-full bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 sm:p-4 my-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200/90 shadow-sm transition-colors duration-150">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold text-amber-800 dark:text-amber-300">Demo Mode Active:</span> Showing realistic sample travel runs across Switzerland, UAE, Cayman, UK, Japan, and South Africa.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
              {!apiKey ? (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="password"
                    placeholder="Enter Full Access Key"
                    id="banner-key-input"
                    className="px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 focus:border-emerald-500 rounded-lg text-slate-900 dark:text-white font-mono placeholder-slate-400 dark:placeholder-slate-500 w-full sm:w-48"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.target.value.trim()) {
                        handleSaveKey(e.target.value.trim());
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const el = document.getElementById("banner-key-input");
                      if (el && el.value.trim()) {
                        handleSaveKey(el.value.trim());
                      }
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs whitespace-nowrap transition-colors shadow-sm"
                  >
                    Load Live Account
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsDemoMode(false);
                    validateAndFetch(apiKey);
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
                >
                  Switch to Live Account ({playerInfo?.name || "Connected"})
                </button>
              )}
              <a
                href="https://www.torn.com/preferences.php#tab=api"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-700 dark:text-amber-400/80 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1 underline underline-offset-2 ml-1"
              >
                <span>Get Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Empty Key Prompt if not demo and no key */}
        {!isDemoMode && !apiKey && (
          <div className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 my-8 text-center max-w-xl mx-auto shadow-xl transition-colors duration-150">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <Plane className="w-6 h-6 transform -rotate-12" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Connect Your Torn City Account</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              To analyze your travel runs, overseas inventory acquisitions, and bazaar revenues, enter a Torn API key with <strong>Full Access</strong> permissions (required by Torn for activity logs).
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsDemoMode(true);
                  setKeyStatus("demo");
                  loadDemoData();
                }}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 hover:bg-amber-100 dark:hover:bg-amber-500/30 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explore With Demo Data</span>
              </button>
              <a
                href="https://www.torn.com/preferences.php#tab=api"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Get API Key on Torn.com</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {isLoading && !ledgerData ? (
          <LoadingSkeleton />
        ) : (
          ledgerData && (
            <>
              {/* 1. Top KPI Metrics: 5-Second Overview */}
              <KpiMetrics kpis={ledgerData.kpis} />

              {/* 2. Visual Analytics: Donut Expense Breakdown & Top Profitable Items Bar */}
              <VisualAnalytics
                expenseBreakdown={ledgerData.expenseBreakdown}
                topProfitableItems={ledgerData.topProfitableItems}
              />

              {/* 3. Itemized Ledger Table */}
              <ItemizedLedger ledgerItems={ledgerData.ledgerItems} />

              {/* 4. Transaction Stream with Dual Timestamps */}
              <TransactionStream rawEvents={ledgerData.rawEvents} />
            </>
          )
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white/60 dark:bg-slate-950/60 py-6 text-center text-xs text-slate-500 transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-400">TornAbacus</span>
            <span>•</span>
            <span>Client-side travel &amp; trading ledger</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>TCT = UTC</span>
            <span>•</span>
            <span>Zero Backend Footprint</span>
            <span>•</span>
            <span>Vercel Ready</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
