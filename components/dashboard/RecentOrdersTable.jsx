"use client";

import React, { useState } from "react";
import { ShoppingCart, Eye, ArrowUpRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate, getOrderStatusBadge } from "@/lib/utils";

export function RecentOrdersTable({ orders = [] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.product_order_id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || order.delivered_status.toString() === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header with Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Recent Customer Orders</h3>
          <p className="text-xs text-slate-500">Real-time order fulfillment pipeline and status</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoice or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800/80 border-0 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          {/* Status Dropdown Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800/80 border-0 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="all">All Statuses</option>
            <option value="0">Pending</option>
            <option value="4">Confirmed</option>
            <option value="6">Shipped</option>
            <option value="1">Delivered</option>
            <option value="2">Cancelled</option>
            <option value="3">Returned</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 pr-4">Invoice ID</th>
              <th className="pb-3 px-4">Customer</th>
              <th className="pb-3 px-4">Date</th>
              <th className="pb-3 px-4">Items</th>
              <th className="pb-3 px-4">Total Amount</th>
              <th className="pb-3 px-4">Payment</th>
              <th className="pb-3 pl-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No matching orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const status = getOrderStatusBadge(order.delivered_status);
                return (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3.5 pr-4 font-semibold text-brand-600 dark:text-brand-400">
                      #{order.product_order_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{order.customer_name}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(order.order_date)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {order.product_count} {order.product_count === 1 ? "item" : "items"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(order.final_price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-medium text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {order.payment_type}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
