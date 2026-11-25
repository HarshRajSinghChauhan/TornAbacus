"use client";

import React, { useState } from "react";
import { Calendar, Clock, RefreshCw, ChevronDown, Filter } from "lucide-react";
import { formatDualTime } from "@/lib/time";

export default function TimeRangeSelector({
  activePreset,
  onSelectPreset,
  customRange,
  onCustomRangeChange,
  onFetch,
  isLoading,
  currentRangeDetails,
}) {
  const [showCustom, setShowCustom] = useState(activePreset === "custom");

  const presets = [
    { id: "today", label: "Today (TCT)", desc: "From 00:00 TCT today" },
    { id: "yesterday", label: "Yesterday (TCT)", desc: "Full prior 24h TCT" },
    { id: "last24h", label: "Last 24 Hours", desc: "Rolling 24 hours" },
    { id: "last7d", label: "Last 7 Days", desc: "Rolling 7 days" },
    { id: "custom", label: "Custom Date", desc: "Pick calendar dates" },
  ];

  const handlePresetClick = (id) => {
    if (id === "custom") {
      setShowCustom(true);
    } else {
      setShowCustom(false);
    }
    onSelectPreset(id);
  };

  const formattedStart = currentRangeDetails?.from ? formatDualTime(currentRangeDetails.from) : null;
  const formattedEnd = currentRangeDetails?.to ? formatDualTime(currentRangeDetails.to) : null;

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 sm:p-4 my-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Time Range:</span>
          </span>

          {presets.map((p) => {
            const isActive = activePreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handlePresetClick(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950"
                    : "bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Active Range Timestamps Preview & Action */}
        <div className="flex flex-wrap items-center gap-3 justify-between md:justify-end">
          {formattedStart && (
            <div className="text-xs text-slate-400 bg-slate-950/60 border border-slate-800 px-2.5 py-1 rounded-lg font-mono">
              <span className="text-slate-500 font-sans mr-1">Range:</span>
              <span className="text-slate-300" suppressHydrationWarning>{formattedStart.tct}</span>
              <span className="text-slate-600 mx-1.5">→</span>
              <span className="text-slate-300" suppressHydrationWarning>{formattedEnd?.tct || "Now"}</span>
            </div>
          )}

          <button
            onClick={onFetch}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
            <span>{isLoading ? "Querying Torn API..." : "Apply Range"}</span>
          </button>
        </div>
      </div>

      {/* Custom Date Inputs if Custom is selected */}
      {showCustom && (
        <div className="mt-3 pt-3 border-t border-slate-800/70 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">From:</span>
            <input
              type="date"
              value={customRange?.start || ""}
              onChange={(e) => onCustomRangeChange("start", e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">To:</span>
            <input
              type="date"
              value={customRange?.end || ""}
              onChange={(e) => onCustomRangeChange("end", e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <span className="text-[11px] text-slate-500">
            * Dates are interpreted based on your calendar and translated to UTC / TCT seconds.
          </span>
        </div>
      )}
    </div>
  );
}
