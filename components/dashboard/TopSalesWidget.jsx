"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Flame, Sparkles, ShoppingBag, TrendingUp, Package } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { formatCurrency } from "@/lib/utils";

const PERIOD_TABS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

export function TopSalesWidget({ title, type = "top_selling", data = [] }) {
  const [activePeriod, setActivePeriod] = useState("all");

  const isTabbed = !Array.isArray(data) && data && typeof data === "object" && Object.keys(data).length > 0;
  const items = Array.isArray(data) ? data : (data[activePeriod] || data.all || []);

  const getProductImage = (item) => {
    if (item.cover_image_url) return item.cover_image_url;
    if (item.cover_image_path) {
      return item.cover_image_path.startsWith("http")
        ? item.cover_image_path
        : `https://meetay.com/${item.cover_image_path}`;
    }
    if (item.image) return item.image;
    if (item.logo) return item.logo;
    return null;
  };

  const isLatest = type === "latest" || type === "brand";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="space-y-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
              isLatest
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
            }`}
          >
            {isLatest ? <Sparkles className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          </div>
        </div>

        {/* Period Filter Tabs (if tabbed data provided) */}
        {isTabbed && (
          <Tabs
            tabs={PERIOD_TABS}
            activeTab={activePeriod}
            onChange={setActivePeriod}
            size="sm"
            className="w-full"
          />
        )}
      </div>

      {/* Items List */}
      <div className="space-y-2.5 mt-1 flex-1">
        {items.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-xs text-slate-400">
            No products found.
          </div>
        ) : (
          items.map((item, idx) => {
            const imgSrc = getProductImage(item);
            const price = item.sale_price ?? item.price ?? item.sales ?? 0;
            const linkHref = item.id ? `/product/edit/${item.id}` : "#!";

            return (
              <Link
                key={item.id || idx}
                href={linkHref}
                className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border border-transparent hover:border-slate-100 dark:hover:border-slate-800/80 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-slate-400 w-4 text-center shrink-0">
                    {idx + 1}
                  </span>

                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=80&auto=format&fit=crop&q=80";
                      }}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-400">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {isLatest
                        ? (item.created_at ? `Added ${new Date(item.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}` : (item.product_stock !== undefined ? `Stock: ${item.product_stock}` : ""))
                        : (item.product_stock !== undefined ? `Stock: ${item.product_stock}` : (item.count ? `${item.count} items sold` : ""))}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(price)}
                  </p>
                  <span
                    className={`text-[10px] font-medium flex items-center justify-end gap-0.5 ${
                      isLatest ? "text-indigo-600 dark:text-indigo-400" : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                   
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
