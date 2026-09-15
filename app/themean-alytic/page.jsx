"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  Eye,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Filter,
  Calendar,
  Download,
  Share2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { VisitorTimelineChart } from "@/components/analytics/VisitorTimelineChart";
import { TopUrlTable } from "@/components/analytics/TopUrlTable";
import { DeviceDonutChart } from "@/components/analytics/DeviceDonutChart";
import { PlatformBarChart } from "@/components/analytics/PlatformBarChart";
import { BrowserDonutChart } from "@/components/analytics/BrowserDonutChart";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { MOCK_ANALYTICS_DATA } from "@/lib/mockData";

export default function ThemeAnalyticsPage() {
  const [data, setData] = useState(MOCK_ANALYTICS_DATA);
  const [timeRange, setTimeRange] = useState("month");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getThemeAnalytics(timeRange);
        if (res) setData(res);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [timeRange]);

  const { timeline, kpis, top_urls, device_breakdown, platform_breakdown, browser_breakdown } = data;

  return (
    <AppLayout>
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-brand-50 via-indigo-50/70 to-slate-100 dark:from-brand-950/60 dark:via-indigo-950/40 dark:to-slate-900 border border-brand-200/80 dark:border-brand-500/20 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Store Analytics</span>
            <Badge variant="brand" size="xs">Live Telemetry</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Traffic & Theme Engagement
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Real-time storefront visitors, geographic devices, browser engines, and top product URLs.
          </p>
        </div>

        {/* Date Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-300/80 dark:border-slate-800">
            {["week", "month", "year"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                  timeRange === range
                    ? "bg-brand-600 text-white font-semibold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {range === "week" ? "Last 7 Days" : range === "month" ? "15 Days" : "This Year"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Page Views"
          value={kpis?.total_views || 11210}
          percentage={kpis?.views_growth || "+ 24.6%"}
          icon={Eye}
          iconColor="text-brand-500 bg-brand-500/10"
        />
        <StatCard
          label="Unique Visitors"
          value={kpis?.unique_visitors || 8810}
          percentage={kpis?.unique_growth || "+ 19.8%"}
          icon={Users}
          iconColor="text-blue-500 bg-blue-500/10"
        />
        <StatCard
          label="Avg. Session Time"
          value={kpis?.avg_session_duration || "3m 48s"}
          percentage="+ 12.4%"
          icon={Clock}
          iconColor="text-emerald-500 bg-emerald-500/10"
        />
        <StatCard
          label="Bounce Rate"
          value={kpis?.bounce_rate || "28.4%"}
          percentage="- 3.2%"
          icon={TrendingUp}
          iconColor="text-purple-500 bg-purple-500/10"
        />
      </div>

      {/* Main Visitor Timeline Area Chart */}
      <div>
        <VisitorTimelineChart data={timeline} />
      </div>

      {/* Breakdown Grid: Top URLs + Device + Platform + Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <TopUrlTable urls={top_urls} />
        </div>
        <div className="lg:col-span-1">
          <DeviceDonutChart data={device_breakdown} />
        </div>
        <div className="lg:col-span-1">
          <BrowserDonutChart data={browser_breakdown} />
        </div>
      </div>

      {/* Platform Operating Systems */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="lg:col-span-2">
          <PlatformBarChart data={platform_breakdown} />
        </div>
      </div>
    </AppLayout>
  );
}
