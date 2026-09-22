"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Printer, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { api } from "@/lib/api";

// High-precision Code 128 (Subset B) Barcode Pattern Table for fallback rendering
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
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

function BarcodeSVG({ value, height = 34, className = "" }) {
  const bars = useMemo(() => generateCode128Bars(value), [value]);
  const barWidth = bars.reduce((sum, b) => sum + b.width, 0);

  // ISO/IEC 15417 Standard: Minimum 10-module quiet zone on both sides for optical scanners
  const quietZone = 10;
  const totalWidth = barWidth + quietZone * 2;

  let currentX = quietZone;

  return (
    <svg
      viewBox={`0 0 ${Math.max(totalWidth, 20)} ${height}`}
      className={`block ${className || "w-[150px] h-[34px]"}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      style={{ background: "#ffffff" }}
    >
      {/* Crisp white background ensuring high contrast for scanners */}
      <rect x="0" y="0" width={Math.max(totalWidth, 20)} height={height} fill="#ffffff" />
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
  const [startPosition, setStartPosition] = useState("1");
  const [loading, setLoading] = useState(false);
  const [barcodeList, setBarcodeList] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleClear = () => {
    setFromSku("");
    setToSku("");
    setQuantity("1");
    setStartPosition("1");
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
      // Call Live Barcode API: /admin/products/barcode
      const list = await api.getBarcodeList({
        fromSku: fromVal,
        toSku: toVal,
        qty: qtyVal,
      });

      if (Array.isArray(list) && list.length > 0) {
        setBarcodeList(list);
        // Trigger Print Dialog
        setTimeout(() => {
          window.print();
        }, 400);
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

  // Build printable items accounting for start position (1-based index)
  const printableList = useMemo(() => {
    const startIdx = Math.max(1, parseInt(startPosition, 10) || 1);
    const blanksCount = startIdx - 1;
    const blanks = Array(blanksCount).fill(null);
    return [...blanks, ...barcodeList];
  }, [barcodeList, startPosition]);

  // Group barcode list into rows of 2 (pairs) for 2-column sticker rolls
  const tableRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < printableList.length; i += 2) {
      rows.push([printableList[i], printableList[i + 1] || null]);
    }
    return rows;
  }, [printableList]);

  return (
    <AppLayout>
      <div className="space-y-6 print:m-0 print:p-0 print:space-y-0">
        {/* Top Header Breadcrumb */}
        <div className="space-y-0.5 print:hidden">
          <h1 className="text-xl font-bold text-slate-900">Product</h1>
          <div className="text-xs">
            <Link href="/dashboard" className="text-emerald-600 hover:underline font-normal">
              Home
            </Link>
          </div>
        </div>

        {/* Batch Label Print Form Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 print:hidden">
          <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">
            Batch Label Print
          </h2>

          <form onSubmit={handleGenerateAndPrint} className="max-w-xl space-y-4">
            {/* From SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] items-center gap-2">
              <label htmlFor="fromSku" className="text-xs font-bold text-slate-800">
                From SKU
              </label>
              <input
                id="fromSku"
                type="text"
                value={fromSku}
                onChange={(e) => setFromSku(e.target.value)}
                placeholder="e.g. 20474"
                className="w-full sm:max-w-xs bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* To SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] items-center gap-2">
              <label htmlFor="toSku" className="text-xs font-bold text-slate-800">
                To SKU
              </label>
              <input
                id="toSku"
                type="text"
                value={toSku}
                onChange={(e) => setToSku(e.target.value)}
                placeholder="e.g. 20474 (optional)"
                className="w-full sm:max-w-xs bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] items-center gap-2">
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

            {/* Start Label Position */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] items-center gap-2">
              <label htmlFor="startPos" className="text-xs font-bold text-slate-800">
                Start Position
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="startPos"
                  type="number"
                  min="1"
                  max="50"
                  value={startPosition}
                  onChange={(e) => setStartPosition(e.target.value)}
                  className="w-24 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <span className="text-xs text-slate-500">(1 = 1st sticker, 2 = 2nd sticker, etc.)</span>
              </div>
            </div> */}

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
                  Print Preview ({barcodeList.length} Labels - Starting at Sticker #{startPosition || "1"})
                </h3>
                <p className="text-[11px] text-slate-500">
                  2-Column Label Roll Format.
                </p>
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

            {/* Table layout matching print template */}
            <div className="border border-slate-200 rounded-lg p-6 bg-slate-50/50">
              <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow-xs border border-slate-100">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {tableRows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((item, cIdx) => (
                          <td
                            key={cIdx}
                            style={{
                              width: "50%",
                              height: "100px",
                              paddingLeft: "26px",
                              paddingBottom: "18px",
                              verticalAlign: "top",
                              border: "1px dashed #e2e8f0",
                            }}
                          >
                            {item ? (
                              <div>
                                <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                                  ₹ {item.rate ?? item.price ?? ""}
                                </div>

                                <div style={{ margin: "2px 0" }}>
                                  <BarcodeSVG value={item.sku} height={34} className="w-[150px] h-[34px]" />
                                </div>

                                <div style={{ fontSize: "12px", fontWeight: "bold" }}>
                                  {item.sku}
                                </div>

                                <div style={{ fontSize: "10px", lineHeight: "1.25" }}>
                                  {item.name}
                                  <br />
                                  {item.size || item.variant || ""}
                                  <br />
                                  Hunter Menswear Kanyakumari.
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center text-[10px] text-slate-300 italic">
                                [Empty Sticker]
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

        {/* PRINT ONLY CONTAINER - Zero-Offset Absolute Positioned for Thermal Roll Printers */}
        <div id="print-barcode-sheet" className="hidden print:block">
          <table
            width="100%"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              margin: 0,
              padding: 0,
            }}
          >
            <tbody>
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((item, cIdx) => (
                    <td
                      key={cIdx}
                      width="50%"
                      style={{
                        width: "50%",
                        height: "100px",
                        paddingLeft: "26px",
                        paddingBottom: "14px",
                        verticalAlign: "top",
                        boxSizing: "border-box",
                      }}
                    >
                      {item && (
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "normal" }}>
                            ₹ {item.rate ?? item.price ?? ""}
                          </div>

                          <div style={{ margin: "2px 0" }}>
                            <BarcodeSVG value={item.sku} height={34} className="w-[150px] h-[34px]" />
                          </div>

                          <div style={{ fontSize: "12px", fontWeight: "normal" }}>
                            {item.sku}
                          </div>

                          <div style={{ fontSize: "10px", lineHeight: "1.25" }}>
                            {item.name}
                            <br />
                            {item.size || item.variant || ""}
                            <br />
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

      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 0mm !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: Arial, sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            height: auto !important;
            min-height: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #print-barcode-sheet,
          #print-barcode-sheet * {
            visibility: visible !important;
          }
          #print-barcode-sheet {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          #print-barcode-sheet table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #print-barcode-sheet td {
            width: 50% !important;
            height: 100px !important;
            padding-left: 26px !important;
            padding-bottom: 14px !important;
            vertical-align: top !important;
            box-sizing: border-box !important;
          }
          #print-barcode-sheet svg {
            max-width: 150px !important;
            width: 150px !important;
            height: 34px !important;
            display: block !important;
            image-rendering: pixelated !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </AppLayout>
  );
}
