import React from "react";
import { Lock, ShieldCheck, Database, EyeOff } from "lucide-react";

export default function SecurityBanner() {
  return (
    <div className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 sm:p-4 my-4 shadow-sm transition-colors duration-150">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-200">
                🔒 100% Client-Side Privacy Architecture
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                Zero Server Storage
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              Your API key is stored exclusively in your browser&apos;s local storage (<code className="text-slate-800 dark:text-slate-300 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700/60">torn_api_key</code>) and is never sent to or stored on any server. All requests connect directly to <code className="text-slate-800 dark:text-slate-300 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700/60">api.torn.com</code> from your browser.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center shrink-0 text-slate-400 dark:text-slate-500 text-[11px]">
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3 text-slate-400" />
            <span>No DB</span>
          </div>
          <div className="flex items-center gap-1">
            <EyeOff className="w-3 h-3 text-slate-400" />
            <span>Zero Tracking</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
            <span>Safe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
