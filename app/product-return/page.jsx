"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function ProductReturnPage() {
  const [returnResponse, setReturnResponse] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    data: [],
  });
  const [loading, setLoading] = useState(true);
  const [skuSearch, setSkuSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [returnStock, setReturnStock] = useState(1);
  const [returnAmount, setReturnAmount] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [toastMessage, setToastMessage] = useState("");

  const loadData = async (pageToFetch = currentPage) => {
    setLoading(true);
    const res = await api.getProductReturns({ page: pageToFetch, limit: pageSize });
    if (res && (res.status === "success" || res.data)) {
      setReturnResponse(res);
    } else {
      setReturnResponse({
        page: 1,
        limit: pageSize,
        total: 0,
        totalPages: 1,
        data: [],
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage]);

  const handleSearchSku = async () => {
    if (!skuSearch.trim()) return;

    const res = await api.searchProductBySku(skuSearch.trim());
    if (res && res.status && res.data) {
      const p = res.data;
      const price = Number(p.sale_price || p.price || p.orignal_price || 999);
      setSelectedProduct(p);
      setBasePrice(price);
      setReturnStock(1);
      setReturnAmount(price);
      setIsModalOpen(true);
    } else {
      alert("Invalid SKU Code. Product not found.");
    }
  };

  const handleStockChange = (e) => {
    const qty = parseInt(e.target.value) || 0;
    setReturnStock(qty);
    setReturnAmount(qty * basePrice);
  };

  const handleSaveReturn = async () => {
    if (!selectedProduct) return;

    const payload = {
      orderId: selectedProduct.order_id || 0,
      productId: selectedProduct.id || selectedProduct.product_id,
      variantId: selectedProduct.variant_id || selectedProduct.product_variant_id || 0,
      returnStock,
    };

    const res = await api.returnPosOrderItem(payload);
    if (res && (res.status === true || res.status === "success" || res.message === "Success")) {
      setIsModalOpen(false);
      setSkuSearch("");
      setToastMessage(`✓ Product return processed successfully!`);
      loadData();
      setTimeout(() => setToastMessage(""), 3500);
    } else {
      alert(`Return Error: ${res?.message || "Failed to submit return"}`);
    }
  };

  const returnList = returnResponse.data || [];
  const totalEntries = returnResponse.total || returnList.length;
  const totalPages = returnResponse.totalPages || Math.ceil(totalEntries / pageSize) || 1;

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-emerald-600" />
              <span>Product Return</span>
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Link href="/dashboard" className="text-emerald-600 hover:underline">
                Home
              </Link>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">Sales</span>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">Product Return</span>
            </div>
          </div>

          {/* SKU Search & Add Button */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter SKU CODE"
              value={skuSearch}
              onChange={(e) => setSkuSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchSku();
              }}
              className="w-48 sm:w-60 bg-white border border-slate-200 rounded-lg px-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
            />
            <button
              type="button"
              onClick={handleSearchSku}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition cursor-pointer flex items-center gap-1"
            >
              <span>ADD</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage("")}
              className="text-emerald-500 hover:text-emerald-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* Master Returns Table matching /admin/pos/product-return API */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-y border-slate-200 font-bold text-slate-800 uppercase tracking-wider">
                  <th className="py-3.5 px-3 w-14 text-center">Sl.No</th>
                  <th className="py-3.5 px-3 w-28">SKU Code</th>
                  <th className="py-3.5 px-3">Product</th>
                  <th className="py-3.5 px-3 w-24">Variant</th>
                  <th className="py-3.5 px-3 w-28 text-center">Stock In (Qty)</th>
                  <th className="py-3.5 px-3 w-28 text-right">Amount</th>
                  <th className="py-3.5 px-3 w-44">Date/Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3.5 px-3 text-center"><div className="h-4 bg-slate-200 rounded w-6 mx-auto"></div></td>
                      <td className="py-3.5 px-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                      <td className="py-3.5 px-3"><div className="h-4 bg-slate-200 rounded w-40"></div></td>
                      <td className="py-3.5 px-3"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                      <td className="py-3.5 px-3 text-center"><div className="h-4 bg-slate-200 rounded w-8 mx-auto"></div></td>
                      <td className="py-3.5 px-3 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                      <td className="py-3.5 px-3"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                    </tr>
                  ))
                ) : returnList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-10 text-center text-slate-400"
                    >
                      No product returns recorded.
                    </td>
                  </tr>
                ) : (
                  returnList.map((item, idx) => (
                    <tr key={item._id || item.id || idx} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-3 text-center font-bold text-slate-500">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        {item.sku}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          {item.cover_image_url && (
                            <img
                              src={item.cover_image_url}
                              alt={item.productName}
                              className="w-8 h-8 rounded object-cover border border-slate-200"
                            />
                          )}
                          <span>{item.productName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        {item.variant || "Standard"}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-emerald-700">
                        +{item.productStock ?? 1}
                      </td>
                      <td className="py-3.5 px-3 text-right font-semibold text-slate-900">
                        ₹ {Number(item.productAmount || item.variant_price || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                        {item.created_at ? new Date(item.created_at).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                className="w-7 h-7 flex items-center justify-center rounded-md bg-emerald-600 text-white font-bold text-xs shadow-2xs"
              >
                {currentPage}
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Return Entry Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Return Entry"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-800">
                Product Name
              </label>
              <input
                type="text"
                disabled
                value={selectedProduct?.name || selectedProduct?.product_name || ""}
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-800">Stock</label>
              <input
                type="number"
                min="1"
                value={returnStock}
                onChange={handleStockChange}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-800">
                Amount
              </label>
              <input
                type="number"
                value={returnAmount}
                onChange={(e) => setReturnAmount(Number(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={Check}
                onClick={handleSaveReturn}
              >
                Save changes
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
