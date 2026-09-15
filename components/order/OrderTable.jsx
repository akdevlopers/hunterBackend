"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  RotateCcw,
  RefreshCw,
  Download,
  LayoutGrid,
  List as LayoutList,
  Calendar,
  Truck,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";

export function OrderTable({
  ordersResponse = null,
  orders = [],
  loading = false,
  filterParams = { page: 1, limit: 10, delivered_status: "all", search: "", fromDate: "", toDate: "" },
  onParamChange,
  onSearchSubmit,
  onUpdateStatus,
  onRefresh,
  onPreviewOrder,
  onBookShiprocket,
  viewMode = "table", // 'table' | 'grid'
  onToggleViewMode,
}) {
  const [searchInput, setSearchInput] = useState(filterParams.search || "");
  const [bookingOrderId, setBookingOrderId] = useState(null);

  const handleShiprocketBooking = async (order) => {
    setBookingOrderId(order.id);
    try {
      if (onBookShiprocket) {
        await onBookShiprocket(order);
      } else {
        const orderId = order.id || order.product_order_id || order.order_id;
        const res = await api.createShiprocketOrder(orderId);
        if (res && (res.status === "success" || res.success)) {
          alert(`Shiprocket order booked successfully for Order #${order.product_order_id || orderId}!`);
          if (onRefresh) onRefresh();
        } else {
          alert(res?.message || res?.error || "Failed to book Shiprocket order.");
        }
      }
    } catch (err) {
      alert(err.message || "Failed to book Shiprocket order.");
    } finally {
      setBookingOrderId(null);
    }
  };

  // Response object or fallback array parsing
  const ordersList = ordersResponse?.data || orders || [];
  const counts = ordersResponse?.counts || {
    all: ordersList.length,
    new: ordersList.filter((o) => o.delivered_status === 0).length,
    completed: ordersList.filter((o) => o.delivered_status === 1).length,
    remark: ordersList.filter((o) => o.delivered_status === 2).length,
  };

  const total = ordersResponse?.total ?? ordersList.length;
  const page = ordersResponse?.page ?? filterParams.page ?? 1;
  const limit = ordersResponse?.limit ?? filterParams.limit ?? 10;
  const totalPages = ordersResponse?.totalPages ?? (Math.ceil(total / limit) || 1);


  const handleTabChange = (status) => {
    if (onParamChange) {
      onParamChange({ delivered_status: status, page: 1 });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchInput);
    } else if (onParamChange) {
      onParamChange({ search: searchInput, page: 1 });
    }
  };

  const handleReset = () => {
    setSearchInput("");
    if (onParamChange) {
      onParamChange({ search: "", fromDate: "", toDate: "", delivered_status: "all", page: 1 });
    }
  };

  const handleExportCSV = () => {
    const headers = "Order ID,Date,Customer Name,Email,Phone,Address,Paid Amount,Payment Type,Delivery Status\n";
    const rows = ordersList
      .map((o) => {
        const cust = o.customer_info || o.customer || {};
        return `"${o.product_order_id || o.id}","${o.order_date}","${cust.name || ""}","${cust.email || ""}","${cust.phone || cust.telephone || ""}","${(cust.address || "").replace(/"/g, '""')}","${o.paid_amount || o.final_price}","${o.payment_type}","${o.delivered_status_label || (o.delivered_status === 0 ? "New" : o.delivered_status === 1 ? "Completed" : "Remark")}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Orders_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const summary = ordersResponse?.summary || { cash_sale: 0, online_sale: 0, return: 0, total: 0 };
  const activeTab = filterParams.delivered_status ?? "all";

  return (
    <div className="space-y-4">
      {/* Top Status Tabs */}
      <div className="flex items-center gap-1.5 -mb-px relative z-10 px-1 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          type="button"
          onClick={() => handleTabChange("all")}
          className={`px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === "all" || activeTab === ""
              ? "bg-white border border-slate-200 border-b-white rounded-t-xl text-slate-900 shadow-xs"
              : "text-emerald-600 hover:text-emerald-700 hover:bg-slate-50/80 rounded-t-xl"
          }`}
        >
          <span>All</span>
          {counts.all !== undefined && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === "all" || activeTab === "" ? "bg-slate-100 text-slate-700" : "bg-emerald-50 text-emerald-700"
            }`}>
              {counts.all}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange(0)}
          className={`px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            String(activeTab) === "0"
              ? "bg-white border border-slate-200 border-b-white rounded-t-xl text-slate-900 shadow-xs"
              : "text-emerald-600 hover:text-emerald-700 hover:bg-slate-50/80 rounded-t-xl"
          }`}
        >
          <span>New</span>
          {counts.new !== undefined && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              String(activeTab) === "0" ? "bg-amber-100 text-amber-800" : "bg-amber-50 text-amber-700"
            }`}>
              {counts.new}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange(1)}
          className={`px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            String(activeTab) === "1"
              ? "bg-white border border-slate-200 border-b-white rounded-t-xl text-slate-900 shadow-xs"
              : "text-emerald-600 hover:text-emerald-700 hover:bg-slate-50/80 rounded-t-xl"
          }`}
        >
          <span>Completed</span>
          {counts.completed !== undefined && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              String(activeTab) === "1" ? "bg-emerald-100 text-emerald-800" : "bg-emerald-50 text-emerald-700"
            }`}>
              {counts.completed}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange(2)}
          className={`px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            String(activeTab) === "2"
              ? "bg-white border border-slate-200 border-b-white rounded-t-xl text-slate-900 shadow-xs"
              : "text-emerald-600 hover:text-emerald-700 hover:bg-slate-50/80 rounded-t-xl"
          }`}
        >
          <span>Remark</span>
          {counts.remark !== undefined && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              String(activeTab) === "2" ? "bg-rose-100 text-rose-800" : "bg-rose-50 text-rose-700"
            }`}>
              {counts.remark}
            </span>
          )}
        </button>
      </div>

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-4">
        {/* Responsive Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Action Row: Export, View Mode & Reset */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                title="Export to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>

              <button
                type="button"
                onClick={onToggleViewMode}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                title={viewMode === "table" ? "Switch to Grid View" : "Switch to Table View"}
              >
                {viewMode === "table" ? (
                  <LayoutGrid className="w-4 h-4" />
                ) : (
                  <LayoutList className="w-4 h-4" />
                )}
              </button>
            </div>

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                title="Refresh Orders"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters & Search: Adaptive Grid on Mobile */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
            {/* Date Pickers Grid on mobile, inline on desktop */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
              {/* From Date */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">From:</span>
                <input
                  type="date"
                  value={filterParams.fromDate || ""}
                  onChange={(e) => onParamChange && onParamChange({ fromDate: e.target.value, page: 1 })}
                  className="bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer w-full min-w-0"
                />
              </div>

              {/* To Date */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">To:</span>
                <input
                  type="date"
                  value={filterParams.toDate || ""}
                  onChange={(e) => onParamChange && onParamChange({ toDate: e.target.value, page: 1 })}
                  className="bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer w-full min-w-0"
                />
              </div>
            </div>

            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <input
                  type="text"
                  placeholder="Search order #, customer..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Search Action Button */}
              <button
                type="submit"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs cursor-pointer shrink-0"
                title="Search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>

              {searchInput && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                  title="Clear search"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* View Mode Switching */}
        {viewMode === "table" ? (
          <div>
            {/* ================= DESKTOP TABLE VIEW (md and up) ================= */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-y border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider">
                    <th className="py-3 px-4 w-[16%]">ORDER ID</th>
                    <th className="py-3 px-4 w-[12%]">DATE</th>
                    <th className="py-3 px-4 w-[24%]">CUSTOMER INFO</th>
                    <th className="py-3 px-4 w-[10%]">PAID AMOUNT</th>
                    <th className="py-3 px-4 w-[10%]">PAYMENT TYPE</th>
                    <th className="py-3 px-4 w-[12%]">ORDER STATUS</th>
                    <th className="py-3 px-4 w-[16%] text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-4 px-4">
                          <div className="h-6 bg-slate-200 rounded w-24"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-4 bg-slate-200 rounded w-28"></div>
                        </td>
                        <td className="py-4 px-4 space-y-1.5">
                          <div className="h-4 bg-slate-200 rounded w-32"></div>
                          <div className="h-3 bg-slate-200 rounded w-44"></div>
                          <div className="h-3 bg-slate-200 rounded w-24"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-4 bg-slate-200 rounded w-16"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-5 bg-slate-200 rounded w-16"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-8 bg-slate-200 rounded w-28"></div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="h-7 w-7 bg-slate-200 rounded mx-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : ordersList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                        No matching orders found.
                      </td>
                    </tr>
                  ) : (
                    ordersList.map((order) => {
                      const customer = order.customer_info || order.customer || {};
                      const phoneNum = customer.phone || customer.telephone || "";
                      const whatsappNumber = phoneNum.replace(/[^0-9]/g, "");

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* 1. ORDER ID */}
                          <td className="py-4 px-4 align-top font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onPreviewOrder(order)}
                              className="hover:text-emerald-600 transition cursor-pointer text-left"
                              title="View Order Preview"
                            >
                              #{order.product_order_id || order.order_id || order.id}
                            </button>
                          </td>

                          {/* 2. DATE */}
                          <td className="py-4 px-4 align-top font-medium text-slate-600 whitespace-nowrap">
                            {order.date || order.order_date || order.created_at}
                          </td>

                          {/* 3. CUSTOMER INFO */}
                          <td className="py-4 px-4 align-top">
                            <div className="space-y-0.5 text-xs">
                              <p className="font-bold text-slate-900">
                                {customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || "Walk-in Customer"}
                              </p>
                              {customer.email && <p className="text-slate-500 text-[11px]">{customer.email}</p>}
                              {phoneNum && (
                                <div className="flex items-center gap-1.5 pt-0.5">
                                  <span className="text-slate-600 text-[11px] font-mono">{phoneNum}</span>
                                  {whatsappNumber && (
                                    <a
                                      href={`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=Hi%20${encodeURIComponent(customer.name || "")}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-600 hover:text-emerald-700 text-[10px] font-bold"
                                      title="Chat on WhatsApp"
                                    >
                                      [WhatsApp]
                                    </a>
                                  )}
                                </div>
                              )}
                              {(customer.address || customer.city) && (
                                <p className="text-slate-600 text-[11px] pt-1 leading-tight max-w-xs">
                                  {[customer.address, customer.city, customer.state, customer.postcode].filter(Boolean).join(", ")}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* 4. PAID AMOUNT */}
                          <td className="py-4 px-4 align-top font-bold text-slate-900 whitespace-nowrap">
                            ₹ {Number(order.final_price ?? order.price ?? order.paid_amount ?? 0).toFixed(2)}
                          </td>

                          {/* 5. PAYMENT TYPE */}
                          <td className="py-4 px-4 align-top">
                            <div className="space-y-0.5">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  (order.customer_payment_type || order.payment_type) === "Cash"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                }`}
                              >
                                {order.customer_payment_type || order.payment_type || "POS"}
                              </span>
                              {order.payment_type_notes && (
                                <p className="text-[10px] text-slate-500 font-mono">
                                  {order.payment_type_notes}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* 6. ORDER STATUS */}
                          <td className="py-4 px-4 align-top">
                            <div className="space-y-1.5">
                              <select
                                value={String(order.delivered_status ?? 0)}
                                onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-xs"
                              >
                                <option value="0">New</option>
                                <option value="1">Completed</option>
                                <option value="2">Remark</option>
                              </select>

                              {order.remark && (
                                <p className="text-[10px] text-amber-700 bg-amber-50 p-1 rounded border border-amber-100 italic">
                                  Note: {order.remark}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* 7. ACTION (Eye / Preview Button & Book Shiprocket Button) */}
                          <td className="py-4 px-4 align-top text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onPreviewOrder(order)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-2xs transition cursor-pointer"
                                title="Quick Preview"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleShiprocketBooking(order)}
                                disabled={bookingOrderId === order.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[11px] font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                title="Book on Shiprocket"
                              >
                                {bookingOrderId === order.id ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>Booking...</span>
                                  </>
                                ) : (
                                  <>
                                    <Truck className="w-3 h-3" />
                                    <span>Book Shiprocket</span>
                                  </>
                                )}
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

            {/* ================= MOBILE ORDER CARDS (sm and down) ================= */}
            <div className="block md:hidden space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="p-3.5 border border-slate-200 rounded-xl space-y-3 animate-pulse bg-slate-50">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-slate-200 rounded w-28"></div>
                      <div className="h-4 bg-slate-200 rounded w-16"></div>
                    </div>
                    <div className="h-10 bg-slate-200 rounded"></div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-5 bg-slate-200 rounded w-20"></div>
                      <div className="h-7 bg-slate-200 rounded w-24"></div>
                    </div>
                  </div>
                ))
              ) : ordersList.length === 0 ? (
                <div className="py-10 text-center text-slate-400 font-medium text-xs">
                  No matching orders found.
                </div>
              ) : (
                ordersList.map((order) => {
                  const customer = order.customer_info || order.customer || {};
                  const phoneNum = customer.phone || customer.telephone || "";
                  const whatsappNumber = phoneNum.replace(/[^0-9]/g, "");

                  return (
                    <div
                      key={order.id}
                      className="p-3.5 border border-slate-200/90 rounded-xl bg-white shadow-2xs hover:border-emerald-500 transition-colors space-y-3"
                    >
                      {/* Card Header: Order ID & Date */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div>
                          <button
                            type="button"
                            onClick={() => onPreviewOrder(order)}
                            className="font-mono text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            #{order.product_order_id || order.order_id || order.id}
                          </button>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {order.date || order.order_date || order.created_at}
                          </p>
                        </div>

                        {/* Status Label Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold shrink-0 ${
                            order.delivered_status === 1 || String(order.delivered_status) === "1"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : order.delivered_status === 2 || String(order.delivered_status) === "2"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {order.delivered_status_label || (order.delivered_status === 1 ? "Completed" : order.delivered_status === 2 ? "Remark" : "New")}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900">
                            {customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || "Walk-in Customer"}
                          </p>
                          {phoneNum && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-600 font-mono text-[11px]">{phoneNum}</span>
                              {whatsappNumber && (
                                <a
                                  href={`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=Hi%20${encodeURIComponent(customer.name || "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                                >
                                  WA
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        {(customer.address || customer.city) && (
                          <p className="text-slate-500 text-[11px] leading-tight">
                            {[customer.address, customer.city, customer.state, customer.postcode].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>

                      {/* Pricing & Payment row */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Paid Amount</span>
                          <span className="font-bold text-slate-900 text-sm">
                            ₹ {Number(order.final_price ?? order.price ?? order.paid_amount ?? 0).toFixed(2)}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-medium">Payment Type</span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                              (order.customer_payment_type || order.payment_type) === "Cash"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            }`}
                          >
                            {order.customer_payment_type || order.payment_type || "POS"}
                          </span>
                        </div>
                      </div>

                      {/* Remark Note if present */}
                      {order.remark && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 italic">
                          Note: {order.remark}
                        </p>
                      )}

                      {/* Actions: Status Dropdown, Preview Button & Book Shiprocket */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
                        <select
                          value={String(order.delivered_status ?? 0)}
                          onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                          className="flex-1 min-w-[100px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                        >
                          <option value="0">Set New</option>
                          <option value="1">Set Completed</option>
                          <option value="2">Set Remark</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => onPreviewOrder(order)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-2xs transition flex items-center gap-1 cursor-pointer shrink-0"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShiprocketBooking(order)}
                          disabled={bookingOrderId === order.id}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs transition flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-50"
                          title="Book on Shiprocket"
                        >
                          {bookingOrderId === order.id ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Booking...</span>
                            </>
                          ) : (
                            <>
                              <Truck className="w-3 h-3" />
                              <span>Book Shiprocket</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* ================= GRID VIEW ================= */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-xl space-y-3 animate-pulse bg-slate-50">
                  <div className="h-6 bg-slate-200 rounded w-28"></div>
                  <div className="h-4 bg-slate-200 rounded w-36"></div>
                  <div className="h-12 bg-slate-200 rounded"></div>
                </div>
              ))
            ) : ordersList.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 font-medium">
                No matching orders found.
              </div>
            ) : (
              ordersList.map((order) => {
                const customer = order.customer_info || order.customer || {};
                return (
                  <div
                    key={order.id}
                    className="p-4 border border-slate-200 rounded-xl bg-white hover:border-emerald-500 transition shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => onPreviewOrder(order)}
                        className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                      >
                        #{order.product_order_id || order.id}
                      </button>
                      <span className="text-[11px] text-slate-500">{order.order_date}</span>
                    </div>

                    <div className="text-xs space-y-0.5">
                      <p className="font-bold text-slate-900">{customer.name}</p>
                      <p className="text-slate-500 text-[11px]">{customer.phone || customer.telephone}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="font-bold text-slate-900">₹ {order.paid_amount || order.final_price}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleShiprocketBooking(order)}
                          disabled={bookingOrderId === order.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold transition disabled:opacity-50 cursor-pointer"
                          title="Book on Shiprocket"
                        >
                          {bookingOrderId === order.id ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            <Truck className="w-2.5 h-2.5" />
                          )}
                          <span>Book Shiprocket</span>
                        </button>
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 font-medium text-slate-700">
                          {order.delivered_status_label || (order.delivered_status === 0 ? "New" : "Completed")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Responsive Server Pagination Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div>
              Showing <span className="font-bold text-slate-900">{total > 0 ? (page - 1) * limit + 1 : 0}</span> to{" "}
              <span className="font-bold text-slate-900">{Math.min(page * limit, total)}</span> of{" "}
              <span className="font-bold text-slate-900">{total}</span>
            </div>

            {/* Per-Page Selector */}
            <div className="flex items-center gap-1.5">
              <span>Show</span>
              <select
                value={limit}
                onChange={(e) => onParamChange && onParamChange({ limit: Number(e.target.value), page: 1 })}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Page Navigation Buttons */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onParamChange && onParamChange({ page: page - 1 })}
              className="px-3 sm:px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs shrink-0"
            >
              Previous
            </button>

            {(() => {
              const maxButtons = 10;
              let start = 1;
              let end = Math.min(totalPages, maxButtons);

              if (totalPages > maxButtons) {
                start = Math.max(1, page - Math.floor(maxButtons / 2));
                end = start + maxButtons - 1;
                if (end > totalPages) {
                  end = totalPages;
                  start = Math.max(1, end - maxButtons + 1);
                }
              }

              const pageNumbers = [];
              for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
              }

              return pageNumbers.map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onParamChange && onParamChange({ page: pageNum })}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition cursor-pointer shrink-0 ${
                    page === pageNum
                      ? "bg-emerald-600 border border-emerald-600 text-white shadow-2xs font-bold"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium"
                  }`}
                >
                  {pageNum}
                </button>
              ));
            })()}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onParamChange && onParamChange({ page: page + 1 })}
              className="px-3 sm:px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-xs shrink-0"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
