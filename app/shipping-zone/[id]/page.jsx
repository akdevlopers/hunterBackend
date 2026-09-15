"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Pencil,
  RotateCcw,
  RefreshCw,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ShippingMethodModal } from "@/components/shipping/ShippingMethodModal";
import { api } from "@/lib/api";

const INITIAL_METHODS = [
  {
    id: 1,
    method_name: "Flat Rate",
    cost: 0,
    calculation_type: "",
    product_cost: {},
    product_no_cost: 0,
  },
  {
    id: 2,
    method_name: "Local pickup",
    cost: 0,
  },
  {
    id: 3,
    method_name: "Free shipping",
    cost: 0,
    shipping_requires: "3",
    min_order_amount: 0,
  },
];

export default function ShippingZoneMethodsPage() {
  const routeParams = useParams();
  const zoneId = routeParams?.id || "2";

  const [zone, setZone] = useState(null);
  const [shippingClasses, setShippingClasses] = useState([]);
  const [methods, setMethods] = useState(INITIAL_METHODS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("id");
  const [sortAsc, setSortAsc] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    const zones = await api.getShippingZones();
    const currentZone = zones.find(
      (z) => z.id === Number(zoneId) || z.id === zoneId
    ) || {
      id: zoneId,
      zone_name: "B_A_R_BIN",
      country_id: "India",
      state_id: "All States",
    };
    const sClasses = await api.getShippingClasses();
    setZone(currentZone);
    setShippingClasses(sClasses || []);

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(
        `meetay_shipping_methods_zone_${zoneId}`
      );
      if (stored) {
        try {
          setMethods(JSON.parse(stored));
        } catch (e) {}
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [zoneId]);

  const handleSaveMethod = (updatedMethod) => {
    const updated = methods.map((m) =>
      m.id === updatedMethod.id ? updatedMethod : m
    );
    setMethods(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `meetay_shipping_methods_zone_${zoneId}`,
        JSON.stringify(updated)
      );
    }
    setToastMessage(
      `Shipping method "${updatedMethod.method_name}" updated successfully.`
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filter & Sort
  const filtered = methods
    .filter((m) => {
      if (!search) return true;
      const q = search.toLowerCase().trim();
      return (
        m.method_name?.toLowerCase().includes(q) ||
        String(m.cost).includes(q)
      );
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === "string") {
        return sortAsc
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortAsc ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0);
    });

  const totalEntries = filtered.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const zoneDisplayName =
    zone?.zone_name || (zoneId === "2" ? "B_A_R_BIN" : `Zone #${zoneId}`);

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header Breadcrumbs matching Screenshot 1 */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900">
            Shipping Method
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link
              href="/dashboard"
              className="text-emerald-600 hover:text-emerald-700 font-normal transition"
            >
              Home
            </Link>
            <span className="text-slate-400">&gt;</span>
            <Link
              href="/shipping-zone"
              className="text-emerald-600 hover:text-emerald-700 font-normal transition"
            >
              Shipping Zone ({zoneDisplayName})
            </Link>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-500">Shipping Method</span>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
            <span>✓ {toastMessage}</span>
            <button
              onClick={() => setToastMessage("")}
              className="text-emerald-500 hover:text-emerald-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Master Card matching Screenshot 1 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
          {/* Top Controls Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Entries Per Page selector */}
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <div className="relative inline-block">
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 pr-7 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs font-medium"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>
              <span>Entries Per Page</span>
            </div>

            {/* Right Buttons: Cyan Reset, Peach Refresh, Search Input */}
            <div className="flex items-center gap-2">
              {/* Cyan Reset Button */}
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#d7f8f9] hover:bg-[#c2f3f5] text-[#00bcd4] transition shadow-2xs cursor-pointer"
                title="Reset Search"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Peach / Orange Refresh Button */}
              <button
                type="button"
                onClick={loadData}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#ffe8d6] hover:bg-[#ffd9be] text-[#ff9800] transition shadow-2xs cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Search Box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-48 sm:w-56 bg-white border border-slate-200 rounded-lg px-3.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* DataTable matching Screenshot 1 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-y border-slate-100 font-bold text-slate-900 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16">#</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer select-none"
                    onClick={() => handleSort("method_name")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>SHIPPING METHOD</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer select-none"
                    onClick={() => handleSort("cost")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>SHIPPING COST</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right w-24">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-slate-400 text-xs"
                    >
                      No shipping methods found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((method, idx) => (
                    <tr
                      key={method.id}
                      className="hover:bg-slate-50/70 transition"
                    >
                      {/* # */}
                      <td className="py-4 px-4 font-normal text-slate-800">
                        {(currentPage - 1) * entriesPerPage + idx + 1}
                      </td>

                      {/* Method Name */}
                      <td className="py-4 px-4 font-normal text-slate-800">
                        {method.method_name}
                      </td>

                      {/* Cost */}
                      <td className="py-4 px-4 font-normal text-slate-800">
                        {method.cost ?? 0}
                      </td>

                      {/* Action (Light blue edit pencil badge) */}
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMethod(method);
                            setIsModalOpen(true);
                          }}
                          className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-[#e8f7fa] hover:bg-[#d0f1f7] text-[#00bcd4] transition cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer: Showing X to Y of Z entries & Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
            <span>
              Showing {totalEntries === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to{" "}
              {Math.min(currentPage * entriesPerPage, totalEntries)} of {totalEntries} entries
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                className="w-7 h-7 flex items-center justify-center rounded-md bg-[#00a859] text-white font-bold text-xs shadow-2xs"
              >
                {currentPage}
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Edit Method Modal */}
        <ShippingMethodModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMethod(null);
          }}
          onSave={handleSaveMethod}
          method={editingMethod}
          shippingClasses={shippingClasses}
        />
      </div>
    </AppLayout>
  );
}
