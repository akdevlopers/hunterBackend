"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Printer, AlertCircle, Sliders, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { api } from "@/lib/api";

// High-precision Code 128 (Subset B) Barcode Pattern Table for fallback rendering
const CODE128_PATTERNS = [

];

function generateCode128Bars(text) {
  if (!text) return [];
  const str = String(text).trim();
  if (!str) return [];

  const codes = [104];
  let checksum = 104;

  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    let code = charCode - 32;
    if (code < 0 || code > 95) code = 0;
    codes.push(code);
    checksum += code * (i + 1);
  }

  const checkDigit = checksum % 103;
  codes.push(checkDigit);
  codes.push(106);

  let patternStr = "";
  for (const c of codes) {
    patternStr += CODE128_PATTERNS[c] || "212222";
  }

  const bars = [];
  let isBar = true;
  for (let i = 0; i < patternStr.length; i++) {
    const width = parseInt(patternStr[i], 10) || 1;
    bars.push({ isBar, width });
    isBar = !isBar;
  }
  return bars;
}

function BarcodeSVG({ value, height = 18, className = "" }) {
  const bars = useMemo(() => generateCode128Bars(value), [value]);
  const totalWidth = bars.reduce((sum, b) => sum + b.width, 0);

  let currentX = 0;
  return (
    <svg
      viewBox={`0 0 ${Math.max(totalWidth, 10)} ${height}`}
      className={`h-[18px] max-w-[110px] ${className}`}
      style={{ height: `${height}px`, width: "110px", maxWidth: "100%" }}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
    >
      {bars.map((bar, idx) => {
        const x = currentX;
        currentX += bar.width;
        if (!bar.isBar) return null;
        return (
          <rect
            key={idx}
            x={x}
            y={0}
            width={bar.width}
            height={height}
            fill="#000000"
          />
        );
      })}
    </svg>
  );
}

export default function BatchLabelPrintPage() {
  const [fromSku, setFromSku] = useState("");
  const [toSku, setToSku] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);
  const [barcodeList, setBarcodeList] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  // Label Calibration / Alignment Settings (Reduced default sizes)
  const [showSettings, setShowSettings] = useState(false);
  const [labelHeight, setLabelHeight] = useState(75); // Reduced from 100px to 75px
  const [paddingLeft, setPaddingLeft] = useState(14); // Reduced from 26px to 14px
  const [barcodeHeight, setBarcodeHeight] = useState(18); // Reduced from 35px to 18px
  const [fontSizeScale, setFontSizeScale] = useState(80); // Reduced font scale

  const handleResetSettings = () => {
    setLabelHeight(75);
    setPaddingLeft(14);
    setBarcodeHeight(18);
    setFontSizeScale(80);
  };

  const handleClear = () => {
    setFromSku("");
    setToSku("");
    setQuantity("1");
    setBarcodeList([]);
    setErrorMsg("");
  };

  const handleGenerateAndPrint = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg("");

    const fromVal = fromSku.trim();
    const toVal = toSku.trim() || fromVal;
    const qtyVal = Math.max(1, parseInt(quantity, 10) || 1);

    if (!fromVal && !toVal) {
      setErrorMsg("Please enter at least a 'From SKU'.");
      return;
    }

    setLoading(true);

    try {
      const list = await api.getBarcodeList({
        fromSku: fromVal,
        toSku: toVal,
        qty: qtyVal,
      });

      if (Array.isArray(list) && list.length > 0) {
        setBarcodeList(list);
        setTimeout(() => {
          window.print();
        }, 300);
      } else {
        setBarcodeList([]);
        setErrorMsg("No barcode data found for the specified SKUs.");
      }
    } catch (err) {
      console.error("Barcode API Error:", err);
      setErrorMsg("Failed to fetch barcode list from server.");
    } finally {
      setLoading(false);
    }
  };

  // Group barcode list into rows of 2 (pairs) for 2-column sticker sheets
  const tableRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < barcodeList.length; i += 2) {
      rows.push([barcodeList[i], barcodeList[i + 1] || null]);
    }
    return rows;
  }, [barcodeList]);

  // Scaled font sizes based on user preference
  const scale = fontSizeScale / 100;
  const priceSize = Math.max(8, Math.round(11 * scale));
  const skuSize = Math.max(7, Math.round(9.5 * scale));
  const textSize = Math.max(6.5, (8 * scale).toFixed(1));
  const storeSize = Math.max(6, (7 * scale).toFixed(1));

  return (
    <AppLayout>
      <div className="space-y-6 print:m-0 print:p-0 print:space-y-0">
        {/* Top Header Breadcrumb */}
        <div className="space-y-0.5 print:hidden">
          <h1 className="text-xl font-bold text-slate-900">Product Barcode Label Print</h1>
          <div className="text-xs">
            <Link href="/dashboard" className="text-emerald-600 hover:underline font-normal">
              Home
            </Link>
          </div>
        </div>

        {/* Batch Label Print Form Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 print:hidden">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Batch Label Print
            </h2>

            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>{showSettings ? "Hide Calibration" : "Label Alignment & Size"}</span>
            </button>
          </div>

          {/* Size & Alignment Fine-Tuning Drawer */}
          {showSettings && (
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-bold text-slate-800">
                  Label Roll Fine-Tuning (Reduced Size Settings)
                </span>
                <button
                  type="button"
                  onClick={handleResetSettings}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Row Height */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>Label Height:</span>
                    <span className="font-bold text-emerald-700">{labelHeight}px</span>
                  </div>
                  <input
                    type="range"
                    min="55"
                    max="110"
                    value={labelHeight}
                    onChange={(e) => setLabelHeight(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                {/* Left Margin / Padding */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>Left Padding:</span>
                    <span className="font-bold text-emerald-700">{paddingLeft}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="35"
                    value={paddingLeft}
                    onChange={(e) => setPaddingLeft(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                {/* Barcode Height */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>Barcode Height:</span>
                    <span className="font-bold text-emerald-700">{barcodeHeight}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="35"
                    value={barcodeHeight}
                    onChange={(e) => setBarcodeHeight(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                {/* Font Scale */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>Font Scale:</span>
                    <span className="font-bold text-emerald-700">{fontSizeScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="120"
                    step="5"
                    value={fontSizeScale}
                    onChange={(e) => setFontSizeScale(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleGenerateAndPrint} className="max-w-xl space-y-4">
            {/* From SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-center gap-2">
              <label htmlFor="fromSku" className="text-xs font-bold text-slate-800">
                From SKU
              </label>
              <input
                id="fromSku"
                type="text"
                value={fromSku}
                onChange={(e) => setFromSku(e.target.value)}
                placeholder="e.g. 19711"
                className="w-full sm:max-w-xs bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* To SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-center gap-2">
              <label htmlFor="toSku" className="text-xs font-bold text-slate-800">
                To SKU
              </label>
              <input
                id="toSku"
                type="text"
                value={toSku}
                onChange={(e) => setToSku(e.target.value)}
                placeholder="e.g. 19712"
                className="w-full sm:max-w-xs bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-center gap-2">
              <label htmlFor="qty" className="text-xs font-bold text-slate-800">
                Quantity
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="qty"
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-24 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <span className="text-xs text-slate-500">(per SKU)</span>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-3">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold transition cursor-pointer"
              >
                Clear
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{loading ? "Calling API..." : "Print"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Barcode Sheet Preview on Screen */}
        {barcodeList.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 space-y-4 print:hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Print Preview ({barcodeList.length} Labels)
                </h3>
                {/* <p className="text-[11px] text-slate-500">
                  Compact 2-column sticker layout (Height: {labelHeight}px, Padding: {paddingLeft}px, Font: {fontSizeScale}%).
                </p> */}
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Barcode</span>
              </button>
            </div>

            {/* Table layout matching reduced print dimensions */}
            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50/50">
              <div className="max-w-md mx-auto bg-white p-4 rounded shadow-xs border border-dashed border-slate-300">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {tableRows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((item, cIdx) => (
                          <td
                            key={cIdx}
                            style={{
                              width: "50%",
                              height: `${labelHeight}px`,
                              paddingLeft: `${paddingLeft}px`,
                              paddingRight: "4px",
                              paddingTop: "2px",
                              paddingBottom: "2px",
                              verticalAlign: "top",
                              border: "1px dashed #e2e8f0",
                            }}
                          >
                            {item && (
                              <div style={{ maxWidth: "135px" }}>
                                <div style={{ fontSize: `${priceSize}px`, fontWeight: "bold", lineHeight: "1.1" }}>
                                  ₹ {item.rate ?? item.price ?? ""}
                                </div>

                                <div style={{ margin: "1px 0" }}>
                                  {item.barcode ? (
                                    <img
                                      src={
                                        item.barcode.startsWith("data:")
                                          ? item.barcode
                                          : `data:image/png;base64,${item.barcode}`
                                      }
                                      alt={String(item.sku || "")}
                                      style={{
                                        display: "block",
                                        height: `${barcodeHeight}px`,
                                        maxHeight: `${barcodeHeight}px`,
                                        maxWidth: "110px",
                                        objectFit: "contain",
                                      }}
                                    />
                                  ) : (
                                    <BarcodeSVG
                                      value={item.sku}
                                      height={barcodeHeight}
                                      className="w-28"
                                    />
                                  )}
                                </div>

                                <div style={{ fontSize: `${skuSize}px`, fontWeight: "bold", lineHeight: "1.1" }}>
                                  {item.sku}
                                </div>

                                <div
                                  style={{
                                    fontSize: `${textSize}px`,
                                    lineHeight: "1.05",
                                    maxHeight: "22px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {item.name}
                                </div>
                                <div style={{ fontSize: `${textSize}px`, lineHeight: "1.05", fontWeight: "600" }}>
                                  {item.size || item.variant || ""}
                                </div>
                                <div style={{ fontSize: `${storeSize}px`, lineHeight: "1.05", color: "#444" }}>
                                  Hunter Menswear Kanyakumari.
                                </div>
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PRINT ONLY CONTAINER - Exact Compact HTML Table for Physical Stickers */}
        <div id="print-barcode-sheet" className="hidden print:block">
          <style jsx global>{`
            @media print {
              @page {
                size: auto;
                margin: 0;
              }
              html, body {
                background: white !important;
                color: black !important;
                margin: 0 !important;
                padding: 0 !important;
                font-family: Arial, Helvetica, sans-serif !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              header, nav, aside, .sidebar, .navbar, .print\\:hidden {
                display: none !important;
                height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                visibility: hidden !important;
              }
              #print-barcode-sheet {
                display: block !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                padding-top: 1px !important;
              }
              table.barcode-print-tbl {
                width: 100% !important;
                border-collapse: collapse !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              td.barcode-cell {
                width: 50% !important;
                height: ${labelHeight}px !important;
                padding-left: ${paddingLeft}px !important;
                padding-right: 4px !important;
                padding-top: 2px !important;
                padding-bottom: 2px !important;
                vertical-align: top !important;
                box-sizing: border-box !important;
              }
            }
          `}</style>

          <table className="barcode-print-tbl" width="100%" style={{ width: "100%", borderCollapse: "collapse", margin: 0, padding: 0 }}>
            <tbody>
              {tableRows.map((row, rIdx) => (
                <React.Fragment key={rIdx}>
                  <tr>
                    {row.map((item, cIdx) => (
                      <td
                        key={cIdx}
                        className="barcode-cell"
                        width="50%"
                        style={{
                          width: "50%",
                          height: `${labelHeight}px`,
                          paddingLeft: `${paddingLeft}px`,
                          paddingRight: "4px",
                          paddingTop: "2px",
                          paddingBottom: "2px",
                          verticalAlign: "top",
                        }}
                      >
                        {item && (
                          <div style={{ maxWidth: "135px", overflow: "hidden" }}>
                            <div style={{ marginTop: "4px", fontSize: `${priceSize}px`, fontWeight: "bold", lineHeight: "1.1" }}>
                              ₹ {item.rate ?? item.price ?? ""}
                            </div>

                            <div style={{ margin: "1px 0" }}>
                              {item.barcode ? (
                                <img
                                  src={
                                    item.barcode.startsWith("data:")
                                      ? item.barcode
                                      : `data:image/png;base64,${item.barcode}`
                                  }
                                  alt={String(item.sku || "")}
                                  style={{
                                    display: "block",
                                    height: `${barcodeHeight}px`,
                                    maxHeight: `${barcodeHeight}px`,
                                    maxWidth: "110px",
                                    objectFit: "contain",
                                  }}
                                />
                              ) : (
                                <BarcodeSVG
                                  value={item.sku}
                                  height={barcodeHeight}
                                  className="w-28"
                                />
                              )}
                            </div>

                            <div style={{ fontSize: `${skuSize}px`, fontWeight: "bold", lineHeight: "1.1" }}>
                              {item.sku}
                            </div>

                            <div
                              style={{
                                fontSize: `${textSize}px`,
                                lineHeight: "1.05",
                                maxHeight: "22px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {item.name}
                            </div>
                            <div style={{ fontSize: `${textSize}px`, lineHeight: "1.05", fontWeight: "600" }}>
                              {item.size || item.variant || ""}
                            </div>
                            <div style={{ fontSize: `${storeSize}px`, lineHeight: "1.05", color: "#333" }}>
                              Hunter Menswear Kanyakumari.
                            </div>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

