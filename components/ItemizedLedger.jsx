"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  ArrowUpDown,
  Download,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
} from "lucide-react";
import { formatMoney, formatPercent, formatNumber } from "@/lib/utils";
import { getCountryDetails } from "@/lib/tornItems";

export default function ItemizedLedger({ ledgerItems = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("netProfit"); // netProfit, qtySold, roi, totalRevenue, costAbroad
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' | 'desc'
  const [selectedCountry, setSelectedCountry] = useState("all");

  // Countries present in the current items list
  const availableCountries = useMemo(() => {
    const set = new Set();
    ledgerItems.forEach((item) => {
      if (item.country) set.add(item.country);
    });
    return Array.from(set).sort();
  }, [ledgerItems]);

  // Filter and sort
  const filteredItems = useMemo(() => {
    return ledgerItems
      .filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.country && item.country.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCountry =
          selectedCountry === "all" || item.country === selectedCountry;
        return matchesSearch && matchesCountry;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [ledgerItems, searchQuery, selectedCountry, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (filteredItems.length === 0) return;

    const headers = [
      "Item Name",
      "Country",
      "Qty Bought",
      "Buy Cost",
      "Avg Buy Price",
      "Qty Sold",
      "Qty In Stock",
      "Inventory Value",
      "COGS",
      "Total Revenue",
      "Avg Sell Price",
      "Fees Paid",
      "Net Profit",
      "ROI %",
    ];

    const rows = filteredItems.map((item) => [
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.country || "Abroad"}"`,
      item.qtyBought,
      item.costAbroad,
      item.avgBuyPrice,
      item.qtySold,
      item.qtyInStock,
      item.inventoryValue,
      item.costOfGoodsSold,
      item.totalRevenue,
      item.avgSellPrice,
      item.feesPaid,
      item.qtySold === 0 && item.qtyBought > 0 ? "In stock" : item.netProfit,
      item.roi !== null ? item.roi.toFixed(1) : "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TornAbacus_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 my-6 shadow-sm transition-colors duration-150">
      
      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Itemized Ledger
            </h2>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
              {filteredItems.length} items
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Grouped overseas purchases, domestic sales, commission fees, and net profit margins
          </p>
        </div>

        {/* Search, Country Filter, and CSV Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-emerald-500 rounded-lg text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none w-44 sm:w-52"
            />
          </div>

          {/* Country Filter */}
          {availableCountries.length > 0 && (
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Countries</option>
              {availableCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            disabled={filteredItems.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50 shadow-sm"
            title="Download CSV Spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold bg-slate-50 dark:bg-slate-950/40 select-none">
              <th
                onClick={() => handleSort("name")}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Item Name</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort("qtyBought")}
                className="py-3 px-2 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                Qty Bought
              </th>
              <th
                onClick={() => handleSort("costAbroad")}
                className="py-3 px-2 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                Buy Cost
              </th>
              <th
                onClick={() => handleSort("avgBuyPrice")}
                className="py-3 px-2 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                Avg Buy
              </th>
              <th
                onClick={() => handleSort("qtySold")}
                className="py-3 px-2 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                Qty Sold
              </th>
              <th
                onClick={() => handleSort("qtyInStock")}
                className="py-3 px-2 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                In Stock
              </th>
              <th
                onClick={() => handleSort("totalRevenue")}
                className="py-3 px-2 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                Revenue
              </th>
              <th
                onClick={() => handleSort("avgSellPrice")}
                className="py-3 px-2 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                Avg Sell
              </th>
              <th
                onClick={() => handleSort("feesPaid")}
                className="py-3 px-2 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                Fees
              </th>
              <th
                onClick={() => handleSort("netProfit")}
                className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center justify-end gap-1 text-emerald-600 dark:text-emerald-400">
                  <span>Net Profit</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("roi")}
                className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                ROI %
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => {
                const countryData = getCountryDetails(item.country);
                const isProfitable = item.netProfit >= 0;
                const isUnsoldStock = item.qtySold === 0 && item.qtyBought > 0;

                return (
                  <tr
                    key={item.name + idx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Item Name & Tags */}
                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                          {item.name}
                        </span>
                        {item.hasNoCostBasis && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
                            No cost basis
                          </span>
                        )}
                        {item.hasPartialCostBasis && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60" title="Sales exceed recorded purchases in this timeframe">
                            Partial basis
                          </span>
                        )}
                        {item.country && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
                            <span>{countryData?.flag || "✈️"}</span>
                            <span>{item.country}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Qty Bought */}
                    <td className="py-2.5 px-2 text-right text-slate-700 dark:text-slate-300">
                      {formatNumber(item.qtyBought)}
                    </td>

                    {/* Buy Cost */}
                    <td className="py-2.5 px-2 text-right text-rose-600 dark:text-rose-300">
                      {formatMoney(item.costAbroad)}
                    </td>

                    {/* Avg Buy */}
                    <td className="py-2.5 px-2 text-right text-slate-500 dark:text-slate-400">
                      {item.avgBuyPrice > 0 ? formatMoney(item.avgBuyPrice) : "-"}
                    </td>

                    {/* Qty Sold */}
                    <td className="py-2.5 px-2 text-right text-slate-700 dark:text-slate-300">
                      {formatNumber(item.qtySold)}
                    </td>

                    {/* In Stock (qty on top, inventory value underneath) */}
                    <td className="py-2.5 px-2 text-right">
                      <div className={item.qtyInStock > 0 ? "font-semibold text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-600"}>
                        {formatNumber(item.qtyInStock)}
                      </div>
                      {item.inventoryValue > 0 && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {formatMoney(item.inventoryValue)}
                        </div>
                      )}
                    </td>

                    {/* Revenue */}
                    <td className="py-2.5 px-2 text-right text-sky-600 dark:text-sky-300 font-semibold">
                      {formatMoney(item.totalRevenue)}
                    </td>

                    {/* Avg Sell */}
                    <td className="py-2.5 px-2 text-right text-slate-500 dark:text-slate-400">
                      {item.avgSellPrice > 0 ? formatMoney(item.avgSellPrice) : "-"}
                    </td>

                    {/* Fees Paid */}
                    <td className="py-2.5 px-2 text-right text-amber-600 dark:text-amber-400/90">
                      {item.feesPaid > 0 ? formatMoney(item.feesPaid) : "$0"}
                    </td>

                    {/* Net Profit */}
                    <td className="py-2.5 px-3 text-right font-bold">
                      {isUnsoldStock ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-sans">
                          In stock
                        </span>
                      ) : (
                        <span className={item.netProfit > 0 ? "text-emerald-600 dark:text-emerald-400" : item.netProfit < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"}>
                          {formatMoney(item.netProfit, true)}
                        </span>
                      )}
                    </td>

                    {/* ROI */}
                    <td className="py-2.5 px-3 text-right">
                      {item.roi === null ? (
                        <span className="text-slate-400 dark:text-slate-500 font-mono text-xs">–</span>
                      ) : (
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            item.roi >= 0
                              ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60"
                              : "bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60"
                          }`}
                        >
                          {formatPercent(item.roi)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-400 dark:text-slate-500 font-sans">
                  No transaction items found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
