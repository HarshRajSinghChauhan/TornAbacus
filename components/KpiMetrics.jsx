import React from "react";
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Plane,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  BadgeAlert,
  Wallet,
} from "lucide-react";
import { formatMoney, formatPercent, formatCompactMoney } from "@/lib/utils";

export default function KpiMetrics({ kpis }) {
  const {
    netProfit = 0,
    grossRevenue = 0,
    totalExpenses = 0,
    overseasCost = 0,
    flightCost = 0,
    marketFees = 0,
    tripsRun = 0,
    roi = 0,
  } = kpis || {};

  const isProfitable = netProfit >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 my-4">
      
      {/* 1. Net Profit */}
      <div
        className={`relative overflow-hidden rounded-xl border p-4 bg-slate-900/80 backdrop-blur-sm transition-all duration-300 hover:border-slate-700 ${
          isProfitable ? "border-emerald-500/40 glow-emerald" : "border-rose-500/40 glow-rose"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Net Profit</span>
          <div
            className={`p-1.5 rounded-lg ${
              isProfitable ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
            }`}
          >
            {isProfitable ? <TrendingUp className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span
            className={`text-2xl font-black tracking-tight font-mono ${
              isProfitable ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {formatMoney(netProfit)}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold ${
              isProfitable
                ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                : "bg-rose-950/60 text-rose-300 border border-rose-800/60"
            }`}
          >
            {formatPercent(roi)} ROI
          </span>
          <span className="text-slate-500 text-[11px]">after all costs &amp; fees</span>
        </div>
      </div>

      {/* 2. Gross Revenue */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm p-4 transition-all duration-300 hover:border-sky-500/40 hover:glow-sky">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Gross Revenue</span>
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight font-mono text-sky-400">
            {formatMoney(grossRevenue)}
          </span>
        </div>

        <div className="mt-2 text-xs text-slate-400">
          <span className="text-slate-300 font-medium">Bazaars &amp; Market</span> item sales
        </div>
      </div>

      {/* 3. Total Expenses */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm p-4 transition-all duration-300 hover:border-rose-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Total Expenses</span>
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight font-mono text-rose-400">
            {formatMoney(totalExpenses)}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>Items: {formatCompactMoney(overseasCost)}</span>
          <span className="text-slate-600">•</span>
          <span>Flights: {formatCompactMoney(flightCost)}</span>
        </div>
      </div>

      {/* 4. Market Fees */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm p-4 transition-all duration-300 hover:border-amber-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Market Fees Paid</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Receipt className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight font-mono text-amber-400">
            {formatMoney(marketFees)}
          </span>
        </div>

        <div className="mt-2 text-xs text-slate-400">
          <span className="text-slate-300 font-medium">
            {grossRevenue > 0 ? ((marketFees / grossRevenue) * 100).toFixed(1) : 0}%
          </span>{" "}
          of gross sales
        </div>
      </div>

      {/* 5. Trips Run */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm p-4 transition-all duration-300 hover:border-purple-500/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Trips Run</span>
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Plane className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight font-mono text-purple-300">
            {tripsRun}
          </span>
          <span className="text-xs text-slate-400 font-sans">overseas flights</span>
        </div>

        <div className="mt-2 text-xs text-slate-400">
          {tripsRun > 0 ? (
            <span>Avg {formatMoney(tripsRun > 0 ? Math.round(netProfit / tripsRun) : 0)} / trip</span>
          ) : (
            <span>No flights recorded</span>
          )}
        </div>
      </div>

    </div>
  );
}
