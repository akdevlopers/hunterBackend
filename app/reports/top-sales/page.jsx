"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Download,
  ShoppingBag,
  Layers,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const TOP_PRODUCTS = [
  { rank: 1, name: "Greige Washed Henley Full Sleeve Tee", salesCount: 142, revenue: 42458 },
  { rank: 2, name: "Classic Oxford Cotton Casual Shirt", salesCount: 118, revenue: 153282 },
  { rank: 3, name: "Slim Fit Stretch Denim Trousers", salesCount: 95, revenue: 142405 },
  { rank: 4, name: "Luxury Pique Polo Shirt Navy", salesCount: 84, revenue: 75516 },
  { rank: 5, name: "Tailored Linen Casual Blazer", salesCount: 62, revenue: 154938 },
];

const TOP_CATEGORIES = [
  { rank: 1, name: "Shirts & Polos", count: 320, share: "45%" },
  { rank: 2, name: "T-Shirts & Henley", count: 240, share: "32%" },
  { rank: 3, name: "Trousers & Chinos", count: 180, share: "23%" },
];

export default function TopSalesReportsPage() {
  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header Breadcrumbs */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>Top Sales Reports</span>
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Link href="/dashboard" className="text-emerald-600 hover:underline">
                Home
              </Link>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">Top Sales Reports</span>
            </div>
          </div>
        </div>

        {/* 2-Column Dashboard Cards matching top_5_reports.blade.php */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 1: Top Selling Products */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Top Selling Products</span>
            </h3>

            <div className="space-y-3">
              {TOP_PRODUCTS.map((prod) => (
                <div
                  key={prod.rank}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                      #{prod.rank}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      {prod.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 block">
                      {prod.salesCount} sold
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      ₹ {prod.revenue.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Top Selling Categories */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Top Selling Categories</span>
            </h3>

            <div className="space-y-3">
              {TOP_CATEGORIES.map((cat) => (
                <div
                  key={cat.rank}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-black text-xs flex items-center justify-center">
                      #{cat.rank}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      {cat.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 block">
                      {cat.count} units
                    </span>
                    <span className="text-[11px] text-sky-700 font-semibold">
                      {cat.share} share
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
