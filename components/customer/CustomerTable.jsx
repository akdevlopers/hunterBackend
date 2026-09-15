"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  ShoppingCart,
  RotateCcw,
  RefreshCw,
  Download,
  LayoutGrid,
  List as LayoutList,
  Phone,
  Mail,
  User,
} from "lucide-react";

export function CustomerTable({
  customers = [],
  customersResponse,
  filterParams = { page: 1, limit: 10, search: "", status: "" },
  onParamChange,
  onToggleStatus,
  onRefresh,
  loading = false,
  viewMode = "table", // 'table' | 'grid'
  onToggleViewMode,
}) {
  const [localSearch, setLocalSearch] = useState(filterParams.search || "");

  const customersList = customersResponse?.data || (Array.isArray(customers) ? customers : []);
  const total = customersResponse?.total ?? customersList.length;
  const page = customersResponse?.page ?? filterParams.page ?? 1;
  const limit = customersResponse?.limit ?? filterParams.limit ?? 10;
  const totalPages = (customersResponse?.totalPages ?? Math.ceil(total / limit)) || 1;


  const handleReset = () => {
    setLocalSearch("");
    if (onParamChange) {
      onParamChange("search", "");
      onParamChange("status", "");
      onParamChange("page", 1);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (onParamChange) {
      onParamChange("search", localSearch);
    }
  };


  const handleExportCSV = () => {
    const headers = "Customer Name,Email,Mobile,Last Active,Date Registered,Orders,Total Spend,AOV,Status\n";
    const rows = filtered
      .map(
        (c) =>
          `"${c.name || `${c.first_name} ${c.last_name}`}","${c.email}","${c.mobile}","${c.last_active}","${c.regiester_date}","${c.orders_count}","${c.total_spend}","${c.aov}","${c.status === 1 ? "Active" : "Inactive"}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Customers_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Actions */}
        <div className="flex items-center gap-2">
          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {/* Grid / Table Switcher */}
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

        {/* Right Search Controls */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search name, email, mobile..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-56 sm:w-72 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Green Search Action Button */}
          <button
            type="submit"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs cursor-pointer shrink-0"
            title="Search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Pink Reset Button */}
          <button
            type="button"
            onClick={handleReset}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600 transition shadow-2xs cursor-pointer shrink-0"
            title="Reset Search"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition shadow-2xs cursor-pointer shrink-0"
            title="Refresh Customers"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        </form>
      </div>

      {/* Table / Grid Mode */}
      {viewMode === "table" ? (
        /* ================= 1. TABLE VIEW ================= */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/90 border-y border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <th className="py-3 px-4">Cutomer Info</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4">Date Registered</th>
                <th className="py-3 px-4 text-center w-20">Orders</th>
                <th className="py-3 px-4 text-right w-28">Total Spend</th>
                <th className="py-3 px-4 text-right w-24">Aov</th>
                <th className="py-3 px-4 text-center w-20">Status</th>
                {/* <th className="py-3 px-4 text-right w-28">Action</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="py-4 px-4 text-center"><div className="h-6 w-6 bg-slate-200 rounded-full mx-auto"></div></td>
                    <td className="py-4 px-4 text-right"><div className="h-4 bg-slate-200 rounded w-14 ml-auto"></div></td>
                    <td className="py-4 px-4 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div></td>
                    <td className="py-4 px-4 text-center"><div className="h-4 w-8 bg-slate-200 rounded-full mx-auto"></div></td>
                    <td className="py-4 px-4 text-right"><div className="h-6 w-14 bg-slate-200 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : customersList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    No customers found matching search criteria.
                  </td>
                </tr>
              ) : (
                customersList.map((customer) => {
                  const fullName = customer.name || `${customer.first_name || ""} ${customer.last_name || ""}`.trim();

                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* 1. CUSTOMER INFO */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-0.5">
                          <Link
                            href={`/customer-timeline/${customer.id}`}
                            className="font-bold text-emerald-700 hover:text-emerald-900 hover:underline capitalize"
                          >
                            {fullName}
                          </Link>
                          <p className="text-slate-500 font-mono text-[11px]">{customer.mobile || "-"}</p>
                        </div>
                      </td>

                      {/* 2. EMAIL */}
                      <td className="py-4 px-4 align-top text-slate-600">
                        {customer.email || "-"}
                      </td>

                      {/* 3. LAST ACTIVE */}
                      <td className="py-4 px-4 align-top text-slate-600 whitespace-nowrap">
                        {customer.last_active || formatDate(customer.last_active)}
                      </td>

                      {/* 4. DATE REGISTERED */}
                      <td className="py-4 px-4 align-top text-slate-600 whitespace-nowrap">
                        {customer.register_date || customer.regiester_date || formatDate(customer.created_at)}
                      </td>

                      {/* 5. ORDERS */}
                      <td className="py-4 px-4 align-top text-center">
                        <Link
                          href={`/customer/${customer.id}`}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition shadow-2xs"
                          title="View Customer Orders"
                        >
                          {customer.orders_count || 0}
                        </Link>
                      </td>

                      {/* 6. TOTAL SPEND */}
                      <td className="py-4 px-4 align-top text-right font-bold text-slate-900 whitespace-nowrap">
                        ₹ {(customer.total_spend || 0).toLocaleString()}
                      </td>

                      {/* 7. AOV */}
                      <td className="py-4 px-4 align-top text-right font-medium text-slate-700 whitespace-nowrap">
                        ₹ {Number(customer.aov || 0).toFixed(2)}
                      </td>

                      {/* 8. STATUS Toggle */}
                      <td className="py-4 px-4 align-top text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={customer.status === 1}
                            onChange={() => onToggleStatus(customer.id, customer.status === 1 ? 0 : 1)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </td>

                      {/* 9. ACTION */}
                      {/* <td className="py-4 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/customer-timeline/${customer.id}`}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-600 text-white shadow-2xs transition"
                            title="Show Timeline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/customer/${customer.id}`}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-sky-600 hover:bg-sky-700 text-white shadow-2xs transition"
                            title="View Orders / Cart"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td> */}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* ================= 2. GRID VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {customersList.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              No customers found.
            </div>
          ) : (
            customersList.map((customer) => {
              const fullName = customer.name || `${customer.first_name || ""} ${customer.last_name || ""}`.trim();

              return (
                <div
                  key={customer.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition space-y-3"
                >
                  <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                    <div>
                      <Link
                        href={`/customer-timeline/${customer.id}`}
                        className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition"
                      >
                        {fullName}
                      </Link>
                      <p className="text-[11px] text-slate-500">{customer.email}</p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customer.status === 1}
                        onChange={() => onToggleStatus(customer.id, customer.status === 1 ? 0 : 1)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Orders</span>
                      <span className="font-bold text-slate-800">{customer.orders_count || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Spend</span>
                      <span className="font-bold text-emerald-700">₹ {(customer.total_spend || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 font-mono">{customer.mobile}</span>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/customer-timeline/${customer.id}`}
                        className="w-7 h-7 inline-flex items-center justify-center rounded bg-amber-500 text-white"
                        title="Timeline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/customer/${customer.id}`}
                        className="w-7 h-7 inline-flex items-center justify-center rounded bg-sky-600 text-white"
                        title="Orders"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Pagination Bar */}
      {total > 0 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, total)} of {total} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onParamChange && onParamChange("page", page - 1)}
              disabled={page <= 1}
              className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="px-2 font-semibold text-slate-800">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => onParamChange && onParamChange("page", page + 1)}
              disabled={page >= totalPages}
              className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

