"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Printer,
  Trash2,
  Search,
  BookOpen,
  Loader2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { OrderPreviewModal } from "@/components/order/OrderPreviewModal";
import { api } from "@/lib/api";

export default function PosOrderListPage() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [posResponse, setPosResponse] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    summary: { cash_sale: 0, online_sale: 0, return: 0, total: 0 },
    data: [],
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [previewOrder, setPreviewOrder] = useState(null);

  // Date Filters (Default to Today)
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);

  const loadData = async (targetPage = page) => {
    setLoading(true);
    const res = await api.getPosOrders({
      page: targetPage,
      limit,
      fromDate,
      toDate,
    });
    if (res && (res.status === "success" || res.data)) {
      setPosResponse(res);
    } else {
      setPosResponse({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        summary: { cash_sale: 0, online_sale: 0, return: 0, total: 0 },
        data: [],
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(page);
  }, [page, fromDate, toDate]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    loadData(1);
  };

  const handleDeleteOrder = async (orderId) => {
    if (
      window.confirm(
        "Are You Sure Want to Cancel this Bill ?\nThis action cannot be undone."
      )
    ) {
      await api.deletePosOrder(orderId, fromDate, toDate);
      loadData(page);
    }
  };

  const handlePrintReceipt = (orderId) => {
    if (typeof window !== "undefined") {
      window.open(
        `/print-file/${orderId}`,
        "_blank",
        "width=450,height=650,toolbar=0,menubar=0,location=0"
      );
    }
  };

  const summary = posResponse.summary || {
    cash_sale: 0,
    online_sale: 0,
    return: 0,
    total: 0,
  };
  const orders = posResponse.data || [];
  const total = posResponse.total || 0;
  const totalPages = (posResponse.totalPages ?? Math.ceil(total / limit)) || 1;

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header Breadcrumbs */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>POS Order List</span>
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <Link href="/dashboard" className="text-emerald-600 hover:underline">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-slate-600 font-medium">POS Order List</span>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (8 cols): Orders Table */}
          <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-y border-slate-200 font-bold text-slate-800">
                    <th className="py-3 px-3 w-12 text-center">Sl.No</th>
                    <th className="py-3 px-3">OrderId</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3">Payment Type / Notes</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-3 px-3 text-center">
                          <div className="h-4 bg-slate-200 rounded w-6 mx-auto"></div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="h-4 bg-slate-200 rounded w-16"></div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="h-4 bg-slate-200 rounded w-28"></div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="h-4 bg-slate-200 rounded w-14"></div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="h-4 bg-slate-200 rounded w-24"></div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="h-6 w-20 bg-slate-200 rounded ml-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 text-center text-slate-400 font-medium"
                      >
                        No sales records found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order, idx) => {
                      const orderCode =
                        order.order_id ||
                        order.product_order_id ||
                        `${order.id}`;
                      const orderPrice =
                        order.final_price ?? order.price ?? order.total ?? 0;
                      const paymentInfo =
                        `${order.customer_payment_type || order.payment_type || "Cash"}`;

                      return (
                        <tr
                          key={order.id || idx}
                          className="hover:bg-slate-50/60 transition"
                        >
                          <td className="py-3 px-3 text-center font-semibold text-slate-500">
                            {order.sl_no || (page - 1) * limit + idx + 1}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                            #{orderCode}
                          </td>
                          <td className="py-3 px-3 text-slate-600 whitespace-nowrap font-medium">
                            {order.date || order.order_date}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            ₹ {Number(orderPrice).toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                            {paymentInfo}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick View Dialog Button */}
                              <button
                                type="button"
                                onClick={() => setPreviewOrder(order)}
                                className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-sky-500 hover:bg-sky-600 text-white shadow-2xs transition cursor-pointer"
                                title="View Order Preview"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Print button */}
                              <button
                                type="button"
                                onClick={() => handlePrintReceipt(order.id || order.order_id)}
                                className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-sky-500 hover:bg-sky-600 text-white shadow-2xs transition cursor-pointer"
                                title="Print Receipt"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Order button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteOrder(order.id || order.order_id)}
                                className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-rose-500 hover:bg-rose-600 text-white shadow-2xs transition cursor-pointer"
                                title="Cancel Bill"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {total > 0 && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span>
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, total)} of {total} entries
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page <= 1}
                    className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="px-2 font-semibold text-slate-800">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page >= totalPages}
                    className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (4 cols): Date Filter & Summary Cards */}
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Filter & Summary
            </h3>

            <form onSubmit={handleSearchSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Search</span>
              </button>
            </form>

            <div className="border-t border-slate-100 pt-3 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">Cash Sale</span>
                <span className="font-bold text-slate-900">
                  ₹ {Number(summary.cash_sale || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">Online Sale</span>
                <span className="font-bold text-slate-900">
                  ₹ {Number(summary.online_sale || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">Return</span>
                <span className="font-bold text-rose-600">
                  ₹ {Number(summary.return || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 font-extrabold text-sm text-emerald-700">
                <span>Total</span>
                <span>
                  ₹ {Number(summary.total || 0).toFixed(2)}
                </span>
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
