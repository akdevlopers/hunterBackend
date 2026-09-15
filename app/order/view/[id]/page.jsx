"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Mail,
  Phone,
  MessageSquare,
  Truck,
  CreditCard,
  Package,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { api } from "@/lib/api";

export default function OrderViewPage() {
  const routeParams = useParams();
  const orderId = routeParams?.id || "15164";

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Note state
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState("private_note");
  const [toastMessage, setToastMessage] = useState("");

  const loadOrder = async () => {
    setLoading(true);
    const data = await api.getOrderById(orderId);
    setOrderData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    await api.addOrderNote(orderId, noteText.trim(), noteType);
    setNoteText("");
    setToastMessage("Order note added successfully!");
    loadOrder();
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      await api.deleteOrderNote(orderId, noteId);
      setToastMessage("Order note deleted.");
      loadOrder();
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-12 text-center text-slate-400">Loading order details...</div>
      </AppLayout>
    );
  }

  if (!orderData) return null;

  const orderObj = orderData.order || orderData;
  const billing = orderData.billing_details || orderObj.customer || {};
  const customerName =
    billing.name ||
    `${billing.first_name || ""} ${billing.last_name || ""}`.trim() ||
    "Customer";
  const phoneNum = billing.telephone || billing.phone || "";
  const whatsappNumber = phoneNum.replace(/[^0-9]/g, "");
  const items = orderObj.products || orderObj.items || [];
  const notesList = orderData.notes || orderObj.notes || [];

  return (
    <AppLayout>
      <div className="space-y-5 max-w-5xl mx-auto">
        {/* Top Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/order"
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-xl font-bold text-slate-900">
                Order #{orderObj.product_order_id || orderObj.id}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <Link href="/dashboard" className="text-emerald-600 hover:underline">
                Home
              </Link>
              <span>&gt;</span>
              <Link href="/order" className="text-emerald-600 hover:underline">
                Order
              </Link>
              <span>&gt;</span>
              <span className="text-slate-600 font-medium">
                Invoice #{orderObj.product_order_id || orderObj.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
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

        {/* Invoice Summary Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
          {/* Header row: Store Info & Invoice Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 block">
                Storefront Invoice
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-0.5">Meetay Hunter Store</h2>
              <p className="text-xs text-slate-500">Luxury Designer Looks • Registered Merchant</p>
            </div>

            <div className="sm:text-right text-xs space-y-1">
              <p className="text-slate-500">
                Order ID:{" "}
                <span className="font-bold text-slate-900">
                  #{orderObj.product_order_id || orderObj.id}
                </span>
              </p>
              <p className="text-slate-500">
                Order Date:{" "}
                <span className="font-medium text-slate-800">
                  {orderObj.order_date_formatted || orderObj.order_date}
                </span>
              </p>
              <p className="text-slate-500">
                Payment Status:{" "}
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {orderObj.payment_status || "Paid"}
                </span>
              </p>
            </div>
          </div>

          {/* 2-Column Addresses: Shipping & Billing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Info */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Shipping Address</span>
              </h3>
              <div className="space-y-1 text-xs text-slate-700">
                <p className="font-bold text-slate-900 text-sm">{customerName}</p>
                {billing.email && (
                  <p className="text-slate-600 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {billing.email}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-0.5">
                  {phoneNum && (
                    <span className="text-slate-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {phoneNum}
                    </span>
                  )}
                  {whatsappNumber && (
                    <a
                      href={`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=Hi%20${encodeURIComponent(customerName)},%20regarding%20order%20#${orderObj.product_order_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
                <p className="text-slate-600 pt-1 leading-relaxed">
                  {[
                    billing.address || billing.delivery_address,
                    billing.city_name || billing.city,
                    billing.state,
                    billing.postcode,
                    billing.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>

            {/* Billing Info */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>Payment & Fulfillment</span>
              </h3>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Payment Gateway:</span>
                  <span className="font-semibold text-slate-900">
                    {orderObj.payment_type_label || orderObj.payment_type || "COD"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Fulfillment Status:</span>
                  <span className="font-bold text-slate-900">
                    {orderObj.delivered_status_label ||
                      (orderObj.delivered_status === 1
                        ? "Completed"
                        : orderObj.delivered_status === 2
                          ? "Remark"
                          : "New")}
                  </span>
                </div>
                {orderObj.additional_note && (
                  <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <span className="font-bold">Operational Note: </span>
                    {orderObj.additional_note}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ordered Products</span>
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold">
                    <th className="py-3 px-4 w-16">Item</th>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">Variant</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white">
                          <img
                            src={
                              item.image ||
                              item.cover_image ||
                              "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200"
                            }
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {item.variant_name || item.variant || item.sku || "-"}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {item.qty || item.quantity || 1}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">
                        ₹ {item.orignal_price || item.price || item.final_price || 0}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹ {item.final_price || item.total_orignal_price || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Calculations */}
            <div className="flex justify-end pt-2">
              <div className="w-72 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>₹ {orderObj.product_price || orderObj.final_price || 0}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee:</span>
                  <span className="text-emerald-600 font-semibold">
                    {orderObj.delivery_price > 0
                      ? `₹ ${orderObj.delivery_price}`
                      : "Free Delivery"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                  <span>Grand Total Paid:</span>
                  <span className="text-emerald-700 text-base">
                    ₹ {orderObj.final_price || orderObj.paidAmount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ORDER NOTES SECTION */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Order Notes & Activity Timeline</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {notesList.length} Notes
            </span>
          </div>

          {/* Notes Cards List */}
          <div className="space-y-3">
            {notesList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                No notes created for this order yet. Add internal remarks or customer updates below.
              </div>
            ) : (
              notesList.map((note) => (
                <div
                  key={note.id}
                  className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-4 ${note.status === "Order Created"
                      ? "bg-blue-50/50 border-blue-200"
                      : "bg-slate-50 border-slate-200"
                    }`}
                >
                  <div className="space-y-1 flex-1">
                    <p className="text-xs font-medium text-slate-900 leading-relaxed">
                      {note.notes}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{note.created_at}</span>
                      {note.status && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-emerald-700">
                            {note.status}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 rounded text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Order Note Form */}
          <form onSubmit={handleAddNote} className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Add New Order Note</h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 space-y-1">
                <textarea
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter message or operational notes here..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  required
                />
              </div>

              <div className="md:col-span-4 space-y-3 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Note Type
                  </label>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="private_note">Private Note</option>
                    <option value="to_customer">Customer Note</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Note</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
