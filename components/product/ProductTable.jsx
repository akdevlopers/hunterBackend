"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Pencil,
  Trash2,
  RotateCcw,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";

const getProductImageUrl = (product) => {
  if (!product) return null;
  const raw =
    product.cover_image_url ||
    product.cover_image_path ||
    product.cover_image ||
    product.image_url ||
    product.image_path ||
    product.image ||
    (Array.isArray(product.images) && product.images[0]
      ? typeof product.images[0] === "string"
        ? product.images[0]
        : product.images[0]?.url || product.images[0]?.image_path || product.images[0]?.image
      : null);

  if (!raw || typeof raw !== "string" || raw.trim() === "" || raw === "undefined" || raw === "null") return null;
  const trimmed = raw.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  return `https://meetay.com/${trimmed.replace(/^\/+/, "")}`;
};

export function ProductTable({
  products = [],
  categories = [],
  loading = false,
  page = 1,
  limit = 10,
  total = 0,
  totalPages = 1,
  search = "",
  onSearchChange,
  onPageChange,
  onLimitChange,
  onDelete,
  onRefresh,
  viewMode = "table", // 'table' | 'grid'
}) {
  const [localSearch, setLocalSearch] = useState("");
  const isControlledSearch = onSearchChange !== undefined;
  const currentSearch = isControlledSearch ? search : localSearch;

  const [localPage, setLocalPage] = useState(1);
  const [localLimit, setLocalLimit] = useState(10);

  const handleSearchInput = (val) => {
    if (isControlledSearch) {
      onSearchChange(val);
    } else {
      setLocalSearch(val);
      setLocalPage(1);
    }
  };

  const handleReset = () => {
    if (isControlledSearch) {
      onSearchChange("");
    } else {
      setLocalSearch("");
    }
    if (onPageChange) onPageChange(1);
    else setLocalPage(1);
  };

  // Local fallback filter only if server-side search is not driving products
  const filtered = isControlledSearch
    ? products
    : products.filter((prod) => {
        const q = currentSearch.toLowerCase().trim();
        if (!q) return true;

        const matchesName = prod.name?.toLowerCase().includes(q);
        const matchesSku =
          prod.sku?.toLowerCase().includes(q) ||
          prod.sku_codes?.some((code) => code.toLowerCase().includes(q));
        const matchesCategory = prod.category_name?.toLowerCase().includes(q);
        const matchesPrice = prod.sale_price?.toString().includes(q);

        return matchesName || matchesSku || matchesCategory || matchesPrice;
      });

  const activePage = onPageChange ? page : localPage;
  const activeLimit = onLimitChange ? limit : localLimit;
  const activeTotal = total || filtered.length;
  const activeTotalPages = totalPages || Math.ceil(filtered.length / activeLimit) || 1;

  const displayProducts = onPageChange
    ? products
    : filtered.slice((localPage - 1) * localLimit, localPage * localLimit);

  const handleGoPage = (p) => {
    if (onPageChange) {
      onPageChange(p);
    } else {
      setLocalPage(p);
    }
  };

  const handleGoLimit = (l) => {
    if (onLimitChange) {
      onLimitChange(l);
    } else {
      setLocalLimit(l);
      setLocalPage(1);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
      {/* Top Search & Filter Toolbar matching Meetay */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="relative flex-1 sm:flex-initial min-w-[160px] max-w-full">
          <input
            type="text"
            placeholder="Search products, SKU, price..."
            value={currentSearch}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="w-full sm:w-64 md:w-72 bg-white border border-slate-200 rounded-lg pl-3.5 pr-8 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
          />
          {currentSearch && (
            <button
              type="button"
              onClick={handleReset}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs p-0.5"
              title="Clear Search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Green Search Action Button */}
          <button
            type="button"
            onClick={() => handleSearchInput(currentSearch)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs cursor-pointer shrink-0"
            title="Search"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* View Mode Switching */}
      {viewMode === "table" ? (
        /* ================= 1. TABLE VIEW (Exact 6 Columns) ================= */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/90 border-y border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <th className="py-3 px-4 w-28">COVER IMAGE</th>
                <th className="py-3 px-4">NAME</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4">SALE PRICE</th>
                <th className="py-3 px-4">SKU CODE</th>
                <th className="py-3 px-4 text-center w-24">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="w-16 h-12 bg-slate-200 rounded-lg"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 bg-slate-200 rounded w-48 mb-1"></div>
                      <div className="h-3 bg-slate-100 rounded w-24"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 bg-slate-200 rounded w-20"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 bg-slate-200 rounded w-16"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3 bg-slate-200 rounded w-36 mb-1"></div>
                      <div className="h-3 bg-slate-100 rounded w-32"></div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="w-14 h-7 bg-slate-200 rounded-md mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : displayProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No matching products found.
                  </td>
                </tr>
              ) : (
                displayProducts.map((product) => {
                  const skuBreakdown =
                    product.variants && product.variants.length > 0
                      ? product.variants.map(
                          (v) => `${v.sku || product.sku || "-"} ⇒ ${v.variant || ""} ⇒ ${v.stock ?? 1}`
                        )
                      : product.sku_codes || [
                          `${product.sku || "15180"} ⇒ M(Size-38) ⇒ 1`,
                        ];

                  const imgUrl = getProductImageUrl(product);

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* 1. COVER IMAGE */}
                      <td className="py-3.5 px-4 align-middle">
                        {imgUrl ? (
                          <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center relative shadow-2xs">
                            <img
                              src={imgUrl}
                              alt={product.name || "Product"}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = "none";
                                if (e.currentTarget.parentElement) {
                                  e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400"><svg class="w-4 h-4 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" stroke-width="1.5"/><circle cx="9" cy="9" r="2" stroke-width="1.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke-width="1.5"/></svg><span class="text-[9px] text-slate-400 mt-0.5">No image</span></div>';
                                }
                              }}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-12 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                            <ImageIcon className="w-4 h-4 stroke-[1.5]" />
                            <span className="text-[9px] text-slate-400 mt-0.5">No image</span>
                          </div>
                        )}
                      </td>


                      {/* 2. NAME */}
                      <td className="py-3.5 px-4 align-middle font-medium text-slate-900 max-w-xs">
                        {product.name}
                      </td>

                      {/* 3. CATEGORY */}
                      <td className="py-3.5 px-4 align-middle text-slate-700 font-normal">
                        {product.category_name}
                      </td>

                      {/* 4. SALE PRICE */}
                      <td className="py-3.5 px-4 align-middle text-slate-900 font-medium whitespace-nowrap">
                        ₹ {product.sale_price}
                      </td>

                      {/* 5. SKU CODE */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="space-y-0.5 text-[11px] text-slate-600 font-mono">
                          {skuBreakdown.map((code, cIdx) => (
                            <p key={cIdx} className="leading-tight">
                              {code}
                            </p>
                          ))}
                        </div>
                      </td>


                      {/* 6. ACTION */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Green Edit Button */}
                          <Link
                            href={`/product/edit/${product.id}`}
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>

                          {/* Pink Delete Button */}
                          <button
                            type="button"
                            onClick={() => onDelete(product.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-rose-100 hover:bg-rose-200 text-rose-600 transition shadow-2xs cursor-pointer"
                            title="Delete"
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
      ) : (
        /* ================= 2. GRID VIEW (matching product.list) ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-1">
          {displayProducts.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 col-span-full border border-dashed border-slate-200 rounded-xl">
              No matching products found.
            </div>
          ) : (
            displayProducts.map((product) => {
              const skuBreakdown = product.sku_codes || [
                `${product.sku || "15180"} => M(Size-38) => 1`,
                `${parseInt(product.sku || "15180") + 1} => L(Size40) => 1`,
              ];

                const imgUrl = getProductImageUrl(product);

                return (
                  <div
                    key={product.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 bg-slate-100 overflow-hidden flex items-center justify-center border-b border-slate-100">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={product.name || "Product"}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.style.display = "none";
                              if (e.currentTarget.parentElement) {
                                e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400"><svg class="w-8 h-8 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" stroke-width="1.5"/><circle cx="9" cy="9" r="2" stroke-width="1.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke-width="1.5"/></svg><span class="text-xs text-slate-400 mt-1 font-medium">No image</span></div>';
                              }
                            }}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                            <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                            <span className="text-xs text-slate-400 mt-1 font-medium">No image</span>
                          </div>
                        )}
                        <div className="absolute top-2.5 left-2.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs">
                            {product.category_name}
                          </span>
                        </div>
                      </div>

                    <div className="p-3.5 space-y-2">
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                        {product.name}
                      </h4>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-slate-900">
                          ₹ {product.sale_price}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          In Stock
                        </span>
                      </div>

                      <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg space-y-0.5 text-[10px] text-slate-600 font-mono">
                        {skuBreakdown.slice(0, 2).map((code, cIdx) => (
                          <p key={cIdx} className="truncate">
                            {code}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 pt-0 flex items-center justify-end gap-2 border-t border-slate-100">
                    <Link
                      href={`/product/edit/${product.id}`}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(product.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-600 transition shadow-2xs cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Full Interactive Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>
            Showing {activeTotal === 0 ? 0 : (activePage - 1) * activeLimit + 1} to{" "}
            {Math.min(activePage * activeLimit, activeTotal)} of {activeTotal} entries
          </span>
          <div className="flex items-center gap-1 ml-2">
            <span className="text-[11px] text-slate-400">Per page:</span>
            <select
              value={activeLimit}
              onChange={(e) => handleGoLimit(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleGoPage(Math.max(1, activePage - 1))}
            disabled={activePage === 1}
            className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer font-medium"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(10, activeTotalPages) }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => handleGoPage(pageNum)}
              className={`w-7 h-7 rounded-md text-xs font-semibold transition cursor-pointer ${
                activePage === pageNum
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            onClick={() => handleGoPage(Math.min(activeTotalPages, activePage + 1))}
            disabled={activePage === activeTotalPages || activeTotalPages === 0}
            className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer font-medium"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

