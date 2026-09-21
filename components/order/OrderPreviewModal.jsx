"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Image as ImageIcon, RotateCcw, Package, AlertCircle, X, ZoomIn, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";

export function OrderPreviewModal({ isOpen, onClose, order }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [returningId, setReturningId] = useState(null);
  const [returnMessage, setReturnMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (isOpen && order?.id) {
      async function fetchOrderDetails() {
        setLoading(true);
        const res = await api.getOrderById(order.id);
        setDetails(res || null);
        setLoading(false);
      }
      fetchOrderDetails();
    } else {
      setDetails(null);
      setSelectedImage(null);
    }
  }, [isOpen, order]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedImage) {
        e.stopPropagation();
        setSelectedImage(null);
      }
    };
    if (selectedImage) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage]);

  if (!isOpen || !order) return null;

  // Extract orderObj, billing details, products array, notes, returns
  const orderObj = details?.order || details?.data?.order || order || {};
  const returnedList = details?.returns || details?.data?.returns || orderObj?.returns || [];

  // Helpers to detect if an item is already returned or has 0 returnable qty
  const isItemReturned = (item) => {
    if (item?.is_returned === true) return true;
    if (String(item?.return_status || "").toLowerCase() === "returned") return true;
    if (String(item?.action || "").toLowerCase() === "returned") return true;
    if (item?.return === 1 || item?.returned === 1 || item?.returned === true) return true;
    if (
      item?.returnable_quantity !== undefined &&
      item?.returnable_quantity !== null &&
      Number(item.returnable_quantity) <= 0 &&
      (Number(item.returned_quantity) > 0 || item?.is_returned)
    ) {
      return true;
    }
    const totalQty = Number(item?.qty ?? item?.quantity ?? 1);
    const returnedQty = Number(item?.returned_quantity ?? 0);
    if (returnedQty > 0 && returnedQty >= totalQty) return true;
    return false;
  };

  const getReturnableQty = (item) => {
    if (isItemReturned(item)) return 0;
    if (item?.returnable_quantity !== undefined && item?.returnable_quantity !== null) {
      return Number(item.returnable_quantity);
    }
    const totalQty = Number(item?.qty ?? item?.quantity ?? 1);
    const returnedQty = Number(item?.returned_quantity ?? 0);
    return Math.max(0, totalQty - returnedQty);
  };

  const handleReturnItem = async (item) => {
    // If item is already returned, do not open dialog box
    if (isItemReturned(item)) {
      return;
    }

    const returnableQty = getReturnableQty(item);
    if (returnableQty <= 0) {
      return;
    }

    const returnQtyStr = window.prompt(
      `Enter stock quantity to return for "${item.name || item.title || item.product_name || "Product"}" (Max: ${returnableQty}):`,
      String(returnableQty)
    );
    if (!returnQtyStr) return;
    const returnQty = Number(returnQtyStr);
    if (!returnQty || returnQty <= 0) return;

    if (returnQty > returnableQty) {
      alert(`Cannot return more than returnable quantity (${returnableQty}).`);
      return;
    }

    const payload = {
      orderId: orderObj.id || orderObj.order_id,
      productId: item.productId || item.product_id || item.id,
      variantId: item.productVariantId || item.variant_id || item.variantId || 0,
      returnStock: returnQty,
    };

    setReturningId(item.id || item.product_id || item.variant_id);
    const res = await api.returnPosOrderItem(payload);
    if (res && (res.status === true || res.status === "success" || res.message === "Success")) {
      setReturnMessage(`✓ Returned ${returnQty} unit(s) of "${item.name || item.title || item.product_name || "Product"}" successfully!`);
      // Reload order details
      const refreshed = await api.getOrderById(order.id || order.order_id);
      if (refreshed) setDetails(refreshed);
      setTimeout(() => setReturnMessage(""), 4000);
    } else {
      setReturnMessage(`⚠️ Return failed: ${res?.message || "Error returning stock"}`);
      setTimeout(() => setReturnMessage(""), 4000);
    }
    setReturningId(null);
  };

  const items =
    Array.isArray(orderObj.products) && orderObj.products.length > 0
      ? orderObj.products
      : Array.isArray(orderObj.items) && orderObj.items.length > 0
        ? orderObj.items
        : (orderObj.product_name || orderObj.name
          ? [
            {
              id: orderObj.id || 1,
              name: orderObj.product_name || orderObj.name,
              variant_name: orderObj.variant_name || orderObj.variant || "",
              image: orderObj.image || orderObj.cover_image || null,
              qty: orderObj.products_count || orderObj.qty || 1,
              orignal_price: orderObj.product_price || orderObj.paid_amount || orderObj.final_price || 0,
              final_price: orderObj.final_price || orderObj.paid_amount || 0,
            },
          ]
          : []);

  // Financial summary calculation
  const subTotal =
    orderObj.product_price ??
    orderObj.sub_total ??
    orderObj.final_price ??
    orderObj.paid_amount ??
    0;

  const discount = orderObj.coupon_price ?? orderObj.discount ?? 0;
  const deliveryCharges = orderObj.delivery_price ?? orderObj.delivery_charges ?? 0;
  const grandTotal = orderObj.final_price ?? (subTotal - discount + deliveryCharges);
  const paymentType = orderObj.payment_type_label || orderObj.payment_type || "COD";
  const orderStatusLabel =
    orderObj.delivered_status_label ||
    (orderObj.delivered_status === 1
      ? "Completed"
      : orderObj.delivered_status === 2
        ? "Remark"
        : "New");
  const paidAmount = orderObj.paid_amount ?? orderObj.paidAmount ?? orderObj.final_price ?? 0;
  const noteText =
    orderObj.delivery_comment || "";

  const renderImage = (imgSrc, altText, className = "w-20 h-20") => {
    if (!imgSrc) {
      return (
        <div className={`${className} rounded-lg border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 shrink-0`}>
          <ImageIcon className="w-5 h-5 text-slate-300" />
          <span className="text-[9px] text-slate-400 mt-0.5">No image</span>
        </div>
      );
    }

    const fullUrl = imgSrc.startsWith("http") || imgSrc.startsWith("blob:") || imgSrc.startsWith("data:")
      ? imgSrc
      : `https://meetay.com/${imgSrc}`;

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedImage({ url: fullUrl, title: altText || "Product Image" });
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            setSelectedImage({ url: fullUrl, title: altText || "Product Image" });
          }
        }}
        className={`${className} group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shadow-2xs shrink-0 flex items-center justify-center cursor-pointer transition-all hover:scale-105 hover:border-emerald-500 hover:shadow-md select-none`}
        title="Click to view full image"
      >
        <img
          src={fullUrl}
          alt={altText || "Product"}
          className="w-full h-full object-cover transition duration-200 group-hover:opacity-90"
          onError={(e) => {
            e.target.style.display = "none";
            if (e.target.parentElement) {
              e.target.parentElement.innerHTML = '<div class="w-full h-full bg-slate-50 flex flex-col items-center justify-center text-slate-400"><svg class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" stroke-width="1.5"/><circle cx="9" cy="9" r="2" stroke-width="1.5"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke-width="1.5"/></svg><span class="text-[9px] text-slate-400 mt-0.5">No image</span></div>';
            }
          }}
        />

        {/* Clean Subtle Corner Zoom Icon */}
        <div className="absolute bottom-1 right-1 p-1 rounded-md bg-slate-900/60 text-white backdrop-blur-xs shadow-2xs pointer-events-none group-hover:bg-slate-900/80 transition-colors">
          <ZoomIn className="w-2.5 h-2.5" />
        </div>
      </div>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Order Preview #${orderObj.product_order_id || orderObj.id}`}
        maxWidth="max-w-4xl"
      >
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs font-medium">Fetching order details from server...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {returnMessage && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between animate-in fade-in ${returnMessage.startsWith("⚠️")
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
                  }`}
              >
                <span>{returnMessage}</span>
                <button onClick={() => setReturnMessage("")} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>
            )}

            {/* 1. Products Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-emerald-600" />
                <span>Order Items</span>
              </h4>

              {items.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium">
                  No active order items. (All items may have been returned)
                </div>
              ) : (
                <>
                  {/* Desktop Items Table (hidden on mobile) */}
                  <div className="hidden sm:block overflow-hidden rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 text-slate-800 font-bold uppercase tracking-wider border-b border-slate-100">
                          <th className="py-3 px-4 w-2/5">ITEM</th>
                          <th className="py-3 px-4 text-center">ITEM IMAGE</th>
                          <th className="py-3 px-4 text-center w-24">QUANTITY</th>
                          <th className="py-3 px-4 text-right w-32">TOTAL</th>
                          <th className="py-3 px-4 text-center w-28">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-xs text-slate-700">
                        {items.map((item, idx) => {
                          const isReturningThis = returningId === item.id;

                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              {/* Item Name & Details */}
                              <td className="py-4 px-4 align-top">
                                <div className="space-y-1.5">
                                  <p className="font-semibold text-emerald-700 text-xs">
                                    {item.name || item.title || item.product_name || "Product"}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                    {(item.variant_name || item.variant || item.product_variant_name) && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-[10px]">
                                        <span className="text-indigo-400 font-normal">Variant:</span>
                                        <span>{item.variant_name || item.variant || item.product_variant_name}</span>
                                      </span>
                                    )}
                                    {(item.sku || item.product_sku || item.variant_sku) && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold text-[10px]">
                                        <span className="text-slate-400 font-sans font-normal">SKU:</span>
                                        <span>{item.sku || item.product_sku || item.variant_sku}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Item Image with clean placeholder */}
                              <td className="py-4 px-4 align-top text-center">
                                <div className="inline-block">
                                  {renderImage(item.cover_image_url, item.name, "w-16 h-16")}
                                </div>
                              </td>

                              {/* Quantity */}
                              <td className="py-4 px-4 align-top text-center font-medium text-slate-800">
                                {item.qty || item.quantity || 1}
                              </td>

                              {/* Total Price */}
                              <td className="py-4 px-4 align-top text-right font-medium text-slate-800 whitespace-nowrap">
                                ₹{Number(item.final_price || item.total_orignal_price || item.orignal_price || item.total || 0).toFixed(2)}
                              </td>

                              {/* Return Action */}
                              <td className="py-4 px-4 align-top text-center">
                                {isItemReturned(item) ? (
                                  <span
                                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold select-none cursor-default"
                                    title="This product has already been returned"
                                  >
                                    Returned
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleReturnItem(item)}
                                    disabled={isReturningThis || getReturnableQty(item) <= 0}
                                    className="px-2.5 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-700 text-[11px] font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
                                    title="Return stock for this product"
                                  >
                                    {isReturningThis ? "Returning..." : "Return"}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Items Card List (visible only on mobile) */}
                  <div className="block sm:hidden space-y-3">
                    {items.map((item, idx) => {
                      const isReturningThis = returningId === (item.id || item.product_id || item.variant_id);
                      const variantVal = item.variant_name || item.variant || item.product_variant_name;
                      const skuVal = item.sku || item.product_sku || item.variant_sku;
                      const itemReturned = isItemReturned(item);

                      return (
                        <div key={idx} className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2 text-xs">
                          <div className="flex gap-3">
                            {renderImage(item.image || item.cover_image, item.name, "w-16 h-16")}
                            <div className="flex-1 min-w-0 space-y-1">
                              <p className="font-semibold text-slate-900 line-clamp-2">
                                {item.name || item.title || item.product_name || "Product"}
                              </p>
                              <div className="flex flex-wrap items-center gap-1">
                                {variantVal && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-semibold">
                                    <span>Variant: {variantVal}</span>
                                  </span>
                                )}
                                {skuVal && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                                    <span>SKU: {skuVal}</span>
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-slate-600 text-[11px]">Qty: <b className="text-slate-900">{item.qty || item.quantity || 1}</b></span>
                                <span className="font-bold text-slate-900">₹{Number(item.final_price || item.total_orignal_price || item.orignal_price || item.total || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200/80 flex justify-end">
                            {itemReturned ? (
                              <span
                                className="inline-flex items-center px-3 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold select-none cursor-default"
                                title="This product has already been returned"
                              >
                                Returned
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleReturnItem(item)}
                                disabled={isReturningThis || getReturnableQty(item) <= 0}
                                className="px-3 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-700 text-[11px] font-bold transition cursor-pointer disabled:opacity-50"
                              >
                                {isReturningThis ? "Returning..." : "Return Stock"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* 2. Returned Items Section (Shows when returns exist) */}
            {returnedList && returnedList.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                  <span>Returned Items History</span>
                  <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded-full font-bold">
                    {returnedList.length}
                  </span>
                </h4>

                {/* Desktop Returns Table */}
                <div className="hidden sm:block overflow-hidden rounded-xl border border-rose-100 bg-rose-50/20">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-rose-50/70 text-rose-900 font-bold uppercase tracking-wider border-b border-rose-100 text-[11px]">
                        <th className="py-2.5 px-4 w-1/3">RETURNED ITEM</th>
                        <th className="py-2.5 px-3 text-center">SKU</th>
                        <th className="py-2.5 px-3 text-center">VARIANT</th>
                        <th className="py-2.5 px-3 text-center w-24">RETURNED QTY</th>
                        <th className="py-2.5 px-4 text-right w-28">REFUND AMOUNT</th>
                        <th className="py-2.5 px-4 text-center w-28">DATE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100 bg-white text-xs text-slate-700">
                      {returnedList.map((retItem, rIdx) => {
                        const returnDate = retItem.created_at
                          ? new Date(retItem.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                          : "-";
                        const sku = retItem.sku || retItem.product_sku || retItem.variant_sku || "-";
                        const variant = retItem.variant || retItem.variant_name || "-";

                        return (
                          <tr key={retItem._id || retItem.id || rIdx} className="hover:bg-rose-50/30 transition-colors">
                            <td className="py-3 px-4 font-semibold text-slate-900">
                              {retItem.product_name || retItem.name || "Product"}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {sku !== "-" ? (
                                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold text-[11px]">
                                  {sku}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {variant !== "-" ? (
                                <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-[11px]">
                                  {variant}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-rose-700 text-xs">
                              {retItem.returned_stock || retItem.return_stock || retItem.qty || 1}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                              ₹{Number(retItem.returned_amount || retItem.amount || retItem.return_price || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-center text-slate-500 text-[11px] whitespace-nowrap">
                              {returnDate}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Returns Cards */}
                <div className="block sm:hidden space-y-2">
                  {returnedList.map((retItem, rIdx) => {
                    const sku = retItem.sku || retItem.product_sku || retItem.variant_sku;
                    const variant = retItem.variant || retItem.variant_name;

                    return (
                      <div
                        key={retItem._id || retItem.id || rIdx}
                        className="p-3 border border-rose-200 rounded-xl bg-rose-50/30 text-xs space-y-2"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-bold text-slate-900">{retItem.product_name || retItem.name || "Product"}</p>
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px] shrink-0">
                            Returned: {retItem.returned_stock || retItem.return_stock || 1}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {variant && (
                            <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-semibold">
                              Variant: <b>{variant}</b>
                            </span>
                          )}
                          {sku && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                              SKU: <b>{sku}</b>
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-1.5 border-t border-rose-100">
                          <span className="text-[11px] text-slate-500">Refund Amount:</span>
                          <span className="font-bold text-slate-900">
                            ₹{Number(retItem.returned_amount || retItem.amount || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Bottom Grid: Left Note & Right Summary Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
              {/* Left Column: Note */}
              <div className="space-y-1 bg-amber-50/50 p-3 rounded-xl border border-amber-100 self-start">
                <h4 className="text-xs font-bold text-amber-800">Note:</h4>
                <p className="text-xs text-slate-700 font-medium">{noteText}</p>
              </div>

              {/* Right Column: Financial Summary Table */}
              <div className="space-y-2 text-xs text-slate-700 font-medium bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-normal">Sub Total :</span>
                  <span className="text-slate-900 font-bold">₹{Number(subTotal || 0).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-normal">Discount :</span>
                  <span className="text-slate-900 font-bold">₹{Number(discount || 0).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-normal">Delivery Charges :</span>
                  <span className="text-slate-900 font-bold">₹{Number(deliveryCharges || 0).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                  <span>Grand Total :</span>
                  <span className="text-emerald-700 text-sm">₹{Number(grandTotal || 0).toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-normal">Payment Type :</span>
                  <span className="text-slate-900 font-bold">{paymentType}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-normal">Order Status :</span>
                  <span className="text-slate-900 font-bold">{orderStatusLabel}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-normal">Paid Amount :</span>
                  <span className="text-slate-900 font-bold">₹{Number(paidAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Standalone Fullscreen Image Popup Lightbox (Desktop & Mobile) */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <h4 className="text-xs font-bold text-slate-800 truncate" title={selectedImage.title}>
                  {selectedImage.title}
                </h4>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={selectedImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                  title="Close image view"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image Container */}
            <div className="flex-1 overflow-auto bg-slate-900/5 p-4 sm:p-6 flex items-center justify-center min-h-[250px] max-h-[75vh]">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
