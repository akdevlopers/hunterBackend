"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  Calendar,
  Receipt,
  Loader2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { OrderPreviewModal } from "@/components/order/OrderPreviewModal";
import { api } from "@/lib/api";

export default function OnlineSaleBookPage() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [saleData, setSaleData] = useState({
    summary: { product_amount: 0, shipping_amount: 0, return_amount: 0, total_amount: 0 },
    total_orders: 0,
    data: [],
  });
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [search, setSearch] = useState("");
  const [previewOrder, setPreviewOrder] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    const res = await api.getOnlineSaleBook({
      fromDate,
      toDate,
    });
    if (res && (res.status === "success" || res.data)) {
      setSaleData({
        summary: res.summary || { product_amount: 0, shipping_amount: 0, return_amount: 0, total_amount: 0 },
        total_orders: res.total_orders || (res.data ? res.data.length : 0),
        data: res.data || [],
      });
    } else {
      setSaleData({
        summary: { product_amount: 0, shipping_amount: 0, return_amount: 0, total_amount: 0 },
        total_orders: 0,
        data: [],
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [fromDate, toDate]);

  const ordersList = saleData.data || [];

  const filteredOrders = ordersList.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (o.order_id && String(o.order_id).toLowerCase().includes(q)) ||
      (o.product_order_id && String(o.product_order_id).toLowerCase().includes(q)) ||
      (o.payment_type && String(o.payment_type).toLowerCase().includes(q))
    );
  });

  const summary = saleData.summary || {
    product_amount: 0,
    shipping_amount: 0,
    return_amount: 0,
    total_amount: 0,
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Sale Book (Online Orders)</h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Link href="/dashboard" className="text-emerald-600 hover:underline">
                Home
              </Link>
              <span>&gt;</span>
              <Link href="/order" className="text-emerald-600 hover:underline">
                Order
              </Link>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">Sale Book</span>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left 8 Cols: Sales Ledger Table */}
          <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Orders Ledger</span>
                {loading && <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin ml-1" />}
              </h3>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search order ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 font-bold text-slate-800 uppercase tracking-wider">
                    <th className="py-3 px-3 w-12">Sl.No</th>
                    <th className="py-3 px-3">OrderId</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Total Amount</th>
                    <th className="py-3 px-3">Payment Type</th>
                    <th className="py-3 px-3 text-center w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-3 px-3">
                          <div className="h-4 bg-slate-200 rounded w-6"></div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="h-4 bg-slate-200 rounded w-28"></div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="h-4 bg-slate-200 rounded w-24"></div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="h-4 bg-slate-200 rounded w-16"></div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="h-4 bg-slate-200 rounded w-14"></div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="h-7 w-7 bg-slate-200 rounded mx-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        No orders recorded for this period.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order, idx) => (
                      <tr key={order.id || idx} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-3 font-medium text-slate-400">
                          {order.sl_no || idx + 1}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                          #{order.order_id || order.product_order_id || order.id}
                        </td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap font-medium">
                          {order.date || order.order_date}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          ₹ {Number(order.total_amount ?? order.product_price ?? order.final_price ?? 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              order.payment_type === "Online" || order.raw_payment_type === "Razorpay"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {order.payment_type || "COD"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => setPreviewOrder(order)}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition cursor-pointer"
                            title="Quick Preview Order"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 4 Cols: Date Filter & Summary Cards */}
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Filter & Summary</span>
            </h3>

            {/* Date Filters */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={loadOrders}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Search Range</span>
              </button>
            </div>

            {/* Calculated Totals Box from Online Sale Book summary */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">Product Amount</label>
                <input
                  type="text"
                  readOnly
                  value={`₹ ${Number(summary.product_amount ?? 0).toFixed(2)}`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">Shipping Amount</label>
                <input
                  type="text"
                  readOnly
                  value={`₹ ${Number(summary.shipping_amount ?? 0).toFixed(2)}`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">Return Amount</label>
                <input
                  type="text"
                  readOnly
                  value={`₹ ${Number(summary.return_amount ?? 0).toFixed(2)}`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-rose-600"
                />
              </div>

              <div className="space-y-1 pt-1">
                <label className="block text-xs font-bold text-slate-900">Total Sales Value</label>
                <input
                  type="text"
                  readOnly
                  value={`₹ ${Number(summary.total_amount ?? 0).toFixed(2)}`}
                  className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm font-extrabold text-emerald-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Preview Modal */}
        <OrderPreviewModal
          isOpen={!!previewOrder}
          onClose={() => setPreviewOrder(null)}
          order={previewOrder}
        />
      </div>
    </AppLayout>
  );
}
