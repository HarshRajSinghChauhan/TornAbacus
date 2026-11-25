"use client";

import React, { useState, useEffect } from "react";
import { formatLiveClock } from "@/lib/time";
import { getRateLimitStatus } from "@/lib/tornApi";
import { useTheme } from "@/components/ThemeProvider";
import {
  ShieldCheck,
  Clock,
  Key,
  LogOut,
  Sparkles,
  RefreshCw,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  PlaneTakeoff,
  ExternalLink,
  Sun,
  Moon,
} from "lucide-react";

export default function Header({
  apiKey,
  onSaveKey,
  onClearKey,
  isDemoMode,
  onToggleDemo,
  isTestingKey,
  keyStatus, // 'connected' | 'invalid' | 'demo' | 'none'
  playerInfo,
  onRefresh,
  isLoading,
}) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [clock, setClock] = useState({
    tct: "--:--:--",
    local: "--:--:--",
    tzAbbr: "UTC",
    localTz: "UTC",
  });
  const [inputKey, setInputKey] = useState(apiKey || "");
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [rateLimit, setRateLimit] = useState({ used: 0, limit: 100, remaining: 100 });

  // Live dual clock ticker (client-side only to prevent hydration mismatch)
  useEffect(() => {
    setMounted(true);
    setClock(formatLiveClock());
    setRateLimit(getRateLimitStatus());

    const timer = setInterval(() => {
      setClock(formatLiveClock());
      setRateLimit(getRateLimitStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setInputKey(apiKey || "");
  }, [apiKey]);

  const handleConnect = (e) => {
    e.preventDefault();
    if (inputKey.trim()) {
      onSaveKey(inputKey.trim());
      setIsEditingKey(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/85 backdrop-blur-md transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 gap-3">
          
          {/* Logo & Dual Time */}
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 p-[1px] shadow-lg shadow-emerald-950/20 dark:shadow-emerald-950/50">
                <div className="h-full w-full rounded-[11px] bg-white dark:bg-slate-950 flex items-center justify-center">
                  <PlaneTakeoff className="h-5 w-5 text-emerald-500 dark:text-emerald-400 transform -rotate-12" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    Torn<span className="text-emerald-500 dark:text-emerald-400">Abacus</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    TORN LEDGER
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Client-Side Travel &amp; Bazaar Profit Analytics
                </p>
              </div>
            </div>

            {/* Live Dual Clock */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono shadow-sm">
              <Clock className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-pulse" />
              <div className="flex items-center gap-2 divide-x divide-slate-200 dark:divide-slate-800">
                <div className="flex items-center gap-1.5 pr-2">
                  <span className="text-slate-500 dark:text-slate-400 font-sans text-[11px]">TCT:</span>
                  <span className="text-emerald-600 dark:text-emerald-300 font-semibold" suppressHydrationWarning>
                    {mounted ? clock.tct : "--:--:--"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 pl-2">
                  <span className="text-slate-500 dark:text-slate-400 font-sans text-[11px]">Local:</span>
                  <span className="text-sky-600 dark:text-sky-300 font-semibold" suppressHydrationWarning>
                    {mounted ? clock.local : "--:--:--"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans uppercase" suppressHydrationWarning>
                    ({mounted ? clock.tzAbbr : "UTC"})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Controls: Key input / status, Demo toggle, Theme toggle, Refresh */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Demo Mode Toggle Button */}
            <button
              onClick={onToggleDemo}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isDemoMode
                  ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950/20 hover:bg-amber-500/30"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white"
              }`}
              title={isDemoMode ? "Currently showing simulated sample data. Click to switch to your live key" : "Load sample data without an API key"}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isDemoMode ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`} />
              <span>{isDemoMode ? "Demo Mode Active" : "Sample Demo Data"}</span>
            </button>

            {/* Connected Key Badge OR Key Input Form */}
            {apiKey && !isEditingKey ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs shadow-sm">
                  {keyStatus === "connected" ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                      <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                        {playerInfo?.name ? `${playerInfo.name} [${playerInfo.player_id}]` : "API Key Connected"}
                      </span>
                    </>
                  ) : keyStatus === "invalid" ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
                      <span className="text-rose-700 dark:text-rose-300 font-medium">Invalid Key</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 font-mono">
                        {apiKey.substring(0, 4)}••••••••
                      </span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setIsEditingKey(true)}
                  className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors"
                  title="Change API Key"
                >
                  Edit
                </button>

                <button
                  onClick={onClearKey}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 transition-colors"
                  title="Disconnect and remove key from browser storage"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              /* Always visible Key Input Form when no key is active or while editing */
              <form onSubmit={handleConnect} className="flex items-center gap-1.5 sm:gap-2">
                <div className="relative">
                  <Key className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-500 dark:text-emerald-400" />
                  <input
                    type="password"
                    placeholder="Paste Torn API Key..."
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="w-44 sm:w-56 pl-8 pr-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-emerald-500/40 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-mono transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isTestingKey || !inputKey.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-all shadow-sm whitespace-nowrap"
                >
                  {isTestingKey ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Connect Key</span>
                </button>
                {isEditingKey && (
                  <button
                    type="button"
                    onClick={() => setIsEditingKey(false)}
                    className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                )}
              </form>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
              title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading || (!apiKey && !isDemoMode)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
              title="Refresh Logs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-500 dark:text-emerald-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Client Rate Limit Pill if connected */}
        {apiKey && !isDemoMode && (
          <div className="pb-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-900 pt-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
              <span>Client Rate Limit:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                {rateLimit.used} / {rateLimit.limit} calls in last 60s
              </span>
              <span className="text-slate-400 dark:text-slate-500">({rateLimit.remaining} remaining)</span>
            </div>
            {playerInfo?.status && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 dark:text-slate-500">Status:</span>
                <span className="capitalize text-slate-700 dark:text-slate-300">{playerInfo.status}</span>
                {playerInfo.level && <span className="text-slate-500">• Lvl {playerInfo.level}</span>}
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
