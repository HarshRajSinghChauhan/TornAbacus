"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, ShieldCheck, Plane, BarChart3, Lock } from "lucide-react";

export function SeoFaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "What is TornAbacus?",
      a: "TornAbacus is a free, 100% client-side financial ledger and travel profit analytics dashboard designed specifically for players of Torn City (torn.com). It tracks overseas plushie/flower running, flight costs, NPC city shop buys, bazaar sales, and item market transactions to calculate true realized profit and return on investment (ROI).",
    },
    {
      q: "How does TornAbacus calculate travel profit and ROI?",
      a: "TornAbacus applies the standard accounting principle of Cost of Goods Sold (COGS). Unsold inventory held in stock is treated as an asset rather than an immediate loss. When you sell plushies, flowers, or drugs, the cost basis is matched to the units sold, deducting flight tickets and market fees to show your exact net realized profit.",
    },
    {
      q: "Is my Torn API key secure?",
      a: "Yes, 100%. TornAbacus has zero backend servers or databases. Your API key is stored exclusively in your browser's local storage ('localStorage') and communicates directly with official Torn API endpoints (api.torn.com). Your key and financial data never pass through any third-party server.",
    },
    {
      q: "What Torn log types and actions are tracked?",
      a: "TornAbacus tracks overseas item purchases (Log 4201, 2400), NPC city shop purchases like Bits 'n' Bobs and Pharmacy (Log 4200, 4205), commercial and private airstrip flights (Log 6000, 2405, 2410), bazaar sales (Log 1210–1215), item market sales (Log 1113, 1220–1225), and direct player trades.",
    },
  ];

  return (
    <section aria-labelledby="seo-faq-heading" className="mt-12 mb-8 border-t border-slate-200 dark:border-slate-800/80 pt-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Torn City Travel & Financial Analytics</span>
          </div>
          <h2 id="seo-faq-heading" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            About TornAbacus & Overseas Travel Profits
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl mx-auto">
            Everything you need to know about tracking overseas item running, bazaar margins, and financial logs in Torn City.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-9 h-9 mx-auto rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Plane className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-200 text-sm">Overseas Runs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tracks plushies, flowers, and items bought abroad with foreign destination attribution.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-9 h-9 mx-auto rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-200 text-sm">COGS Realized Profit</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Unsold inventory is counted as stock, matching buy costs accurately as items sell in your bazaar.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-9 h-9 mx-auto rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-200 text-sm">Zero Server Footprint</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              100% private in-browser storage. Your API key never touches a database or external backend.
            </p>
          </div>
        </div>

        {/* Accordion FAQ */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 text-sm font-medium text-slate-900 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? "rotate-180 text-emerald-500" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/50 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
