"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { OrderTable } from "@/components/order/OrderTable";
import { OrderPreviewModal } from "@/components/order/OrderPreviewModal";
import { RemarkModal } from "@/components/order/RemarkModal";
import { api } from "@/lib/api";

export default function OrderPage() {
  const [ordersResponse, setOrdersResponse] = useState({
    data: [],
    counts: { all: 0, new: "0", completed: "0", remark: "0" },
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState({
    page: 1,
    limit: 10,
    delivered_status: "all",
    search: "",
    fromDate: "",
    toDate: "",
  });

  const [previewOrder, setPreviewOrder] = useState(null);
  const [remarkOrder, setRemarkOrder] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [viewMode, setViewMode] = useState("table");

  const loadOrders = async (updatedParams = {}) => {
    setLoading(true);
    const p = { ...filterParams, ...updatedParams };
    const res = await api.getOrders(p);
    setOrdersResponse(res);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [filterParams.page, filterParams.limit, filterParams.delivered_status, filterParams.fromDate, filterParams.toDate]);

  const handleSearchSubmit = (searchTerm) => {
    const next = { ...filterParams, search: searchTerm, page: 1 };
    setFilterParams(next);
    loadOrders(next);
  };

  const handleParamChange = (newParams) => {
    setFilterParams((prev) => ({ ...prev, ...newParams }));
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const targetOrder = ordersResponse.data.find((o) => o.id === orderId);

    if (newStatus === "2" || newStatus === 2) {
      setRemarkOrder(targetOrder);
      setPendingStatusChange({ orderId, status: 2 });
      return;
    }

    const statusLabel = newStatus === "1" || newStatus === 1 ? "Completed" : "New";
    if (window.confirm(`Are you sure you want to change order status to "${statusLabel}"?`)) {
      await api.updateOrderStatus(orderId, newStatus);
      setToastMessage(`Order status updated to ${statusLabel}`);
      loadOrders();
      setTimeout(() => setToastMessage(""), 3500);
    }
  };

  const handleSaveRemark = async (notes) => {
    if (pendingStatusChange) {
      await api.updateOrderStatus(pendingStatusChange.orderId, 2, notes);
      setPendingStatusChange(null);
      setRemarkOrder(null);
      setToastMessage("Order marked as Remark with note saved.");
      loadOrders();
      setTimeout(() => setToastMessage(""), 3500);
    }
  };

  const handleBookShiprocket = async (order) => {
    const orderId = order.id || order.product_order_id || order.order_id;
    try {
      const res = await api.createShiprocketOrder(orderId);
      if (res && (res.status === "success" || res.success)) {
        setToastMessage(`Shiprocket order booked successfully for Order #${order.product_order_id || orderId}!`);
        loadOrders();
        setTimeout(() => setToastMessage(""), 4000);
      } else {
        alert(res?.message || res?.error || "Failed to book Shiprocket order.");
      }
    } catch (err) {
      alert(err.message || "Failed to book Shiprocket order.");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Order</h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Link href="/dashboard" className="text-emerald-600 hover:underline">
                Home
              </Link>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">Order</span>
            </div>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
            <span>✓ {toastMessage}</span>
            <button onClick={() => setToastMessage("")} className="text-emerald-500 hover:text-emerald-700">✕</button>
          </div>
        )}

        {/* Order Table Component */}
        <OrderTable
          ordersResponse={ordersResponse}
          loading={loading}
          filterParams={filterParams}
          onParamChange={handleParamChange}
          onSearchSubmit={handleSearchSubmit}
          onUpdateStatus={handleUpdateStatus}
          onRefresh={loadOrders}
          onPreviewOrder={(ord) => setPreviewOrder(ord)}
          onBookShiprocket={handleBookShiprocket}
          viewMode={viewMode}
          onToggleViewMode={() => setViewMode(viewMode === "table" ? "grid" : "table")}
        />


        {/* Quick Preview Modal */}
        <OrderPreviewModal
          isOpen={!!previewOrder}
          onClose={() => setPreviewOrder(null)}
          order={previewOrder}
        />

        {/* Remark Modal */}
        <RemarkModal
          isOpen={!!remarkOrder}
          onClose={() => {
            setRemarkOrder(null);
            setPendingStatusChange(null);
          }}
          onSave={handleSaveRemark}
          order={remarkOrder}
        />
      </div>
    </AppLayout>
  );
}
