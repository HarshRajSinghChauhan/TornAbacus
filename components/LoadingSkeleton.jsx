import React from "react";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 my-6 animate-pulse">
      {/* KPI Cards Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
            </div>
            <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800 rounded mt-3"></div>
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded mt-2"></div>
          </div>
        ))}
      </div>

      {/* Charts Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 h-72 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
          <div className="h-48 w-48 rounded-full border-4 border-slate-200 dark:border-slate-800 mx-auto"></div>
        </div>
        <div className="lg:col-span-7 h-72 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4">
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
          <div className="h-48 w-full bg-slate-200/50 dark:bg-slate-800/40 rounded"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-full bg-slate-200/60 dark:bg-slate-800/50 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
