"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  RotateCcw,
  RefreshCw,
  Truck,
  Download,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ShippingClassModal } from "@/components/shipping/ShippingClassModal";
import { api } from "@/lib/api";

export default function ShippingClassPage() {
  const [shippingClasses, setShippingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    const data = await api.getShippingClasses();
    setShippingClasses(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    if (editingItem) {
      await api.updateShippingClass(editingItem.id, formData);
      setToastMessage("Shipping Class updated successfully.");
    } else {
      await api.createShippingClass(formData);
      setToastMessage("Shipping Class created successfully.");
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
      await api.deleteShippingClass(id);
      setToastMessage("Shipping Class deleted successfully.");
      loadData();
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const filtered = shippingClasses.filter((sc) => {
    if (!search) return true;
    const q = search.toLowerCase().trim();
    return (
      sc.name?.toLowerCase().includes(q) ||
      sc.description?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleExportCSV = () => {
    const headers = "Name,Description,Created At\n";
    const rows = filtered
      .map((sc) => `"${sc.name}","${sc.description}","${sc.created_at}"`)
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Shipping_Classes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header Breadcrumb & Action Button matching shipping/index.blade.php */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              <span>Shipping Class</span>
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Link href="/dashboard" className="text-emerald-600 hover:underline">
                Home
              </Link>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">Shipping Class</span>
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
              title="Add Shipping Class"
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
                placeholder="Search shipping class..."
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

          {/* Table matching ShippingDataTable.php */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-y border-slate-200 font-bold text-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-4 w-64">Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400">
                      No shipping classes found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition">
                      {/* Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.name}
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 text-slate-600 leading-relaxed">
                        {item.description || "-"}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item);
                              setIsModalOpen(true);
                            }}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-sky-500 hover:bg-sky-600 text-white shadow-2xs transition cursor-pointer"
                            title="Edit Shipping Class"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-rose-500 hover:bg-rose-600 text-white shadow-2xs transition cursor-pointer"
                            title="Delete Shipping Class"
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
        <ShippingClassModal
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
