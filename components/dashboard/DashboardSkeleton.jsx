import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 8 Order & Customer KPI Statistic Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="w-10 h-10 rounded-xl" />
            </div>
            <div className="flex items-baseline justify-between gap-2 pt-1">
              <Skeleton className="h-7 w-16 rounded" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Section: Top selling Products + Latest Products + Storage Meter Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top Selling Products Skeleton */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="h-5 w-36 rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 p-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Skeleton className="w-4 h-4 rounded shrink-0" />
                  <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Skeleton className="h-3.5 w-3/4 rounded" />
                    <Skeleton className="h-2.5 w-1/2 rounded" />
                  </div>
                </div>
                <Skeleton className="h-4 w-14 rounded shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Latest Products Skeleton */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="h-5 w-32 rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 p-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Skeleton className="w-4 h-4 rounded shrink-0" />
                  <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Skeleton className="h-3.5 w-3/4 rounded" />
                    <Skeleton className="h-2.5 w-1/2 rounded" />
                  </div>
                </div>
                <Skeleton className="h-4 w-14 rounded shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Storage Meter Skeleton */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-5">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <Skeleton className="h-5 w-28 rounded" />
          </div>
          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            <Skeleton className="w-32 h-32 rounded-full" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Recent Orders Table Skeleton */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div className="space-y-1">
            <Skeleton className="h-5 w-44 rounded" />
            <Skeleton className="h-3 w-64 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-8 w-28 rounded-xl" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 pr-4"><Skeleton className="h-3 w-16" /></th>
                <th className="pb-3 px-4"><Skeleton className="h-3 w-20" /></th>
                <th className="pb-3 px-4"><Skeleton className="h-3 w-14" /></th>
                <th className="pb-3 px-4"><Skeleton className="h-3 w-12" /></th>
                <th className="pb-3 px-4"><Skeleton className="h-3 w-20" /></th>
                <th className="pb-3 px-4"><Skeleton className="h-3 w-16" /></th>
                <th className="pb-3 pl-4 text-right"><Skeleton className="h-3 w-14 ml-auto" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td className="py-3.5 pr-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="py-3.5 px-4 space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-2.5 w-36" />
                  </td>
                  <td className="py-3.5 px-4"><Skeleton className="h-3.5 w-24" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-3.5 w-12" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="py-3.5 px-4"><Skeleton className="h-4 w-12 rounded" /></td>
                  <td className="py-3.5 pl-4 text-right"><Skeleton className="h-5 w-20 rounded-full ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
