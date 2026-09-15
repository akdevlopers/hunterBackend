"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { CustomerTable } from "@/components/customer/CustomerTable";
import { api } from "@/lib/api";

export default function CustomerPage() {
  const [customersResponse, setCustomersResponse] = useState({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [filterParams, setFilterParams] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table");
  const [toastMessage, setToastMessage] = useState("");

  const loadCustomers = async () => {
    setLoading(true);
    const res = await api.getCustomers(filterParams);
    if (res && res.data) {
      setCustomersResponse(res);
    } else if (Array.isArray(res)) {
      setCustomersResponse({ data: res, total: res.length, page: 1, limit: 10, totalPages: 1 });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, [filterParams]);

  const handleParamChange = (key, value) => {
    setFilterParams((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== "page" ? { page: 1 } : {}),
    }));
  };

  const handleToggleStatus = async (customerId, newStatus) => {
    await api.updateCustomerStatus(customerId, newStatus);
    setToastMessage(`Customer status updated to ${newStatus === 1 ? "Active" : "Inactive"}`);
    loadCustomers();
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header Breadcrumbs */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Customer</h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Link href="/dashboard" className="text-emerald-600 hover:underline">
                Home
              </Link>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">Customer</span>
            </div>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in">
            <span>✓ {toastMessage}</span>
            <button onClick={() => setToastMessage("")} className="text-emerald-500 hover:text-emerald-700">
              ✕
            </button>
          </div>
        )}

        {/* Customer Table */}
        <CustomerTable
          customersResponse={customersResponse}
          filterParams={filterParams}
          onParamChange={handleParamChange}
          onToggleStatus={handleToggleStatus}
          onRefresh={loadCustomers}
          loading={loading}
          viewMode={viewMode}
          onToggleViewMode={() => setViewMode(viewMode === "table" ? "grid" : "table")}
        />
      </div>
    </AppLayout>
  );
}
