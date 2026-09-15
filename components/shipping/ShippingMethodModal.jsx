"use client";

import React, { useEffect, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export function ShippingMethodModal({
  isOpen,
  onClose,
  onSave,
  method,
  shippingClasses = [],
}) {
  const [cost, setCost] = useState("0");
  const [calculationType, setCalculationType] = useState("");
  const [shippingRequires, setShippingRequires] = useState("3");
  const [minOrderAmount, setMinOrderAmount] = useState("0");
  const [productCosts, setProductCosts] = useState({});
  const [noClassCost, setNoClassCost] = useState("0");

  useEffect(() => {
    if (method) {
      setCost(
        method.cost !== undefined && method.cost !== null
          ? String(method.cost)
          : "0"
      );
      setCalculationType(method.calculation_type || "");
      setShippingRequires(method.shipping_requires || "3");
      setMinOrderAmount(
        method.min_order_amount !== undefined
          ? String(method.min_order_amount)
          : "0"
      );
      setProductCosts(method.product_cost || {});
      setNoClassCost(
        method.product_no_cost !== undefined
          ? String(method.product_no_cost)
          : "0"
      );
    }
  }, [method, isOpen]);

  if (!method) return null;

  const methodName = method.method_name || "Flat Rate";
  const isFlatRate = methodName.toLowerCase().includes("flat");
  const isFreeShipping = methodName.toLowerCase().includes("free");
  const isLocalPickup = !isFlatRate && !isFreeShipping;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...method,
      cost: Number(cost) || 0,
      calculation_type: calculationType,
      shipping_requires: shippingRequires,
      min_order_amount: Number(minOrderAmount) || 0,
      product_cost: productCosts,
      product_no_cost: Number(noClassCost) || 0,
    });
    onClose();
  };

  // Fallback classes if none exist
  const displayClasses =
    shippingClasses && shippingClasses.length > 0
      ? shippingClasses
      : [{ id: 1, name: "Barbin" }];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Shipping Method"
      size="md"
      overflowVisible={true}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* ================= 1. LOCAL PICKUP (Matching Screenshot 2 & 5) ================= */}
        {isLocalPickup && (
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="block font-medium text-slate-800 text-xs">
                Name
              </label>
              <input
                type="text"
                disabled
                value={methodName}
                className="w-full bg-[#f1f5f9] border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-700 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-medium text-slate-800 text-xs">
                Cost
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* ================= 2. FLAT RATE (Matching Screenshot 3 & 4) ================= */}
        {isFlatRate && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block font-medium text-slate-800 text-xs">
                  Name
                </label>
                <input
                  type="text"
                  disabled
                  value={methodName}
                  className="w-full bg-[#f1f5f9] border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-700 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-medium text-slate-800 text-xs">
                  Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-medium text-slate-800 text-xs">
                Calculation type
              </label>
              <div className="relative">
                <select
                  value={calculationType}
                  onChange={(e) => setCalculationType(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-8 cursor-pointer"
                >
                  <option value="">Select calculation type</option>
                  <option value="1">
                    Per class: Charge shipping for each shipping class individually
                  </option>
                  <option value="2">
                    Per order: Charge shipping for the most expensive shipping class
                  </option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Single "Barbin" Shipping Class Cost matching Image 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3">
              <label className="font-medium text-slate-800 text-xs">
                &quot;Barbin&quot; shipping class cost
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={productCosts["barbin"] ?? "0"}
                onChange={(e) =>
                  setProductCosts({
                    ...productCosts,
                    barbin: e.target.value,
                  })
                }
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* No shipping class cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3">
              <label className="font-medium text-slate-800 text-xs">
                No shipping class cost
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={noClassCost}
                onChange={(e) => setNoClassCost(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* ================= 3. FREE SHIPPING ================= */}
        {isFreeShipping && (
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="block font-medium text-slate-800 text-xs">
                Name
              </label>
              <input
                type="text"
                disabled
                value={methodName}
                className="w-full bg-[#f1f5f9] border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-700 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-medium text-slate-800 text-xs">
                Free shipping requires
              </label>
              <div className="relative">
                <select
                  value={shippingRequires}
                  onChange={(e) => setShippingRequires(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-8 cursor-pointer"
                >
                  <option value="1">N/A</option>
                  <option value="2">A valid free shipping coupon</option>
                  <option value="3">A minimum order amount</option>
                  <option value="4">A minimum order amount OR a coupon</option>
                  <option value="5">A minimum order amount AND a coupon</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {["3", "4", "5"].includes(shippingRequires) && (
              <div className="space-y-1.5">
                <label className="block font-medium text-slate-800 text-xs">
                  Minimum order amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Buttons matching screenshots */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#e2e8f0] hover:bg-slate-300 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-[#00a859] hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer shadow-xs"
          >
            Update
          </button>
        </div>
      </form>
    </Modal>
  );
}
