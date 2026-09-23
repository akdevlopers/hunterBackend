"use client";

import React, { useState } from "react";
import { X, Printer, CheckCircle, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export function POSPayModal({
  isOpen,
  onClose,
  cartData,
  onCompletePayment,
  isEditMode = false,
}) {
  const [step, setStep] = useState("preview"); // 'preview' | 'receipt'
  const [selectedPayment, setSelectedPayment] = useState("cash"); // 'cash' | 'online'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState("");

  if (!isOpen || !cartData) return null;

  const {
    pos_id = "15166",
    customer_id = 0,
    date = new Date().toISOString().slice(0, 10),
    customer = { name: "Walk-in Customer" },
    items = [],
    subtotal = 0,
    discount = 0,
    gst = 0,
    gstAmount = 0,
    total = 0,
    notes = "Walk-in customer order",
    storeName = "Hunter Clothing",
  } = cartData;

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    let res;
    if (isEditMode) {
      res = await api.updateOrder({
        id: pos_id,
        note: notes || "",
        discount: Number(discount) || 0,
      });
    } else {
      const payload = {
        customer_id: Number(customer_id) || 0,
        discount: Number(discount) || 0,
        gst: Number(gst) || 0,
        paymentNotes: selectedPayment, // "cash" or "online"
        delivery_comment: notes || " ",
        items: items.map((item) => ({
          id: Number(item.product_id || item.id),
          variant_id: Number(item.variant_id) || 0,
          name: item.name || "Product",
          orignal_price: Number(item.sale_price || item.price) || 0,
          quantity: Number(item.quantity) || 1,
        })),
      };
      res = await api.createPosOrder(payload);
    }

    if (res && (res.status === "success" || res.code === 200 || res.success || res.order_id || res.id || res.status === true)) {
      const orderId = res.order_id || res.id || res.data?.order_id || pos_id;
      setCreatedOrderId(orderId);
      onCompletePayment(selectedPayment === "cash" ? "Cash" : "Online", res);
      setStep("receipt");
    } else {
      setErrorMessage(res?.message || res?.error || "Failed to process order. Please try again.");
    }
    setIsSubmitting(false);
  };

  const activePosId = createdOrderId || pos_id;
  const paymentTypeName = selectedPayment === "cash" ? "CASH" : "ONLINE";
  const totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const calculatedTax = gstAmount > 0 ? gstAmount : (gst ? ((subtotal - discount) * gst) / 100 : 0);

  // Formatted date and time matching reference receipt
  const today = new Date();
  const dateFormatted = today.toLocaleDateString("en-GB"); // DD/MM/YYYY
  const timeFormatted = today.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true });

  const handlePrint = () => {
    const printArea = document.getElementById("thermal-receipt-area");
    if (!printArea) return;

    const printWin = window.open("", "_blank", "width=420,height=700");
    if (!printWin) return;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt #${activePosId}</title>
          <style>
            @page { size: auto; margin: 0; }
            body {
              font-family: Arial, sans-serif;
              font-size: 11px;
              color: #000;
              margin: 0;
              padding: 15px;
              width: 280px;
              margin: 0 auto;
              line-height: 1.3;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-left: left; }
            .font-bold { font-weight: bold; }
            .border-box {
              border: 1.5px solid #000;
              padding: 2px 10px;
              display: inline-block;
              font-weight: bold;
              margin: 6px 0;
            }
            .divider-top-bottom {
              border-top: 1px solid #000;
              border-bottom: 1px solid #000;
              padding: 4px 0;
              margin: 6px 0;
            }
            table { width: 100%; border-collapse: collapse; margin: 6px 0; }
            th { border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0; font-size: 11px; text-align: left; }
            td { padding: 4px 0; vertical-align: top; font-size: 11px; }
            .flex { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          ${printArea.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const handleClose = () => {
    setStep("preview");
    setErrorMessage("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      maxWidth="max-w-4xl"
    >
      {step === "preview" ? (
        /* ================= STEP 1: Order Preview & Payment ================= */
        <div className="space-y-5 text-slate-800 text-xs font-sans">
          {/* Header Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">#{activePosId}</h2>
                {isEditMode && (
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                    Edit Mode
                  </span>
                )}
              </div>
              <p className="text-slate-600">
                <span className="font-semibold text-slate-800">Date:</span> {date}
              </p>
              <div className="pt-1.5">
                <span className="font-bold block text-slate-900">Billed To :</span>
                <span className="text-slate-800 font-bold">{customer.name || "Walk-in Customer"}</span>
              </div>
            </div>

            <div className="text-center pt-2 sm:pt-6">
              <span className="font-bold block text-slate-900">Shipped To :</span>
              <span className="text-slate-500 font-medium">-</span>
            </div>

            <div className="space-y-1 sm:text-right">
              <p className="text-slate-700">
                <span className="font-bold text-slate-900">Store Name:</span> {storeName}
              </p>
              <div className="pt-3 sm:text-right">
                <span className="font-bold text-slate-900">From:</span>{" "}
                <span className="text-slate-800 font-medium">{storeName}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200/80 rounded-xl overflow-x-auto shadow-2xs">
            <table className="w-full text-left text-xs border-collapse min-w-[550px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">ITEMS</th>
                  <th className="py-2.5 px-3 text-center">QUANTITY</th>
                  <th className="py-2.5 px-3 text-center">PRICE</th>
                  <th className="py-2.5 px-3 text-center">TAX</th>
                  <th className="py-2.5 px-3 text-center">TAX AMOUNT</th>
                  <th className="py-2.5 px-3 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {item.name} {item.variant ? `(${item.variant})` : ""}
                    </td>
                    <td className="py-3 px-3 text-center font-medium">{item.quantity}</td>
                    <td className="py-3 px-3 text-center font-medium">₹ {item.sale_price || item.price}</td>
                    <td className="py-3 px-3 text-center text-slate-400">-</td>
                    <td className="py-3 px-3 text-center font-medium">₹ 0</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      ₹ {(item.sale_price || item.price) * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="divide-y divide-slate-100 border-t border-slate-200 text-slate-700 font-semibold bg-slate-50/30">
                <tr>
                  <td colSpan={5} className="py-2.5 px-3">Sub Total</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    ₹ {subtotal}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} className="py-2.5 px-3">Discount</td>
                  <td className="py-2.5 px-3 text-right">
                    ₹ {discount}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} className="py-2.5 px-3">Gst</td>
                  <td className="py-2.5 px-3 text-right">
                    ₹ {calculatedTax > 0 ? Number(calculatedTax).toFixed(2) : 0}
                  </td>
                </tr>
                <tr className="bg-slate-50 font-black text-slate-900">
                  <td colSpan={5} className="py-3 px-3 text-sm font-bold">Total</td>
                  <td className="py-3 px-3 text-right text-sm font-bold text-slate-900">
                    ₹ {total}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Selection & Submit Order */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">
                Select Payment Method
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPayment("cash")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition cursor-pointer",
                    selectedPayment === "cash"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-500 shadow-2xs ring-1 ring-emerald-500"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <span className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                    selectedPayment === "cash" ? "border-emerald-600 bg-emerald-600" : "border-slate-300 bg-white"
                  )}>
                    {selectedPayment === "cash" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span>Cash Payment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPayment("online")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition cursor-pointer",
                    selectedPayment === "online"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-500 shadow-2xs ring-1 ring-emerald-500"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <span className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                    selectedPayment === "online" ? "border-emerald-600 bg-emerald-600" : "border-slate-300 bg-white"
                  )}>
                    {selectedPayment === "online" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <span>Online Payment</span>
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isEditMode ? "Updating Order..." : "Submitting Order..."}</span>
                  </>
                ) : (
                  <span>{isEditMode ? "Confirm & Update Order" : "Submit Order & Pay Now"}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= STEP 2: Thermal Print Receipt matching user screenshot ================= */
        <div className="space-y-4 text-slate-800 text-xs font-sans">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isEditMode
                ? `Order #${activePosId} updated successfully!`
                : `Payment completed successfully! Bill No: ${activePosId}`}
            </span>
          </div>

          {/* Printable Receipt Layout Container */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-center">
            <div
              id="thermal-receipt-area"
              className="w-[300px] bg-white p-5 border border-slate-300 shadow-xs font-mono text-slate-900 text-[11px] leading-tight space-y-2"
            >
              {/* Header */}
              <div className="text-center space-y-0.5">
                <p className="text-[10px] text-slate-600">Receipt</p>
                <h3 className="text-sm font-bold text-slate-900 uppercase">Hunter Clothing</h3>
                <p className="text-[10px] text-slate-700">4-74D-1 , Near Ramraj , main road ,</p>
                <p className="text-[10px] text-slate-700">Kanyakumari-629702</p>
                <p className="text-[10px] text-slate-700">Contact: 6383627571,9487826087</p>

                <div className="mt-2.5 mb-1.5 inline-block border border-slate-900 px-3 py-0.5 font-bold text-xs">
                  --{paymentTypeName} BILL--
                </div>
              </div>

              {/* Date & Bill No section */}
              <div className="border-t border-b border-slate-900 py-1.5 my-2 space-y-0.5 text-[11px] font-medium">
                <div className="flex justify-between">
                  <span>Date:{dateFormatted}</span>
                  <span>Time:{timeFormatted}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Bill No: {activePosId}</span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-[11px] border-collapse my-2">
                <thead>
                  <tr className="border-t border-b border-slate-900 font-bold">
                    <th className="py-1 text-left font-bold">Item Name</th>
                    <th className="py-1 text-right font-bold">Rate</th>
                    <th className="py-1 text-center font-bold">Qty</th>
                    <th className="py-1 text-right font-bold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1 text-left font-medium pr-1">{item.name}</td>
                      <td className="py-1 text-right font-medium">{item.sale_price || item.price}</td>
                      <td className="py-1 text-center font-medium">{item.quantity}</td>
                      <td className="py-1 text-right font-bold">{(item.sale_price || item.price) * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div className="border-t border-slate-900 pt-2 space-y-0.5 text-[11px] font-semibold text-right">
                <div className="flex justify-end gap-6">
                  <span>Sub Total</span>
                  <span className="w-20 text-right">₹ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-end gap-6">
                  <span>Discount</span>
                  <span className="w-20 text-right">₹ {discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-end gap-6">
                  <span>Tax</span>
                  <span className="w-20 text-right">₹ {calculatedTax > 0 ? Number(calculatedTax).toFixed(2) : "0.00"}</span>
                </div>
                <div className="flex justify-end gap-6 font-bold text-xs text-slate-900 pt-1">
                  <span>Total To Pay</span>
                  <span className="w-20 text-right">₹ {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Summary Bar */}
              <div className="border-t border-b border-slate-900 py-1.5 my-2 flex justify-between text-[11px] font-bold">
                <span>Total Qty : {totalQty}</span>
                <span>Today's Savings: ₹ {discount}</span>
              </div>

              {/* Footer text */}
              <p className="text-center font-bold text-xs text-slate-900 pt-1">
                Thank you for Hunting !
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
