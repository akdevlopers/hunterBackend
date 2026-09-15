"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  RotateCcw,
  RefreshCw,
  Globe,
  Download,
  MapPin,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ShippingZoneModal } from "@/components/shipping/ShippingZoneModal";
import { api } from "@/lib/api";

export default function ShippingZonePage() {
  const [shippingZones, setShippingZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    const data = await api.getShippingZones();
    setShippingZones(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    if (editingItem) {
      await api.updateShippingZone(editingItem.id, formData);
      setToastMessage("Shipping Zone updated successfully.");
    } else {
      await api.createShippingZone(formData);
      setToastMessage("Shipping Zone created successfully.");
    }
    loadData();
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are You Sure?\nThis action cannot be undone. Do you want to continue?"
      )
    ) {
      await api.deleteShippingZone(id);
      setToastMessage("Shipping Zone deleted successfully.");
      loadData();
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const filtered = shippingZones.filter((sz) => {
    if (!search) return true;
    const q = search.toLowerCase().trim();
    return (
      sz.zone_name?.toLowerCase().includes(q) ||
      sz.country_id?.toLowerCase().includes(q) ||
      sz.state_id?.toLowerCase().includes(q) ||
      sz.shipping_method?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleExportCSV = () => {
    const headers = "#,Name,Country,State,Shipping Method\n";
    const rows = filtered
      .map(
        (sz, idx) =>
          `"${idx + 1}","${sz.zone_name}","${sz.country_id}","${sz.state_id}","${sz.shipping_method}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Shipping_Zones_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header Breadcrumb & Actions matching shippingzone/index.blade.php */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              <span>Shipping Zone</span>
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Link href="/dashboard" className="text-emerald-600 hover:underline">
                Home
              </Link>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">Shipping Zone</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition cursor-pointer"
              title="Add Shipping Zone"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
            <span>✓ {toastMessage}</span>
            <button onClick={() => setToastMessage("")} className="text-emerald-500 hover:text-emerald-700">✕</button>
          </div>
        )}

        {/* Table Container */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                title="Export CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search shipping zones..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-56 sm:w-72 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />

              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs cursor-pointer shrink-0"
                title="Search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600 transition shadow-2xs cursor-pointer shrink-0"
                title="Reset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={loadData}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition shadow-2xs cursor-pointer shrink-0"
                title="Refresh"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table matching ShippingZoneDataTable.php */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50/90 border-y border-slate-200 font-bold text-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-52">Name</th>
                  <th className="py-3 px-4 w-36">Country</th>
                  <th className="py-3 px-4 w-48">State</th>
                  <th className="py-3 px-4">Shipping Method</th>
                  <th className="py-3 px-4 text-right w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No shipping zones found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((zone, idx) => (
                    <tr key={zone.id} className="hover:bg-slate-50/60 transition">
                      {/* # Index */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                        {(page - 1) * pageSize + idx + 1}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {zone.zone_name}
                      </td>

                      {/* Country */}
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {zone.country_id}
                      </td>

                      {/* State */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {zone.state_id}
                      </td>

                      {/* Shipping Method */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium">
                          {zone.shipping_method}
                        </span>
                      </td>

                      {/* Action buttons matching shippingzone/action.blade.php */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Yellow Eye (Show Shipping Zone Methods) */}
                          <Link
                            href={`/shipping-zone/${zone.id}`}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-600 text-white shadow-2xs transition cursor-pointer"
                            title="Show Shipping Methods"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Blue Pencil (Edit) */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(zone);
                              setIsModalOpen(true);
                            }}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-sky-500 hover:bg-sky-600 text-white shadow-2xs transition cursor-pointer"
                            title="Edit Shipping Zone"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Red Trash (Delete) */}
                          <button
                            type="button"
                            onClick={() => handleDelete(zone.id)}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-rose-500 hover:bg-rose-600 text-white shadow-2xs transition cursor-pointer"
                            title="Delete Shipping Zone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > pageSize && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span>
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-2 font-semibold text-slate-800">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Create / Edit Modal */}
        <ShippingZoneModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSave}
          editingItem={editingItem}
        />
      </div>
    </AppLayout>
  );
}
