"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

export default function PrintFileReceiptPage() {
  const routeParams = useParams();
  const router = useRouter();
  const orderId = routeParams?.id || "15144";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await api.getOrderById(orderId);
      setOrder(data);
      setLoading(false);
    }
    load();
  }, [orderId]);

  useEffect(() => {
    if (order) {
      // Auto-trigger print dialog after render
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-500 text-xs">
        Loading receipt #{orderId}...
      </div>
    );
  }

  const orderObj = order?.order || order?.data?.order || order || {};
  const returnedList = order?.returns || order?.data?.returns || orderObj?.returns || [];

  // Parse active order items
  let items = [];
  if (Array.isArray(orderObj.products) && orderObj.products.length > 0) {
    items = orderObj.products;
  } else if (Array.isArray(orderObj.items) && orderObj.items.length > 0) {
    items = orderObj.items;
  } else if (Array.isArray(orderObj.order_items) && orderObj.order_items.length > 0) {
    items = orderObj.order_items;
  } else if (typeof orderObj.product_json === "string" && orderObj.product_json.trim()) {
    try {
      const parsed = JSON.parse(orderObj.product_json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        items = parsed;
      }
    } catch (e) {}
  } else if (Array.isArray(orderObj.product_json)) {
    items = orderObj.product_json;
  }

  const totalQuantity = items.reduce(
    (sum, item) => sum + (Number(item.qty || item.quantity) || 1),
    0
  );

  const subTotal =
    orderObj.product_price ??
    orderObj.sub_total ??
    orderObj.subtotal ??
    orderObj.total_amount ??
    items.reduce((sum, it) => {
      const q = Number(it.qty || it.quantity || 1) || 1;
      const p = Number(
        it.orignal_price ??
        it.original_price ??
        it.sale_price ??
        it.price ??
        it.product_price ??
        it.final_price ??
        0
      ) || 0;
      return sum + (Number(it.total_orignal_price ?? it.total_original_price ?? it.total ?? (p * q)) || 0);
    }, 0);

  const discount = Number(orderObj.coupon_price ?? orderObj.discount ?? orderObj.discount_amount ?? 0) || 0;
  const tax = Number(orderObj.tax_price ?? orderObj.tax ?? orderObj.tax_amount ?? orderObj.gst ?? 0) || 0;
  const finalPrice =
    orderObj.final_price ??
    orderObj.paidAmount ??
    orderObj.paid_amount ??
    orderObj.total ??
    orderObj.total_amount ??
    (Number(subTotal) - discount + tax);
  const paymentMode = (orderObj.customer_payment_type || orderObj.payment_type || "CASH").toUpperCase();

  const now = orderObj.order_date ? new Date(orderObj.order_date) : new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:p-0 print:bg-white flex flex-col items-center">
      {/* Top Controls Toolbar (Hidden during print) */}
      <div className="w-full max-w-[3.2in] mb-4 flex items-center justify-between print:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Receipt</span>
        </button>
      </div>

      {/* 3-inch POS Thermal Receipt Container matching print_file.blade.php */}
      <div
        id="thermal-receipt"
        className="w-[3.1in] bg-white p-4 text-slate-900 font-mono text-[11px] leading-tight border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-0 print:w-[3in] print:mx-auto"
      >
        {/* Store Header */}
        <div className="text-center space-y-1 pb-1">
          <h1 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
            Hunter Clothing
          </h1>
          <p className="text-[10px] text-slate-700">
            4-74D-1 , Near Ramraj , main road ,
          </p>
          <p className="text-[10px] text-slate-700">
            Kanyakumari-629702
          </p>
          <p className="text-[10px] text-slate-700">
            Contact: 6383627571, 9487826087
          </p>

          <div className="pt-1">
            <span className="inline-block border border-slate-900 px-3 py-0.5 text-xs font-black uppercase">
              --{paymentMode} BILL--
            </span>
          </div>
        </div>

        <div className="border-t border-slate-900 my-2" />

        {/* Date & Time row */}
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span>Date: {dateStr}</span>
          <span>Time: {timeStr}</span>
        </div>

        {/* Bill No */}
        <div className="pt-1 pb-2">
          <span className="font-extrabold text-xs">
            Bill No: {orderObj.product_order_id || orderObj.order_id || orderObj.id || orderId}
          </span>
        </div>

        {/* Line Items Table (Active Order Products) */}
        {items.length > 0 ? (
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-y border-slate-900 font-bold text-[10px]">
                <th className="py-1 text-left">Item Name</th>
                <th className="py-1 text-center">Rate</th>
                <th className="py-1 text-right">Qty</th>
                <th className="py-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item, idx) => {
                const qty = Number(item.qty ?? item.quantity ?? item.products_count ?? 1) || 1;

                const rawUnitPrice =
                  item.orignal_price ??
                  item.original_price ??
                  item.sale_price ??
                  item.price ??
                  item.product_price ??
                  item.rate ??
                  item.unit_price ??
                  item.final_price ??
                  item.mrp ??
                  0;

                const rawTotalAmount =
                  item.total_orignal_price ??
                  item.total_original_price ??
                  item.total_price ??
                  item.total ??
                  item.total_amount ??
                  item.final_price ??
                  0;

                let unitPrice = Number(rawUnitPrice) || 0;
                let totalAmount = Number(rawTotalAmount) || 0;

                if (unitPrice > 0 && totalAmount === 0) {
                  totalAmount = unitPrice * qty;
                } else if (totalAmount > 0 && unitPrice === 0) {
                  unitPrice = totalAmount / qty;
                } else if (unitPrice === 0 && totalAmount === 0) {
                  const anyPrice = Number(item.mrp ?? item.paid_amount ?? item.sub_total ?? 0) || 0;
                  if (anyPrice > 0) {
                    unitPrice = anyPrice / qty;
                    totalAmount = anyPrice;
                  }
                }

                const variantName = item.variant_name || item.variant || item.product_variant_name;
                const skuCode = item.sku || item.product_sku || item.variant_sku;

                return (
                  <tr key={idx}>
                    <td className="py-1 pr-1 font-medium leading-tight">
                      <div>{item.name || item.product_name || item.title || "Product"}</div>
                      {(variantName || skuCode) && (
                        <div className="text-[9px] text-slate-600">
                          {[variantName, skuCode ? `SKU:${skuCode}` : ""].filter(Boolean).join(" | ")}
                        </div>
                      )}
                    </td>
                    <td className="py-1 text-center font-normal">
                      {Number(unitPrice).toFixed(0)}
                    </td>
                    <td className="py-1 text-right font-normal">
                      {qty}
                    </td>
                    <td className="py-1 text-right font-bold">
                      {Number(totalAmount).toFixed(0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}

        <div className="border-t border-slate-900 my-2" />

        {/* Totals Section */}
        <div className="space-y-1 text-right text-xs">
          <div className="flex justify-end gap-3">
            <span className="font-bold w-24 text-right">Sub Total</span>
            <span className="w-20 text-right">
              ₹ {Number(subTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {Number(discount) > 0 && (
            <div className="flex justify-end gap-3">
              <span className="font-bold w-24 text-right">Discount</span>
              <span className="w-20 text-right">
                ₹ {Number(discount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {Number(tax) > 0 && (
            <div className="flex justify-end gap-3">
              <span className="font-bold w-24 text-right">Tax</span>
              <span className="w-20 text-right">
                ₹ {Number(tax).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-3 font-black text-sm pt-1 border-t border-slate-400">
            <span className="w-24 text-right">Total To Pay</span>
            <span className="w-20 text-right">
              ₹ {Number(finalPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-900 my-2" />

        {/* Summary Qty & Savings */}
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span>Total Qty : {totalQuantity}</span>
          <span>Today's Savings: ₹ {Math.round(discount)}</span>
        </div>

        <div className="border-t border-slate-900 my-2" />

        {/* Delivery / Note comment if present */}
        {orderObj.delivery_comment && (
          <div className="pb-2 text-[10px] text-slate-700">
            <span className="font-bold">Note: </span>
            <span>{orderObj.delivery_comment}</span>
            <div className="border-t border-dashed border-slate-400 my-1.5" />
          </div>
        )}

        {/* Footer */}
        <div className="text-center font-bold text-xs pt-1">
          Thank you for Hunting !
        </div>
      </div>
    </div>
  );
}
