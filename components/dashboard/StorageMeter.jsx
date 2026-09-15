"use client";

import React from "react";
import { HardDrive, Server, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function StorageMeter({ usedMb = 742.8, totalMb = 1024.0 }) {
  const percentage = Math.min(Math.round((usedMb / totalMb) * 100), 100);
  const remainingMb = (totalMb - usedMb).toFixed(1);

  // SVG Gauge calculations
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Storage Usage</h4>
            <p className="text-[11px] text-slate-500">Plan limit quota</p>
          </div>
        </div>
        <Badge variant={percentage > 85 ? "danger" : "brand"} size="xs">
          {percentage}% Used
        </Badge>
      </div>

      {/* Circular Gauge */}
      <div className="flex items-center justify-center my-4 relative">
        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-brand-600 dark:stroke-brand-500 transition-all duration-1000 ease-out"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{percentage}%</span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{usedMb.toFixed(1)} MB</span>
        </div>
      </div>

      {/* Storage Breakdown & Upgrade */}
      <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Available Storage:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{remainingMb} MB free</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Total Allowed Quota:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{totalMb} MB</span>
        </div>
      </div>
    </div>
  );
}
