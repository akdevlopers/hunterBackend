"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Receipt,
  Barcode,
  QrCode,
  Camera,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { POSPayModal } from "@/components/pos/POSPayModal";
import { POSCameraScannerModal } from "@/components/pos/POSCameraScannerModal";
import { api } from "@/lib/api";

// Web Audio API Beep Feedback
function playSound(type = "success") {
  try {
    if (typeof window === "undefined") return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
      osc.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.08); // E6
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // AudioContext failure fallback
  }
}

// Extract SKU or Code from scanned QR raw content (JSON, URL, or plain SKU string)
function parseScannedCode(raw) {
  if (!raw) return "";
  const str = String(raw).trim();

  // 1. If scanned code is JSON payload (e.g. {"sku":"...", "id":123})
  if (str.startsWith("{") && str.endsWith("}")) {
    try {
      const obj = JSON.parse(str);
      return (
        obj.sku ||
        obj.sku_code ||
        obj.skuCode ||
        obj.code ||
        obj.id ||
        obj.product_id ||
        str
      );
    } catch (e) { }
  }

  // 2. If scanned code is URL (e.g. https://domain.com/product?sku=ABC or /product/123)
  if (str.startsWith("http://") || str.startsWith("https://")) {
    try {
      const url = new URL(str);
      const skuParam =
        url.searchParams.get("sku") ||
        url.searchParams.get("code") ||
        url.searchParams.get("id") ||
        url.searchParams.get("sku_code");
      if (skuParam) return skuParam.trim();

      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length > 0) return parts[parts.length - 1];
    } catch (e) { }
  }

  return str;
}

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("walkin");
  const [cart, setCart] = useState([]);
  const [skuSearch, setSkuSearch] = useState("");
  const [skuSuggestions, setSkuSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [discount, setDiscount] = useState("");
  const [gst, setGst] = useState("");
  const [notes, setNotes] = useState("");

  // Scanner & Modal States
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payModalData, setPayModalData] = useState(null);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const searchInputRef = useRef(null);

  // Auto-focus search input on mount and on return
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    async function load() {
      const prods = await api.getProducts({ limit: 200 });
      const custs = await api.getCustomers({ limit: 100 });
      setProducts(prods?.products || prods?.data || (Array.isArray(prods) ? prods : []));
      setCustomers(custs?.data || (Array.isArray(custs) ? custs : []));
    }
    load();
  }, []);

  // Debounced SKU search for manual typing
  useEffect(() => {
    if (!skuSearch.trim()) {
      setSkuSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const q = skuSearch.trim();
      const apiResults = await api.searchProductBySku(q);
      if (apiResults && apiResults.length > 0) {
        setSkuSuggestions(apiResults);
      } else {
        // Fallback to searching loaded local products list
        const lower = q.toLowerCase();
        const matches = products.filter((p) => {
          const matchSku = p.sku_codes && p.sku_codes.some((s) => s.toLowerCase().includes(lower));
          const matchName = p.name?.toLowerCase().includes(lower);
          const matchCategory = p.category?.toLowerCase().includes(lower);
          return matchSku || matchName || matchCategory;
        });
        setSkuSuggestions(matches.slice(0, 8));
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [skuSearch, products]);

  // Add Product to Cart with stock validation
  const handleAddToCart = useCallback(
    (productItem, variantOverride = null) => {
      const productId =
        productItem.productId || productItem.product_id || productItem.id || Date.now();
      const productName =
        productItem.productName || productItem.product_name || productItem.name || "Product";
      const variant =
        variantOverride ||
        productItem.variant ||
        productItem.variant_name ||
        (productItem.variants && productItem.variants.length > 0
          ? typeof productItem.variants[0] === "object"
            ? productItem.variants[0].variant || productItem.variants[0].name
            : productItem.variants[0]
          : "Standard");
      const variantId =
        productItem.productVariantId ||
        productItem.product_variant_id ||
        productItem.variantId ||
        productItem.variant_id ||
        null;
      const price = Number(productItem.price || productItem.sale_price) || 0;
      const skuCode =
        productItem.sku ||
        productItem.sku_code ||
        (productItem.sku_codes ? productItem.sku_codes.join(", ") : "");

      // Resolve stock
      const rawStock =
        productItem.stock ??
        productItem.available_stock ??
        productItem.variant_stock ??
        productItem.total_stock ??
        productItem.current_stock ??
        productItem.quantity ??
        productItem.product_stock ??
        (productItem.variants &&
        productItem.variants.length > 0 &&
        typeof productItem.variants[0] === "object"
          ? productItem.variants[0].stock
          : null);

      let availableStock =
        rawStock !== undefined && rawStock !== null && rawStock !== "" && !isNaN(Number(rawStock))
          ? Number(rawStock)
          : null;

      // Fallback search in loaded products
      if (availableStock === null && products.length > 0) {
        const matchLocal = products.find(
          (p) =>
            String(p.id) === String(productId) ||
            (skuCode && p.sku_codes && p.sku_codes.includes(skuCode))
        );
        if (matchLocal) {
          const localStock =
            matchLocal.stock ??
            matchLocal.total_stock ??
            matchLocal.available_stock ??
            matchLocal.quantity;
          if (localStock !== undefined && localStock !== null && !isNaN(Number(localStock))) {
            availableStock = Number(localStock);
          }
        }
      }

      // Out of stock check
      if (availableStock !== null && availableStock <= 0) {
        playSound("error");
        setToastMessage(`⚠️ Out of stock! "${productName}" is currently unavailable.`);
        setTimeout(() => setToastMessage(""), 4000);
        return;
      }

      // Check existing item in cart
      setCart((prev) => {
        const existingIdx = prev.findIndex(
          (item) =>
            String(item.product_id) === String(productId) &&
            (variantId ? String(item.variant_id) === String(variantId) : item.variant === variant)
        );

        if (existingIdx > -1) {
          const item = prev[existingIdx];
          const stockLimit =
            availableStock !== null
              ? availableStock
              : item.stock !== null && item.stock !== undefined
              ? item.stock
              : null;

          const currentQty = Number(item.quantity) || 1;

          if (stockLimit !== null && currentQty + 1 > stockLimit) {
            playSound("error");
            setToastMessage(
              `⚠️ Stock limit reached! Only ${stockLimit} unit(s) available for "${productName}".`
            );
            setTimeout(() => setToastMessage(""), 4000);
            return prev;
          }

          playSound("success");
          setToastMessage(`✓ Added "${productName}" (+1 Qty) to bill.`);
          setTimeout(() => setToastMessage(""), 3500);

          return prev.map((it, i) =>
            i === existingIdx ? { ...it, quantity: currentQty + 1, stock: stockLimit } : it
          );
        } else {
          playSound("success");
          setToastMessage(`✓ Added "${productName}" (₹${price}) to bill.`);
          setTimeout(() => setToastMessage(""), 3500);

          return [
            ...prev,
            {
              id: Date.now() + Math.random(),
              product_id: productId,
              variant_id: variantId,
              name: productName,
              variant: variant,
              sku: skuCode,
              quantity: 1,
              sale_price: price,
              purchase_price: productItem.purchase_price || 0,
              cover_image: productItem.cover_image || "",
              stock: availableStock,
            },
          ];
        }
      });

      // Clear input and suggestions, re-focus
      setSkuSearch("");
      setSkuSuggestions([]);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    },
    [products]
  );

  // Direct Barcode / QR Code Scanner & Enter Key handler: instantly finds product and adds to billing
  const handleDirectScanOrSubmit = useCallback(
    async (rawCode) => {
      const code = parseScannedCode(rawCode);
      if (!code) return;

      setIsSearching(true);

      try {
        // 1. First check loaded local products for exact SKU or ID match
        const lowerCode = code.toLowerCase();
        let matchedItem = null;

        const exactLocal = products.find((p) => {
          const matchesSkuArray =
            Array.isArray(p.sku_codes) &&
            p.sku_codes.some((s) => String(s).toLowerCase() === lowerCode);
          const matchesDirectSku =
            p.sku && String(p.sku).toLowerCase() === lowerCode;
          const matchesId = String(p.id) === String(code);
          return matchesSkuArray || matchesDirectSku || matchesId;
        });

        if (exactLocal) {
          matchedItem = exactLocal;
        } else {
          // 2. Query backend SKU search endpoint
          const apiResults = await api.searchProductBySku(code);
          if (apiResults && apiResults.length > 0) {
            // Check if there is an exact SKU match among results
            const exactApi = apiResults.find(
              (r) =>
                (r.sku && String(r.sku).toLowerCase() === lowerCode) ||
                (r.sku_code && String(r.sku_code).toLowerCase() === lowerCode)
            );
            matchedItem = exactApi || apiResults[0];
          } else {
            // 3. Check partial match in local products
            const partialLocal = products.find(
              (p) =>
                p.name?.toLowerCase().includes(lowerCode) ||
                (p.sku_codes &&
                  p.sku_codes.some((s) => s.toLowerCase().includes(lowerCode)))
            );
            if (partialLocal) {
              matchedItem = partialLocal;
            }
          }
        }

        if (matchedItem) {
          handleAddToCart(matchedItem);
        } else {
          playSound("error");
          setToastMessage(`⚠️ Product not found for scanned SKU/Barcode: "${code}"`);
          setTimeout(() => setToastMessage(""), 4500);
          setSkuSearch("");
          setSkuSuggestions([]);
          searchInputRef.current?.focus();
        }
      } catch (err) {
        console.error("Scan submit error:", err);
        playSound("error");
        setToastMessage(`⚠️ Error searching product code: "${code}"`);
        setTimeout(() => setToastMessage(""), 4000);
      } finally {
        setIsSearching(false);
      }
    },
    [products, handleAddToCart]
  );

  // Global scanner listener: If cashier scans without first focusing the input box, focus and route to search input
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Don't intercept if user is inside a modal or typing in inputs like notes, discount, gst
      if (isPayModalOpen || isCameraScannerOpen) return;
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT");

      if (isInput && activeEl !== searchInputRef.current) {
        return;
      }

      // If user typed alphanumeric character and search input wasn't focused, focus it
      if (
        !isInput &&
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        searchInputRef.current
      ) {
        searchInputRef.current.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isPayModalOpen, isCameraScannerOpen]);

  // Stepper controls
  const handleUpdateQty = (idx, delta) => {
    const item = cart[idx];
    if (!item) return;

    const currentQty = Number(item.quantity) || 1;
    const newQty = currentQty + delta;

    if (newQty <= 0) {
      setCart((prev) => prev.filter((_, i) => i !== idx));
      return;
    }

    if (delta > 0) {
      const maxStock =
        item.stock !== null && item.stock !== undefined && !isNaN(Number(item.stock))
          ? Number(item.stock)
          : null;

      if (maxStock !== null && newQty > maxStock) {
        playSound("error");
        setToastMessage(
          `⚠️ Stock limit reached! Only ${maxStock} unit(s) available for "${item.name}".`
        );
        setTimeout(() => setToastMessage(""), 4000);
        return;
      }
    }

    setCart((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, quantity: newQty } : it))
    );
  };

  const handleRemoveItem = (idx) => {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleEmptyCart = () => {
    if (cart.length === 0) return;
    if (window.confirm("Are you sure you want to empty the POS cart?")) {
      setCart([]);
      setDiscount("");
      setGst("");
      setNotes("");
    }
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.sale_price * item.quantity, 0);
  const numDiscount = Number(discount) || 0;
  const numGst = Number(gst) || 0;
  const gstAmount = numGst > 0 ? ((subtotal - numDiscount) * numGst) / 100 : 0;
  const grandTotal = Math.max(0, subtotal - numDiscount + gstAmount);

  const selectedCustomerObj =
    selectedCustomerId === "walkin"
      ? { name: "Walk-in Customer", email: "-", mobile: "-" }
      : customers.find((c) => c.id === Number(selectedCustomerId)) || {
          name: "Walk-in Customer",
        };

  // Open PAY Modal
  const handleOpenPayModal = () => {
    if (cart.length === 0) return;

    const customerIdNum = selectedCustomerId === "walkin" ? 0 : Number(selectedCustomerId) || 0;
    const newPosId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    setPayModalData({
      pos_id: newPosId,
      customer_id: customerIdNum,
      date: new Date().toISOString().slice(0, 10),
      customer: selectedCustomerObj,
      items: [...cart],
      subtotal,
      discount: numDiscount,
      gst: numGst,
      gstAmount,
      total: grandTotal,
      notes: notes || "Walk-in customer order",
      storeName: "Hunter Mens Wear",
    });
    setIsPayModalOpen(true);
  };

  const handleCompletePayment = (paymentType, apiResult) => {
    const orderId = apiResult?.order_id || apiResult?.id || apiResult?.data?.order_id || "";
    setToastMessage(`Payment completed successfully! ${orderId ? `Order #${orderId}` : ""}`);
    setCart([]);
    setDiscount("");
    setGst("");
    setNotes("");
    setTimeout(() => setToastMessage(""), 5000);
    setTimeout(() => searchInputRef.current?.focus(), 200);
  };

  return (
    <AppLayout>
      <div className="space-y-4 font-sans text-slate-800">
        {/* Top Search & Scanner Bar */}
        <div className="relative bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search / Scan Input */}
            <div className="relative flex-1">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Scan Barcode / QR code or Search SKU..."
                value={skuSearch}
                onChange={(e) => setSkuSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (skuSearch.trim()) {
                      handleDirectScanOrSubmit(skuSearch.trim());
                    }
                  }
                }}
                className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-24 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />

              {/* Status Pill in Input */}
              <div className="absolute right-3 top-2.5 flex items-center gap-1.5 pointer-events-none">
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Scanner Ready
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions: Direct Camera QR Scan & Add button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (skuSearch.trim()) {
                    handleDirectScanOrSubmit(skuSearch.trim());
                  } else {
                    searchInputRef.current?.focus();
                  }
                }}
                className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCameraScannerOpen(true)}
                className="px-3.5 py-2.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold shadow-2xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                title="Open Camera QR & Barcode Scanner"
              >
                <Camera className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">Camera Scan</span>
              </button>
            </div>
          </div>

          {/* SKU Suggestions Dropdown for partial/manual typing */}
          {(skuSuggestions.length > 0 || (skuSearch.trim() && !isSearching)) && (
            <div className="absolute top-full left-0 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {skuSuggestions.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs font-medium flex flex-col items-center gap-1">
                  <Barcode className="w-5 h-5 text-slate-300" />
                  <span>No products found for code "{skuSearch}"</span>
                  <span className="text-[10px] text-slate-400">Press Enter or Scan with Barcode Gun to search again</span>
                </div>
              ) : (
                skuSuggestions.map((p, idx) => {
                  const productName = p.productName || p.name || "Product";
                  const skuCode = p.sku || (p.sku_codes ? p.sku_codes.join(", ") : "");
                  const price = p.price || p.sale_price || 0;

                  return (
                    <div
                      key={p.productVariantId || p.productId || p.id || idx}
                      onClick={() => handleAddToCart(p)}
                      className="p-3 flex items-center justify-between hover:bg-emerald-50/70 cursor-pointer transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0 flex items-center justify-center font-bold text-xs text-emerald-700 bg-emerald-50">
                          {p.cover_image ? (
                            <img
                              src={p.cover_image}
                              alt={productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Barcode className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 group-hover:text-emerald-800 truncate">
                            {productName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            SKU: <span className="font-mono text-slate-700 font-semibold">{skuCode || "-"}</span> | Price:{" "}
                            <span className="text-emerald-700 font-extrabold">₹{price}</span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition shrink-0 ml-2"
                      >
                        + Add to Bill
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between animate-in fade-in ${
              toastMessage.startsWith("⚠️")
                ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs"
                : "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-2">
              {!toastMessage.startsWith("⚠️") && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage("")}
              className={`p-1 rounded hover:bg-black/5 ${
                toastMessage.startsWith("⚠️")
                  ? "text-amber-600 hover:text-amber-800"
                  : "text-emerald-500 hover:text-emerald-700"
              }`}
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Billing Section & Order Summary Layout */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          {/* Header Row: Billing Section Title & Customer Dropdown */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Billing Section</h2>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold text-[11px]">
                {cart.length} item{cart.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="w-full sm:w-64">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer shadow-2xs"
              >
                <option value="walkin">Walk-in-customer</option>
                {(Array.isArray(customers) ? customers : customers?.data || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || `${c.first_name || ""} ${c.last_name || ""}`.trim()} (
                    {c.mobile || c.email || "-"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: POS Cart Table */}
            <div className="lg:col-span-8 overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50/90 border-y border-slate-100 font-bold text-slate-900 uppercase tracking-wider">
                    <th className="py-3 px-3">NAME</th>
                    <th className="py-3 px-3">VARIANT</th>
                    <th className="py-3 px-3 text-center">QTY</th>
                    <th className="py-3 px-3">TAX</th>
                    <th className="py-3 px-3">PRICE</th>
                    <th className="py-3 px-3">SUB TOTAL</th>
                    <th className="py-3 px-3 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <Barcode className="w-6 h-6" />
                          </div>
                          <p className="font-semibold text-sm text-slate-700">No Items In Cart</p>
                          <span className="text-xs text-slate-400 max-w-sm">
                            Scan a product QR code / barcode with scanner gun or camera, or search by SKU above to add products to the bill.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    cart.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-3 font-medium text-slate-800">
                          <div>{item.name}</div>
                          {item.sku && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              SKU: {item.sku}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 font-medium">
                          {item.variant || "Standard"}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(idx, -1)}
                              className="w-6 h-6 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs transition cursor-pointer"
                            >
                              -
                            </button>
                            <span className="font-semibold text-xs text-slate-900 w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(idx, 1)}
                              className="w-6 h-6 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs transition cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-400">-</td>
                        <td className="py-3.5 px-3 font-medium text-slate-800">
                          ₹ {item.sale_price}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-900">
                          ₹ {item.sale_price * item.quantity}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-600 transition cursor-pointer inline-flex items-center justify-center"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Right 4 Cols: Order Summary Side Panel */}
            <div className="lg:col-span-4 space-y-4">
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full border-collapse">
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-bold text-slate-800">Sub Total</td>
                      <td className="p-3 text-right font-bold text-slate-900">
                        ₹{subtotal.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-700">Discount (Amount)</td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          className="w-28 bg-white border border-slate-200 rounded p-1.5 text-xs text-right font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-700">GST (%)</td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          value={gst}
                          onChange={(e) => setGst(e.target.value)}
                          className="w-28 bg-white border border-slate-200 rounded p-1.5 text-xs text-right font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">Total</td>
                      <td className="p-3 text-right font-extrabold text-slate-900 text-sm">
                        ₹{grandTotal.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="p-3 space-y-1">
                        <label className="block font-semibold text-slate-700">Notes</label>
                        <textarea
                          rows={2}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* You are saving */}
              <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-medium">
                <span>You are saving :</span>
                <span className="font-semibold text-slate-900">
                  ₹{numDiscount > 0 ? numDiscount.toFixed(2) : ""}
                </span>
              </div>

              {/* Empty Cart & PAY Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleEmptyCart}
                  disabled={cart.length === 0}
                  className="px-4 py-2 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition cursor-pointer"
                >
                  Empty Cart
                </button>

                <button
                  type="button"
                  onClick={handleOpenPayModal}
                  disabled={cart.length === 0}
                  className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  PAY
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Camera QR Code / Barcode Scanner Modal */}
        <POSCameraScannerModal
          isOpen={isCameraScannerOpen}
          onClose={() => setIsCameraScannerOpen(false)}
          onScanSuccess={(scannedCode) => {
            handleDirectScanOrSubmit(scannedCode);
          }}
        />

        {/* POS Payment & Invoice Preview Modal */}
        <POSPayModal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          cartData={payModalData}
          onCompletePayment={handleCompletePayment}
        />
      </div>
    </AppLayout>
  );
}
