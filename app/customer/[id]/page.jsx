"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Eye,
  User,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Trash2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { api } from "@/lib/api";

export default function CustomerOrdersPage() {
  const routeParams = useParams();
  const customerId = routeParams?.id || "3955";

  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    const cust = await api.getCustomerById(customerId);
    const custOrders = await api.getCustomerOrders(customerId);
    setCustomer(cust);
    setOrders(custOrders);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [customerId]);

  const handleDeleteOrder = async (orderId) => {
    if (
      window.confirm(
        "Are You Sure?\nThis action cannot be undone. Do you want to continue?"
      )
    ) {
      await api.deleteOrder(orderId);
      setToastMessage("Order deleted successfully.");
      loadData();
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  if (!customer) return null;

  const fullName = customer.name || `${customer.first_name} ${customer.last_name}`;

  const handleExportCSV = () => {
    const headers = "Order ID,Date,Name,Value,Payment Type,Status\n";
    const rows = orders
      .map(
        (o) =>
          `"${o.product_order_id}","${o.order_date}","${fullName}","${o.final_price}","${o.payment_type}","${o.delivered_status === 1 ? "Completed" : "New"}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Customer_${customerId}_Orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Header Breadcrumb & Actions matching view.blade.php */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/customer"
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-xl font-bold text-slate-900">
                Orders
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <Link href="/dashboard" className="text-emerald-600 hover:underline">
                Home
              </Link>
              <span>&gt;</span>
              <Link href="/customer" className="text-emerald-600 hover:underline">
                Customer
              </Link>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">Orders</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
              title="Export Orders"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
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

        {/* Customer Orders Table matching customer/view.blade.php */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-y border-slate-200 font-bold text-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-4 w-32">Orders</th>
                  <th className="py-3 px-4 w-36">Date</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4 w-28">Value</th>
                  <th className="py-3 px-4 w-36">Payment Type</th>
                  <th className="py-3 px-4 w-32">Status</th>
                  <th className="py-3 px-4 text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No order records found for this customer.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition">
                      {/* Order Id badge */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/order/view/${order.id}`}
                          className="inline-flex items-center px-2.5 py-1 rounded bg-brand-600 hover:bg-brand-700 text-white font-mono text-xs font-bold shadow-2xs transition"
                        >
                          #{order.product_order_id}
                        </Link>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-600">
                        {order.order_date}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {fullName}
                      </td>

                      {/* Value */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹ {order.final_price || order.paidAmount}
                      </td>

                      {/* Payment Type */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            order.payment_type === "Razorpay"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {order.payment_type === "Razorpay" ? "Prepaid (Razorpay)" : "Cash On Delivery"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            order.delivered_status === 1
                              ? "bg-emerald-100 text-emerald-800"
                              : order.delivered_status === 2
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {order.delivered_status === 1
                            ? "Delivered"
                            : order.delivered_status === 2
                            ? "Remark"
                            : "New / Processing"}
                        </span>
                      </td>

                      {/* Action: Eye View + Red Trash Delete */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Invoice */}
                          <Link
                            href={`/order/view/${order.id}`}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition"
                            title="View Invoice"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete Order Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-rose-500 hover:bg-rose-600 text-white shadow-2xs transition cursor-pointer"
                            title="Delete Order"
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
        </div>
      </div>
    </AppLayout>
  );
}
