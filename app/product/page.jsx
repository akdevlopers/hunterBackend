"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Printer,
  LayoutGrid,
  List as LayoutList,
  Plus,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductTable } from "@/components/product/ProductTable";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid'

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadData = useCallback(
    async (currentPage = page, currentLimit = limit, currentSearch = debouncedSearch) => {
      setLoading(true);
      const [prodsRes, cats] = await Promise.all([
        api.getProducts({
          page: currentPage,
          limit: currentLimit,
          search: currentSearch.trim(),
          search_key: currentSearch.trim(),
        }),
        api.getCategories(),
      ]);

      if (prodsRes && typeof prodsRes === "object" && !Array.isArray(prodsRes)) {
        setProducts(prodsRes.products || []);
        setTotal(prodsRes.total || 0);
        setTotalPages(prodsRes.totalPages || 1);
        setPage(prodsRes.page || currentPage);
        setLimit(prodsRes.limit || currentLimit);
      } else {
        const list = Array.isArray(prodsRes) ? prodsRes : [];
        setProducts(list);
        setTotal(list.length);
        setTotalPages(Math.ceil(list.length / currentLimit) || 1);
      }

      setCategories(cats || []);
      setLoading(false);
    },
    [page, limit, debouncedSearch]
  );

  // Trigger search whenever debounced search query changes
  useEffect(() => {
    setPage(1);
    loadData(1, limit, debouncedSearch);
  }, [debouncedSearch]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadData(newPage, limit, debouncedSearch);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    loadData(1, newLimit, debouncedSearch);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      const res = await api.deleteProduct(deleteId);
      setDeleteId(null);
      if (res && (res.success || res.status === "success")) {
        setToastMessage(res.message || "Product deleted successfully.");
      } else {
        setToastMessage(res?.message || "Failed to delete product.");
      }
      loadData(page, limit, debouncedSearch);
      setTimeout(() => setToastMessage(""), 3500);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Top Header Bar matching Screenshot */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Product</h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Link href="/dashboard" className="text-emerald-600 hover:underline">
                Home
              </Link>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">Product</span>
            </div>
          </div>

          {/* Top Right Action Buttons (Print, Grid/List Toggle, Add) */}
          <div className="flex items-center gap-1.5">
            {/* Print Button */}
            {/* <button
              type="button"
              onClick={() => window.print()}
              className="p-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer"
              title="Print Products"
            >
              <Printer className="w-4 h-4" />
            </button> */}

            {/* Grid / List View Toggle Button */}
            <button
              type="button"
              onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
              className="p-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer"
              title={viewMode === "table" ? "Switch to Grid View" : "Switch to List View"}
            >
              {viewMode === "table" ? (
                <LayoutGrid className="w-4 h-4" />
              ) : (
                <LayoutList className="w-4 h-4" />
              )}
            </button>

            {/* Add New Product Button */}
            <Link
              href="/product/create"
              className="p-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer"
              title="Add New Product"
            >
              <Plus className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
            <span>✓ {toastMessage}</span>
            <button onClick={() => setToastMessage("")} className="text-emerald-500 hover:text-emerald-700">✕</button>
          </div>
        )}

        {/* Product Table / Grid with debounced search */}
        <ProductTable
          products={products}
          categories={categories}
          loading={loading}
          page={page}
          limit={limit}
          total={total}
          totalPages={totalPages}
          search={search}
          onSearchChange={handleSearchChange}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onDelete={(id) => setDeleteId(id)}
          onRefresh={() => loadData(page, limit, debouncedSearch)}
          viewMode={viewMode}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          title="Delete Product"
          description="Are you sure you want to delete this product? This action cannot be undone."
        >
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-600">
              Removing this product will remove it from all storefront catalog views and search results.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
                Yes, Delete Product
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
