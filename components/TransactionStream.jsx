"use client";

import React, { useState } from "react";
import { formatDualTime } from "@/lib/time";
import { formatMoney, formatNumber } from "@/lib/utils";
import { ACTION_TYPES } from "@/lib/logParser";
import {
  History,
  ChevronDown,
  ChevronUp,
  Filter,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export default function TransactionStream({ rawEvents = [] }) {
  const [isOpen, setIsOpen] = useState(true);
  const [filterAction, setFilterAction] = useState("ALL");
  const [limit, setLimit] = useState(25);

  const filters = [
    { id: "ALL", label: "All Activity" },
    { id: "BOUGHT_ABROAD", label: "✈️ Purchases" },
    { id: "BAZAAR_SALE", label: "🏪 Bazaar" },
    { id: "MARKET_SALE", label: "🏷️ Market" },
    { id: "FLIGHT", label: "🎫 Flights" },
    { id: "TRADE", label: "🤝 Trades" },
  ];

  const filteredEvents = rawEvents.filter((ev) => {
    if (filterAction === "ALL") return true;
    return ev.action === filterAction;
  });

  const displayedEvents = filteredEvents.slice(0, limit);

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800/80 rounded-xl my-6 overflow-hidden">
      
      {/* Stream Header & Accordion Toggle */}
      <div className="p-4 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
            <History className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Raw Transaction Stream
              </h3>
              <span className="text-[11px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded-full border border-slate-700">
                {rawEvents.length} events
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Chronological parsed activity log with dual TCT and local time indexing
            </p>
          </div>
        </div>

        {/* Toggle Collapse */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <span>{isOpen ? "Collapse Feed" : "Expand Feed"}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      {isOpen && (
        <div className="px-4 py-2.5 bg-slate-950/30 border-b border-slate-800/60 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterAction(f.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterAction === f.id
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Stream List */}
      {isOpen && (
        <div className="divide-y divide-slate-800/40 max-h-[480px] overflow-y-auto">
          {displayedEvents.length > 0 ? (
            displayedEvents.map((ev, index) => {
              const actionMeta = ACTION_TYPES[ev.action] || {
                label: ev.action,
                color: "text-slate-400 bg-slate-800 border-slate-700",
                badge: ev.action,
                type: "neutral",
              };
              const time = formatDualTime(ev.timestamp);

              const isRevenue = actionMeta.type === "revenue";
              const isExpense = actionMeta.type === "expense";
              const amount = isRevenue ? ev.revenue : ev.totalCost;

              return (
                <div
                  key={ev.id || index}
                  className="p-3 sm:px-4 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  {/* Left: Dual Time & Badge */}
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                    <div className="font-mono text-slate-400 text-[11px] flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] bg-slate-800 text-slate-300 font-sans px-1.5 py-0.5 rounded border border-slate-700/60" suppressHydrationWarning>
                        {time.dateFormatted}
                      </span>
                      <span className="text-slate-200" suppressHydrationWarning>{time.tct}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400" suppressHydrationWarning>{time.local}</span>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${actionMeta.color}`}
                    >
                      {actionMeta.badge}
                    </span>

                    <span className="text-slate-200 font-medium">
                      {ev.title}
                    </span>
                  </div>

                  {/* Right: Item Quantity & Financial Impact */}
                  <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-center font-mono">
                    {ev.quantity > 0 && ev.action !== "FLIGHT" && (
                      <span className="text-slate-500 text-[11px]">
                        x{formatNumber(ev.quantity)}
                      </span>
                    )}

                    {ev.fee > 0 && (
                      <span className="text-[11px] text-amber-400/80">
                        Fee: -{formatMoney(ev.fee)}
                      </span>
                    )}

                    <span
                      className={`font-bold ${
                        isRevenue
                          ? "text-emerald-400"
                          : isExpense
                          ? "text-rose-400"
                          : "text-slate-300"
                      }`}
                    >
                      {isRevenue ? `+${formatMoney(amount)}` : `-${formatMoney(amount)}`}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No transactions match this category.
            </div>
          )}
        </div>
      )}

      {/* Stream Footer with Pagination / Load More */}
      {isOpen && filteredEvents.length > limit && (
        <div className="p-3 bg-slate-950/40 text-center border-t border-slate-800/80">
          <button
            onClick={() => setLimit(limit + 25)}
            className="text-xs text-slate-400 hover:text-white font-medium transition-colors"
          >
            Show more ({filteredEvents.length - limit} remaining)
          </button>
        </div>
      )}

    </div>
  );
}
