"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Boxes,
  Search,
  RotateCcw,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { api } from "@/lib/api";

export default function StockReportHunterPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skuCodeInput, setSkuCodeInput] = useState("");
  const [activeSkuCode, setActiveSkuCode] = useState("");

  const [purchaseTotal, setPurchaseTotal] = useState(0);
  const [saleTotal, setSaleTotal] = useState(0);
  const [formattedPurchaseTotal, setFormattedPurchaseTotal] = useState("₹ 0");
  const [formattedSaleTotal, setFormattedSaleTotal] = useState("₹ 0");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = useCallback(
    async (pageToLoad = currentPage, skuToSearch = activeSkuCode, limitToLoad = pageSize) => {
      setLoading(true);
      try {
        const res = await api.getStockReportHunter({
          skuCode: skuToSearch,
          page: pageToLoad,
          limit: limitToLoad,
        });

        const dataObj = res?.data || res || {};
        const items = Array.isArray(dataObj.products)
          ? dataObj.products
          : Array.isArray(res?.products)
          ? res.products
          : [];

        setProducts(items);

        // Totals
        const pTotal = dataObj.purchaseTotal ?? res?.purchaseTotal ?? 0;
        const sTotal = dataObj.saleTotal ?? res?.saleTotal ?? 0;
        setPurchaseTotal(pTotal);
        setSaleTotal(sTotal);

        setFormattedPurchaseTotal(
          dataObj.formattedPurchaseTotal ||
            res?.formattedPurchaseTotal ||
            `₹ ${Number(pTotal).toLocaleString("en-IN")}`
        );
        setFormattedSaleTotal(
          dataObj.formattedSaleTotal ||
            res?.formattedSaleTotal ||
            `₹ ${Number(sTotal).toLocaleString("en-IN")}`
        );

        // Pagination
        const pag = dataObj.pagination || res?.pagination || {};
        const totalCount = pag.total !== undefined && pag.total !== null ? pag.total : items.length;
        const pagesCount = pag.totalPages || Math.ceil(totalCount / limitToLoad) || 1;

        setTotalEntries(totalCount);
        setTotalPages(pagesCount);
        setCurrentPage(pag.page || pageToLoad);
      } catch (err) {
        console.error("Failed to load stock report:", err);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, activeSkuCode, pageSize]
  );

  useEffect(() => {
    loadData(1, "", pageSize);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setActiveSkuCode(skuCodeInput.trim());
    setCurrentPage(1);
    loadData(1, skuCodeInput.trim(), pageSize);
  };

  const handleReset = () => {
    setSkuCodeInput("");
    setActiveSkuCode("");
    setCurrentPage(1);
    loadData(1, "", pageSize);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    loadData(newPage, activeSkuCode, pageSize);
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value) || 10;
    setPageSize(newLimit);
    setCurrentPage(1);
    loadData(1, activeSkuCode, newLimit);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-emerald-600" />
              <span>Stock Report</span>
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Link href="/dashboard" className="text-emerald-600 hover:underline">
                Home
              </Link>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">Stock Report</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadData(currentPage, activeSkuCode, pageSize)}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition shadow-2xs cursor-pointer"
              title="Refresh Report"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Filter Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Total Purchase Price
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={formattedPurchaseTotal}
                className="w-full bg-slate-100/80 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-800 cursor-not-allowed select-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Total Sale Price
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={formattedSaleTotal}
                className="w-full bg-slate-100/80 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-bold text-emerald-700 cursor-not-allowed select-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                SKU Code
              </label>
              <input
                type="text"
                placeholder="Enter SKU CODE"
                value={skuCodeInput}
                onChange={(e) => setSkuCodeInput(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-2xs transition cursor-pointer"
              >
                reset
              </button>
            </div>
          </form>
        </div>

        {/* Master Stock Table */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={handleLimitChange}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries per page</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-y border-slate-200 font-bold text-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-3 w-14 text-center">Sl.No</th>
                  <th className="py-3 px-3 w-36">SKU Code</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3 w-28">Variant</th>
                  <th className="py-3 px-3 w-20 text-center">Stock</th>
                  <th className="py-3 px-3">Purchase Price (Total)</th>
                  <th className="py-3 px-3">Sale Price (Total)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3.5 px-3 text-center">
                        <div className="h-4 bg-slate-200 rounded w-6 mx-auto"></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-4 bg-slate-200 rounded w-20"></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-4 bg-slate-200 rounded w-48"></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-4 bg-slate-200 rounded w-12"></div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="h-4 bg-slate-200 rounded w-8 mx-auto"></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-4 bg-slate-200 rounded w-16"></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-4 bg-slate-200 rounded w-16"></div>
                      </td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-slate-400 font-medium"
                    >
                      No stock records found.
                    </td>
                  </tr>
                ) : (
                  products.map((item, idx) => {
                    const slNo = item.sl_no || (currentPage - 1) * pageSize + idx + 1;
                    const skuCodeVal = item.sku || "-";
                    const productName = item.name || item.product || "-";
                    const variantName = item.variant || "-";
                    const stockVal = item.stock ?? 0;
                    const pTotalFormatted =
                      item.formatted_purchase_price_total ||
                      `₹ ${Number(item.purchase_price_total ?? 0).toLocaleString("en-IN")}`;
                    const sTotalFormatted =
                      item.formatted_sale_price_total ||
                      `₹ ${Number(item.sale_price_total ?? 0).toLocaleString("en-IN")}`;

                    return (
                      <tr
                        key={item.variant_id || item.product_id || idx}
                        className="hover:bg-slate-50/60 transition"
                      >
                        <td className="py-3.5 px-3 text-center font-bold text-slate-500">
                          {slNo}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                          {skuCodeVal}
                        </td>
                        <td className="py-3.5 px-3 font-medium text-slate-900">
                          {productName}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">
                          {variantName}
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              stockVal > 0
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {stockVal}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800">
                          {pTotalFormatted}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-emerald-700">
                          {sTotalFormatted}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
            <span>
              Showing {totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pNum = i + 1;
                if (totalPages > 5) {
                  if (currentPage > 3) {
                    pNum = currentPage - 2 + i;
                  }
                  if (pNum > totalPages) {
                    pNum = totalPages - (4 - i);
                  }
                }
                if (pNum < 1 || pNum > totalPages) return null;

                const isActive = pNum === currentPage;
                return (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => handlePageChange(pNum)}
                    className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
