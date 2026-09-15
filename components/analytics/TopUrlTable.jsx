"use client";

import React from "react";
import { Link2, ExternalLink } from "lucide-react";

export function TopUrlTable({ urls = [] }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Link2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Top Visited Pages</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Most requested storefront URLs and product paths</p>
          </div>
        </div>

        {/* List of URLs with percentage bars */}
        <div className="space-y-3 mt-4">
          {urls.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 w-3">{idx + 1}.</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate" title={item.url}>
                    {item.title || item.url}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-bold text-slate-900 dark:text-slate-100">
                  <span>{item.views.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">({item.percentage}%)</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span>Showing top {urls.length} pages</span>
        <span className="text-brand-600 dark:text-brand-400 font-medium">Updated live</span>
      </div>
    </div>
  );
}
