"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Search,
  Download,
  Printer,
  FileSpreadsheet,
  Store,
  ShoppingBag,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Receipt,
  Boxes,
  Loader2,
  CalendarRange,
  RefreshCcw,
  IndianRupee,
  Layers,
  Sparkles,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { api } from "@/lib/api";

function getProductImageUrl(imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  if (imagePath.startsWith("/")) return imagePath;
  return `/${imagePath}`;
}

export default function PosSaleReportPage() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [activeFromDate, setActiveFromDate] = useState(todayStr);
  const [activeToDate, setActiveToDate] = useState(todayStr);

  const [dateGroups, setDateGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedDates, setCollapsedDates] = useState({});

  // Fetch API data
  const loadSaleReport = useCallback(async (fDate = activeFromDate, tDate = activeToDate) => {
    setLoading(true);
    try {
      const res = await api.getPosSaleReport({
        fromdate: fDate,
        todate: tDate,
      });

      if (res && (res.status === true || res.status === "success" || Array.isArray(res.products))) {
        const rawProducts = Array.isArray(res.products) ? res.products : [];
        setDateGroups(rawProducts);
      } else {
        setDateGroups([]);
      }
    } catch (err) {
      console.error("Failed to load sale report:", err);
      setDateGroups([]);
    } finally {
      setLoading(false);
    }
  }, [activeFromDate, activeToDate]);

  useEffect(() => {
    loadSaleReport(activeFromDate, activeToDate);
  }, [activeFromDate, activeToDate, loadSaleReport]);

  const handleFilterSubmit = (e) => {
    if (e) e.preventDefault();
    setActiveFromDate(fromDate);
    setActiveToDate(toDate);
  };

  const handlePresetSelect = (presetId) => {
    const today = new Date();
    const formatDate = (d) => d.toISOString().slice(0, 10);

    let start = todayStr;
    let end = todayStr;

    if (presetId === "today") {
      start = todayStr;
      end = todayStr;
    } else if (presetId === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      start = formatDate(y);
      end = formatDate(y);
    } else if (presetId === "last-7") {
      const l7 = new Date();
      l7.setDate(l7.getDate() - 6);
      start = formatDate(l7);
      end = todayStr;
    } else if (presetId === "this-month") {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      start = formatDate(firstDay);
      end = todayStr;
    }

    setFromDate(start);
    setToDate(end);
    setActiveFromDate(start);
    setActiveToDate(end);
  };

  const toggleDateGroup = (dateKey) => {
    setCollapsedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  const handleToggleAll = (expand) => {
    const nextState = {};
    dateGroups.forEach((d) => {
      nextState[d.date] = !expand;
    });
    setCollapsedDates(nextState);
  };

  // Filter products by search query (supports categories structure or fallback flat items)
  const filteredDateGroups = useMemo(() => {
    return dateGroups
      .map((group) => {
        const q = searchQuery.trim().toLowerCase();

        // Check if group has categories
        if (Array.isArray(group.categories) && group.categories.length > 0) {
          const filteredCategories = group.categories
            .map((cat) => {
              const items = Array.isArray(cat.items)
                ? cat.items
                : Array.isArray(cat.products)
                ? cat.products
                : [];

              const matchingItems = items.filter((item) => {
                if (!q) return true;
                return (
                  (item.name && item.name.toLowerCase().includes(q)) ||
                  (item.sku && String(item.sku).toLowerCase().includes(q)) ||
                  (item.variant && item.variant.toLowerCase().includes(q)) ||
                  (item.product_id && String(item.product_id).includes(q)) ||
                  (cat.category_name && cat.category_name.toLowerCase().includes(q))
                );
              });

              if (matchingItems.length === 0) return null;

              const catQty = matchingItems.reduce(
                (acc, curr) => acc + (Number(curr.total_quantity) || 0),
                0
              );
              const catAmount = matchingItems.reduce(
                (acc, curr) => acc + (Number(curr.total_amount) || 0),
                0
              );

              return {
                ...cat,
                items: matchingItems,
                total_quantity: catQty,
                total_amount: catAmount,
              };
            })
            .filter(Boolean);

          if (filteredCategories.length === 0) return null;

          const totalQty = filteredCategories.reduce(
            (acc, cat) => acc + (Number(cat.total_quantity) || 0),
            0
          );
          const totalAmount = filteredCategories.reduce(
            (acc, cat) => acc + (Number(cat.total_amount) || 0),
            0
          );
          const totalDistinctProducts = filteredCategories.reduce(
            (acc, cat) => acc + cat.items.length,
            0
          );

          return {
            ...group,
            categories: filteredCategories,
            totalQty,
            totalAmount,
            totalDistinctProducts,
          };
        } else {
          // Fallback flat items
          const items = Array.isArray(group.items) ? group.items : [];
          const matchingItems = items.filter((item) => {
            if (!q) return true;
            return (
              (item.name && item.name.toLowerCase().includes(q)) ||
              (item.sku && String(item.sku).toLowerCase().includes(q)) ||
              (item.variant && item.variant.toLowerCase().includes(q)) ||
              (item.product_id && String(item.product_id).includes(q))
            );
          });

          if (matchingItems.length === 0) return null;

          const totalQty = matchingItems.reduce(
            (acc, curr) => acc + (Number(curr.total_quantity) || 0),
            0
          );
          const totalAmount = matchingItems.reduce(
            (acc, curr) => acc + (Number(curr.total_amount) || 0),
            0
          );

          return {
            ...group,
            items: matchingItems,
            totalQty,
            totalAmount,
            totalDistinctProducts: matchingItems.length,
          };
        }
      })
      .filter(Boolean);
  }, [dateGroups, searchQuery]);

  // Overall calculations across all dates
  const grandTotalQuantity = useMemo(() => {
    return filteredDateGroups.reduce((acc, g) => acc + (g.totalQty || 0), 0);
  }, [filteredDateGroups]);

  const grandTotalAmount = useMemo(() => {
    return filteredDateGroups.reduce((acc, g) => acc + (g.totalAmount || 0), 0);
  }, [filteredDateGroups]);

  const grandTotalOrders = useMemo(() => {
    return filteredDateGroups.reduce((acc, g) => acc + (g.totalOrders || 0), 0);
  }, [filteredDateGroups]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Date",
      "Category",
      "SL No",
      "Product ID",
      "SKU",
      "Product Name",
      "Variant",
      "Unit Price (INR)",
      "Sell Quantity",
      "Total Amount (INR)",
      "Orders Count",
    ];

    const rows = [];
    filteredDateGroups.forEach((group) => {
      if (Array.isArray(group.categories)) {
        group.categories.forEach((cat) => {
          (cat.items || []).forEach((item, index) => {
            rows.push([
              group.date,
              `"${(cat.category_name || "").replace(/"/g, '""')}"`,
              item.sl_no || index + 1,
              item.product_id || "",
              `"${item.sku || ""}"`,
              `"${(item.name || "").replace(/"/g, '""')}"`,
              `"${item.variant || ""}"`,
              item.unit_price || 0,
              item.total_quantity || 0,
              item.total_amount || 0,
              item.orders_count || 0,
            ]);
          });
        });
      } else if (Array.isArray(group.items)) {
        group.items.forEach((item, index) => {
          rows.push([
            group.date,
            `"${(item.category_name || "").replace(/"/g, '""')}"`,
            item.sl_no || index + 1,
            item.product_id || "",
            `"${item.sku || ""}"`,
            `"${(item.name || "").replace(/"/g, '""')}"`,
            `"${item.variant || ""}"`,
            item.unit_price || 0,
            item.total_quantity || 0,
            item.total_amount || 0,
            item.orders_count || 0,
          ]);
        });
      }
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `POS_Sale_Report_${activeFromDate}_to_${activeToDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) return dateString;
      return dateObj.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getDayOfWeek = (dateString) => {
    if (!dateString) return "";
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) return "";
      return dateObj.toLocaleDateString("en-IN", { weekday: "long" });
    } catch (e) {
      return "";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Store className="w-5 h-5 text-emerald-600" />
              <span>POS Sale Report</span>
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <Link href="/dashboard" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Home
              </Link>
              <span className="text-slate-400">&gt;</span>
              <Link href="/pos-order-list" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Sales
              </Link>
              <span className="text-slate-400">&gt;</span>
              <span className="text-slate-600 font-medium">Sale Report</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Date Filter & Search Bar */}
        <form
          onSubmit={handleFilterSubmit}
          className="bg-white p-5 border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs space-y-4"
        >
          {/* Quick Presets Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 mr-1.5 flex items-center gap-1">
                <CalendarRange className="w-3.5 h-3.5 text-emerald-600" />
                Quick Range:
              </span>
              {[
                { id: "today", label: "Today" },
                { id: "yesterday", label: "Yesterday" },
                { id: "last-7", label: "Last 7 Days" },
                { id: "this-month", label: "This Month" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetSelect(p.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => handleToggleAll(true)}
                className="text-emerald-700 hover:underline font-semibold cursor-pointer"
              >
                Expand All
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleToggleAll(false)}
                className="text-slate-600 hover:underline font-semibold cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Form Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-3 items-center">
            {/* From Date */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                From Date
              </label>
              <input
                type="date"
                name="fromdate"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>

            {/* To Date */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                To Date
              </label>
              <input
                type="date"
                name="todate"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>

            {/* Filter Submit Button */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Filter
              </label>
              <button
                type="submit"
                className="w-full h-[36px] flex items-center justify-center gap-1.5 rounded-xl bg-[#00a859] hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Filter Report</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="lg:col-span-4">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Search Product / SKU / Category
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search product, SKU, variant, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Date-Wise & Category-Wise Product List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-16 text-center shadow-2xs">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-600">Loading date-wise sale report...</p>
            </div>
          ) : filteredDateGroups.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-16 text-center shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Sale Records Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No products were sold for the selected date range ({formatDateDisplay(activeFromDate)} to {formatDateDisplay(activeToDate)}).
              </p>
            </div>
          ) : (
            filteredDateGroups.map((group) => {
              const isCollapsed = !!collapsedDates[group.date];
              const hasCategories = Array.isArray(group.categories) && group.categories.length > 0;

              return (
                <div
                  key={group.date}
                  className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all duration-200"
                >
                  {/* Date Accordion Header */}
                  <div
                    onClick={() => toggleDateGroup(group.date)}
                    className="px-5 py-4 bg-slate-50/90 hover:bg-slate-100/90 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                            {formatDateDisplay(group.date)}
                          </h3>
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">
                            {getDayOfWeek(group.date) || group.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          {hasCategories && (
                            <>
                              <span>{group.categories.length} Categories</span>
                              <span>•</span>
                            </>
                          )}
                          <span>
                            {group.totalDistinctProducts || (group.items ? group.items.length : 0)} distinct items sold
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Daily Summary Badges */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Total Sell Qty
                        </span>
                        <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block">
                          {group.totalQty} Pcs Sold
                        </span>
                      </div>

                      <div className="p-1 text-slate-400 hover:text-slate-600 transition ml-2">
                        {isCollapsed ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Products Content for this Date */}
                  {!isCollapsed && (
                    <div className="divide-y divide-slate-200/70">
                      {hasCategories ? (
                        /* Render Grouped by Category */
                        group.categories.map((cat, catIdx) => {
                          const catItems = cat.items || [];
                          return (
                            <div key={cat.category_id || catIdx} className="p-0">
                              {/* Category Header Row */}
                              <div className="px-5 py-2.5 bg-slate-100/60 border-b border-slate-200/60 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                                    {cat.category_name || "Uncategorized"}
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                    {catItems.length} items
                                  </span>
                                </div>
                                <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-lg">
                                  {cat.total_quantity || catItems.reduce((a, b) => a + (Number(b.total_quantity) || 0), 0)} Pcs
                                </div>
                              </div>

                              {/* Category Products Table */}
                              <div className="overflow-x-auto">
                                <table className="w-full table-fixed text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                      <th className="py-2.5 px-4 w-[10%] text-center">SL No</th>
                                      <th className="py-2.5 px-4 w-[50%] text-left">Product Name & SKU</th>
                                      <th className="py-2.5 px-4 w-[20%] text-center">Variant / Size</th>
                                      <th className="py-2.5 px-4 w-[20%] text-center">Sell Quantity</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {catItems.map((item, idx) => {
                                      const imgSrc = getProductImageUrl(item.image);
                                      return (
                                        <tr
                                          key={`${group.date}-${cat.category_id}-${item.product_id}-${item.variant_id}-${idx}`}
                                          className="hover:bg-emerald-50/30 transition duration-150 group"
                                        >
                                          {/* SL No */}
                                          <td className="py-3 px-4 text-center text-slate-400 font-semibold">
                                            {item.sl_no || idx + 1}
                                          </td>

                                          {/* Product Name & Image */}
                                          <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                                                {imgSrc ? (
                                                  <img
                                                    src={imgSrc}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                                    onError={(e) => {
                                                      e.target.style.display = "none";
                                                    }}
                                                  />
                                                ) : (
                                                  <ShoppingBag className="w-4 h-4 text-slate-400" />
                                                )}
                                              </div>
                                              <div className="min-w-0 pr-2">
                                                <span
                                                  className="font-bold text-slate-900 block leading-snug truncate group-hover:text-emerald-700 transition"
                                                  title={item.name}
                                                >
                                                  {item.name}
                                                </span>
                                                <span className="text-[11px] text-slate-500 font-mono font-medium block mt-0.5">
                                                  SKU : <span className="text-slate-700 font-bold">{item.sku || "N/A"}</span>
                                                </span>
                                              </div>
                                            </div>
                                          </td>

                                          {/* Variant / Size */}
                                          <td className="py-3 px-4 text-center">
                                            <span className="text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/70 px-3 py-1 rounded-lg inline-block min-w-[50px] transition">
                                              {item.variant || "Standard"}
                                            </span>
                                          </td>

                                          {/* Sell Quantity - Highlighted */}
                                          <td className="py-3 px-4 text-center">
                                            <span className="px-3.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-2xs inline-block min-w-[54px]">
                                              {item.total_quantity || 0} Pcs
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        /* Flat Fallback Table */
                        <div className="overflow-x-auto">
                          <table className="w-full table-fixed text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                <th className="py-3 px-4 w-[10%] text-center">SL No</th>
                                <th className="py-3 px-4 w-[50%] text-left">Product Name & SKU</th>
                                <th className="py-3 px-4 w-[20%] text-center">Variant / Size</th>
                                <th className="py-3 px-4 w-[20%] text-center">Sell Quantity</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(group.items || []).map((item, idx) => {
                                const imgSrc = getProductImageUrl(item.image);
                                return (
                                  <tr
                                    key={`${group.date}-${item.product_id}-${item.variant_id}-${idx}`}
                                    className="hover:bg-emerald-50/30 transition duration-150 group"
                                  >
                                    <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">
                                      {item.sl_no || idx + 1}
                                    </td>
                                    <td className="py-3.5 px-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                                          {imgSrc ? (
                                            <img
                                              src={imgSrc}
                                              alt={item.name}
                                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                              onError={(e) => {
                                                e.target.style.display = "none";
                                              }}
                                            />
                                          ) : (
                                            <ShoppingBag className="w-4 h-4 text-slate-400" />
                                          )}
                                        </div>
                                        <div className="min-w-0 pr-2">
                                          <span className="font-bold text-slate-900 block leading-snug truncate group-hover:text-emerald-700 transition" title={item.name}>
                                            {item.name}
                                          </span>
                                          <span className="text-[11px] text-slate-500 font-mono font-medium block mt-0.5">
                                            SKU : <span className="text-slate-700 font-bold">{item.sku || "N/A"}</span>
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                      <span className="text-xs font-semibold text-slate-700 bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200/70 px-3 py-1 rounded-lg inline-block min-w-[50px] transition">
                                        {item.variant || "Standard"}
                                      </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                      <span className="px-3.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-2xs inline-block min-w-[54px]">
                                        {item.total_quantity || 0} Pcs
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Daily Subtotal Footer inside Date Accordion */}
                      <div className="px-5 py-3.5 bg-slate-50/90 border-t border-slate-200 flex items-center justify-between text-xs">
                        <span className="uppercase tracking-wider text-[11px] text-slate-600 font-bold">
                          Total for {formatDateDisplay(group.date)}:
                        </span>
                        <span className="font-black text-emerald-800 text-xs bg-emerald-100/80 px-3 py-1 rounded-lg border border-emerald-200/60">
                          {group.totalQty} Pcs Sold
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
