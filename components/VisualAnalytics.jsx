"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { formatCompactMoney, formatMoney, formatPercent } from "@/lib/utils";
import { PieChart as PieIcon, BarChart3, TrendingUp, DollarSign } from "lucide-react";

export default function VisualAnalytics({ expenseBreakdown = [], topProfitableItems = [] }) {
  const hasExpenses = expenseBreakdown && expenseBreakdown.length > 0;
  const hasItems = topProfitableItems && topProfitableItems.length > 0;

  // Total sum of all expenses in breakdown
  const totalExpenses = (expenseBreakdown || []).reduce(
    (sum, item) => sum + (Number(item.value) || 0),
    0
  );

  // Custom Dark Tooltip for Donut
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const pct = totalExpenses > 0 ? ((data.value / totalExpenses) * 100).toFixed(1) : 0;
      return (
        <div className="bg-slate-950 border border-slate-700/80 p-2.5 rounded-lg shadow-xl text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.payload.color }}
            />
            <span className="font-semibold text-slate-200">{data.name}</span>
          </div>
          <div className="font-mono text-white text-sm font-bold">
            {formatMoney(data.value)}
          </div>
          <div className="text-[10px] text-slate-400 font-sans mt-0.5">
            {pct}% of total costs
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Dark Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-slate-700/80 p-3 rounded-lg shadow-xl text-xs space-y-1">
          <div className="font-bold text-slate-200 flex items-center gap-1.5">
            <span>{item.name}</span>
            {item.country && (
              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {item.country}
              </span>
            )}
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-slate-800 text-slate-400">
            <span>Net Profit:</span>
            <span className="font-mono font-bold text-emerald-400">
              {formatMoney(item.profit)}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-slate-400">
            <span>Revenue:</span>
            <span className="font-mono text-sky-300">
              {formatMoney(item.revenue)}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-slate-400">
            <span>Cost:</span>
            <span className="font-mono text-rose-300">
              {formatMoney(item.cost)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 my-4">
      
      {/* Donut Chart: Expense Breakdown (5 cols) */}
      <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Expense Breakdown</h3>
              <p className="text-[11px] text-slate-400">
                Inventory vs Flight Tickets vs Market Fees
              </p>
            </div>
          </div>
        </div>

        {/* Donut with Center Stat Hole */}
        <div className="relative h-56 w-full flex items-center justify-center">
          {hasExpenses ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#090d16"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Inside Donut Center Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                  Total Costs
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-white tracking-tight">
                  {formatCompactMoney(totalExpenses)}
                </span>
              </div>
            </>
          ) : (
            <div className="text-center text-xs text-slate-500 py-10">
              No expenses recorded in selected time window
            </div>
          )}
        </div>

        {/* Detailed Legend with Names, Exact Numbers, and Percentages */}
        {hasExpenses && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1.5">
            {expenseBreakdown.map((item) => {
              const pct = totalExpenses > 0 ? ((item.value / totalExpenses) * 100).toFixed(1) : 0;
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between bg-slate-950/40 border border-slate-800/60 px-2.5 py-1.5 rounded-lg text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-300 font-medium text-[11px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-white font-semibold text-xs">
                      {formatMoney(item.value)}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-sans">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bar Chart: Top Profitable Items (7 cols) */}
      <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Top Profitable Items</h3>
              <p className="text-[11px] text-slate-400">
                Highest net profit generators (Revenue - Costs - Fees)
              </p>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          {hasItems ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProfitableItems}
                margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickFormatter={(val) => formatCompactMoney(val)}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="profit"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Net Profit"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-center text-xs text-slate-500 py-10">
              No profitable items recorded in this range
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
