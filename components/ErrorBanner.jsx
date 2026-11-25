import React from "react";
import { AlertCircle, RefreshCw, Key, ShieldAlert, Sparkles } from "lucide-react";

export default function ErrorBanner({ error, onRetry, onEnableDemo }) {
  if (!error) return null;

  const isAccessLevelError =
    error.includes("Access level") ||
    error.includes("access level") ||
    error.includes("Public key") ||
    error.includes("code 13") ||
    error.includes("code 16");
  const isRateLimit = error.includes("rate limit") || error.includes("code 5");

  return (
    <div className="w-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl p-4 my-4 text-rose-800 dark:text-rose-200 shadow-sm transition-colors duration-150">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-300">
              {isRateLimit
                ? "Torn API Rate Limit Exceeded"
                : isAccessLevelError
                ? "Insufficient Key Permissions"
                : "Torn API Request Failed"}
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-300/80 mt-0.5 leading-relaxed">
              {error}
            </p>
            {isAccessLevelError && (
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                Note: In Torn City, the <strong>user log</strong> selection strictly requires a{" "}
                <strong>Full Access</strong> API key because it tracks personal transactions, travel runs, and bazaar sales. Your key is stored 100% client-side in your browser.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {onEnableDemo && (
            <button
              onClick={onEnableDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 hover:bg-amber-100 dark:hover:bg-amber-500/30 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Switch to Demo</span>
            </button>
          )}

          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white dark:bg-rose-900/40 dark:hover:bg-rose-900/70 border border-rose-600 dark:border-rose-700/60 transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
