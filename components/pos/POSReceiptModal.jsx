"use client";

import React from "react";
import { X, Printer, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function POSReceiptModal({ isOpen, onClose, orderData }) {
  if (!isOpen || !orderData) return null;

  const {
    pos_id = "1025",
    date = new Date().toLocaleString(),
    customer = { name: "Walk-in Customer" },
    items = [],
    subtotal = 0,
    discount = 0,
    gst = 0,
    gstAmount = 0,
    total = 0,
    paymentMethod = "Cash",
    notes = "",
  } = orderData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="POS Sale Receipt"
      description={`Receipt #${pos_id} • ${date}`}
      size="lg"
    >
      <div className="space-y-5 text-slate-800">
        {/* Printable Receipt Box */}
        <div
          id="printable-receipt"
          className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 font-mono text-xs shadow-xs"
        >
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-4 space-y-1">
            <h2 className="text-base font-black uppercase text-slate-900">
              Meetay Hunter Store
            </h2>
            <p className="text-[11px] text-slate-500">Luxury Designer Looks • Registered Store</p>
            <p className="text-[11px] text-slate-500">GSTIN: 33ABCDE1234F1Z5</p>
            <div className="flex justify-between items-center text-[11px] text-slate-600 pt-2">
              <span>Receipt: #{pos_id}</span>
              <span>{date}</span>
            </div>
          </div>

          {/* Customer & Cashier info */}
          <div className="flex justify-between items-center text-[11px] border-b border-dashed border-slate-200 pb-2">
            <div>
              <span className="text-slate-500">Customer: </span>
              <span className="font-bold text-slate-900">{customer.name}</span>
            </div>
            <div>
              <span className="text-slate-500">Payment: </span>
              <span className="font-bold text-emerald-700">{paymentMethod}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 font-bold text-slate-900">
                <th className="py-2">Item</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 font-medium text-slate-800">
                    <div>{item.name}</div>
                    {item.variant && (
                      <span className="text-[10px] text-slate-500">({item.variant})</span>
                    )}
                  </td>
                  <td className="py-2 text-center text-slate-700">{item.quantity}</td>
                  <td className="py-2 text-right text-slate-700">₹{item.sale_price}</td>
                  <td className="py-2 text-right font-bold text-slate-900">
                    ₹{item.sale_price * item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculations */}
          <div className="border-t border-dashed border-slate-300 pt-3 space-y-1.5 text-right text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Discount:</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            {gst > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>GST ({gst}%):</span>
                <span>+₹{gstAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-300">
              <span>Grand Total:</span>
              <span className="text-emerald-700">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {notes && (
            <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
              <span className="font-bold">Note: </span>
              {notes}
            </div>
          )}

          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-dashed border-slate-200">
            Thank you for shopping with Meetay Hunter!
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            icon={Printer}
          >
            Print Receipt
          </Button>
        </div>
      </div>
    </Modal>
  );
}
