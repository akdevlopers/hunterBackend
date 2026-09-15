"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Calendar,
  IndianRupee,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const ORDER_SALES_DATA = [
  { month: "Jan", orders: 60, revenue: 145000 },
  { month: "Feb", orders: 80, revenue: 168000 },
  { month: "Mar", orders: 90, revenue: 182000 },
  { month: "Apr", orders: 108, revenue: 195000 },
  { month: "May", orders: 113, revenue: 210000 },
  { month: "Jun", orders: 127, revenue: 225000 },
  { month: "Jul", orders: 145, revenue: 240000 },
  { month: "Aug", orders: 163, revenue: 275000 },
];

export default function OrderReportsPage() {
  const [filterRange, setFilterRange] = useState("year");
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });

  const totalOrders = ORDER_SALES_DATA.reduce((sum, d) => sum + d.orders, 0);
  const totalRevenue = ORDER_SALES_DATA.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header Breadcrumbs */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Order Reports</span>
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Link href="/dashboard" className="text-emerald-600 hover:underline">
                Home
              </Link>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">Order Reports</span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "year", label: "Year" },
                { id: "last-month", label: "Last month" },
                { id: "this-month", label: "This month" },
                { id: "seven-day", label: "Last 7 days" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterRange(tab.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    filterRange === tab.id
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
              />
              <button
                type="button"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
              >
                Generate
              </button>
            </div>
          </div>
        </div>

        {/* 2 Top Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Orders</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{totalOrders}</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Order Revenue</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                ₹ {totalRevenue.toLocaleString("en-IN")}
              </h3>
            </div>
          </div>
        </div>

        {/* Master Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Monthly Order Volume &amp; Sales Summary
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-y border-slate-200 font-bold text-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Total Orders</th>
                  <th className="py-3 px-4">Gross Revenue</th>
                  <th className="py-3 px-4 text-right">Average Order Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {ORDER_SALES_DATA.map((row) => {
                  const aov = Math.round(row.revenue / row.orders);
                  return (
                    <tr key={row.month} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {row.month} 2026
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {row.orders} orders
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700">
                        ₹ {row.revenue.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                        ₹ {aov.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
